// Pure, framework-agnostic currency format/parse helpers.
//
// Everything derives from `Intl.NumberFormat`, so no locale table ships: the
// parser is generated FROM the formatter via `formatToParts` (the technique
// `@internationalized/number` uses). That makes tr-TR correct for free —
// '.' group separator, ',' decimal separator, trailing '₺' — with zero
// hand-maintained data and zero runtime dependencies.
//
// Per the contract's "value normalization → use a pure helper" rule these are
// plain functions, NOT a hook: no state, no effects, no React import.

export interface CurrencyFormatOptions {
  /** BCP-47 locale, e.g. 'tr-TR'. Always pass explicitly — see SSR note below. */
  locale: string;
  /** ISO 4217 code, e.g. 'TRY'. */
  currency: string;
  /** @defaultValue 'symbol' */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Intl.NumberFormat construction is the expensive part; cache per option set.
const displayCache = new Map<string, Intl.NumberFormat>();
const editCache = new Map<string, Intl.NumberFormat>();
const separatorCache = new Map<string, CurrencySeparators>();

const cacheKey = (options: CurrencyFormatOptions) =>
  [options.locale, options.currency, options.currencyDisplay, options.minimumFractionDigits, options.maximumFractionDigits].join('|');

/** Formatter for the resting (blurred) display string — symbol + grouping. */
export const getDisplayFormatter = (options: CurrencyFormatOptions): Intl.NumberFormat => {
  const key = cacheKey(options);
  let formatter = displayCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(options.locale, {
      style: 'currency',
      currency: options.currency,
      currencyDisplay: options.currencyDisplay ?? 'symbol',
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
    });
    displayCache.set(key, formatter);
  }
  return formatter;
};

/**
 * Formatter for the *editable* string shown while the field has focus: the
 * locale's decimal separator but no grouping and no currency symbol, so typing
 * and caret movement stay predictable. This is why the component formats on
 * blur — see the Field part.
 */
export const getEditFormatter = (options: CurrencyFormatOptions): Intl.NumberFormat => {
  const key = cacheKey(options);
  let formatter = editCache.get(key);
  if (!formatter) {
    // Derive the currency's natural fraction digits (TRY/USD → 2, JPY → 0)
    // from a currency-styled formatter, then reuse them without the symbol.
    const resolved = getDisplayFormatter(options).resolvedOptions();
    formatter = new Intl.NumberFormat(options.locale, {
      style: 'decimal',
      useGrouping: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: resolved.maximumFractionDigits,
    });
    editCache.set(key, formatter);
  }
  return formatter;
};

export interface CurrencySeparators {
  /** Thousands separator for this locale ('.' in tr-TR). */
  group: string;
  /** Decimal separator for this locale (',' in tr-TR). */
  decimal: string;
}

/**
 * Read the locale's separators out of the formatter itself rather than a table.
 * `formatToParts` is the only source of truth that stays correct as ICU data
 * changes under us.
 */
export const getSeparators = (locale: string): CurrencySeparators => {
  let separators = separatorCache.get(locale);
  if (!separators) {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    separators = {
      group: parts.find(part => part.type === 'group')?.value ?? ',',
      decimal: parts.find(part => part.type === 'decimal')?.value ?? '.',
    };
    separatorCache.set(locale, separators);
  }
  return separators;
};

/** The resting display string. `undefined` renders as empty, not '₺0,00'. */
export const formatCurrency = (value: number | undefined, options: CurrencyFormatOptions): string =>
  value === undefined || Number.isNaN(value) ? '' : getDisplayFormatter(options).format(value);

/** The focused, editable string. */
export const formatEditable = (value: number | undefined, options: CurrencyFormatOptions): string =>
  value === undefined || Number.isNaN(value) ? '' : getEditFormatter(options).format(value);

/**
 * Parse user input back to a number. Tolerant by design — the user may have
 * typed a bare '1234,5', pasted a fully formatted '₺1.234,56', or left stray
 * spaces. Returns `undefined` for "no value" so an empty field never collapses
 * to 0 (which would be indistinguishable from a real zero).
 *
 * The NBSP normalisation matters: several locales (tr-TR among them) emit
 * U+00A0 / U+202F inside formatted output, and a pasted value would otherwise
 * fail to parse.
 */
export const parseCurrency = (raw: string, locale: string): number | undefined => {
  if (!raw) return undefined;

  const { group, decimal } = getSeparators(locale);

  const normalized = raw
    // Non-breaking / narrow-no-break / figure spaces → ordinary space, then drop.
    .replace(/[   ]/g, ' ')
    .replace(/\s/g, '')
    // Strip the locale's group separator (split/join avoids regex-escaping '.').
    .split(group)
    .join('')
    // Locale decimal separator → the '.' Number() understands.
    .split(decimal)
    .join('.');

  // Everything else (currency symbols, letters, stray punctuation) goes away.
  // A leading '-' is preserved; '-' elsewhere is not meaningful here.
  const negative = normalized.trimStart().startsWith('-');
  const digits = normalized.replace(/[^0-9.]/g, '');

  if (!digits || digits === '.') return undefined;

  const parsed = Number(negative ? `-${digits}` : digits);
  return Number.isFinite(parsed) ? parsed : undefined;
};
