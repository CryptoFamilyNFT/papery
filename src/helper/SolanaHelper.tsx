import { ISolanaContext } from "./ISolanaContext";
import AddressFactory from "../common/AddressFactory";
import { IUser } from "../entities/IUser";
import { IToast } from "../entities/IToast";
import React, { FC, useMemo } from 'react';
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SolflareWalletAdapter, UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { AccountInfo, clusterApiUrl, Connection, GetProgramAccountsFilter, GetProgramAccountsResponse, PublicKey } from '@solana/web3.js';
import solanaWeb3 from '@solana/web3.js'
// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';
import { SolanaContextRepository } from "./SolanaContextRepository";
import { Liquidity, Percent, Token, TokenAmount, TOKEN_PROGRAM_ID, SPL_ACCOUNT_LAYOUT, TokenAccount, ReplaceType, LIQUIDITY_VERSION_TO_STATE_LAYOUT, LiquidityAssociatedPoolKeys, LIQUIDITY_STATE_LAYOUT_V4, LIQUIDITY_STATE_LAYOUT_V5, GetMultipleAccountsInfoConfig, MarketState, getMultipleAccountsInfo, MARKET_STATE_LAYOUT_V3, LiquidityStateV5, LiquidityStateV4, LiquidityPoolKeysV4, MarketStateLayoutV3, MarketStateLayout, jsonInfo2PoolKeys, Market, MARKET_VERSION_TO_STATE_LAYOUT } from "@raydium-io/raydium-sdk";


declare global {
    interface Window {
        Solanaeum?: any;
    }
}

interface LiquidityPoolKeys {
    id: string;
    baseMint: string;
    quoteMint: string;
    lpMint: string;
    baseDecimals: number;
    quoteDecimals: number;
    lpDecimals: number;
    version: 4;
    programId: string;
    authority: string;
    openOrders: string;
    targetOrders: string;
    baseVault: string;
    quoteVault: string;
    withdrawQueue: string;
    lpVault: string;
    marketVersion: 3;
    marketProgramId: string;
    marketId: string;
    marketAuthority: string;
    marketBaseVault: string;
    marketQuoteVault: string;
    marketBids: string;
    marketAsks: string;
    marketEventQueue: string;
    lookupTableAccount: string;
}

interface ILIQ {
    unOfficial: any,
    official: any
}

interface DataNet {
    network: WalletAdapterNetwork;
    wallets: () => Adapter[];
}

interface Window {
    Solanaeum?: any;
}

interface IAsset {
    name: string;
    symbol: string;
    address: string;
    logo: string;
    disabled: boolean;
}

// @ts-ignore
const { Solanaeum } = window;

class LinkFactory {
    static getTransctionLink(txHash: string, chainId?: number, name?: string) {
        return this.getLink(name ?? 'Transaction HASH', `${chainId === 11155111 ? 'testnet: ' : ''}tx => ${txHash}`);
    }

    static getLink(name: string, url: string) {
        return { name: name, url: url };
    }
}

type Listener = (...args: Array<any>) => void;

export default class SolanaHelper {

    public static getChainId(): number { return process.env.REACT_APP_CHAINID ? Number(process.env.REACT_APP_CHAINID) : 137; }

    public static PAPERY_SOL_LP_V4_POOL_KEY = '579KdT9okDg9BC3ptNH6sj359qzs581SQiGDbEqM4iVJ';
    public static RAYDIUM_LIQUIDITY_JSON = 'https://api.raydium.io/v4/sdk/liquidity/mainnet.json';
    static RAYDIUM_V4_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'

    public static initialAccount(): IUser {
        return {
            balanceSol: 0,
            balancePapery: 0,
            connected: false
        } as IUser;
    }

    public static initialToast(): IToast {
        return {
            toastId: undefined,
            toastDescription: '',
            toastStatus: "success",
            toastTitle: '',
            toastLink: undefined
        } as IToast;
    }

