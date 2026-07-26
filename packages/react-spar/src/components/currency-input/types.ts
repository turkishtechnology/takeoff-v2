import type { ReactNode } from 'react';

import type { ClassNamesMap, SlotPropsMap } from '../../core';
import type { InputProps } from '../input';
import type { SelectProps } from '../select';

export type CurrencyInputSlot = 'root';
export type CurrencyInputFieldSlot = 'root';
export type CurrencyInputCurrencySelectSlot = 'root';

/** A selectable currency. `symbol`/`label` are display-only; `code` is the value. */
export interface CurrencyOption {
  /** ISO 4217 code — the committed value, e.g. 'TRY'. */
  code: string;
  /** Human-readable name, e.g. 'Türk Lirası'. Falls back to `code`. */
  label?: string;
  /** Display glyph, e.g. '₺'. Falls back to the code. */
  symbol?: string;
}

/**
 * Domain + slot props owned by takeoff-v2 for the CurrencyInput root.
 *
 * The root renders no DOM of its own — it provides the amount/currency context
 * and delegates the bordered row to the styled `Input`. It is therefore a
 * state-only root and exempt from the polymorphism rule; `as` belongs to
 * `Input`, which still owns the rendered element.
 */
export interface CurrencyInputOwnProps {
  /** Controlled amount. `undefined` means "empty", which is distinct from `0`. */
  value?: number;
  /** Initial amount for uncontrolled usage. */
  defaultValue?: number;
  /** Called with the parsed amount after a commit (blur), or `undefined` when cleared. */
  onValueChange?: (value: number | undefined) => void;
  /** Controlled ISO 4217 currency code. Pair with `onCurrencyChange`. */
  currency?: string;
  /** Initial currency for uncontrolled usage. @defaultValue 'TRY' */
  defaultCurrency?: string;
  /** Called with the next ISO 4217 code when the selector commits. */
  onCurrencyChange?: (currency: string) => void;
  /**
   * BCP-47 locale driving grouping/decimal separators and symbol placement.
   * Pinned rather than runtime-resolved so SSR and the client agree.
   * @defaultValue 'tr-TR'
   */
  locale?: string;
  /** How the currency is rendered in the resting display string. @defaultValue 'symbol' */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  /** Override the currency's natural fraction digits. */
  minimumFractionDigits?: number;
  /** Override the currency's natural fraction digits. */
  maximumFractionDigits?: number;
  /** Anatomy — compose `CurrencyInput.CurrencySelect`, `CurrencyInput.Field`, … */
  children?: ReactNode;
  className?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CurrencyInputSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CurrencyInputSlot>;
}

export type CurrencyInputProps = CurrencyInputOwnProps &
  // Visual + form-state surface forwarded verbatim to the styled `Input` this
  // root renders. Deliberately EXCLUDES `as` (polymorphism stays Input's, since
  // Input owns the rendered element) and excludes `children` from Input — the
  // anatomy is this component's own, composed by the caller.
  Pick<InputProps<'div'>, 'id' | 'size' | 'invalid' | 'disabled' | 'required' | 'readOnly'>;

export interface CurrencyInputFieldOwnProps {
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  className?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CurrencyInputFieldSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CurrencyInputFieldSlot>;
}

/**
 * The amount field. Formats on **blur** and edits an unformatted string while
 * focused, which is what keeps this component free of caret-restoration logic.
 * (As-you-type grouping is a separate, much harder problem — deliberately not
 * v1. See the component contract's non-goals.)
 */
export type CurrencyInputFieldProps = CurrencyInputFieldOwnProps;

export interface CurrencyInputCurrencySelectOwnProps {
  /** The selectable currencies, in display order. */
  'currencies': CurrencyOption[];
  /**
   * Custom panel item content. Receives each option so callers can reorder
   * symbol/name/code or localise the name without a new part.
   */
  'children'?: (currency: CurrencyOption) => ReactNode;
  /** Custom trigger content. Receives the currently selected option. */
  'trigger'?: (currency: CurrencyOption | undefined) => ReactNode;
  /**
   * Accessible name for the trigger — required because the default trigger
   * renders only a symbol, which is not a usable label on its own.
   * @defaultValue 'Para birimi'
   */
  'aria-label'?: string;
  'className'?: string;
  /** Per-slot class name overrides. */
  'classNames'?: ClassNamesMap<CurrencyInputCurrencySelectSlot>;
  /** Per-slot HTML attribute overrides. */
  'slotProps'?: SlotPropsMap<CurrencyInputCurrencySelectSlot>;
}

export type CurrencyInputCurrencySelectProps = CurrencyInputCurrencySelectOwnProps &
  // Panel/disclosure surface forwarded to the styled `Select`. `value` /
  // `onChange` are EXCLUDED on purpose: the selected currency is owned by the
  // CurrencyInput context so the field's formatting stays in sync no matter
  // where this part is placed.
  Pick<SelectProps<'div'>, 'contentWidth' | 'open' | 'defaultOpen' | 'onOpenChange' | 'disabled'>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    CurrencyInput: import('../../core').ComponentThemeConfig<CurrencyInputProps, CurrencyInputSlot>;
    CurrencyInputField: import('../../core').ComponentThemeConfig<CurrencyInputFieldProps, CurrencyInputFieldSlot>;
    CurrencyInputCurrencySelect: import('../../core').ComponentThemeConfig<CurrencyInputCurrencySelectProps, CurrencyInputCurrencySelectSlot>;
  }
}
