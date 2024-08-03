import { PaletteMode, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { amber, deepOrange, grey } from '@mui/material/colors';

const customColors = {
    primary: '#F9F9E0',
    secondary: '#000',
    primaryDark: '#FF9EAA',
    secondaryDark: '#F9F9E0',
};


const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        primary: {
            ...(mode === 'light'
                ? {
                    main: customColors.primary,
                }
                : {
                    main: customColors.primaryDark,
                }),
        },
        secondary: {
            ...(mode === 'light'
                ? {
                    main: customColors.secondary,
                }
                : {
                    main: customColors.secondaryDark,
                }),
        },
        error: {
            main: deepOrange[500],
        },
        warning: {
            main: amber[700],
        },
        info: {
            main: grey[700],
        },
        success: {
            main: amber[400],
        },
        shadows: {
            // Effetto di ombreggiatura per il box
            boxShadow: mode === 'dark'
                ? [
                    '0 0 1px rgba(85, 166, 246, 0.1)',
                    '1px 1.5px 2px -1px rgba(85, 166, 246, 0.15)',
                    '4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)',
                ]
                : [
                    '0 0 1px rgba(85, 166, 246, 0.1)',
                    '1px 1.5px 2px -1px rgba(85, 166, 246, 0.15)',
                    '4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)',
                ],
        },
    },
});

export const darkTheme = createTheme(getDesignTokens('dark'));
export const lightTheme = createTheme(getDesignTokens('light'));
