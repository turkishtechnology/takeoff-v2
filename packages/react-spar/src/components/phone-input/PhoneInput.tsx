import { useCallback, useEffect, useMemo } from 'react';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';
import { Input } from '../input';

import { PhoneInputBase } from './base';
import { PhoneInputProvider } from './context';
import { DEFAULT_COUNTRY } from './defaults';
import { allCountries, compareNames, countryName, countryOfValue, dialCodeOf } from './phone';
import type { PhoneCountry, PhoneCountryCode, PhoneInputCountry, PhoneInputProps, PhoneInputValueDetails } from './types';

/**
 * Phone number field with a country.
 *
 * Renders the styled `Input` for its row (border, sizing, focus ring, form
 * state, `Field` inheritance) and holds the number and the country in a private
 * context. libphonenumber-js, behind a mask resolver on `PhoneInput.Field`,
 * formats and validates; Spar's mask owns the caret. Nothing renders unless the
 * consumer composes it:
 *
 * ```tsx
 * <PhoneInput value={phone} onValueChange={setPhone}>
 *   <PhoneInput.Prefix>
 *     <PhoneInput.CountrySelect />
 *   </PhoneInput.Prefix>
 *   <PhoneInput.Field />
 * </PhoneInput>
 * ```
 */
export const PhoneInput = (props: PhoneInputProps) => {
  const theme = useComponentTheme('PhoneInput');
  const { rootAttrs, rest } = composeRootAttrs(PhoneInputBase, props, theme);

  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    country: countryProp,
    defaultCountry,
    onCountryChange,
    countries: countriesProp,
    locale,
    name,
    form,
    children,
    ...inputProps
  } = rest;

  const [value = '', setValueState] = useControllableState<string>(valueProp, defaultValue ?? '', undefined);
  const [stateCountry = DEFAULT_COUNTRY, setCountry] = useControllableState<PhoneCountryCode>(countryProp, defaultCountry ?? DEFAULT_COUNTRY, onCountryChange);

  const countries = useMemo<PhoneInputCountry[]>(() => {
    const list = (countriesProp ?? allCountries().map((code): PhoneCountry => ({ code }))).map(option => ({
      ...option,
      label: option.label ?? countryName(option.code, locale),
      dialCode: dialCodeOf(option.code),
    }));
    if (!countriesProp) {
      const compare = compareNames(locale);
      list.sort((a, b) => compare(a.label, b.label));
    }
    return list;
  }, [countriesProp, locale]);

  // A value set from outside may belong to another country (`+44…` while the
  // field is on TR). It wins for this render, and the effect below tells the
  // parent, so the trigger and the mask never disagree with the number.
  const valueCountry = useMemo(() => {
    const named = countryOfValue(value, stateCountry);
    return named && countries.some(option => option.code === named) ? named : undefined;
  }, [value, stateCountry, countries]);
  const country = valueCountry ?? stateCountry;

  useEffect(() => {
    if (valueCountry && valueCountry !== stateCountry) setCountry(valueCountry);
  }, [valueCountry, stateCountry, setCountry]);

  const setValue = useCallback(
    (next: string, details: PhoneInputValueDetails) => {
      setValueState(next);
      onValueChange?.(next, details);
    },
    [setValueState, onValueChange],
  );

  // Core's design: a number typed for one plan is not a number in another, so
  // picking a country clears it.
  const pickCountry = useCallback(
    (next: PhoneCountryCode) => {
      if (next === country) return;
      setCountry(next);
      if (value !== '') setValue('', { national: '', formatted: '', isValid: false, country: next });
    },
    [country, setCountry, value, setValue],
  );

  const contextValue = useMemo(
    () => ({
      value,
      setValue,
      country,
      setCountry,
      pickCountry,
      countries,
      dialCode: dialCodeOf(country),
      locale,
    }),
    [value, setValue, country, setCountry, pickCountry, countries, locale],
  );

  // `data-slot` is dropped — the rendered row is Input's element and Input
  // emits its own. The className rides along so the row carries both
  // `tk-input` and `tk-phone-input`.
  const { 'data-slot': _rootSlot, className, ...rootState } = rootAttrs;

  return (
    <PhoneInputProvider value={contextValue}>
      <Input {...inputProps} className={className} {...rootState}>
        {children}
        {name ? <input type="hidden" name={name} form={form} value={value} /> : null}
      </Input>
    </PhoneInputProvider>
  );
};

PhoneInput.displayName = 'PhoneInput';
