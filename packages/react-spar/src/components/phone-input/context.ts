import { createSafeContext } from '../../hooks';

import type { PhoneCountryCode, PhoneInputCountry, PhoneInputValueDetails } from './types';

export interface PhoneInputOwnContextValue {
  /** The number in E.164 — the single source of truth the field resyncs from. */
  value: string;
  setValue: (value: string, details: PhoneInputValueDetails) => void;
  /** The active country. */
  country: PhoneCountryCode;
  setCountry: (country: PhoneCountryCode) => void;
  /** Picks a country the way the list does: sets it and clears the number. */
  pickCountry: (country: PhoneCountryCode) => void;
  /** The selectable countries, names and dial codes resolved, in display order. */
  countries: PhoneInputCountry[];
  /** Dial code of the active country, e.g. `'+90'`. */
  dialCode: string;
  /** Locale names and search follow; `undefined` is the runtime's. */
  locale: string | undefined;
}

/**
 * Wrapper-private context. It keeps the field and the picker bound to the same
 * number and country wherever the consumer places them.
 *
 * Exported as `usePhoneInputContext` so a consumer who outgrows
 * `PhoneInput.CountrySelect` can bind a bespoke picker to the same state.
 */
export const [PhoneInputProvider, usePhoneInputOwnContext] = createSafeContext<PhoneInputOwnContextValue>('PhoneInputProvider');
