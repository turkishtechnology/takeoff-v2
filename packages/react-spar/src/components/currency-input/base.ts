import { createComponentBase } from '../../core';

import type { CurrencyInputCurrencySelectProps, CurrencyInputFieldProps, CurrencyInputProps, CurrencyInputSymbolProps } from './types';

// @archetype react-enhancement — no Spar equivalent; owns the amount and the
// currency, and delegates the bordered row to the styled Input.
export const CurrencyInputBase = createComponentBase<CurrencyInputProps, 'root'>({
  name: 'CurrencyInput',
  slots: ['root'] as const,
  classes: { root: 'tk-currency-input' },
});

// @archetype inherited — the styled Input.Field with Spar's `number` mask; the
// wrapper only bridges the mask's text and the root's number.
export const CurrencyInputFieldBase = createComponentBase<CurrencyInputFieldProps, 'root'>({
  name: 'CurrencyInputField',
  slots: ['root'] as const,
  classes: { root: 'tk-currency-input-field' },
});

// @archetype react-enhancement — no Spar equivalent; renders the active
// currency's symbol, read from Intl.
export const CurrencyInputSymbolBase = createComponentBase<CurrencyInputSymbolProps, 'root'>({
  name: 'CurrencyInputSymbol',
  slots: ['root'] as const,
  classes: { root: 'tk-currency-input-symbol' },
});

// @archetype react-enhancement — the styled Select, bound to the currency held
// on the CurrencyInput context.
export const CurrencyInputCurrencySelectBase = createComponentBase<CurrencyInputCurrencySelectProps, 'root'>({
  name: 'CurrencyInputCurrencySelect',
  slots: ['root'] as const,
  classes: { root: 'tk-currency-input-currency-select' },
});
