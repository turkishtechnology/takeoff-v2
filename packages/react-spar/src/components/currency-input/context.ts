import { createSafeContext } from '../../hooks';

import type { CurrencyMeta } from './intl';

export interface CurrencyInputOwnContextValue {
  /** The amount — the single source of truth the field resyncs from. */
  value: number | undefined;
  setValue: (value: number | undefined) => void;
  /** ISO 4217 code of the active currency. */
  currency: string;
  setCurrency: (currency: string) => void;
  /** Locale the mask and the symbol follow; `undefined` is the runtime's. */
  locale: string | undefined;
  /** The active currency in `locale`, from `Intl`. */
  meta: CurrencyMeta;
  /** Resolved mask limits. */
  decimalScale: number;
  integerScale: number | undefined;
  allowNegative: boolean;
}

/**
 * Wrapper-private context. It keeps the field and the selector bound to the
 * same amount and currency wherever the consumer places them — the selector
 * behaves the same in `Prefix` or `Suffix`.
 *
 * Exported as `useCurrencyInputContext` so a consumer who outgrows
 * `CurrencyInput.CurrencySelect` can bind a bespoke picker to the same state.
 */
export const [CurrencyInputProvider, useCurrencyInputOwnContext] = createSafeContext<CurrencyInputOwnContextValue>('CurrencyInputProvider');
