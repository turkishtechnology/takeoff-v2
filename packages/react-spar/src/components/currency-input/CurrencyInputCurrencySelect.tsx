import { useState } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Select } from '../select';

import { CurrencyInputCurrencySelectBase } from './base';
import { useCurrencyInputOwnContext } from './context';
import { DEFAULT_CURRENCY_SELECT_LABEL, DEFAULT_EMPTY_LABEL, DEFAULT_SEARCH_LABEL, DEFAULT_SEARCH_PLACEHOLDER } from './defaults';
import { getCurrencyMeta } from './intl';
import type { CurrencyInputCurrencySelectProps, CurrencyOption } from './types';

const optionLabel = (option: CurrencyOption) => option.label ?? option.code;

/** A blank override falls back, so no control is left without a name. */
const orDefault = (value: string | undefined, fallback: string) => (value?.trim() ? value : fallback);

/**
 * Folds case and accents the way a person searching expects: `try`, `TRY`,
 * `turk` and `Türk` all find the lira. The four Turkish i's (`I İ ı i`) fold
 * together too — whatever the locale lower-cases them to — so `LIRASI`,
 * `lirasi` and `Lirası` find each other.
 */
const fold = (text: string, locale: string | undefined) =>
  text
    .toLocaleLowerCase(locale)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ı/g, 'i');

/**
 * Currency picker — the styled `Select`, bound to the CurrencyInput root.
 *
 * Core's design: the trigger shows the icon and the code next to the chevron,
 * a search field sits above the list, and each row shows icon, symbol and
 * name. The search is Select's own (`Select.Search`), so focus, keyboard and
 * the combobox ARIA are Spar's; this part only decides which rows match.
 */
export const CurrencyInputCurrencySelect = (props: CurrencyInputCurrencySelectProps) => {
  const theme = useComponentTheme('CurrencyInputCurrencySelect');
  const { currency, setCurrency, locale } = useCurrencyInputOwnContext('CurrencyInput.CurrencySelect');

  const { rootAttrs, rest } = composeRootAttrs(CurrencyInputCurrencySelectBase, props, theme);

  const {
    currencies,
    children,
    trigger,
    'aria-label': ariaLabel,
    searchable = true,
    searchLabel,
    searchPlaceholder,
    emptyLabel,
    contentWidth = 'content',
    ...selectProps
  } = rest;

  // Select.Search resets it to '' while the list is closed.
  const [query, setQuery] = useState('');

  const selected = currencies.find(option => option.code === currency);
  const symbolOf = (option: CurrencyOption) => option.symbol ?? getCurrencyMeta(locale, option.code).symbol;

  const needle = fold(query.trim(), locale);
  const visible = searchable && needle ? currencies.filter(option => [option.code, optionLabel(option), symbolOf(option)].some(text => fold(text, locale).includes(needle))) : currencies;

  const rows = visible.map(option => (
    // `label` is explicit because the children are not plain text; Select
    // uses it as the typeahead key and the option's name.
    <Select.Item key={option.code} value={option.code} label={optionLabel(option)}>
      {children ? (
        children(option, symbolOf(option))
      ) : (
        <span className="tk-currency-input-currency-select-option">
          {option.icon ? (
            <span className="tk-currency-input-currency-select-icon" aria-hidden="true">
              {option.icon}
            </span>
          ) : null}
          <span className="tk-currency-input-currency-select-symbol" aria-hidden="true">
            {symbolOf(option)}
          </span>
          <span>{optionLabel(option)}</span>
        </span>
      )}
    </Select.Item>
  ));

  return (
    <Select {...selectProps} value={currency} onChange={setCurrency} contentWidth={contentWidth} {...rootAttrs}>
      <Select.Trigger aria-label={orDefault(ariaLabel, DEFAULT_CURRENCY_SELECT_LABEL)}>
        {trigger ? (
          trigger(selected)
        ) : (
          <span className="tk-currency-input-currency-select-value">
            {selected?.icon ? (
              <span className="tk-currency-input-currency-select-icon" aria-hidden="true">
                {selected.icon}
              </span>
            ) : null}
            <span>{currency}</span>
          </span>
        )}
      </Select.Trigger>
      <Select.Content>
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

CurrencyInputCurrencySelect.displayName = 'CurrencyInput.CurrencySelect';
