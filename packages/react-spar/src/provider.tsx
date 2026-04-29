import { createContext, useContext, useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

import type { ComponentName, ComponentThemeRegistry, ComponentsThemeMap } from './core';

export type ColorMode = 'light' | 'dark';

export interface SparReactProviderValue {
  colorMode: ColorMode;
  locale?: string;
  components?: ComponentsThemeMap;
}

export interface ThemeValue {
  colorMode: ColorMode;
}

type SparReactProviderElementProps = Omit<HTMLAttributes<HTMLDivElement>, keyof SparReactProviderValue | 'children'>;

const providerStyle: CSSProperties = {
  display: 'contents',
};

const SparReactContext = createContext<SparReactProviderValue | undefined>(undefined);

export interface SparReactProviderProps extends SparReactProviderElementProps, Partial<SparReactProviderValue> {
  children: ReactNode;
}

export const SparReactProvider = ({ children, colorMode = 'light', locale, components, style, ...restProps }: SparReactProviderProps) => {
  const value = useMemo(() => ({ colorMode, locale, components }), [colorMode, locale, components]);

  return (
    <SparReactContext.Provider value={value}>
      <div
        {...restProps}
        lang={locale}
        data-theme={colorMode}
        // `display: contents` is part of the provider contract (ADR-0005);
        // consumer `style` is merged underneath so the invariant always wins.
        style={style ? { ...style, ...providerStyle } : providerStyle}
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
  return { colorMode: context.colorMode };
};

/**
 * Read the provider override config for a known component name. The return
 * type narrows by key: `useComponentTheme('Accordion')` returns
 * `ComponentThemeConfig<AccordionProps> | undefined`. Unknown names are a
 * compile-time error.
 */
export const useComponentTheme = <K extends ComponentName>(componentName: K): ComponentThemeRegistry[K] | undefined => {
  const context = useContext(SparReactContext);
  // The runtime value is `ComponentThemeRegistry[K] | undefined` by
  // construction, but indexing a `Partial<...>`-shaped map with a generic
  // key keeps the optional modifier under non-strict-null tsconfigs (the
  // docs site extends `@docusaurus/tsconfig`, which is not strict). The
  // cast bridges typing only — it does not change behavior.
  return context?.components?.[componentName] as ComponentThemeRegistry[K] | undefined;
};
