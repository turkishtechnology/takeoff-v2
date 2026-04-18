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

type InputRootNativeProps = Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'defaultValue'>;

export interface InputProps extends InputRootNativeProps {
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
   * Marks the field as required. Affects the `<Input.Asterisk>` subcomponent.
   * @defaultValue false
   */
  required?: boolean;
  /**
   * Marks the field as invalid. When `true`, `<Input.ErrorMessage>` is rendered
   * and the input receives `aria-invalid="true"`; `<Input.Description>` is
   * suppressed while invalid.
   * @defaultValue false
   */
  invalid?: boolean;
  /**
   * Enables `<Input.ClearButton>` to render. The clear button becomes visible
   * when the field has a value and is not disabled/read-only.
   * @defaultValue false
   */
  clearable?: boolean;
  /**
   * Drives `<Input.Spinner>` visibility. The spinner yields to the clear
   * button when both are active.
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
   * Fired after the user activates `<Input.ClearButton>`.
   */
  onClearClick?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  /**
   * Custom base ID for ARIA wiring.
   */
  id?: string;
  /**
   * Compound children — typically composed from `Input.Label`,
   * `Input.Container`, `Input.Description`, and `Input.ErrorMessage`.
   */
  children?: ReactNode;
  /**
   * Per-slot class name overrides.
   */
  classNames?: ClassNamesOverride<InputSlot>;
  /**
   * Per-slot HTML attribute overrides. `className` is concatenated rather than
   * replaced.
   */
  slotProps?: InputSlotProps;
}

export interface InputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
}

export interface InputAsteriskProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface InputContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'disabled' | 'readOnly' | 'required' | 'value' | 'defaultValue'>;

export interface InputLeadingIconProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface InputTrailingIconProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface InputPrefixProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface InputSuffixProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface InputSpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Optional custom spinner content. When omitted a default indicator is used.
   */
  children?: ReactNode;
}

export interface InputClearButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onKeyDown' | 'type'> {
  /**
   * Optional custom icon content for the clear button. When omitted, the
   * default placeholder close icon is used.
   */
  children?: ReactNode;
}

export interface InputDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface InputErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
