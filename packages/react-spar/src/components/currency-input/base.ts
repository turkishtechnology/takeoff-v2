import { createComponentBase } from '../../core';

import type { CurrencyInputCurrencySelectProps, CurrencyInputFieldProps, CurrencyInputProps } from './types';

// @archetype react-enhancement — no Spar equivalent; owns the numeric amount and
// the selected currency, and delegates the bordered row to the styled Input.
export const CurrencyInputBase = createComponentBase<CurrencyInputProps, 'root'>({
  name: 'CurrencyInput',
  slots: ['root'] as const,
  classes: { root: 'tk-currency-input' },
});

// @archetype react-enhancement — no Spar equivalent; formats on blur via
// Intl.NumberFormat and writes the parsed number back to the context.
export const CurrencyInputFieldBase = createComponentBase<CurrencyInputFieldProps, 'root'>({
  name: 'CurrencyInputField',
  slots: ['root'] as const,
  classes: { root: 'tk-currency-input-field' },
});

// @archetype react-enhancement — no Spar equivalent; wraps the styled Select and
// binds it to the currency held on the CurrencyInput context.
export const CurrencyInputCurrencySelectBase = createComponentBase<CurrencyInputCurrencySelectProps, 'root'>({
  name: 'CurrencyInputCurrencySelect',
  slots: ['root'] as const,
  classes: { root: 'tk-currency-input-currency-select' },
});
