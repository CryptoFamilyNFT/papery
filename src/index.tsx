import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createTheme } from '@mui/material';
import ThemeProvider from '@mui/material';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import SolanaHelper from './helper/SolanaHelper';
import SolanaProvider from './helper/SolanaProvider';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const wallets = SolanaHelper.getNetwork().wallets;

root.render(
  <ConnectionProvider endpoint={"https://solana-mainnet.core.chainstack.com/b963a6e2efa9342dcb953d8087f458cd"}>
    <SolanaProvider>
      <WalletProvider wallets={wallets()} autoConnect>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </WalletProvider>
    </SolanaProvider>
  </ConnectionProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
