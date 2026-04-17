import type { ButtonHTMLAttributes, ChangeEvent, ComponentPropsWithoutRef, HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SyntheticEvent } from 'react';

import type { InputSlot } from './InputBase';
import type { ClassNamesOverride } from '../../customization/overrides';

/**
 * Native HTML input types supported by the wrapper. Narrower than
 * `HTMLInputElement['type']` on purpose — values that would require their own
 * wrapper family (file, range, checkbox, radio, submit, reset, button, image,
 * hidden, color, date-family) are intentionally excluded.
 */
export type InputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number';

export type InputSize = 'large' | 'base' | 'small';

export type InputIconPosition = 'left' | 'right';

export type InputIcon = ReactNode | string;

export interface InputSlotProps {
  root?: HTMLAttributes<HTMLDivElement>;
  label?: LabelHTMLAttributes<HTMLLabelElement>;
  asterisk?: HTMLAttributes<HTMLSpanElement>;
  container?: HTMLAttributes<HTMLDivElement>;
  field?: InputHTMLAttributes<HTMLInputElement>;
  leadingIcon?: HTMLAttributes<HTMLSpanElement>;
  trailingIcon?: HTMLAttributes<HTMLSpanElement>;
  prefix?: HTMLAttributes<HTMLSpanElement>;
  suffix?: HTMLAttributes<HTMLSpanElement>;
  clearButton?: ButtonHTMLAttributes<HTMLButtonElement>;
  clearIcon?: HTMLAttributes<HTMLSpanElement>;
  spinner?: HTMLAttributes<HTMLSpanElement>;
  description?: HTMLAttributes<HTMLDivElement>;
  errorMessage?: HTMLAttributes<HTMLDivElement>;
}

type InputNativeProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'children' | 'type' | 'size' | 'disabled' | 'readOnly' | 'required' | 'value' | 'defaultValue' | 'onChange' | 'prefix'
>;

export interface InputProps extends InputNativeProps {
  /**
   * HTML input type. Narrower than the native set — see `InputType` for the
   * supported values.
   * @defaultValue 'text'
   */
  type?: InputType;
  /**
   * Component size.
   * @defaultValue 'base'
   */
  size?: InputSize;
  /**
   * Disables the input.
   * @defaultValue false
   */
  disabled?: boolean;
  /**
   * Makes the input read-only.
   * @defaultValue false
   */
  readOnly?: boolean;
  /**
   * Marks the field as required. When a label is present, the wrapper renders
   * the canonical asterisk node.
   * @defaultValue false
   */
  required?: boolean;
  /**
   * Marks the field as invalid. When `true`, `error` is announced via the
   * error-message slot and the input receives `aria-invalid="true"`.
   * @defaultValue false
   */
  invalid?: boolean;
  /**
   * Shows a clear button that resets the value to an empty string and calls
   * `onClearClick`.
   * @defaultValue false
   */
  clearable?: boolean;
  /**
   * Shows a spinner on the trailing side. Skipped when the clear button is
   * visible.
   * @defaultValue false
   */
  loading?: boolean;
  /**
   * Current value for controlled usage.
   */
  value?: string | number;
  /**
   * Initial value for uncontrolled usage.
   */
  defaultValue?: string | number;
  /**
   * Fired on every value change. Receives the raw native event.
   */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Fired after the user activates the clear button.
   */
  onClearClick?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  /**
   * Label text above the field.
   */
  label?: ReactNode;
  /**
   * Helper text below the field. Hidden while an error is shown.
   */
  description?: ReactNode;
  /**
   * Error text shown below the field when `invalid` is `true`. Announced as an
   * alert via `role="alert"`.
   */
  error?: ReactNode;
  /**
   * Shared icon prop. String values assume the consumer has loaded Material
   * Symbols fonts. Prefer `leadingIcon` / `trailingIcon` for explicit slot
   * control.
   */
  icon?: InputIcon;
  /**
   * Placement of the shared `icon` prop.
   * @defaultValue 'left'
   */
  iconPosition?: InputIconPosition;
  /**
   * Explicit content for the leading icon slot.
   */
  leadingIcon?: ReactNode;
  /**
   * Explicit content for the trailing icon slot.
   */
  trailingIcon?: ReactNode;
  /**
   * Text or node rendered inside the field before the native input. Replaces
   * the Stencil `pre` prop.
   */
  prefix?: ReactNode;
  /**
   * Text or node rendered inside the field after the native input.
   */
  suffix?: ReactNode;
  /**
   * Optional custom loading indicator. When omitted the wrapper renders the
   * canonical default spinner node.
   */
  spinner?: ReactNode;
  /**
   * Custom base ID for ARIA wiring. When omitted, the Spar primitive generates
   * one. Sub-element IDs derive from this base.
   */
  id?: string;
  /**
   * Per-slot class name overrides.
   */
  classNames?: ClassNamesOverride<InputSlot>;
  /**
   * Per-slot HTML attribute overrides. `className` is concatenated rather than
   * replaced.
   */
  slotProps?: InputSlotProps;
  /**
   * Render override for the leading icon content. Receives the default icon
   * node and must return React content — the structural `<span>` owner stays.
   */
  renderLeadingIcon?: (defaultIcon: ReactNode) => ReactNode;
  /**
   * Render override for the trailing icon content. The structural `<span>`
   * owner stays.
   */
  renderTrailingIcon?: (defaultIcon: ReactNode) => ReactNode;
  /**
   * Render override for the spinner content. Receives the default spinner
   * node; the structural slot `<span>` owner stays.
   */
  renderSpinner?: (defaultSpinner: ReactNode) => ReactNode;
  /**
   * Render override for the clear button icon content. The structural
   * `<button>` owner and dismiss behavior stay.
   */
  renderClearIcon?: (defaultIcon: ReactNode) => ReactNode;
}

export interface InputLabelPartProps {
  children?: ReactNode;
  className?: string;
}

export interface InputDescriptionPartProps {
  children?: ReactNode;
  className?: string;
}

export interface InputErrorMessagePartProps {
  children?: ReactNode;
  className?: string;
}
