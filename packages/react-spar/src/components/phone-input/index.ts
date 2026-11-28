import { Input } from '../input';

import { PhoneInput as PhoneInputRoot } from './PhoneInput';
import { PhoneInputCountrySelect } from './PhoneInputCountrySelect';
import { PhoneInputDialCode } from './PhoneInputDialCode';
import { PhoneInputField } from './PhoneInputField';

const PhoneInput = Object.assign(PhoneInputRoot, {
  // Parts that carry real phone anatomy.
  Field: PhoneInputField,
  DialCode: PhoneInputDialCode,
  CountrySelect: PhoneInputCountrySelect,

  // Layout parts inherited from Input — the SAME components re-exposed under
  // this namespace so the caller never mixes `Input.*` and `PhoneInput.*` in one
  // tree. Being aliases, they add no types, tokens or slot-registry entries.
  Prefix: Input.Prefix,
  Suffix: Input.Suffix,
  ClearButton: Input.ClearButton,
});

export { PhoneInput };

/**
 * Escape hatch for consumers who outgrow `PhoneInput.CountrySelect`: bind a
 * bespoke picker straight to the number/country state.
 */
export { usePhoneInputOwnContext as usePhoneInputContext } from './context';
export type { PhoneInputOwnContextValue } from './context';

export type {
  PhoneCountry,
  PhoneCountryCode,
  PhoneInputCountry,
  PhoneInputCountrySelectProps,
  PhoneInputCountrySelectSlot,
  PhoneInputDialCodeProps,
  PhoneInputDialCodeSlot,
  PhoneInputFieldProps,
  PhoneInputFieldSlot,
  PhoneInputProps,
  PhoneInputSlot,
  PhoneInputValueDetails,
} from './types';
