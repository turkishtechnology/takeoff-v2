import type { MaskChangeMeta } from '../input';

import { FALLBACK_DECIMAL_SCALE } from './defaults';

/** What the field needs to know about a currency in a locale. Read from `Intl`; nothing here formats a value. */
export interface CurrencyMeta {
  /** The currency's natural fraction digits (TRY 2, JPY 0, KWD 3). */
  decimalScale: number;
  /** The locale's decimal mark — what the mask reads as "the fraction starts here". */
  decimalMark: string;
  /** The narrow symbol (`₺`, `$`), or the code when the locale has none. */
  symbol: string;
}

const decimalMarkOf = (locale: string | undefined): string => {
  try {
    return new Intl.NumberFormat(locale).formatToParts(1.5).find(part => part.type === 'decimal')?.value ?? '.';
  } catch {
    return '.';
  }
};

/**
 * Describes `currency` in `locale`. An unknown code or locale makes `Intl`
 * throw; the field still has to render, so it falls back to two fraction digits
 * and the code as its symbol.
 */
export const getCurrencyMeta = (locale: string | undefined, currency: string): CurrencyMeta => {
  const decimalMark = decimalMarkOf(locale);
  try {
    const format = new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' });
    return {
      decimalScale: format.resolvedOptions().maximumFractionDigits ?? FALLBACK_DECIMAL_SCALE,
      decimalMark,
      symbol: format.formatToParts(0).find(part => part.type === 'currency')?.value ?? currency,
    };
  } catch {
    return { decimalScale: FALLBACK_DECIMAL_SCALE, decimalMark, symbol: currency };
  }
};

/**
 * An amount as the plain digits the mask expects (`1234,5` in tr-TR), which
 * the mask then groups itself. Not a formatter: there is no grouping, no
 * symbol and no padding — only the decimal mark swapped for the locale's, since
 * the mask reads a `.` in tr-TR as a group separator.
 */
export const toMaskText = (amount: number | undefined, decimalMark: string): string => {
  if (amount === undefined || !Number.isFinite(amount)) return '';
  // `String(1e21)` is exponent notation, which no mask reads as digits.
  const plain = amount.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 });
  return plain.replace('.', decimalMark);
};

/** The amount a mask edit names: `meta.iso` is already a `Number()`-parseable string, or absent while nothing does. */
export const fromMaskMeta = (meta: MaskChangeMeta): number | undefined => {
  if (meta.iso === undefined || meta.iso === '') return undefined;
  const amount = Number(meta.iso);
  return Number.isFinite(amount) ? amount : undefined;
};

/**
 * Cuts `amount` to `decimalScale` fraction digits the way the mask cuts typed
 * digits — by dropping, not rounding — so switching to a currency with fewer
 * digits leaves the value the field now shows.
 */
export const truncateToScale = (amount: number, decimalScale: number): number => {
  const [integer, fraction = ''] = toMaskText(amount, '.').split('.');
  if (fraction.length <= decimalScale) return amount;
  return Number(decimalScale === 0 ? integer : `${integer}.${fraction.slice(0, decimalScale)}`);
};
