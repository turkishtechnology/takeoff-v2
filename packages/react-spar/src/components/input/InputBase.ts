import type { ChangeEvent, MutableRefObject, Ref, SyntheticEvent } from 'react';

import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';
import { createSafeContext } from '../../utils/createSafeContext';

import type { InputProps } from './types';

export const inputSlots = [
  'root',
  'label',
  'asterisk',
  'container',
  'field',
  'leadingIcon',
  'trailingIcon',
  'prefix',
  'suffix',
  'clearButton',
  'clearIcon',
  'spinner',
  'description',
  'errorMessage',
] as const;

export type InputSlot = (typeof inputSlots)[number];

export const inputClassNames = {
  root: 'tk-input',
  label: 'tk-input-label',
  asterisk: 'tk-input-asterisk',
  container: 'tk-input-container',
  field: 'tk-input-field',
  leadingIcon: 'tk-input-leading-icon',
  trailingIcon: 'tk-input-trailing-icon',
  prefix: 'tk-input-prefix',
  suffix: 'tk-input-suffix',
  clearButton: 'tk-input-clear-button',
  clearIcon: 'tk-input-clear-icon',
  spinner: 'tk-input-spinner',
  description: 'tk-input-description',
  errorMessage: 'tk-input-error-message',
} as const satisfies SlotClassNames<InputSlot>;

/**
 * Composition archetype classification (see
 * `packages/react-spar/docs/CODING_STANDARDS.md § Composition Archetypes`).
 *
 * `SparInput` ships a compound upstream; its ARIA-coordinated parts are
 * inherited. Visual chrome (container, icons, prefix/suffix, spinner, clear
 * button, asterisk) is react-enhancement because upstream leaves the visual
 * anatomy to the adapter layer.
 *
 * - `Input` root             — inherited. Delegates to `SparInput`; the
 *   upstream root is what wires `fieldId` / `labelId` / `descriptionId` /
 *   `errorId` for the ARIA relationships.
 * - `Input.Field`            — inherited. Delegates to `SparInputField`.
 * - `Input.Label`            — inherited. Delegates to `SparInputLabel`.
 * - `Input.Description`      — inherited. Delegates to `SparInputDescription`;
 *   conditionally hidden when `invalid` is true.
 * - `Input.ErrorMessage`     — inherited. Delegates to `SparInputErrorMessage`;
 *   conditionally rendered when `invalid` is true.
 * - `Input.Container`        — react-enhancement.
 * - `Input.LeadingIcon`      — react-enhancement.
 * - `Input.TrailingIcon`     — react-enhancement.
 * - `Input.Prefix`           — react-enhancement.
 * - `Input.Suffix`           — react-enhancement.
 * - `Input.Spinner`          — react-enhancement; conditional on `loading` and
 *   suppressed when `ClearButton` would take the same slot.
 * - `Input.ClearButton`      — react-enhancement; conditional on `clearable`
 *   and non-empty value.
 * - `Input.Asterisk`         — react-enhancement; conditional on `required`.
 */
export const InputBase = createComponentBase<InputProps, InputSlot>({
  name: 'Input',
  slots: inputSlots,
  classNames: inputClassNames,
  defaultProps: {
    type: 'text',
    size: 'base',
    disabled: false,
    readOnly: false,
    required: false,
    invalid: false,
    clearable: false,
    loading: false,
  },
});

export interface InputContextValue {
  /** Resolved current value of the input field. */
  currentValue: string | number | undefined;
  /** Whether the parent is operating in controlled mode. */
  isControlled: boolean;
  size: NonNullable<InputProps['size']>;
  type: NonNullable<InputProps['type']>;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  clearable: boolean;
  loading: boolean;
  fieldRef: Ref<HTMLInputElement>;
  fieldRefObject: MutableRefObject<HTMLInputElement | null>;
  classNames: InputProps['classNames'];
  slotProps: InputProps['slotProps'];
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearClick?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  setUncontrolledValue: (value: string | number | undefined) => void;
}

export const [InputProvider, useInputContext] = createSafeContext<InputContextValue>('Input');
