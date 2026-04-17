import { createComponentBase } from '../../base/createComponentBase';
import type { SlotClassNames } from '../../types';

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
    iconPosition: 'left',
  },
});
