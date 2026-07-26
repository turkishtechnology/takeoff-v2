import { Input } from '../input';

import { CurrencyInput as CurrencyInputRoot } from './CurrencyInput';
import { CurrencyInputCurrencySelect } from './CurrencyInputCurrencySelect';
import { CurrencyInputField } from './CurrencyInputField';

const CurrencyInput = Object.assign(CurrencyInputRoot, {
  // Parts that carry real currency anatomy.
  Field: CurrencyInputField,
  CurrencySelect: CurrencyInputCurrencySelect,

  // Layout parts inherited from Input. These are the SAME components re-exposed
  // under this namespace so the caller never mixes `Input.*` and
  // `CurrencyInput.*` in one tree — and never has to know that CurrencyInput
  // renders an Input at all. Being aliases rather than new components, they add
  // no types, no tokens and no slot-registry entries: they still resolve to
  // `inputPrefix` / `inputSuffix` / … for theming.
  Prefix: Input.Prefix,
  Suffix: Input.Suffix,
  ClearButton: Input.ClearButton,
  Spinner: Input.Spinner,
});

export { CurrencyInput };

/**
 * Escape hatch for consumers who outgrow `CurrencyInput.CurrencySelect`: bind a
 * bespoke picker straight to the amount/currency state.
 */
export { useCurrencyInputOwnContext as useCurrencyInputContext } from './context';
export type { CurrencyInputOwnContextValue } from './context';

export { formatCurrency, formatEditable, getSeparators, parseCurrency } from './format';
export type { CurrencyFormatOptions, CurrencySeparators } from './format';

export type {
  CurrencyInputCurrencySelectProps,
  CurrencyInputCurrencySelectSlot,
  CurrencyInputFieldProps,
  CurrencyInputFieldSlot,
  CurrencyInputProps,
  CurrencyInputSlot,
  CurrencyOption,
} from './types';
