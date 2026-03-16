import { createContext, useContext } from 'react';

export interface ThemeContextType {
  colorMode: 'light' | 'dark';
  density: 'comfortable' | 'compact';
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
