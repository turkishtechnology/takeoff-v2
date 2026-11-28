import { useCallback, useMemo } from 'react';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';
import { Input } from '../input';

import { CurrencyInputBase } from './base';
import { CurrencyInputProvider } from './context';
import { DEFAULT_CURRENCY } from './defaults';
import { getCurrencyMeta, truncateToScale } from './intl';
import type { CurrencyInputProps } from './types';

/**
 * Amount field with a currency.
 *
 * Renders the styled `Input` for its row (border, sizing, focus ring, form
 * state, `Field` inheritance) and holds the amount and the currency in a
 * private context. Spar's `number` mask on `CurrencyInput.Field` does the
 * grouping, the decimal mark and the caret; this root only tells it which
 * locale and how many digits. Nothing renders unless the consumer composes it:
 *
 * ```tsx
 * <CurrencyInput value={amount} onValueChange={setAmount} locale="tr-TR">
 *   <CurrencyInput.Field />
 *   <CurrencyInput.Suffix>
 *     <CurrencyInput.CurrencySelect currencies={CURRENCIES} />
 *   </CurrencyInput.Suffix>
 * </CurrencyInput>
 * ```
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
    locale,
    decimalScale: ownDecimalScale,
    integerScale,
    allowNegative = false,
    name,
    form,
    children,
    ...inputProps
  } = rest;

  const [amount, setAmount] = useControllableState<number | undefined>(value, defaultValue, onValueChange);
  const [activeCurrency = DEFAULT_CURRENCY, setActiveCurrency] = useControllableState<string>(currency, defaultCurrency ?? DEFAULT_CURRENCY, onCurrencyChange);

  const meta = useMemo(() => getCurrencyMeta(locale, activeCurrency), [locale, activeCurrency]);
  const decimalScale = ownDecimalScale ?? meta.decimalScale;

  // A currency with fewer fraction digits (TRY → JPY) makes the mask drop the
  // extra digits from what it shows, but the mask reports only edits — so the
  // amount is cut here, the same way, or it would keep digits nobody can see.
  const setCurrency = useCallback(
    (next: string) => {
      setActiveCurrency(next);
      if (amount === undefined || ownDecimalScale !== undefined) return;
      const cut = truncateToScale(amount, getCurrencyMeta(locale, next).decimalScale);
      if (cut !== amount) setAmount(cut);
    },
    [amount, locale, ownDecimalScale, setActiveCurrency, setAmount],
  );

  const contextValue = useMemo(
    () => ({
      value: amount,
      setValue: setAmount,
      currency: activeCurrency,
      setCurrency,
      locale,
      meta,
      decimalScale,
      integerScale,
      allowNegative,
    }),
    [amount, setAmount, activeCurrency, setCurrency, locale, meta, decimalScale, integerScale, allowNegative],
  );

  // `data-slot` is dropped — the rendered row is Input's element and Input
  // emits its own. The className rides along so the row carries both
  // `tk-input` and `tk-currency-input`.
  const { 'data-slot': _rootSlot, className, ...rootState } = rootAttrs;

  return (
    <CurrencyInputProvider value={contextValue}>
      <Input {...inputProps} className={className} data-currency={activeCurrency} {...rootState}>
        {children}
        {name ? <input type="hidden" name={name} form={form} value={amount === undefined ? '' : String(amount)} /> : null}
      </Input>
    </CurrencyInputProvider>
  );
};

CurrencyInput.displayName = 'CurrencyInput';
