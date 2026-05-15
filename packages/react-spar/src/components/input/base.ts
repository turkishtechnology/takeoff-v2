import { createComponentBase } from '../../core';

import type { InputContainerProps, InputContainerSlot, InputFieldProps, InputPrefixProps, InputProps, InputSuffixProps } from './types';

export const InputBase = createComponentBase<InputProps, 'root'>({
  name: 'Input',
  slots: ['root'] as const,
  classes: { root: 'tk-input' },
});

export const InputContainerBase = createComponentBase<InputContainerProps, InputContainerSlot>({
  name: 'InputContainer',
  slots: ['root', 'startContent', 'endContent'] as const,
  classes: {
    root: 'tk-input-container',
    startContent: 'tk-input-start-content',
    endContent: 'tk-input-end-content',
  },
});

export const InputFieldBase = createComponentBase<InputFieldProps, 'root'>({
  name: 'InputField',
  slots: ['root'] as const,
  classes: { root: 'tk-input-field' },
});

export const InputPrefixBase = createComponentBase<InputPrefixProps, 'root'>({
  name: 'InputPrefix',
  slots: ['root'] as const,
  classes: { root: 'tk-input-prefix' },
});

export const InputSuffixBase = createComponentBase<InputSuffixProps, 'root'>({
  name: 'InputSuffix',
  slots: ['root'] as const,
  classes: { root: 'tk-input-suffix' },
});
