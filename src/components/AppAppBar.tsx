import * as React from 'react';
import { Avatar, IconButton, PaletteMode, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import ToggleColorMode from './ToggleColorMode';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import DSHelper, { IPair } from '../helper/DSHelper';
import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ISolanaContext } from '../helper/ISolanaContext';
import { AccountInfo } from '@solana/web3.js';
import { Link } from 'react-router-dom';
import Swap from './Swap/Swap';
import { Link as RouterLink } from 'react-router-dom';
import { Telegram } from '@mui/icons-material';

const logoStyle = {
    width: '50px',
    height: 'auto',
    cursor: 'pointer',
};

interface AppAppBarProps {
    mode: PaletteMode;
    ds: IPair[];
    toggleColorMode: () => void;
    balance: number;
    context: ISolanaContext;
}

const lamport = 1000000000;

function AppAppBar({ mode, ds, toggleColorMode, balance, context }: AppAppBarProps) {
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const scrollToSection = (sectionId: string) => {
        const sectionElement = document.getElementById(sectionId);
        const offset = 128;
        if (sectionElement) {
            const targetScroll = sectionElement.offsetTop - offset;
            sectionElement.scrollIntoView({ behavior: 'smooth' });
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth',
            });
            setOpen(false);
        }
    };

    let primary = useTheme().palette.primary.light;
    let dark = useTheme().palette.primary.dark;

    return (
        <div>
            <AppBar
                position="fixed"
                sx={(theme) => ({
                    boxShadow: 0,
                    bgcolor: 'transparent',
                    backgroundImage: 'none',
                    mt: 2,
                })}
            >
                <Container maxWidth="lg">
                    <Toolbar
                        variant="regular"
                        sx={(theme) => ({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexShrink: 0,
                            borderRadius: '999px',
                            bgcolor:
                                theme.palette.mode === 'light'
                                    ? 'rgba(255, 255, 255, 0.4)'
                                    : 'rgba(0, 0, 0, 0.4)',
                            backdropFilter: 'blur(24px)',
                            maxHeight: 40,
                            border: theme.palette.mode === 'light' ? `2px solid ${primary}` : `2px solid ${dark}`,
                            boxShadow:
                                theme.palette.mode === 'light'
                                    ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                                    : '0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)',
                        })}
                    >
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: 'flex',
                                alignItems: 'center',
                                ml: '-18px',
                                px: 0,
                            }}
                        >
                            {/*<img
                                src={
                                    LOGO
                                }
                                style={logoStyle}
                                alt="logo of ethercode"
                            />*/}
                            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                                <MenuItem
                                    component={RouterLink}
                                    to='/'
                                    sx={{ py: '6px', px: '12px' }}
                                >
                                    <Typography variant="body2" color="text.primary">
                                        Home
                                    </Typography>
                                </MenuItem>
                                <MenuItem
                                    component={RouterLink}
                                    to='/chart'
                                    sx={{ py: '6px', px: '12px' }}
                                >
                                    <Typography variant="body2" color="text.primary">
                                        Chart
                                    </Typography>
                                </MenuItem>
                                <MenuItem
                                    component={RouterLink}
                                    to='/swap'
                                    sx={{ py: '6px', px: '12px' }}
                                >
                                    <Typography variant="body2" color="text.primary">
                                        Swap
                                    </Typography>
                                </MenuItem>
                                {/*MenuItem
                                    onClick={() => scrollToSection('highlights')}
                                    sx={{ py: '6px', px: '12px' }}
                                >
                                    <Typography variant="body2" color="text.primary">
                                        Memes
                                    </Typography>
                                </MenuItem>
                                <MenuItem
                                    onClick={() => scrollToSection('pricing')}
                                    sx={{ py: '6px', px: '12px' }}
                                >
                                    <Typography variant="body2" color="text.primary">
                                        FAQ
                                    </Typography>
                                </MenuItem>*/}
                                <Divider />
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                gap: 0.5,
                                alignItems: 'center',
                            }}
                        >
                            <IconButton
                                sx={(theme) => ({ color: theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.secondary.dark })}
                                component="a"
                                href="https://t.me/paperyrealcto"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Telegram />
                            </IconButton>
                            {/* */}
                            {ds !== undefined && ds !== null && (
                                <Typography variant='body1' color={"secondary"}>{ds[0]?.priceUsd}</Typography>
                            )}
                            <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
                            {/** user section **/}
                        </Box>
                        <Box sx={{ display: { sm: '', md: 'none' } }}>
                            <Button
                                variant="text"
                                color="primary"
                                aria-label="menu"
                                onClick={toggleDrawer(true)}
                                sx={{ minWidth: '30px', p: '4px' }}
                            >
                                <MenuTwoToneIcon sx={(theme) => ({ color: theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.secondary.dark })} />
                            </Button>
                            
                            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                                <Box
                                    sx={{
                                        minWidth: '60dvw',
                                        p: 2,
                                        backgroundColor: 'background.paper',
                                        flexGrow: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'end',
                                            flexGrow: 1,
                                        }}
                                    >
                                        <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
                                    </Box>
                                    <MenuItem
                                        component={RouterLink}
                                        to='/'
                                        sx={{ py: '6px', px: '12px', width: '100', display: 'flex', justifyContent: 'center' }} >
                                        <Button variant="contained" sx={(theme) => ({ width: '300px', color: theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.secondary.dark })} onClick={() => setOpen(false)}>Home</Button>
                                    </MenuItem>
                                    <MenuItem
                                        component={RouterLink}
                                        to='/chart'
                                        sx={{ py: '6px', px: '12px', width: '100', display: 'flex', justifyContent: 'center' }}>
                                        <Button variant="contained" sx={(theme) => ({ width: '300px', color: theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.secondary.dark })} onClick={() => setOpen(false)}>Chart</Button>
                                    </MenuItem>
                                    <MenuItem
                                        component={RouterLink}
                                        to='/swap'
                                        sx={{ py: '6px', px: '12px', width: '100', display: 'flex', justifyContent: 'center' }}>
                                        <Button variant="contained" sx={(theme) => ({ width: '300px', color: theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.secondary.dark })} onClick={() => setOpen(false)}>Swap</Button>
                                    </MenuItem>
                                    {/*<MenuItem onClick={() => scrollToSection('pricing')}>
                                        Memes
                                    </MenuItem>
                                    <MenuItem onClick={() => scrollToSection('pricing')}>
                                        FAQ
                                    </MenuItem>*/}
                                    <Divider />
                                    <MenuItem>
                                        <WalletModalProvider>
                                            <WalletMultiButton />
                                            <WalletDisconnectButton />
                                        </WalletModalProvider>
                                    </MenuItem>
                                    <MenuItem>
                                        <IconButton
                                            sx={(theme) => ({ color: theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.secondary.dark })}
                                            component="a"
                                            href="https://t.me/paperyrealcto"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Telegram />

                                        </IconButton>
                                    </MenuItem>
                                    <MenuItem>
                                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>Your Balance: {balance.toFixed(5)} SOL</Box>
                                    </MenuItem>
                                    <MenuItem>
                                        {/* */}
                                        {ds !== undefined && ds !== null && (
                                            <Typography variant='body1' color={"secondary"}>$PAPERY {ds[0]?.priceUsd}</Typography>
                                        )}
                                    </MenuItem>
                                </Box>
                            </Drawer>
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>{balance.toFixed(5)} SOL</Box>
                        <MenuItem>
                            <WalletModalProvider>
                                {context && !context.isConnected && (
                                    <WalletMultiButton />
                                )}
                                {context && context.isConnected && (
                                    <WalletDisconnectButton />
                                )}
                            </WalletModalProvider>
                        </MenuItem>
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
}

export default AppAppBar;