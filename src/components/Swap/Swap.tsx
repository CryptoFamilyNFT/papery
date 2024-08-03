import React, { ChangeEvent, MouseEventHandler, useContext, useEffect, useState, } from 'react';
import { Box, Button, InputAdornment, MenuItem, Select, TextField, Typography, Divider, TextFieldProps, TextFieldVariants, Alert, IconButton, Backdrop, Slider, Switch, Chip, Modal } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { SolanaContext } from '../../helper/SolanaContext';
import { SolanaContextRepository } from '../../helper/SolanaContextRepository';
import { IPair } from '../../helper/DSHelper';
import SolanaHelper from '../../helper/SolanaHelper';
import { useConnection, useWallet, Wallet } from '@solana/wallet-adapter-react';
import { Liquidity, LiquidityPoolKeysV4, TokenAccount } from '@raydium-io/raydium-sdk';
import { VersionedTransaction, TransactionMessage, PublicKey, LAMPORTS_PER_SOL, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import AddressFactory from '../../common/AddressFactory';
import { CheckCircleOutline, SettingsOutlined } from '@mui/icons-material';

// Dummy data for the token list
const tokenList = [
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'PAPERY', name: 'PAPERY' },
    // Add more tokens as needed
];

const Swap = () => {
    const [fromToken, setFromToken] = useState(tokenList[0].symbol);
    const [toToken, setToToken] = useState(tokenList[1].symbol);
    const [amount, setAmount] = useState('');
    const { context, saveContext } = useContext(SolanaContext) as SolanaContextRepository;
    const [raySolPoolKey, setRaySolPoolKey] = useState<LiquidityPoolKeysV4>();
    const [swapInDirection, setSwapInDirection] = useState<boolean>(false); // IN: PAPERY to SOL; OUT: SOL to PAPERY
    const { connection } = useConnection()
    const { publicKey, wallet, signTransaction, sendTransaction } = useWallet()
    const [alertHeading, setAlertHeading] = useState<string>('');
    const [alertContent, setAlertContent] = useState<string>('');
    const [alertType, setAlertType] = useState<string>('warning');
    const [alertShow, setAlertShow] = useState<boolean>(false);
    const [solBalance, setSolBalance] = useState<number>(0);
    const [rayBalance, setRayBalance] = useState<number>(0);
    const [exchangeRate, setExchangeRate] = useState<string>('');
    const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([]);
    const [priceImpact, setPriceImpact] = useState<string>('');
    const [open, setOpen] = React.useState(false);
    const [slippage, setSlippage] = useState<number | number[]>(1);

    const handleSlippage = (event: Event, newValue: number | number[]) => {
        // event non ha 'target.value', ma newValue contiene il valore del Slider
        setSlippage(newValue);
        console.log('Slippage value:', newValue);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleOpen = () => {
        setOpen(true);
    };

    const [input, setInput] = useState<string>('0');
    const [output, setOutput] = useState<string>('0');

    // Dummy conversion function
    const convertAmount = (amount: string, from: string, to: string) => {
        if (!amount) return '0';
        // This is a placeholder. Implement your real conversion logic here.
        return (Number(amount) * Number(context.priceSol ?? 0)).toLocaleString('en', { maximumFractionDigits: 2 }); // Example conversion rate
    };
    // Calculate balances
    const balance = fromToken === 'PAPERY'
        ? context.balancePapery ?? 0
        : (context.balanceSol ?? 0) / 1000000000;

    const handlePercentageClick = (percentage: number) => {
        if (swapInDirection === true) {
            const newAmount = (solBalance * (percentage / 100)).toFixed(5)
            setInput(newAmount);
        } else {
            const newAmount = (rayBalance * (percentage / 100)).toFixed(0);
            setInput(newAmount);
        }
    };

    useEffect(() => {
        setRaySolPoolKey(context.LPkey)
    }, [context.LPkey])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (publicKey !== null) {
                const balance = await connection.getBalance(publicKey); // get SOL balance
                setSolBalance(balance / LAMPORTS_PER_SOL);

                const tokenAccs = await SolanaHelper.getTokenAccountsByOwner(connection, publicKey as PublicKey); // get all token accounts
                setTokenAccounts(tokenAccs);

                let rayTokenAddress: PublicKey;
                tokenAccs.filter(acc => acc.accountInfo.mint.toBase58() === AddressFactory.getTokenAddress(102)).map(async (acc) => {
                    rayTokenAddress = acc.pubkey;
                    const accBalance = await connection.getTokenAccountBalance(rayTokenAddress);
                    const rayBal = accBalance.value.uiAmount || 0;
                    setRayBalance(rayBal);
                });

            }
        };
        getAccountInfo()
    }, [publicKey, connection, alertShow])

    useEffect(() => {
        const getInitialRate = async () => {
            try {
                if (raySolPoolKey && publicKey && Number(input) !== 0) {
                    const { executionPrice, ...data } = await SolanaHelper.calcAmountOut(connection, raySolPoolKey, Number(input), swapInDirection, slippage);
                    console.log(executionPrice?.toFixed());
                    const rate = executionPrice?.toFixed(4) || '0';
                    console.log(data.amountOut.toFixed(), data.amountIn.toFixed(), data.currentPrice.toFixed())
                    setOutput(data.amountOut.toFixed());
                    if (swapInDirection === false && Number(input) < 1000) {
                        setPriceImpact('0')
                    } else {
                        setPriceImpact(data.priceImpact.toFixed())
                    }
                }
            } catch (error) {
                console.error("Error in getInitialRate:", error);
            }
        };

        getInitialRate();
    }, [publicKey, raySolPoolKey, swapInDirection, input, slippage]);


    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        console.log(e.target.value)
    };

    const useVersionedTransaction = VersionedTransaction

    const handleSwap = async () => {
        const inputNumber = parseFloat(input);
        console.log(raySolPoolKey && publicKey && wallet && wallet.adapter.publicKey)
        if (raySolPoolKey && publicKey && wallet && wallet.adapter.publicKey && signTransaction) {
            try {
                const { amountIn, minAmountOut } = await SolanaHelper.calcAmountOut(connection, raySolPoolKey, inputNumber, swapInDirection, slippage);

                console.log({ minAmountOut, amountIn });
                const userTokenAccounts = await SolanaHelper.getTokenAccountsByOwner(connection, publicKey)
                console.log("userTokenAccounts", userTokenAccounts)

                const swapTransaction = await Liquidity.makeSwapInstructionSimple({
                    connection: connection,
                    makeTxVersion: useVersionedTransaction ? 0 : 1,
                    poolKeys: raySolPoolKey,
                    userKeys: {
                        tokenAccounts: userTokenAccounts,
                        owner: publicKey,
                    },
                    amountIn: amountIn,
                    amountOut: minAmountOut,
                    fixedSide: "in",
                    config: {
                        bypassAssociatedCheck: false,
                    },

                })

                const recentBlockhashForSwap = await connection.getLatestBlockhash()
                const instructions = swapTransaction.innerTransactions[0].instructions.filter(Boolean)

                const versionedTransaction: Transaction = new Transaction({
                    blockhash: recentBlockhashForSwap.blockhash,
                    lastValidBlockHeight: recentBlockhashForSwap.lastValidBlockHeight,
                    feePayer: publicKey,
                })

                versionedTransaction.add(...instructions)


                const signedTransaction = await signTransaction(versionedTransaction)
                const txid = await sendTransaction(signedTransaction, connection);

                console.log(txid, versionedTransaction)

                setAlertHeading('Swapped!');
                setAlertContent(`Check TX at https://solscan.io/tx/${txid}`);
                setAlertType('success');
                setAlertShow(true);
            } catch (err: any) {
                console.error('tx failed => ', err);
                setAlertHeading('Something went wrong');
                if (err?.code && err?.message) {
                    setAlertContent(`${err.code}: ${err.message}`)
                } else {
                    setAlertContent(JSON.stringify(err));
                }
                setAlertType('warning');
                setAlertShow(true);
            }
        }
    };

    useEffect(() => {
        if (alertShow) {
            const time = setTimeout(() => {
                setAlertShow(false)
            }, 3000)

            return clearTimeout(time)
        }
    }, [alertShow, alertHeading])

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper', mt: 20 }}>
            <Typography variant="h5" gutterBottom align="center">
                {alertShow === true && alertType === 'success' && (
                    <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="success" action={
                        <Button color="inherit" size="small" onClick={() => setAlertShow(false)}>
                            X
                        </Button>
                    }>
                        {alertHeading} | {alertContent}
                    </Alert>
                )}
                {alertShow === true && alertType === 'warning' && (
                    <Alert icon={<CheckCircleOutline fontSize="inherit" />} severity="success">
                        {alertHeading} | {alertContent}
                    </Alert>
                )}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        gap: 1,
                        mt: 1
                    }}
                >
                    <Box sx={{ flexGrow: 1 }} /> {/* This will push buttons to the end */}
                    <Button color="secondary" variant="outlined" onClick={() => handlePercentageClick(25)}>25%</Button>
                    <Button color="secondary" variant="contained" onClick={() => handlePercentageClick(50)}>50%</Button>
                    <Button color="secondary" variant="contained" onClick={() => handlePercentageClick(75)}>75%</Button>
                    <Button color="secondary" variant="contained" onClick={() => handlePercentageClick(100)}>100%</Button>
                </Box>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        gap: 1,
                        mt: 1
                    }}
                >
                    <AccountBalanceWalletIcon color="secondary" />
                    <Typography variant='body1' color="secondary">
                        {`${swapInDirection === true ? solBalance.toLocaleString('en', { maximumFractionDigits: 5 }) : rayBalance.toLocaleString('en', { maximumFractionDigits: 0 })} ${swapInDirection === true ? 'SOL' : 'PAPERY'}`}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} /> {/* This will push buttons to the end */}
                    <Modal
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={open}
                        onClose={() => setOpen(false)}
                    >
                        <Box sx={(theme) => ({
                            height: 'auto',
                            width: 300, // default width
                            [theme.breakpoints.up('md')]: {
                                width: 500, // width for medium screens and above
                                height: 'auto',
                            },
                            position: 'absolute' as 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            padding: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            border: `1px solid ${theme.palette.primary.dark}`,
                            alignItems: 'center',
                            verticalAlign: 'center'
                        })}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'flex-start' }}>
                                <Typography sx={(theme) => ({color: theme.palette.mode === 'light' ? 'black' : 'primary', mt: 1, mb: 0 })} variant="body1">Slippage: {slippage}%</Typography>
                                <Slider
                                    defaultValue={1}
                                    sx={(theme) => ({color: theme.palette.mode === 'light' ? 'black' : 'primary', m: 5})}
                                    min={1}
                                    max={20}
                                    color="primary"
                                    value={slippage}
                                    onChange={handleSlippage}
                                    aria-label="Small"
                                    valueLabelDisplay="auto"
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 1, alignItems: 'flex-start' }}>
                                <Typography sx={(theme) => ({color: theme.palette.mode === 'light' ? 'black' : 'primary', mt: 1, mb: 0 })} variant="body1">Pro Papery Trader</Typography>
                                <Switch value={true} color="info"></Switch>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 1, alignItems: 'flex-start' }}>
                                <Typography sx={(theme) => ({color: theme.palette.mode === 'light' ? 'black' : 'primary', mt: 1, mb: 0 })} variant="body1">Show Chart</Typography>
                                <Switch value={true} color="warning"></Switch>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
                                <Button sx={(theme) => ({color: theme.palette.mode === 'light' ? 'black' : 'primary', mt: 1, mb: 0 })} onClick={() => setOpen(false)}>Close</Button>
                            </Box>
                        </Box>
                    </Modal>
                    <Chip label={`${slippage}%`} color="success" variant="outlined" />
                    <IconButton onClick={handleOpen}>
                        <SettingsOutlined color="secondary"></SettingsOutlined>
                        {/**BACKDROP */}

                    </IconButton>
                </Box>
                <TextField
                    label="You swap"
                    InputProps={{
                        endAdornment: <InputAdornment position="end">{`${swapInDirection === true ? 'SOL' : 'PAPERY'}`}</InputAdornment>,
                        sx: { bgcolor: 'background.default' }

                    }}
                    type="text"
                    className="form-control form-control-lg"
                    value={input}
                    onChange={handleChange}
                    variant="outlined"
                />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<SwapHorizIcon sx={{ ml: 1 }} />}
                        sx={{ alignSelf: 'center' }}
                        onClick={() => {
                            setSwapInDirection(!swapInDirection ? true : false)
                        }}
                    />
                </Box>

                <TextField
                    label="You get"
                    value={output}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">{`${swapInDirection === false ? 'SOL' : 'PAPERY'}`}</InputAdornment>,
                        readOnly: true,
                        sx: { bgcolor: 'background.default' }
                    }}

                />

                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        gap: 1,
                        mt: 1
                    }}
                >
                    <AccountBalanceWalletIcon color="secondary" />

                    <Typography variant='body1' color="secondary">
                        {`${swapInDirection === true ? rayBalance.toLocaleString("en", { maximumFractionDigits: 0 }) : solBalance.toLocaleString("en", { maximumFractionDigits: 5 })} ${swapInDirection === true ? 'PAPERY' : 'SOL'}`}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} /> {/* This will push buttons to the end */}
                </Box>

                <Box
                    sx={(theme) => ({
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        background: theme.palette.mode === 'light' ? 'black' : 'black',
                        color: theme.palette.mode === 'light' ? 'white' : 'black',
                        border: theme.palette.mode === 'light' ? `2px solid ${theme.palette.secondary}` : `2px solid ${theme.palette.primary}`,
                        height: 100,
                        borderRadius: 10,
                        gap: 2,
                        mt: 0,
                    })}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: 600, minWidth: 'auto', justifyContent: 'space-between', width: '100%', padding: '0 16px', mt: 3 }}>
                        <Typography
                            sx={(theme) => ({
                                color: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.secondary.dark,
                            })}
                            variant="body1"
                        >
                            Minimum Received
                        </Typography>
                        <Typography
                            sx={(theme) => ({
                                color: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary.dark,
                            })}
                            variant="body1"
                        >
                            {Number(output).toLocaleString('en', { maximumFractionDigits: 5 })}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth: 600, minWidth: 'auto', justifyContent: 'space-between', width: '100%', padding: '0 16px' }}>
                        <Typography
                            sx={(theme) => ({
                                color: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.secondary.dark,
                            })}
                            variant="body1"
                        >
                            Price Impact
                        </Typography>
                        <Typography
                            sx={(theme) => ({
                                color: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary.dark,
                            })}
                            variant="body1"
                        >
                            {priceImpact}%
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ my: 2 }} />

                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowDownwardIcon />}
                    onClick={handleSwap}
                    disabled={!publicKey || parseFloat(input) > (swapInDirection === true ? solBalance : rayBalance)}
                >
                    Swap
                </Button>
            </Box>
        </Box>
    );
};

export default Swap;
