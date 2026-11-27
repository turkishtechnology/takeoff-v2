import { useRef, useState } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { useInputOwnContext } from '../input/context';
import { Select } from '../select';

import { PhoneInputCountrySelectBase } from './base';
import { usePhoneInputOwnContext } from './context';
import { DEFAULT_COUNTRY_SELECT_LABEL, DEFAULT_EMPTY_LABEL, DEFAULT_SEARCH_LABEL, DEFAULT_SEARCH_PLACEHOLDER } from './defaults';
import { fold } from './phone';
import type { PhoneCountryCode, PhoneInputCountry, PhoneInputCountrySelectProps } from './types';

/** A blank override falls back, so no control is left without a name. */
const orDefault = (value: string | undefined, fallback: string) => (value?.trim() ? value : fallback);

/**
 * Country picker — the styled `Select`, bound to the PhoneInput root.
 *
 * Core's design: the trigger shows the flag and the dial code next to the
 * chevron, a search field sits above the list, and each row shows flag, name
 * and dial code. The search is Select's own (`Select.Search`), so focus,
 * keyboard and the combobox ARIA are Spar's; this part only decides which rows
 * match. Spar's Select follows the row's disabled / readOnly and leaves a
 * surrounding Field to the number. A pick clears the number and hands focus to
 * the field, as Core does.
 */
export const PhoneInputCountrySelect = (props: PhoneInputCountrySelectProps) => {
  const theme = useComponentTheme('PhoneInputCountrySelect');
  const { country, pickCountry, countries, locale } = usePhoneInputOwnContext('PhoneInput.CountrySelect');
  const { fieldRef } = useInputOwnContext('PhoneInput.CountrySelect');

  const { rootAttrs, rest } = composeRootAttrs(PhoneInputCountrySelectBase, props, theme);

  const { children, trigger, 'aria-label': ariaLabel, searchable = true, searchLabel, searchPlaceholder, emptyLabel, contentWidth = 'content', ...selectProps } = rest;

  // Select.Search resets it to '' while the list is closed.
  const [query, setQuery] = useState('');
  // Set by a pick so the close hands focus to the field rather than the trigger.
  const pickedRef = useRef(false);

  const selected = countries.find(option => option.code === country);

  const needle = fold(query.trim(), locale);
  const visible = searchable && needle ? countries.filter(option => [option.label, option.code, option.dialCode].some(text => fold(text, locale).includes(needle))) : countries;

  const handleChange = (next: string) => {
    pickedRef.current = true;
    pickCountry(next as PhoneCountryCode);
  };

  const handleCloseAutoFocus = (event: Event) => {
    if (!pickedRef.current) return;
    pickedRef.current = false;
    event.preventDefault();
    fieldRef.current?.focus();
  };

  const icon = (option: PhoneInputCountry | undefined) =>
    option?.icon ? (
      <span className="tk-phone-input-country-select-icon" aria-hidden="true">
        {option.icon}
      </span>
    ) : null;

  const rows = visible.map(option => (
    // `label` is explicit because the children are not plain text; Select
    // uses it as the typeahead key and the option's name.
    <Select.Item key={option.code} value={option.code} label={option.label}>
      {children ? (
        children(option)
      ) : (
        <span className="tk-phone-input-country-select-option">
          {icon(option)}
          <span className="tk-phone-input-country-select-name">{option.label}</span>
          <span className="tk-phone-input-country-select-dial-code">{option.dialCode}</span>
        </span>
      )}
    </Select.Item>
  ));

  return (
    <Select {...selectProps} value={country} onChange={handleChange} contentWidth={contentWidth} {...rootAttrs}>
      <Select.Trigger aria-label={orDefault(ariaLabel, DEFAULT_COUNTRY_SELECT_LABEL)}>
        {trigger ? (
          trigger(selected)
        ) : (
          <span className="tk-phone-input-country-select-value">
            {icon(selected)}
            <span>{selected?.dialCode ?? country}</span>
          </span>
        )}
      </Select.Trigger>
      <Select.Content onCloseAutoFocus={handleCloseAutoFocus}>
        {searchable ? (
          <Select.Search
            aria-label={orDefault(searchLabel, DEFAULT_SEARCH_LABEL)}
            placeholder={orDefault(searchPlaceholder, DEFAULT_SEARCH_PLACEHOLDER)}
            value={query}
            onValueChange={setQuery}
          />
        ) : null}
        <Select.Viewport>
          {rows}
          {visible.length === 0 ? <Select.Empty>{orDefault(emptyLabel, DEFAULT_EMPTY_LABEL)}</Select.Empty> : null}
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
};

PhoneInputCountrySelect.displayName = 'PhoneInput.CountrySelect';
