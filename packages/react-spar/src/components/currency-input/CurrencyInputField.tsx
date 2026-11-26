import { useMemo, useState } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Input, type MaskChangeMeta } from '../input';

import { CurrencyInputFieldBase } from './base';
import { useCurrencyInputOwnContext } from './context';
import { fromMaskMeta, toMaskText } from './intl';
import type { CurrencyInputFieldProps } from './types';

/**
 * The amount field — `Input.Field` with Spar's `number` mask.
 *
 * The mask groups as the user types and owns the caret; this part bridges its
 * text and the root's number. The text is kept here rather than derived from
 * the number on every render: `1.234,` and `1.234` name the same amount, and
 * re-deriving the text would eat the decimal mark the user just typed. It is
 * re-derived only when the amount changes from outside (a reset, a preset, a
 * currency with fewer digits).
 */
export const CurrencyInputField = (props: CurrencyInputFieldProps) => {
  const theme = useComponentTheme('CurrencyInputField');
  const { value, setValue, locale, meta, decimalScale, integerScale, allowNegative } = useCurrencyInputOwnContext('CurrencyInput.Field');

  const { rootAttrs, rest } = composeRootAttrs(CurrencyInputFieldBase, props, theme);

  const [text, setText] = useState(() => toMaskText(value, meta.decimalMark));
  const [syncedValue, setSyncedValue] = useState(value);
  if (!Object.is(value, syncedValue)) {
    setSyncedValue(value);
    setText(toMaskText(value, meta.decimalMark));
  }

  const mask = useMemo(
    () => ({
      number: true as const,
      numberLocale: locale,
      numberDecimalMark: meta.decimalMark,
      numberDecimalScale: decimalScale,
      numberIntegerScale: integerScale,
      numberPositiveOnly: !allowNegative,
    }),
    [locale, meta.decimalMark, decimalScale, integerScale, allowNegative],
  );

  const handleValueChange = (next: string, maskMeta: MaskChangeMeta) => {
    setText(next);
    const amount = fromMaskMeta(maskMeta);
    setSyncedValue(amount);
    if (!Object.is(amount, value)) setValue(amount);
  };

  return (
    <Input.Field
      {...rest}
      {...rootAttrs}
      // After rootAttrs on purpose: these are the field's value pipeline, so
      // `slotProps.root` may restyle the element but must not detach it.
      type="text"
      inputMode={decimalScale === 0 ? 'numeric' : 'decimal'}
      autoComplete="off"
      mask={mask}
      value={text}
      onValueChange={handleValueChange}
    />
  );
};

CurrencyInputField.displayName = 'CurrencyInput.Field';
