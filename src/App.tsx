/* eslint-disable react-hooks/exhaustive-deps */
import React, { Suspense, useContext, useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import AppAppBar from './components/AppAppBar';
import { Box, CssBaseline, AlertTitle, Alert, ThemeProvider, PaletteMode, Backdrop, CircularProgress } from '@mui/material';
import getLPTheme from './getLPTheme';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeHelper } from './helper/ThemeHelper';
import Hero from './components/Hero/Hero';
import { darkTheme, lightTheme } from './theme/Theme';
import dark_BG from './assets/dark_bg.jpg';
import DSHelper, { IPair } from './helper/DSHelper';
import { Charts } from './components/Chart/Charts';
import UserHero from './components/User/UserHero';
import Swap from './components/Swap/Swap';
import { SolanaContext } from './helper/SolanaContext';
import { SolanaContextRepository } from './helper/SolanaContextRepository';
import SolanaHelper from './helper/SolanaHelper';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LiquidityAssociatedPoolKeysV4, LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk';

function WrapperApp() {
  return (
    <Box sx={{ flexGrow: 1, p: 3, zIndex: 1 }}>
      <Alert severity="warning" sx={{ marginTop: 10 }}>
        <AlertTitle>Community Takeover (CTO) - A community claimed ownership for this token on Jul 12 2024
        </AlertTitle>
      </Alert>
      <Hero />
      <UserHero />
    </Box>
  );
}

function Content() {
  const bg = "https://c1.wallpaperflare.com/path/335/477/318/paper-background-wallpaper-texture-1d3813f1de07544f82100481b9b76884.jpg"
  const bg_black = dark_BG
  return (
    <Box
      component="main"
      sx={(theme) => ({
        backgroundImage: theme.palette.mode === 'light' ? `url(${bg})` : `url(${bg_black})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
      })}
    >
      <Routes>
        <Route path="/" element={<WrapperApp />} />
        <Route path="/chart" element={<Charts />} />
        <Route path="/swap" element={<Swap />} />
      </Routes>
    </Box>
  );
}

function App() {
  const [mode, setMode] = React.useState<PaletteMode>('light');
  const [open, setOpen] = React.useState(false);
  const [alert, setAlert] = React.useState(true);
  const [userInfo, setUserInfo] = React.useState<AccountInfo<Buffer> | undefined>(undefined);
  const [lamport_user, setLamportUser] = React.useState<number>(0);
  const { context, saveContext } = React.useContext(SolanaContext) as SolanaContextRepository;
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const executeUser = async (publicKey: PublicKey) => {
    console.log("User is connected")
    const user_info = await connection.getAccountInfo(publicKey);
    console.log("USER_INFO[]: ", user_info)
  }

  async function executeQuery(publicKey: PublicKey) {
    const ctx = await SolanaHelper.queryProviderInfo(context, publicKey, connection)
    saveContext({ ...ctx, isConnected: true })
    console.log("CTX: ", ctx, ctx.balancePapery, ctx.balanceSol)
  }

  React.useEffect(() => {
    if (publicKey !== null) {
      executeUser(publicKey)
      executeQuery(publicKey)
    } else {
      return
    }
  }, [publicKey]);

  const toggleColorMode = () => {
    setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
    ThemeHelper.setTheme(mode);
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  function closeAlert() {
    setAlert(false);
  }

  const [pairData, setPairData] = React.useState<IPair[] | undefined>(undefined);
  const dsHelper = new DSHelper();
  const tokenAddress = '9KRXddfHPTjqHmbNSStvzPTbWQyp8JJocofXJNeXpump';

  React.useEffect(() => {
    dsHelper.getTokenInfo(tokenAddress)
      .then(pairs => {
        setPairData(pairs);
        console.log('Token Info:', pairs);
        saveContext({ ...context, pool: pairs[0] })
      })
      .catch(error => {
        console.error('Error fetching token info:', error);
      });
  }, []);

  React.useEffect(() => {
    async function getPoolInfo() {
      const poolInfo: LiquidityPoolKeysV4 = await SolanaHelper.getPoolInfo(connection) as LiquidityPoolKeysV4
      saveContext({ ...context, LPkey: poolInfo })
      console.log(poolInfo)
    }
    getPoolInfo()
  }, [])

  type CustomThemeProviderProps = {
    children: React.ReactNode;
    mode: PaletteMode;
  };

  const bg = "https://c1.wallpaperflare.com/path/335/477/318/paper-background-wallpaper-texture-1d3813f1de07544f82100481b9b76884.jpg"
  const bg_black = dark_BG

  const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children, mode }: { children: React.ReactNode, mode: PaletteMode }) => {
    return <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>{children}</ThemeProvider>;
  };

  //const Swap = React.lazy(() => import('./components/Swap/Swap'));

  return (
    <CustomThemeProvider mode={mode}>
      <CssBaseline />
      <Router>
        <AppAppBar mode={mode} ds={pairData ?? [] as IPair[]} toggleColorMode={toggleColorMode} balance={context.balanceSol !== undefined ? context.balanceSol / 1000000000 : 0} context={context} />
        <Content />
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
