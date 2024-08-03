import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, Grid, IconButton, Typography } from '@mui/material';
import asset from "../../assets/papery.jpg"
import weird_black from "../../assets/weird_black.jpg"
import { DiscountRounded, Telegram, Twitter } from '@mui/icons-material';


const Hero: React.FC = () => {
    let primary = useTheme().palette.primary.light;
    let dark = useTheme().palette.primary.dark;



    return (
        <Grid container sx={(theme) => ({
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0, 0.2)' : '#000',
            height: 600,
            backgroundImage: theme.palette.mode === 'light' ? `url(${weird_black})` : `url(${weird_black})`,
            backgroundSize: "cover",
            border: theme.palette.mode === 'light' ? `2px solid ${primary}` : `2px solid ${dark}`,
            borderRadius: theme.spacing(1),
            marginTop: 0,
            boxShadow: theme.palette.mode === 'light' ? '0 0 1px rgba(85, 166, 246, 0.1),1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)' : '0 0 1px rgba(85, 166, 246, 0.1),1px 1.5px 2px -1px rgba(85, 166, 246, 0.15),4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)',
            alignItems: 'center',
            gap: 10,
            position: 'relative',
            padding: 5,
        })}>
            <div style={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(5px)',
                zIndex: 0,
                borderRadius: 10,
            }}></div>

            <Grid item xs={12} sm={6} md={12} sx={{ alignItems: 'center', textAlign: 'center', mt: 10, zIndex: 1 }}>
                <div style={{ zIndex: 10 }}>
                    <img
                        alt=""
                        style={{
                            border: `2px solid ${dark}`,
                            borderRadius: '50%',
                            animation: "bounce 2s ease-in-out infinite"
                        }}
                        src={asset}
                        width={200}
                        height="auto"
                    />
                    <style>
                        {`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-50px);
            }
          }
        `}
                    </style>
                </div>
                <Typography variant="h3" sx={(theme) => ({ mt: 5, color: theme.palette.mode === 'light' ? primary : dark })}>$PAPERY</Typography>
                <Typography variant="h4" sx={(theme) => ({ mt: 2, color: theme.palette.mode === 'dark' ? primary : dark })}>THE RICHEST PAPER ON SOLANA</Typography>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    marginTop: 20
                }}>
                    <Button variant="contained" color="primary">
                        Swap
                    </Button>

                    <Button variant="contained" color="primary" href='/chart'>
                        Chart
                    </Button>
                    <Button variant="outlined" color="primary">
                        Game
                    </Button>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 20,
                    marginTop: 20
                }}>
                    <IconButton
                        color="primary"
                        component="a"
                        href="https://x.com/PAPERYCTO"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Twitter />
                    </IconButton>
                    <IconButton
                        color="primary"
                        component="a"
                        href="https://t.me/paperyrealcto"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Telegram />
                    </IconButton>
                    <IconButton
                        color="primary"
                        component="a"
                        href="https://solscan.io/token/9KRXddfHPTjqHmbNSStvzPTbWQyp8JJocofXJNeXpump"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <DiscountRounded />
                    </IconButton>
                </div>
            </Grid>
            <Grid item xs={12} sm={6}>
                {/* Aggiungi qui le tue foto o dati */}
            </Grid>
        </Grid>
    );
};

export default Hero;