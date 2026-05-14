import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

import type { ComponentName, ComponentThemeRegistry, ComponentsThemeMap } from './core';
import { isDevelopment } from './utils';

export type ColorMode = 'light' | 'dark';

export interface TakeoffSparProviderValue {
  colorMode: ColorMode;
  locale?: string;
  components?: ComponentsThemeMap;
}

export interface ThemeValue {
  colorMode: ColorMode;
}

const TakeoffSparContext = createContext<TakeoffSparProviderValue | undefined>(undefined);

export interface TakeoffSparProviderProps extends Partial<TakeoffSparProviderValue> {
  children: ReactNode;
}

/**
 * Top-level provider for Takeoff React components. Writes `data-theme` and
 * `lang` to `document.documentElement` so styling and language attributes
 * propagate to portal-mounted descendants (Dialog, Popover, Tooltip, …) and
 * are picked up by global CSS selectors.
 *
 * Renders no DOM of its own — only a React context. For SSR apps, set
 * `<html data-theme="…" lang="…">` on the server (e.g. with a small inline
 * script that reads stored preferences) to avoid a first-paint flash before
 * the provider's effect runs.
 */
export const TakeoffSparProvider = ({ children, colorMode = 'light', locale, components }: TakeoffSparProviderProps) => {
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.dataset.theme;
    html.dataset.theme = colorMode;
    return () => {
      if (previous === undefined) {
        delete html.dataset.theme;
      } else {
        html.dataset.theme = previous;
      }
    };
  }, [colorMode]);

  useEffect(() => {
    if (!locale) return;
    const html = document.documentElement;
    const previous = html.lang;
    html.lang = locale;
    return () => {
      html.lang = previous;
    };
  }, [locale]);

  const value = useMemo(() => ({ colorMode, locale, components }), [colorMode, locale, components]);

  return <TakeoffSparContext.Provider value={value}>{children}</TakeoffSparContext.Provider>;
};

const DEFAULT_THEME: ThemeValue = { colorMode: 'light' };

// Module-level latch so the dev-mode warning fires at most once per process.
// Without this, tests and provider-less render loops flood the console.
let useThemeWarningEmitted = false;

/**
 * Read the active theme value. The provider is **optional**: when no
 * `TakeoffSparProvider` ancestor is present, the default theme
 * (`{ colorMode: 'light' }`) is returned and a one-time dev-mode warning is
 * emitted. Wrap the app in `TakeoffSparProvider` to customize `colorMode` or
 * `locale`.
 */
export const useTheme = (): ThemeValue => {
  const context = useContext(TakeoffSparContext);
  if (context === undefined) {
    if (isDevelopment() && !useThemeWarningEmitted) {
      useThemeWarningEmitted = true;
      // eslint-disable-next-line no-console
      console.warn(
        '[TakeoffSparProvider] `useTheme` was called outside a provider; falling back to `{ colorMode: "light" }`. ' + 'Wrap your app in <TakeoffSparProvider> to customize.',
      );
    }
    return DEFAULT_THEME;
  }
  return { colorMode: context.colorMode };
};

/**
 * Read the provider override config for a known component name. The return
 * type narrows by key: `useComponentTheme('Accordion')` returns
 * `ComponentThemeConfig<AccordionProps> | undefined`. Unknown names are a
 * compile-time error.
 *
 * The provider is **optional** — when no `TakeoffSparProvider` ancestor is
 * present, this hook returns `undefined` silently and the component falls
 * back to its author defaults. No warning is emitted because the absence of
 * a provider-level override is a legitimate use case (component used
 * standalone).
 */
export const useComponentTheme = <K extends ComponentName>(componentName: K): ComponentThemeRegistry[K] | undefined => {
  const context = useContext(TakeoffSparContext);
  // The runtime value is `ComponentThemeRegistry[K] | undefined` by
  // construction, but indexing a `Partial<...>`-shaped map with a generic
  // key keeps the optional modifier under non-strict-null tsconfigs (the
  // docs site extends `@docusaurus/tsconfig`, which is not strict). The
  // cast bridges typing only — it does not change behavior.
  return context?.components?.[componentName] as ComponentThemeRegistry[K] | undefined;
};
