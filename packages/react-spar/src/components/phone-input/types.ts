import type { ReactNode } from 'react';
import type { CountryCode } from 'libphonenumber-js/min';

import type { ClassNamesMap, SlotPropsMap } from '../../core';
import type { InputFieldProps, InputProps } from '../input';
import type { SelectProps } from '../select';

export type PhoneInputSlot = 'root';
export type PhoneInputFieldSlot = 'root';
export type PhoneInputDialCodeSlot = 'root';
export type PhoneInputCountrySelectSlot = 'root';

/** ISO 3166-1 alpha-2 region code, as libphonenumber-js names it (`'TR'`). */
export type PhoneCountryCode = CountryCode;

/** A selectable country. `code` is the value; the rest is display. */
export interface PhoneCountry {
  /** ISO 3166-1 alpha-2 code — the committed country, e.g. `'TR'`. */
  code: PhoneCountryCode;
  /** Name shown in the list. Falls back to the locale's own name for `code`. */
  label?: string;
  /** Leading visual on the trigger and in the list — typically a flag. No flag set ships with the package. */
  icon?: ReactNode;
}

/** A country as the parts render it: name and dial code resolved. */
export interface PhoneInputCountry extends PhoneCountry {
  label: string;
  /** International dialing code with `+`, e.g. `'+90'`. */
  dialCode: string;
}

/** Second argument of `onValueChange`. */
export interface PhoneInputValueDetails {
  /** Digits after the dial code, without a trunk prefix (`'5321234567'`). Core's `rawValue`. */
  national: string;
  /** The text the field shows (`'532 123 45 67'`). Core's `maskedValue`. */
  formatted: string;
  /** The number is valid for its country per libphonenumber-js `min` metadata. */
  isValid: boolean;
  /** The country the number belongs to. */
  country: PhoneCountryCode;
}

/**
 * Props owned by takeoff-v2 for the PhoneInput root.
 *
 * The root's own element is `Input`'s row: it holds the number and the country
 * and hands the bordered row, sizing and form state to the styled `Input`. The
 * number is formatted by a mask resolver on `PhoneInput.Field`; these props only
 * feed it.
 */
export interface PhoneInputOwnProps {
  /** Controlled number in E.164 (`'+905321234567'`). `''` is empty. */
  value?: string;
  /** Initial number for uncontrolled usage, in E.164. */
  defaultValue?: string;
  /** Called with the E.164 number on every edit that changes it (`''` once nothing names one). */
  onValueChange?: (value: string, details: PhoneInputValueDetails) => void;
  /** Controlled country. Pair with `onCountryChange`. */
  country?: PhoneCountryCode;
  /**
   * Initial country for uncontrolled usage.
   * @defaultValue 'TR'
   */
  defaultCountry?: PhoneCountryCode;
  /** Called with the next country when the user picks one, types `+<another code>`, or `value` names another one. */
  onCountryChange?: (country: PhoneCountryCode) => void;
  /** The selectable countries, in display order. Defaults to every region libphonenumber-js knows, sorted by name. */
  countries?: PhoneCountry[];
  /**
   * BCP 47 locale for country names, their order and search folding. Pass it
   * explicitly when the page is server-rendered.
   * @defaultValue the runtime's locale
   */
  locale?: string;
  /** Submits the E.164 number under this name. The country has its own `name` on `CountrySelect`. */
  name?: string;
  /** Form the hidden number input belongs to, when it is outside it. */
  form?: string;
  /** Anatomy — compose `PhoneInput.Prefix`, `PhoneInput.CountrySelect`, `PhoneInput.Field`, … */
  children?: ReactNode;
  className?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<PhoneInputSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<PhoneInputSlot>;
}

export type PhoneInputProps = PhoneInputOwnProps &
  // Visual and form-state surface forwarded to the styled `Input` this root
  // renders. EXCLUDES `as` (the row is Input's element, so polymorphism stays
  // Input's) and `children` (the anatomy is this component's own).
  Pick<InputProps<'div'>, 'id' | 'size' | 'invalid' | 'disabled' | 'required' | 'readOnly'>;

export interface PhoneInputFieldOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<PhoneInputFieldSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<PhoneInputFieldSlot>;
}

/**
 * The number field: an `Input.Field` with a libphonenumber-js mask resolver.
 * EXCLUDES `mask`, `value`, `defaultValue`, `onValueChange`, `type` and `as` —
 * the root owns the value and the mask, and a phone number is a `tel` input.
 * `placeholder` defaults to the country's example mobile number.
 */
export type PhoneInputFieldProps = PhoneInputFieldOwnProps &
  Omit<InputFieldProps<'input'>, 'mask' | 'value' | 'defaultValue' | 'onValueChange' | 'type' | 'as' | 'classNames' | 'slotProps'>;

export interface PhoneInputDialCodeOwnProps {
  /** Replaces the dial code. Receives the active country's code and dial code. */
  children?: (country: { code: PhoneCountryCode; dialCode: string }) => ReactNode;
  className?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<PhoneInputDialCodeSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<PhoneInputDialCodeSlot>;
}

/** The active country's dial code as text, for a field whose country is fixed. Place it in `Prefix`. */
export type PhoneInputDialCodeProps = PhoneInputDialCodeOwnProps;

export interface PhoneInputCountrySelectOwnProps {
  /** Replaces a list row's content. Receives the country. Default: icon, name, dial code. */
  'children'?: (country: PhoneInputCountry) => ReactNode;
  /** Replaces the trigger's content (the chevron stays). Receives the selected country. Default: icon and dial code. */
  'trigger'?: (country: PhoneInputCountry | undefined) => ReactNode;
  /**
   * Accessible name of the trigger, which shows only an icon and a dial code.
   * @defaultValue 'Country code'
   */
  'aria-label'?: string;
  /**
   * Show a search field above the list that filters by name, ISO code and dial
   * code, ignoring case and accents.
   * @defaultValue true
   */
  'searchable'?: boolean;
  /**
   * Accessible name of the search field.
   * @defaultValue 'Search countries'
   */
  'searchLabel'?: string;
  /**
   * Placeholder of the search field.
   * @defaultValue 'Search'
   */
  'searchPlaceholder'?: string;
  /**
   * What the list says once a search matches nothing.
   * @defaultValue 'No countries found'
   */
  'emptyLabel'?: string;
  'className'?: string;
  /** Per-slot class name overrides. */
  'classNames'?: ClassNamesMap<PhoneInputCountrySelectSlot>;
  /** Per-slot HTML attribute overrides. */
  'slotProps'?: SlotPropsMap<PhoneInputCountrySelectSlot>;
}

export type PhoneInputCountrySelectProps = PhoneInputCountrySelectOwnProps &
  // Disclosure and form surface of the styled `Select`. EXCLUDES `value`,
  // `defaultValue` and `onChange` (the country lives on the PhoneInput root so
  // the field's mask follows it wherever this part sits), `readOnly` (Spar
  // takes the row's) and `size` (the row's size cascades).
  Pick<SelectProps<'div'>, 'contentWidth' | 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled' | 'name'>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    PhoneInput: import('../../core').ComponentThemeConfig<PhoneInputProps, PhoneInputSlot>;
    PhoneInputField: import('../../core').ComponentThemeConfig<PhoneInputFieldProps, PhoneInputFieldSlot>;
    PhoneInputDialCode: import('../../core').ComponentThemeConfig<PhoneInputDialCodeProps, PhoneInputDialCodeSlot>;
    PhoneInputCountrySelect: import('../../core').ComponentThemeConfig<PhoneInputCountrySelectProps, PhoneInputCountrySelectSlot>;
  }
}
