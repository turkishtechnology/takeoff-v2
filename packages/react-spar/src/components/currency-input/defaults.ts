/**
 * Locale is pinned explicitly rather than falling back to the runtime default.
 * `Intl` resolves a different locale on the server (Node's ICU) than in the
 * browser, and the formatted display string is rendered during SSR — an
 * implicit locale is a hydration-mismatch waiting to happen.
 */
export const DEFAULT_LOCALE = 'tr-TR';

export const DEFAULT_CURRENCY = 'TRY';