    public static async getBalances(publicKey: PublicKey, connection: Connection, context: ISolanaContext) {
        let tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")

        async function getTokenAccounts(wallet: string) {
            const filters: GetProgramAccountsFilter[] = [
                {
                    dataSize: 165,    //size of account (bytes)
                },
                {
                    memcmp: {
                        offset: 32,
                        bytes: wallet,  //our search criteria, a base58 encoded string
                    }
                }
            ];

            const accounts = await connection.getParsedProgramAccounts(
                tokenProgram,   //SPL Token Program
                { filters: filters }
            );

            let userBalancePapery = accounts.map((account) => {
                const parsedAccountInfo: any = account.account.data;
                const tokenBalance: number = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
                console.log(tokenBalance)
                return tokenBalance
            })

            return userBalancePapery
        }

        async function getBalances() {
            if (publicKey !== null) {
                const balance_ = await connection.getBalance(publicKey).then((balance) => {
                    console.log(`Token balance: ${balance}`);
                    return balance
                });
                const paperyBalance: number[] = await getTokenAccounts(publicKey.toString())
                return [balance_, paperyBalance[0]]
            }
        }

        let balances = await getBalances() ?? [0, 0]

        return balances

    }

    public static getNetwork() {
        const network = new Connection("https://solana-mainnet.core.chainstack.com/b963a6e2efa9342dcb953d8087f458cd", { wsEndpoint: "wss://solana-mainnet.core.chainstack.com/b963a6e2efa9342dcb953d8087f458cd" });
        const wallets =
            () => [
                /**
                 * Wallets that implement either of these standards will be available automatically.
                 *
                 *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
                 *     (https://github.com/solana-mobile/mobile-wallet-adapter)
                 *   - Solana Wallet Standard
                 *     (https://github.com/anza-xyz/wallet-standard)
                 *
                 * If you wish to support a wallet that supports neither of those standards,
                 * instantiate its legacy wallet adapter here. Common legacy adapters can be found
                 * in the npm package `@solana/wallet-adapter-wallets`.
                 */
                new SolflareWalletAdapter(),

            ] as Adapter[];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const data = { network, wallets } as unknown as DataNet;
        return data;
    }

