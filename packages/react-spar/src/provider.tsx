import { createContext, useContext, useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

import type { ComponentCustomizationRegistry, ComponentName, ComponentsThemeMap } from './customization';

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
        // `display: contents` is part of the provider contract (ADR 0007);
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

  return {
    colorMode: context.colorMode,
  };
};

/**
 * Reads the theme config for a known component name from `SparReactProvider`.
 * The return type is narrowed by the component key: `useComponentTheme('Button')`
 * returns `ComponentThemeConfig<ButtonProps, ButtonSlot, ButtonSlotProps> | undefined`.
 *
 * Passing an unknown component name is a compile-time error.
 */
export const useComponentTheme = <K extends ComponentName>(componentName: K): ComponentCustomizationRegistry[K] | undefined => {
  const context = useContext(SparReactContext);
  /*
   * Indexed access on a `Partial<...>`-shaped map with a generic key cannot be
   * narrowed by TypeScript without help: under non-strict-null tsconfigs (the
   * docs site extends `@docusaurus/tsconfig`, which does not enable strict),
   * `ComponentsThemeMap[K]` keeps its optional modifier and fails the variance
   * check against `ComponentCustomizationRegistry[K]`. The runtime value is
   * already `ComponentCustomizationRegistry[K] | undefined` by construction
   * of `ComponentsThemeMap`, so this assertion is a typing bridge, not a
   * behavioral change. Recorded as load-bearing in ADR 0006.
   */
  return context?.components?.[componentName] as ComponentCustomizationRegistry[K] | undefined;
};
