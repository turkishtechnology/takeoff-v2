import { useMemo } from 'react';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';
import { Input } from '../input';

import { CurrencyInputBase } from './base';
import { CurrencyInputProvider } from './context';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from './defaults';
import type { CurrencyInputProps } from './types';

/**
 * Amount field with a currency selector.
 *
 * Renders the styled `Input` for its chrome (border, sizing, focus ring,
 * disabled/invalid state, clear button) rather than duplicating it, and layers
 * the amount/currency state on top through a private context. Anatomy is
 * explicit — nothing is rendered unless the caller composes it:
 *
 * ```tsx
 * <CurrencyInput value={amount} onValueChange={setAmount} currency="TRY">
 *   <CurrencyInput.Field />
 *   <CurrencyInput.Suffix>
 *     <CurrencyInput.CurrencySelect currencies={CURRENCIES} />
 *   </CurrencyInput.Suffix>
 * </CurrencyInput>
 * ```
 *
 * Placing the selector in `Suffix` rather than `Prefix` is how the tr-TR
 * trailing-symbol convention ('1.234,56 ₺') is expressed — no `position` prop
 * is introduced, mirroring how the Input counter look keys on placement.
 */
export const CurrencyInput = (props: CurrencyInputProps) => {
  const theme = useComponentTheme('CurrencyInput');
  const { rootAttrs, rest } = composeRootAttrs(CurrencyInputBase, props, theme);

  const {
    value,
    defaultValue,
    onValueChange,
    currency,
    defaultCurrency,
    onCurrencyChange,
    locale = DEFAULT_LOCALE,
    currencyDisplay,
    minimumFractionDigits,
    maximumFractionDigits,
    children,
    ...inputProps
  } = rest;

  const [amount, setAmount] = useControllableState<number | undefined>(value, defaultValue, onValueChange);
  const [activeCurrency = DEFAULT_CURRENCY, setActiveCurrency] = useControllableState<string>(currency, defaultCurrency ?? DEFAULT_CURRENCY, onCurrencyChange);

  const formatOptions = useMemo(
    () => ({
      locale,
      currency: activeCurrency,
      currencyDisplay,
      minimumFractionDigits,
      maximumFractionDigits,
    }),
    [locale, activeCurrency, currencyDisplay, minimumFractionDigits, maximumFractionDigits],
  );

  const contextValue = useMemo(
    () => ({
      value: amount,
      setValue: setAmount,
      currency: activeCurrency,
      setCurrency: setActiveCurrency,
      formatOptions,
    }),
    [amount, setAmount, activeCurrency, setActiveCurrency, formatOptions],
  );

  // `data-slot` is dropped — the rendered root is Input's element and Input
  // emits its own. The composed className rides along so the row carries both
  // `tk-input` and `tk-currency-input`; Input's own composeRootAttrs merges it.
  const { 'data-slot': _rootSlot, className, ...rootState } = rootAttrs;

  return (
    <CurrencyInputProvider value={contextValue}>
      <Input {...inputProps} className={className} data-currency={activeCurrency} {...rootState}>
        {children}
      </Input>
    </CurrencyInputProvider>
  );
};

CurrencyInput.displayName = 'CurrencyInput';
