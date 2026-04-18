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
