import { Input as InputRoot } from './Input';
import { InputContainer } from './InputContainer';
import { InputField } from './InputField';
import { InputLabel } from './InputLabel';
import { InputDescription } from './InputDescription';
import { InputErrorMessage } from './InputErrorMessage';
import { InputPrefix } from './InputPrefix';
import { InputSuffix } from './InputSuffix';

const Input = Object.assign(InputRoot, {
  Container: InputContainer,
  Field: InputField,
  Label: InputLabel,
  Description: InputDescription,
  ErrorMessage: InputErrorMessage,
  Prefix: InputPrefix,
  Suffix: InputSuffix,
});

export { Input };

export type {
  InputContainerProps,
  InputDescriptionProps,
  InputErrorMessageProps,
  InputFieldProps,
  InputLabelProps,
  InputPrefixProps,
  InputProps,
  InputSize,
  InputSuffixProps,
} from './types';
