import { createContext, useContext, useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export type ColorMode = 'light' | 'dark';
export type Density = 'comfortable' | 'compact';
export type TextDirection = 'ltr' | 'rtl';

export interface SparReactProviderValue {
  colorMode: ColorMode;
  density: Density;
  dir: TextDirection;
  locale?: string;
}

export interface ThemeValue {
  colorMode: ColorMode;
  density: Density;
}

type SparReactProviderElementProps = Omit<HTMLAttributes<HTMLDivElement>, keyof SparReactProviderValue | 'children'>;

const providerStyle: CSSProperties = {
  display: 'contents',
};

const SparReactContext = createContext<SparReactProviderValue | undefined>(undefined);

export interface SparReactProviderProps extends SparReactProviderElementProps, Partial<SparReactProviderValue> {
  children: ReactNode;
}

export const SparReactProvider = ({ children, colorMode = 'light', density = 'comfortable', dir = 'ltr', locale, style, ...restProps }: SparReactProviderProps) => {
  const value = useMemo(() => ({ colorMode, density, dir, locale }), [colorMode, density, dir, locale]);

  return (
    <SparReactContext.Provider value={value}>
      <div
        {...restProps}
        dir={dir}
        lang={locale}
        data-theme={colorMode}
        data-color-mode={colorMode}
        data-density={density}
        data-direction={dir}
        data-locale={locale}
        style={style ? { ...providerStyle, ...style } : providerStyle}
      >
        {children}
      </div>
    </SparReactContext.Provider>
  );
};

export const useTheme = (): ThemeValue => {
  const context = useContext(SparReactContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a SparReactProvider');
  }

  return {
    colorMode: context.colorMode,
    density: context.density,
  };
};
