import { createSafeContext } from '../../hooks';

import type { CurrencyFormatOptions } from './format';

export interface CurrencyInputOwnContextValue {
  /** The normalised numeric amount — the single source of truth. */
  value: number | undefined;
  setValue: (value: number | undefined) => void;
  /** ISO 4217 code of the selected currency. */
  currency: string;
  setCurrency: (currency: string) => void;
  /** Resolved formatter options, derived once on the root. */
  formatOptions: CurrencyFormatOptions;
}

/**
 * Wrapper-private context. It exists so the selector and the field stay wired
 * to the same amount/currency **regardless of where the caller places them** —
 * the currency selector works identically in `CurrencyInput.Prefix` or
 * `CurrencyInput.Suffix`. Behaviour therefore keys on context, never on DOM
 * position (unlike the purely visual counter recipe in `_input.scss`).
 *
 * Exported publicly as `useCurrencyInputContext` from the package root so a
 * consumer who outgrows `CurrencyInput.CurrencySelect` can build a bespoke
 * picker and bind it to the same state.
 */
export const [CurrencyInputProvider, useCurrencyInputOwnContext] = createSafeContext<CurrencyInputOwnContextValue>('CurrencyInputProvider');
