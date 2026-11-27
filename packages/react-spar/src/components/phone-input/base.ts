import { createComponentBase } from '../../core';

import type { PhoneInputCountrySelectProps, PhoneInputDialCodeProps, PhoneInputFieldProps, PhoneInputProps } from './types';

// @archetype react-enhancement — no Spar equivalent; owns the number and the
// country, and delegates the bordered row to the styled Input.
export const PhoneInputBase = createComponentBase<PhoneInputProps, 'root'>({
  name: 'PhoneInput',
  slots: ['root'] as const,
  classes: { root: 'tk-phone-input' },
});

// @archetype inherited — the styled Input.Field with a libphonenumber-js mask
// resolver; the wrapper only bridges the field's text and the root's E.164.
export const PhoneInputFieldBase = createComponentBase<PhoneInputFieldProps, 'root'>({
  name: 'PhoneInputField',
  slots: ['root'] as const,
  classes: { root: 'tk-phone-input-field' },
});

// @archetype react-enhancement — no Spar equivalent; renders the active
// country's dial code, read from libphonenumber-js.
export const PhoneInputDialCodeBase = createComponentBase<PhoneInputDialCodeProps, 'root'>({
  name: 'PhoneInputDialCode',
  slots: ['root'] as const,
  classes: { root: 'tk-phone-input-dial-code' },
});

// @archetype react-enhancement — the styled Select, bound to the country held
// on the PhoneInput context.
export const PhoneInputCountrySelectBase = createComponentBase<PhoneInputCountrySelectProps, 'root'>({
  name: 'PhoneInputCountrySelect',
  slots: ['root'] as const,
  classes: { root: 'tk-phone-input-country-select' },
});
