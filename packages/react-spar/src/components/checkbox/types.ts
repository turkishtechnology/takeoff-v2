import type { FocusEvent, HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import type { CheckboxSlot } from './CheckboxBase';
import type { ClassNamesOverride } from '../../customization/overrides';

/**
 * Tri-state value preserved from the `tk-checkbox` contract: `true` = checked,
 * `false` = unchecked, `null` = indeterminate. The React wrapper normalizes
 * this onto the spar primitive's `CheckedState` (`boolean | 'indeterminate'`).
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
  text?: HTMLAttributes<HTMLSpanElement>;
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
   * Sugar for `value: null`. Mirrors the `tk-checkbox` `indeterminate` prop.
   * Wins over `value` / `defaultValue` while `true`.
   * @defaultValue false
   */
  indeterminate?: boolean;
  /**
   * Fired on every value change. Receives the normalized tri-state value.
   */
  onChange?: (value: CheckboxValue) => void;
  /**
   * Visible label text.
   */
  label?: ReactNode;
  /**
   * Helper text rendered below the label.
   */
  description?: ReactNode;
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
   * Marks the control as read-only. Spar primitive handles the interaction
   * lock.
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
   * styling; does not alter the ARIA tree.
   * @defaultValue false
   */
  invalid?: boolean;
  /**
   * Name attribute for form submission. When set, spar renders a hidden
   * native input that mirrors the checked state.
   */
  name?: string;
  /**
   * String value sent with form submissions when the box is checked. Mirrors
   * the native `<input type="checkbox">` `value` attribute.
   * @defaultValue 'on'
   */
  formValue?: string;
  /**
   * ID of the form this checkbox belongs to. Forwards to the hidden native
   * input rendered by spar when `name` is set.
   */
  form?: string;
  /**
   * Auto-focus the control on mount.
   * @defaultValue false
   */
  autoFocus?: boolean;
  /**
   * Override the tab order. The spar primitive already handles `-1` when the
   * control is disabled.
   */
  tabIndex?: number;
  /**
   * Custom ID for the root node. When omitted, spar generates a stable id
   * via `useId`.
   */
  id?: string;
  /**
   * Extra class names appended to the canonical root class.
   */
  className?: string;
  /**
   * Per-slot class name overrides. Canonical `tk-*` classes are never
   * replaced.
   */
  classNames?: ClassNamesOverride<CheckboxSlot>;
  /**
   * Per-slot HTML attribute overrides. `className` values concatenate onto
   * the canonical slot class.
   */
  slotProps?: CheckboxSlotProps;
  /**
   * Render override for the check / indeterminate glyph. Receives the
   * resolved checked / indeterminate flags. Returning `null` hides the
   * glyph; the structural `<span class="tk-checkbox-icon">` owner stays so
   * the recipe can keep driving the fill.
   */
  renderIcon?: (state: CheckboxIconRenderState) => ReactNode;
  /**
   * Fired when focus enters the root.
   */
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  /**
   * Fired when focus leaves the root.
   */
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  /**
   * Fired when the root is clicked. Runs in addition to the primitive's
   * toggle handler.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * Fired on every keydown on the root.
   */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
}
