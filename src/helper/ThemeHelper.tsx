import { PaletteMode} from '@mui/material';

export class ThemeHelper {

    public static theme_: PaletteMode = 'light';

public static getTheme = (): PaletteMode => {
    type Theme = 'light' | 'dark';
    const theme: Theme = ThemeHelper.theme_;
    console.log(theme)
    return theme;
};

public static setTheme = (theme: string) => {
    localStorage.setItem('theme', theme);
    console.log(theme)
    this.theme_ = theme as PaletteMode;
  };
}