    static async fetchAllPoolKeys(
        connection: Connection,
        programId: PublicKey, // Solo per la versione 4
        config?: GetMultipleAccountsInfoConfig,
    ): Promise<LiquidityPoolKeysV4[]> {
        const layout = LIQUIDITY_VERSION_TO_STATE_LAYOUT[4]; // Usa solo il layout per la versione 4

        // Tentativo di recupero degli account
        try {
            const accounts = await connection.getProgramAccounts(programId, {
                filters: [{ dataSize: layout.span }],
            });

            if (accounts.length === 0) {
                console.warn("Nessun account trovato per il programma specificato.");
            } else {
                console.log(`Trovati ${accounts.length} account.`);
            }

            const allPools = accounts.map((info) => ({
                id: info.pubkey,
                version: 4,
                programId: programId,
                ...layout.decode(info.account.data),
            }));

            // Debug: visualizzazione delle informazioni sui pool
            console.log("Pools decodificati:", allPools);

            const allMarketIds = allPools.map((i) => i.marketId);
            const marketsInfo: { [marketId: string]: MarketState } = {};

            try {
                const _marketsInfo = await getMultipleAccountsInfo(connection, allMarketIds, config);
                for (const item of _marketsInfo) {
                    if (item === null) continue;
                    const _i = { programId: item.owner, ...MARKET_STATE_LAYOUT_V3.decode(item.data) };
                    marketsInfo[_i.ownAddress.toString()] = _i;
                }

                // Debug: visualizzazione delle informazioni sui mercati
                console.log("Markets info:", marketsInfo);

            } catch (error) {
                if (error instanceof Error) {
                    console.error('Failed to fetch markets', {
                        message: error.message,
                    });
                }
            }

            const authority = Liquidity.getAssociatedAuthority({ programId }).publicKey;

            const formatPoolInfos: LiquidityPoolKeysV4[] = allPools
                .map((pool) => {
                    if (pool === undefined || pool.baseMint.equals(PublicKey.default)) return undefined;

                    const market = marketsInfo[pool.marketId.toString()];

                    if (!market) return undefined;

                    return {
                        id: pool.id,
                        baseMint: pool.baseMint,
                        quoteMint: pool.quoteMint,
                        lpMint: pool.lpMint,
                        baseDecimals: pool.baseDecimal.toNumber(),
                        quoteDecimals: pool.quoteDecimal.toNumber(),
                        lpDecimals: pool.baseDecimal.toNumber(),
                        version: pool.version,
                        programId: pool.programId,
                        authority: authority,
                        openOrders: pool.openOrders,
                        targetOrders: pool.targetOrders,
                        baseVault: pool.baseVault,
                        quoteVault: pool.quoteVault,
                        marketVersion: 3,
                        marketProgramId: new PublicKey("579KdT9okDg9BC3ptNH6sj359qzs581SQiGDbEqM4iVJ"),
                        marketId: market.ownAddress,
                        marketAuthority: Liquidity.getAssociatedAuthority({ programId: new PublicKey("579KdT9okDg9BC3ptNH6sj359qzs581SQiGDbEqM4iVJ") }).publicKey,
                        marketBaseVault: market.baseVault,
                        marketQuoteVault: market.quoteVault,
                        marketBids: market.bids,
                        marketAsks: market.asks,
                        marketEventQueue: market.eventQueue,
                        withdrawQueue: (pool as LiquidityStateV4).withdrawQueue,
                        lpVault: (pool as LiquidityStateV4).lpVault,
                        lookupTableAccount: PublicKey.default,
                    } as LiquidityPoolKeysV4;
                })
                .filter((pool): pool is LiquidityPoolKeysV4 => pool !== undefined); // Filtra i pool non definiti

            // Debug: visualizzazione del risultato finale
            console.log("Pools finali formattati:", formatPoolInfos);

            return formatPoolInfos;
        } catch (error) {
            console.error("Errore durante il recupero degli account del programma:", error);
            return [];
        }
    }

    private static async _getProgramAccounts(connection: Connection, baseMint: PublicKey, quoteMint: PublicKey): Promise<GetProgramAccountsResponse> {
        const layout = LIQUIDITY_STATE_LAYOUT_V4

        return connection.getProgramAccounts(new PublicKey(SolanaHelper.RAYDIUM_V4_PROGRAM_ID), {
            filters: [
                { dataSize: layout.span },
                {
                    memcmp: {
                        offset: layout.offsetOf('baseMint'),
                        bytes: baseMint.toBase58(),
                    },
                },
                {
                    memcmp: {
                        offset: layout.offsetOf('quoteMint'),
                        bytes: quoteMint.toBase58(),
                    },
                },
            ],
        })
    }

    public static async getProgramAccounts(connection: Connection, baseMint: PublicKey, quoteMint: PublicKey) {
        const response = await Promise.all([
          this._getProgramAccounts(connection, baseMint, quoteMint),
          this._getProgramAccounts(connection, quoteMint, baseMint),
        ])
    
        return response.filter((r) => r.length > 0)[0] || []
      }


