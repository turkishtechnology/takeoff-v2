import { useState, type ChangeEvent } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Input } from '../input';

import { CurrencyInputFieldBase } from './base';
import { useCurrencyInputOwnContext } from './context';
import { formatCurrency, formatEditable, parseCurrency } from './format';
import type { CurrencyInputFieldProps } from './types';

/**
 * The amount field.
 *
 * Format-on-blur by design: while focused the user edits a plain, ungrouped
 * string (`1234,56`) and on blur it settles into the formatted display
 * (`₺1.234,56`). That is what keeps this component free of caret-restoration
 * code — reformatting on every keystroke is what makes masked inputs jump the
 * cursor, and it is deliberately out of scope for v1.
 */
export const CurrencyInputField = (props: CurrencyInputFieldProps) => {
  const theme = useComponentTheme('CurrencyInputField');
  const { value, setValue, formatOptions } = useCurrencyInputOwnContext('CurrencyInput.Field');

  const { rootAttrs, rest } = composeRootAttrs(CurrencyInputFieldBase, props, theme);

  // The in-progress text. `null` means "not editing", which is what switches
  // the field between the editable and the formatted representation. It is not
  // merely an empty string, because an empty string is a legitimate draft.
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;

  // NOTE (SSR): `formatCurrency` runs during render. The locale is pinned in
  // `defaults.ts` precisely so the server and the client resolve the same ICU
  // data and produce byte-identical strings — several locales (tr-TR included)
  // emit U+00A0 inside formatted output, and a divergence here surfaces as a
  // hydration mismatch rather than a visual bug.
  const display = isEditing ? draft : formatCurrency(value, formatOptions);

  const handleFocus = () => setDraft(formatEditable(value, formatOptions));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value);

  const handleBlur = () => {
    setValue(parseCurrency(draft ?? '', formatOptions.locale));
    setDraft(null);
  };

  return (
    <Input.Field
      {...rest}
      {...rootAttrs}
      // Spread after rootAttrs on purpose: these are behavioural invariants of
      // the currency field, so consumer `slotProps.root` may restyle the
      // element but must not detach its value pipeline.
      value={display}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      inputMode="decimal"
      autoComplete="off"
    />
  );
};

CurrencyInputField.displayName = 'CurrencyInput.Field';
