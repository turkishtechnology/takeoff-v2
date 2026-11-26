import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CurrencyInputSymbolBase } from './base';
import { useCurrencyInputOwnContext } from './context';
import type { CurrencyInputSymbolProps } from './types';

/**
 * The active currency's symbol, for a field whose currency is fixed. Hidden
 * from assistive tech: the symbol is decoration next to a field that a label
 * already names, and `₺` read aloud is noise.
 */
export const CurrencyInputSymbol = (props: CurrencyInputSymbolProps) => {
  const theme = useComponentTheme('CurrencyInputSymbol');
  const { currency, meta } = useCurrencyInputOwnContext('CurrencyInput.Symbol');
  const { rootAttrs, rest } = composeRootAttrs(CurrencyInputSymbolBase, props, theme);
  const { children, ...spanProps } = rest;

  return (
    <span aria-hidden="true" {...spanProps} {...rootAttrs}>
      {children ? children({ code: currency, symbol: meta.symbol }) : meta.symbol}
    </span>
  );
};

CurrencyInputSymbol.displayName = 'CurrencyInput.Symbol';
