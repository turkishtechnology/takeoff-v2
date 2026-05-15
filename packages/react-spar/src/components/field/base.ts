import { createComponentBase } from '../../core';

import type { FieldDescriptionProps, FieldErrorMessageProps, FieldLabelProps, FieldLabelSlot, FieldProps, FieldSlot } from './types';

export const FieldBase = createComponentBase<FieldProps, FieldSlot>({
  name: 'Field',
  slots: ['root'] as const,
  classes: { root: 'tk-field' },
});

export const FieldLabelBase = createComponentBase<FieldLabelProps, FieldLabelSlot>({
  name: 'FieldLabel',
  slots: ['root', 'asterisk'] as const,
  classes: { root: 'tk-field-label', asterisk: 'tk-field-asterisk' },
});

export const FieldDescriptionBase = createComponentBase<FieldDescriptionProps, 'root'>({
  name: 'FieldDescription',
  slots: ['root'] as const,
  classes: { root: 'tk-field-description' },
});

export const FieldErrorMessageBase = createComponentBase<FieldErrorMessageProps, 'root'>({
  name: 'FieldErrorMessage',
  slots: ['root'] as const,
  classes: { root: 'tk-field-error-message' },
});