    public static async getPoolInfo(connection: Connection): Promise<LiquidityPoolKeysV4 | undefined> {
        try {
            const layout = LIQUIDITY_STATE_LAYOUT_V4
            
            const info = await connection.getAccountInfo(new PublicKey(this.PAPERY_SOL_LP_V4_POOL_KEY));
            if (!info) return;
            const poolState = LIQUIDITY_STATE_LAYOUT_V4.decode(info.data) as LiquidityStateV4;

            const programData = await this.getProgramAccounts(connection, poolState.baseMint, poolState.quoteMint)

            const collectedPoolResults = programData
                .map((info) => ({
                    id: new PublicKey(info.pubkey),
                    version: 4,
                    programId: new PublicKey(SolanaHelper.RAYDIUM_V4_PROGRAM_ID),
                    ...layout.decode(info.account.data),
                }))
                .flat()

                console.log(collectedPoolResults)
            const pool = collectedPoolResults[0]
            console.log(pool)

            // Recupero delle informazioni di mercato
            const marketState = await connection.getAccountInfo(poolState.marketId).then((item: AccountInfo<Buffer> | null) => ({
                programId: item?.owner,
                ...MARKET_STATE_LAYOUT_V3.decode(item?.data ?? {} as Buffer),
            }))

            console.log("MARKETSTATE", marketState)

            // Assicurati che marketState non sia null o undefined
            if (!marketState) return undefined;

            const programId = TOKEN_PROGRAM_ID;

            const authority = Liquidity.getAssociatedAuthority({
                programId: new PublicKey(SolanaHelper.RAYDIUM_V4_PROGRAM_ID),
            }).publicKey

            const marketProgramId: PublicKey = marketState.programId ?? PublicKey.default

            // Costruzione dell'oggetto jsonPool
            const jsonPool = {
                id: pool.id,
                baseMint: pool.baseMint,
                quoteMint: pool.quoteMint,
                lpMint: pool.lpMint,
                baseDecimals: Number.parseInt(pool.baseDecimal.toString()),
                quoteDecimals: Number.parseInt(pool.quoteDecimal.toString()),
                lpDecimals: Number.parseInt(pool.baseDecimal.toString()),
                version: pool.version,
                programId: pool.programId,
                openOrders: pool.openOrders,
                targetOrders: pool.targetOrders,
                baseVault: pool.baseVault,
                quoteVault: pool.quoteVault,
                marketVersion: 3,
                authority: authority,
                marketProgramId,
                marketId: marketState.ownAddress,
                marketAuthority: Market.getAssociatedAuthority({
                    programId: marketProgramId,
                    marketId: marketState.ownAddress,
                }).publicKey,
                marketBaseVault: marketState.baseVault,
                marketQuoteVault: marketState.quoteVault,
                marketBids: marketState.bids,
                marketAsks: marketState.asks,
                marketEventQueue: marketState.eventQueue,
                withdrawQueue: pool.withdrawQueue,
                lpVault: pool.lpVault,
                lookupTableAccount: PublicKey.default,
            } as LiquidityPoolKeysV4

            console.log(jsonInfo2PoolKeys(jsonPool));

            return jsonPool;
        } catch (error) {
            console.error("Error fetching pool info:", error);
            return undefined;
        }
    }


    public static async getTokenAccountsByOwner(
        connection: Connection,
        owner: PublicKey,
    ) {
        const tokenResp = await connection.getTokenAccountsByOwner(
            owner,
            {
                programId: TOKEN_PROGRAM_ID
            },
        );

        const accounts: TokenAccount[] = [];

        for (const { pubkey, account } of tokenResp.value) {
            accounts.push(
                {
                    pubkey,
                    accountInfo: SPL_ACCOUNT_LAYOUT.decode(account.data),
                    programId: TOKEN_PROGRAM_ID
                });
        }

        return accounts;
    }

