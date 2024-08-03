import React, { useContext, useEffect, useState } from 'react';
import { Box, Chip, Grid, List, ListItem, Typography, useTheme } from '@mui/material';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection, ParsedTransactionWithMeta, ConfirmedSignatureInfo, TokenAmount, GetProgramAccountsFilter } from '@solana/web3.js';
import { SolanaContext } from '../../helper/SolanaContext';
import { SolanaContextRepository } from '../../helper/SolanaContextRepository';
import AddressFactory from '../../common/AddressFactory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SellIcon from '@mui/icons-material/Sell';
import asset from "../../assets/papery.jpg"
import paperyuser from "../../assets/paperyuser.jpeg"
import SolanaHelper from '../../helper/SolanaHelper';

const UserHero: React.FC = () => {
    const { connection } = useConnection();
    const { context, saveContext } = useContext(SolanaContext) as SolanaContextRepository;
    const paperyMintAddy = AddressFactory.getTokenAddress(102);
    const { publicKey } = useWallet();
    const addyuser = publicKey?.toString()
    const [buyTransactions, setBuyTransactions] = useState<{ amount: number, date: string }[]>([]);
    const [sellTransactions, setSellTransactions] = useState<{ amount: number, date: string }[]>([]);
    const [profitTransactions, setProfitTransactions] = useState<{ profit: number, date: string }[]>([]);
    const [balance, setBalance] = useState<number>();
    const [papery, setBalancePapery] = useState<number>();
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
            setBalance(balance_)
            const tokenAccs = await SolanaHelper.getTokenAccountsByOwner(connection, publicKey as PublicKey); // get all token accounts
            let rayTokenAddress: PublicKey;
            tokenAccs.filter(acc => acc.accountInfo.mint.toBase58() === AddressFactory.getTokenAddress(102)).map(async (acc) => {
                rayTokenAddress = acc.pubkey;
                const accBalance = await connection.getTokenAccountBalance(rayTokenAddress);
                const rayBal = accBalance.value.uiAmount || 0;
                setBalancePapery(rayBal);
            });
        }
    }

    const fetchTransactions = async () => {
        getBalances()
        if (publicKey === null) return;

        const transactions = await connection.getSignaturesForAddress(publicKey, { limit: 1000 });
        const buyTxs: { amount: number, date: string }[] = [];
        const sellTxs: { amount: number, date: string }[] = [];
        const profitTxs: { profit: number, date: string }[] = [];

        for (const tx of transactions) {
            const detailedTx = await connection.getParsedTransaction(tx.signature, { maxSupportedTransactionVersion: 0 });
            if (detailedTx !== null) {
                console.log(detailedTx)
                const preBalance = detailedTx.meta?.preTokenBalances?.find(balance => balance.mint === paperyMintAddy);
                const postBalance = detailedTx.meta?.postTokenBalances?.find(balance => balance.mint === paperyMintAddy);

                console.log(preBalance)
                console.log(postBalance)

                if (preBalance && postBalance) {
                    const preAmount = preBalance.uiTokenAmount.uiAmount ?? 0;
                    const postAmount = postBalance.uiTokenAmount.uiAmount ?? 0;
                    const diff = postAmount - preAmount;

                    const date = new Date((detailedTx.blockTime ?? 0) * 1000).toLocaleString();

                    if (diff > 0) {
                        buyTxs.push({ amount: diff, date });
                    } else if (diff < 0) {
                        sellTxs.push({ amount: Math.abs(diff), date });
                    }
                }
            }
        }

        const totalBuys = buyTxs.reduce((sum, tx) => sum + tx.amount, 0);
        const totalSells = sellTxs.reduce((sum, tx) => sum + tx.amount, 0);
        const profitOrLoss = totalSells - totalBuys;

        profitTxs.push({ profit: profitOrLoss, date: new Date().toLocaleString() });

        setBuyTransactions(buyTxs);
        setSellTransactions(sellTxs);
        setProfitTransactions(profitTxs);
    };

    useEffect(() => {
        fetchTransactions();
    }, [connection, context, publicKey]);

    let light = useTheme().palette.primary.light;
    let dark = useTheme().palette.primary.dark;


    return (
        <Box sx={(theme) => ({
            mt: 5,
            width: '100%',
            minHeight: 200,
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0, 0.2)' : '#000',
            border: theme.palette.mode === 'light' ? `2px solid ${light}` : `2px solid ${dark}`,
            borderRadius: theme.spacing(1),
            boxShadow: theme.palette.mode === 'light' ? '0 0 1px rgba(85, 166, 246, 0.1),1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)' : '0 0 1px rgba(85, 166, 246, 0.1),1px 1.5px 2px -1px rgba(85, 166, 246, 0.15),4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)',
        })}>
            <Grid container spacing={2}>
                <Grid item md={4} xs={12}>
                    <Box sx={{ alignItems: 'center', height: '100%', overflowY: 'auto' }}>
                        <List>
                            {sellTransactions.map((buy, index) => (
                                <ListItem key={index} sx={{ gap: 1 }}>
                                    <ShoppingCartIcon color="primary" />
                                    <Chip sx={{ minWidth: 150 }} label={<div style={{ fontWeight: 'bold' }}>{buy.amount.toLocaleString("en", { maximumFractionDigits: 2 })}</div>} color="primary" />
                                    {buy.date}
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Grid>
                <Grid item md={4} xs={12}>
                    <Box sx={{height: '100%', overflowY: 'auto'}}>
                        <List>

                            {buyTransactions.map((sell, index) => (
                                <ListItem sx={{ gap: 1 }} key={index}>
                                    <SellIcon color="warning" />
                                    {sell.amount} tokens on {sell.date}
                                </ListItem>
                            ))}
                            {buyTransactions.length === 0 && (
                                <ListItem sx={{ gap: 1 }}>
                                    <SellIcon color="secondary" />
                                    You ain't sold nothin'... you're straight-up diamond hands!
                                </ListItem>
                            )}
                        </List>
                    </Box>
                </Grid>
                <Grid item md={4} xs={12}>
                    <Box>
                        <List>
                            <ListItem alignItems='center' sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                <img alt="" src={paperyuser} width="32px" height="32px" style={{ border: '1px solid', borderRadius: '50%' }} />
                                <Typography variant="body1" color="secondary" sx={{ mt: 1 }}>
                                    {addyuser ? `${addyuser.slice(0, 5)}...${addyuser.slice(-5)}` : 'Not Connected'}
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                <img alt="" src={"https://solana.com/favicon.png"} width="32px" height="32px" style={{ border: '1px solid', borderRadius: '50%' }} />
                                <Typography variant='body1' color="secondary">{((balance ?? 0) / 1000000000).toFixed(4)} SOL</Typography>
                            </ListItem>
                            <ListItem sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                                <img alt="" src={asset} width="32px" height="32px" style={{ border: '1px solid', borderRadius: '50%' }} />
                                <Typography variant='body1' color="secondary">{(papery ?? 0).toLocaleString('en', { maximumFractionDigits: 0 })} PAPERY</Typography>
                            </ListItem>

                        </List>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UserHero;
