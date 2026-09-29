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

interface DocumentAttributeHandle {
  release: () => void;
}

/**
 * Ownership of one `document.documentElement` attribute shared by every
 * mounted top-level provider. The original value is captured when the first
 * provider claims the attribute and restored (or removed, when it was absent)
 * once the last one releases it, whatever order they unmount in — a per-effect
 * snapshot could not tell a sibling's value from the server-rendered one. The
 * most recently claimed value is the one written, so siblings behave as they
 * always did (last mount wins) and the restore is still correct.
 */
const createDocumentAttribute = (read: () => string | undefined, write: (value: string) => void, remove: () => void) => {
  const writers: { value: string }[] = [];
  let original: string | undefined;

  const apply = () => {
    const top = writers[writers.length - 1];
    if (top) write(top.value);
    else if (original === undefined) remove();
    else write(original);
  };

  return {
    claim(value: string): DocumentAttributeHandle {
      if (writers.length === 0) original = read();
      const writer = { value };
      writers.push(writer);
      apply();
      return {
        release: () => {
          writers.splice(writers.indexOf(writer), 1);
          apply();
        },
      };
    },
  };
};

const documentTheme = createDocumentAttribute(
  () => document.documentElement.dataset.theme,
  value => {
    document.documentElement.dataset.theme = value;
  },
  () => {
    delete document.documentElement.dataset.theme;
  },
);

const documentLang = createDocumentAttribute(
  () => (document.documentElement.hasAttribute('lang') ? document.documentElement.lang : undefined),
  value => {
    document.documentElement.lang = value;
  },
  () => document.documentElement.removeAttribute('lang'),
);

export interface TakeoffSparProviderProps extends Partial<TakeoffSparProviderValue> {
  children: ReactNode;
}

/**
 * Top-level provider for Takeoff React components. Writes `data-theme` and
 * `lang` to `document.documentElement` so styling and language attributes
 * propagate to portal-mounted descendants (Dialog, Popover, Tooltip, …) and
 * are picked up by global CSS selectors. The previous values are restored
 * once every provider has unmounted, whatever order they leave in.
 *
 * Only a provider with no provider ancestor writes to the document: `<html>`
 * carries one theme and one language, so a nested provider scopes
 * `colorMode`, `locale` and `components` for its subtree through context
 * (what `useTheme` / `useComponentTheme` report) without fighting the outer
 * one over the document attributes. Portalled content inside a nested
 * provider therefore still paints with the outer provider's tokens.
 *
 * Renders no DOM of its own — only a React context. For SSR apps, set
 * `<html data-theme="…" lang="…">` on the server (e.g. with a small inline
 * script that reads stored preferences) to avoid a first-paint flash before
 * the provider's effect runs.
 */
export const TakeoffSparProvider = ({ children, colorMode = 'light', locale, components }: TakeoffSparProviderProps) => {
  const ownsDocument = useContext(TakeoffSparContext) === undefined;

  useEffect(() => {
    if (!ownsDocument) return;
    return documentTheme.claim(colorMode).release;
  }, [colorMode, ownsDocument]);

  useEffect(() => {
    if (!ownsDocument || !locale) return;
    return documentLang.claim(locale).release;
  }, [locale, ownsDocument]);

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
