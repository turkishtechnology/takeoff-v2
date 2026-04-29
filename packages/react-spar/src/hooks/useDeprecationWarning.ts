import { useEffect, useRef } from 'react';

declare const process: { env: { NODE_ENV?: string } } | undefined;

/**
 * Warn once per component instance, dev only, while `condition` holds.
 * Per-instance gate (ref, not module Set) so each mount gets its own signal
 * in long-lived apps. `process.env.NODE_ENV` is replaced inline by bundlers
 * so the prod branch dead-code-eliminates.
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
