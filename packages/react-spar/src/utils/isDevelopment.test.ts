import { afterEach, describe, expect, it, vi } from 'vitest';

import { isDevelopment } from './index';

/** Swap the `process` global for the duration of a synchronous call only. */
const withProcessGlobal = <T>(value: unknown, run: () => T): T => {
  vi.stubGlobal('process', value);
  try {
    return run();
  } finally {
    vi.unstubAllGlobals();
  }
};

describe('isDevelopment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns true for development and test builds', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isDevelopment()).toBe(true);

    vi.stubEnv('NODE_ENV', 'test');
    expect(isDevelopment()).toBe(true);
  });

  it('returns false for production builds', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(isDevelopment()).toBe(false);
  });

  it('treats an unset NODE_ENV as a non-production build', () => {
    vi.stubEnv('NODE_ENV', undefined);

    expect(isDevelopment()).toBe(true);
  });

  it('stays silent when the runtime has no process global to read NODE_ENV from', () => {
    expect(withProcessGlobal(undefined, isDevelopment)).toBe(false);
  });
});
