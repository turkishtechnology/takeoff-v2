import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Select } from '../select';

import { CurrencyInputCurrencySelectBase } from './base';
import { useCurrencyInputOwnContext } from './context';
import type { CurrencyInputCurrencySelectProps, CurrencyOption } from './types';

const DEFAULT_TRIGGER_LABEL = 'Para birimi';

const optionLabel = (option: CurrencyOption) => option.label ?? option.code;
const optionSymbol = (option: CurrencyOption) => option.symbol ?? option.code;

/**
 * Currency picker.
 *
 * Reuses the styled `Select` rather than a bespoke panel: the currency list is
 * short, so the native-style first-letter typeahead Select already ships is
 * enough and no search box is needed. (The country picker in a phone input is
 * the opposite case — ~250 options genuinely need filtering.)
 *
 * The selected value is read from and written to the CurrencyInput context, not
 * held locally, so the field's formatting stays in sync wherever this part is
 * placed in the anatomy.
 */
export const CurrencyInputCurrencySelect = (props: CurrencyInputCurrencySelectProps) => {
  const theme = useComponentTheme('CurrencyInputCurrencySelect');
  const { currency, setCurrency } = useCurrencyInputOwnContext('CurrencyInput.CurrencySelect');

  const { rootAttrs, rest } = composeRootAttrs(CurrencyInputCurrencySelectBase, props, theme);

  const { currencies, children, trigger, 'aria-label': ariaLabel = DEFAULT_TRIGGER_LABEL, contentWidth = 'content', ...selectProps } = rest;

  const selected = currencies.find(option => option.code === currency);

  return (
    <Select {...selectProps} value={currency} onChange={setCurrency} contentWidth={contentWidth} {...rootAttrs}>
      {/*
        The trigger collapses to a bare symbol so it reads as an in-input
        adornment rather than a second form control — which is exactly why it
        needs an explicit accessible name.
      */}
      <Select.Trigger aria-label={ariaLabel}>{trigger ? trigger(selected) : selected ? optionSymbol(selected) : currency}</Select.Trigger>
      <Select.Content>
        <Select.Viewport>
          {currencies.map(option => (
            // `label` is set explicitly because the item's children are not
            // plain text; Select uses it for the typeahead search key.
            <Select.Item key={option.code} value={option.code} label={optionLabel(option)}>
              {children ? (
                children(option)
              ) : (
                <>
                  <span aria-hidden="true">{optionSymbol(option)}</span>
                  <span>{optionLabel(option)}</span>
                  <span>{option.code}</span>
                </>
              )}
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
};

CurrencyInputCurrencySelect.displayName = 'CurrencyInput.CurrencySelect';
