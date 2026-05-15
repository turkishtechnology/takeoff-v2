import { Field as FieldRoot } from './Field';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { FieldErrorMessage } from './FieldErrorMessage';

const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Description: FieldDescription,
  ErrorMessage: FieldErrorMessage,
});

export { Field };

export type { FieldProps, FieldSlot, FieldLabelProps, FieldLabelSlot, FieldDescriptionProps, FieldDescriptionSlot, FieldErrorMessageProps, FieldErrorMessageSlot } from './types';
