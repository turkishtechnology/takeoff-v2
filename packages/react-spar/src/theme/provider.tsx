import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { ThemeContext, type ThemeContextType } from './context';

type ThemeProviderElementProps = Omit<HTMLAttributes<HTMLDivElement>, keyof ThemeContextType | 'children'>;

const providerStyle: CSSProperties = {
  display: 'contents',
};

export interface ThemeProviderProps extends ThemeProviderElementProps, Partial<ThemeContextType> {
  children: ReactNode;
}

export const ThemeProvider = ({ children, colorMode = 'light', density = 'comfortable', style, ...restProps }: ThemeProviderProps) => {
  return (
    <ThemeContext.Provider value={{ colorMode, density }}>
      <div {...restProps} data-theme={colorMode} data-color-mode={colorMode} data-density={density} style={style ? { ...providerStyle, ...style } : providerStyle}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
