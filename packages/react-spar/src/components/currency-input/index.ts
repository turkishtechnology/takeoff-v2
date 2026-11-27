import { Input } from '../input';

import { CurrencyInput as CurrencyInputRoot } from './CurrencyInput';
import { CurrencyInputCurrencySelect } from './CurrencyInputCurrencySelect';
import { CurrencyInputField } from './CurrencyInputField';
import { CurrencyInputSymbol } from './CurrencyInputSymbol';

const CurrencyInput = Object.assign(CurrencyInputRoot, {
  // Parts that carry real currency anatomy.
  Field: CurrencyInputField,
  Symbol: CurrencyInputSymbol,
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
});

export { CurrencyInput };

/**
 * Escape hatch for consumers who outgrow `CurrencyInput.CurrencySelect`: bind a
 * bespoke picker straight to the amount/currency state.
 */
export { useCurrencyInputOwnContext as useCurrencyInputContext } from './context';
export type { CurrencyInputOwnContextValue } from './context';

export type {
  CurrencyInputCurrencySelectProps,
  CurrencyInputCurrencySelectSlot,
  CurrencyInputFieldProps,
  CurrencyInputFieldSlot,
  CurrencyInputProps,
  CurrencyInputSlot,
  CurrencyInputSymbolProps,
  CurrencyInputSymbolSlot,
  CurrencyOption,
} from './types';
