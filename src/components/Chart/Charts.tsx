import React from 'react';
import { Box } from '@mui/material';

export const Charts = () => {
    return (
        <Box position="relative" width="100%" mt={10} sx={(theme) => ({margin: `2px solid ${theme.palette.primary}` })} paddingBottom={{ xs: '125%', md: '65%',  }}>
            <iframe
                src="https://dexscreener.com/solana/579KdT9okDg9BC3ptNH6sj359qzs581SQiGDbEqM4iVJ?embed=1&theme=dark"
                title="Dex Screener"
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    border: 0
                }}
            ></iframe>
        </Box>
    );
};
