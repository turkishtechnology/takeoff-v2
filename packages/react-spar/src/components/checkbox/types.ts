import type { FocusEvent, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import type { CheckboxSlot } from './CheckboxBase';
import type { ClassNamesOverride } from '../../customization/overrides';

/**
 * Tri-state value preserved from the `tk-checkbox` contract: `true` = checked,
 * `false` = unchecked, `null` = indeterminate.
 */
export type CheckboxValue = boolean | null;

export type CheckboxType = 'default' | 'card';

export type CheckboxSize = 'base' | 'small';

export interface CheckboxIconRenderState {
  /** `true` while the checkbox is fully checked. */
  checked: boolean;
  /** `true` while the checkbox is in the indeterminate state (tri-state null). */
  indeterminate: boolean;
}

export interface CheckboxSlotProps {
  root?: HTMLAttributes<HTMLElement>;
  indicator?: HTMLAttributes<HTMLSpanElement>;
  icon?: HTMLAttributes<HTMLSpanElement>;
  content?: HTMLAttributes<HTMLSpanElement>;
  label?: HTMLAttributes<HTMLSpanElement>;
  description?: HTMLAttributes<HTMLSpanElement>;
}

export interface CheckboxProps {
  /**
   * Controlled tri-state value. `null` is indeterminate.
   */
  value?: CheckboxValue;
  /**
   * Initial tri-state value for uncontrolled usage. Defaults to `false`.
   */
  defaultValue?: CheckboxValue;
  /**
   * Sugar for `value: null`. Wins over `value` / `defaultValue` while `true`.
   * @defaultValue false
   */
  indeterminate?: boolean;
  /**
   * Fired on every value change. Receives the normalized tri-state value.
   */
  onChange?: (value: CheckboxValue) => void;
  /**
   * Component size.
   * @defaultValue 'base'
   */
  size?: CheckboxSize;
  /**
   * Visual variant.
   * @defaultValue 'default'
   */
  type?: CheckboxType;
  /**
   * Disables interaction.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Marks the control as read-only.
   * @defaultValue false
   */
  readOnly?: boolean;
  /**
   * Marks the control as required for form submission.
   * @defaultValue false
   */
  required?: boolean;
  /**
   * Marks the control as invalid. Exposes `data-invalid` on the root for
   * styling.
   * @defaultValue false
   */
  invalid?: boolean;
  /**
   * Name attribute for form submission.
   */
  name?: string;
  /**
   * String value sent with form submissions when the box is checked.
   * @defaultValue 'on'
   */
  formValue?: string;
  /**
   * ID of the form this checkbox belongs to.
   */
  form?: string;
  /**
   * Auto-focus the control on mount.
   * @defaultValue false
   */
  autoFocus?: boolean;
  /**
   * Override the tab order.
   */
  tabIndex?: number;
  /**
   * Custom ID for the root node.
   */
  id?: string;
  /**
   * Extra class names appended to the canonical root class.
   */
  className?: string;
  /**
   * Compound children — must be composed from `Checkbox.Indicator`,
   * `Checkbox.Content`, `Checkbox.Label`, `Checkbox.Description`.
   */
  children?: ReactNode;
  /**
   * Per-slot class name overrides.
   */
  classNames?: ClassNamesOverride<CheckboxSlot>;
  /**
   * Per-slot HTML attribute overrides. `className` values concatenate.
   */
  slotProps?: CheckboxSlotProps;
  /**
   * Fired when focus enters the root.
   */
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  /**
   * Fired when focus leaves the root.
   */
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  /**
   * Fired when the root is clicked.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * Fired on every keydown on the root.
   */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface CheckboxIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Typically `<Checkbox.Icon>`, or custom glyph content.
   */
  children?: ReactNode;
}

export interface CheckboxIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /**
   * Optional custom glyph content. When omitted, the default check/remove
   * icons are rendered based on state.
   */
  children?: ReactNode | ((state: CheckboxIconRenderState) => ReactNode);
}

export interface CheckboxContentProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface CheckboxLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface CheckboxDescriptionProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}
