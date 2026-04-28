import { useEffect, useRef } from 'react';

declare const process: { env: { NODE_ENV?: string } } | undefined;

/**
 * Fire `console.warn(message)` exactly once per component instance while
 * `condition` is true, and only in non-production builds. Used by wrappers to
 * announce deprecated public surfaces during their migration window per
 * `docs/contract-model.md` § "deprecated" disposition obligations.
 *
 * The warning is gated on a per-instance ref rather than a module-level Set so
 * that two independent instances each get one warning, preserving signal even
 * in long-lived apps. Bundlers (tsup, Vite) replace `process.env.NODE_ENV`
 * inline at build time, so the production branch dead-code-eliminates.
 */
export const useDeprecationWarning = (condition: boolean, message: string): void => {
  const warned = useRef(false);

  useEffect(() => {
    if (!condition || warned.current) return;
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') return;
    warned.current = true;
    // eslint-disable-next-line no-console
    console.warn(message);
  }, [condition, message]);
};