    public static async calcAmountOut(connection: Connection, poolKeys: LiquidityPoolKeysV4, rawAmountIn: number, swapInDirection: boolean, slippage_: number | number[]) {
        const poolInfo = await Liquidity.fetchInfo({ connection, poolKeys });
        console.log(poolInfo)
        let currencyInMint = poolKeys.baseMint;
        let currencyInDecimals = poolInfo.baseDecimals;
        let currencyOutMint = poolKeys.quoteMint;
        let currencyOutDecimals = poolInfo.quoteDecimals;

        if (swapInDirection === false) {
            currencyInMint = poolKeys.quoteMint;
            currencyInDecimals = poolInfo.quoteDecimals;
            currencyOutMint = poolKeys.baseMint;
            currencyOutDecimals = poolInfo.baseDecimals;
        }

        console.log("SWAP and Currency", swapInDirection, currencyInMint)

        const currencyIn = new Token(poolKeys.programId, currencyInMint, currencyInDecimals);
        const amountIn = new TokenAmount(currencyIn, rawAmountIn, false);
        const currencyOut = new Token(poolKeys.programId, currencyOutMint, currencyOutDecimals);
        const slippage = new Percent(slippage_, 100); // 5% slippage

        const {
            amountOut,
            minAmountOut,
            currentPrice,
            executionPrice,
            priceImpact,
            fee,
        } = Liquidity.computeAmountOut({ poolKeys, poolInfo, amountIn, currencyOut, slippage, });

        console.log({
            amountOut,
            minAmountOut,
            currentPrice,
            executionPrice,
            priceImpact,
            fee,
        })
        return {
            amountIn,
            amountOut,
            minAmountOut,
            currentPrice,
            executionPrice,
            priceImpact,
            fee,
        };
    }
    public static async queryProviderInfo(context: ISolanaContext, publicKey?: PublicKey, connection?: Connection): Promise<ISolanaContext> {
        if (context.loaded && !context.reload) return context;

        if (publicKey && connection) {
            await this.getBalances(publicKey, connection, context).then((ctx) => {
                context = { ...context, balancePapery: ctx[1], balanceSol: ctx[0] }
                console.log("CTX", context)
                return context
            })
        }
        //await Promise.all([]);

        return context;
    }

    /*public static async disconnect(context: ISolanaContext): Promise<ISolanaContext> {
        this.disconnectListeners();
        return this.queryProviderInfo({ loaded: false, reload: true });
    }*/

    /*public static async querySignerInfo(context: ISolanaContext): Promise<ISolanaContext> {
        const provider = SolanaHelper.initProvider();
        const chainId = SolanaHelper.getChainId()
        // const provider = new Solanas.providers.Web3Provider(Solanaeum);

        if (!context.chainId) context = await this.getNetwork(provider, context);

        const signer = provider.getSigner(context.addressSigner);

        function toNumberSafe(bn: BigNumber): number {
            try {
                return bn.toNumber();
            } catch (error) {
                console.error('Error converting BigNumber to number:', error);
                return 0; // o un valore predefinito appropriato in caso di errore
            }
        }

        const SolanaBalancePromise = signer
            .getBalance()
            .then((result: BigNumber) => context.balance = Number(Solanas.utils.formatSolana(result)))
            .catch((error: any) => console.log("SolanaHelper.queryProviderInfo.ethBalance: ", JSON.stringify(error)));
        // context.nfts = [];
        const userAddress: string = context.addressSigner || '';

        await Promise.all([SolanaBalancePromise]);
        return context;
    }*/

    /*
    public static async getTokenURI(context: ISolanaContext, tokenId: number) {
            if (context.connected) {
                const provider = SolanaHelper.initProvider();
                const signer = provider.getSigner(context.addressSigner);
                const Factories = new Contract(AddressFactory.getFactoriesAddress(context.chainId ?? 11155111), DivitrendFactoriesABI, signer) as DivitrendFactories;
    
                const URIpath = await Factories.tokenURI(tokenId);
                const response = await fetch(URIpath + '.json');
                const tokenData = await response.json();
                return tokenData;
            }
        }
    */

    /*public static async queryProviderInfo(context: ISolanaContext): Promise<ISolanaContext> {
        if (context.loaded && !context.reload) return context;

        const provider = SolanaHelper.initProvider();
        const signer = provider.getSigner(context.addressSigner);

        if (!context.chainId) context = await this.getNetwork(provider, context);

        //await Promise.all([]);

        return context;
    }*/

    //#endregion


    public static connectChainListener(chainChanged: Listener) {
        Solanaeum?.on('chainChanged', chainChanged);
    }

    public static connectAccountListener(accountsChanged: Listener) {
        Solanaeum?.on('accountsChanged', accountsChanged);
    }

    public static connectErrorListener(error: Listener) {
        Solanaeum?.on("error", error);
    }

    public static disconnectListeners() {
        Solanaeum?.removeAllListeners();
    }
}