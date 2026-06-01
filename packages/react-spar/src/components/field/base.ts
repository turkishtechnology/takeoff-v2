import { createComponentBase } from '../../core';

import type { FieldDescriptionProps, FieldDescriptionSlot, FieldErrorMessageProps, FieldErrorMessageSlot, FieldLabelProps, FieldLabelSlot, FieldProps, FieldSlot } from './types';

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

export const FieldDescriptionBase = createComponentBase<FieldDescriptionProps, FieldDescriptionSlot>({
  name: 'FieldDescription',
  slots: ['root', 'icon'] as const,
  classes: { root: 'tk-field-description', icon: 'tk-field-description-icon' },
});

export const FieldErrorMessageBase = createComponentBase<FieldErrorMessageProps, FieldErrorMessageSlot>({
  name: 'FieldErrorMessage',
  slots: ['root', 'icon'] as const,
  classes: { root: 'tk-field-error-message', icon: 'tk-field-error-message-icon' },
});
