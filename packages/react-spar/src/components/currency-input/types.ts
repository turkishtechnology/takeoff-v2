import type { ReactNode } from 'react';

import type { ClassNamesMap, SlotPropsMap } from '../../core';
import type { InputFieldProps, InputProps } from '../input';
import type { SelectProps } from '../select';

export type CurrencyInputSlot = 'root';
export type CurrencyInputFieldSlot = 'root';
export type CurrencyInputSymbolSlot = 'root';
export type CurrencyInputCurrencySelectSlot = 'root';

/** A selectable currency. `code` is the value; the rest is display. */
export interface CurrencyOption {
  /** ISO 4217 code — the committed value, e.g. `'TRY'`. */
  code: string;
  /** Name shown in the list, e.g. `'Türk Lirası'`. Falls back to `code`. */
  label?: string;
  /** Symbol shown in the list, e.g. `'₺'`. Falls back to the locale's own symbol for `code`. */
  symbol?: string;
  /** Leading visual on the trigger and in the list — typically a flag. No flag set ships with the package. */
  icon?: ReactNode;
}

/**
 * Props owned by takeoff-v2 for the CurrencyInput root.
 *
 * The root's own element is `Input`'s row: it holds the amount and the currency
 * and hands the bordered row, sizing and form state to the styled `Input`. The
 * amount is formatted by Spar's `number` mask on `CurrencyInput.Field`; these
 * props only feed it.
 */
export interface CurrencyInputOwnProps {
  /** Controlled amount. `undefined` is "empty", which is distinct from `0`. */
  value?: number;
  /** Initial amount for uncontrolled usage. */
  defaultValue?: number;
  /** Called with the amount on every edit that changes it, or `undefined` once nothing names one (empty, or a lone `-`). */
  onValueChange?: (value: number | undefined) => void;
  /** Controlled ISO 4217 currency code. Pair with `onCurrencyChange`. */
  currency?: string;
  /**
   * Initial currency for uncontrolled usage.
   * @defaultValue 'TRY'
   */
  defaultCurrency?: string;
  /** Called with the next ISO 4217 code when the currency changes. */
  onCurrencyChange?: (currency: string) => void;
  /**
   * BCP 47 locale for the grouping, the decimal mark and the symbol. Pass it
   * explicitly when the page is server-rendered: the server's runtime locale
   * can differ from the browser's.
   * @defaultValue the runtime's locale
   */
  locale?: string;
  /** Fraction digits the field accepts. `0` makes it whole numbers only. Defaults to the currency's own (TRY 2, JPY 0). */
  decimalScale?: number;
  /** Integer digits the field accepts. Unset leaves it unbounded. */
  integerScale?: number;
  /**
   * Accept a minus sign.
   * @defaultValue false
   */
  allowNegative?: boolean;
  /** Submits the amount in canonical form (`1234.5`) under this name. The currency has its own `name` on `CurrencySelect`. */
  name?: string;
  /** Form the hidden amount input belongs to, when it is outside it. */
  form?: string;
  /** Anatomy — compose `CurrencyInput.Field`, `CurrencyInput.Suffix`, … */
  children?: ReactNode;
  className?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CurrencyInputSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CurrencyInputSlot>;
}

export type CurrencyInputProps = CurrencyInputOwnProps &
  // Visual and form-state surface forwarded to the styled `Input` this root
  // renders. EXCLUDES `as` (the row is Input's element, so polymorphism stays
  // Input's) and `children` (the anatomy is this component's own).
  Pick<InputProps<'div'>, 'id' | 'size' | 'invalid' | 'disabled' | 'required' | 'readOnly'>;

export interface CurrencyInputFieldOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CurrencyInputFieldSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CurrencyInputFieldSlot>;
}

/**
 * The amount field: an `Input.Field` with Spar's `number` mask. EXCLUDES
 * `mask`, `value`, `defaultValue`, `onValueChange`, `type` and `inputMode` —
 * the root owns the value and the mask, and a masked number is a text field.
 */
export type CurrencyInputFieldProps = CurrencyInputFieldOwnProps &
  Omit<InputFieldProps<'input'>, 'mask' | 'value' | 'defaultValue' | 'onValueChange' | 'type' | 'inputMode' | 'as' | 'classNames' | 'slotProps'>;

export interface CurrencyInputSymbolOwnProps {
  /** Replaces the symbol. Receives the active currency's code and the locale's symbol for it. */
  children?: (currency: { code: string; symbol: string }) => ReactNode;
  className?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CurrencyInputSymbolSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CurrencyInputSymbolSlot>;
}

/** The active currency's symbol as text, for a field whose currency is fixed. Place it in `Prefix` or `Suffix`. */
export type CurrencyInputSymbolProps = CurrencyInputSymbolOwnProps;

export interface CurrencyInputCurrencySelectOwnProps {
  /** The selectable currencies, in display order. */
  'currencies': CurrencyOption[];
  /** Replaces a list row's content. Receives the option and the locale's symbol for it. Default: icon, symbol, name. */
  'children'?: (currency: CurrencyOption, symbol: string) => ReactNode;
  /** Replaces the trigger's content (the chevron stays). Receives the selected option. Default: icon and code. */
  'trigger'?: (currency: CurrencyOption | undefined) => ReactNode;
  /**
   * Accessible name of the trigger, which shows only an icon and a code.
   * @defaultValue 'Currency'
   */
  'aria-label'?: string;
  /**
   * Show a search field above the list that filters by code, name and symbol,
   * ignoring case and accents.
   * @defaultValue true
   */
  'searchable'?: boolean;
  /**
   * Accessible name of the search field.
   * @defaultValue 'Search currencies'
   */
  'searchLabel'?: string;
  /**
   * Placeholder of the search field.
   * @defaultValue 'Search'
   */
  'searchPlaceholder'?: string;
  /**
   * What the list says once a search matches nothing.
   * @defaultValue 'No currencies found'
   */
  'emptyLabel'?: string;
  'className'?: string;
  /** Per-slot class name overrides. */
  'classNames'?: ClassNamesMap<CurrencyInputCurrencySelectSlot>;
  /** Per-slot HTML attribute overrides. */
  'slotProps'?: SlotPropsMap<CurrencyInputCurrencySelectSlot>;
}

export type CurrencyInputCurrencySelectProps = CurrencyInputCurrencySelectOwnProps &
  // Disclosure and form surface of the styled `Select`. EXCLUDES `value`,
  // `defaultValue` and `onChange` (the currency lives on the CurrencyInput root
  // so the field's mask follows it wherever this part sits) and `size` (the
  // row's size cascades).
  Pick<SelectProps<'div'>, 'contentWidth' | 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled' | 'name'>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    CurrencyInput: import('../../core').ComponentThemeConfig<CurrencyInputProps, CurrencyInputSlot>;
    CurrencyInputField: import('../../core').ComponentThemeConfig<CurrencyInputFieldProps, CurrencyInputFieldSlot>;
    CurrencyInputSymbol: import('../../core').ComponentThemeConfig<CurrencyInputSymbolProps, CurrencyInputSymbolSlot>;
    CurrencyInputCurrencySelect: import('../../core').ComponentThemeConfig<CurrencyInputCurrencySelectProps, CurrencyInputCurrencySelectSlot>;
  }
}
