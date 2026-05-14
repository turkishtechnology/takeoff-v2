import { Input as InputRoot } from './Input';
import { InputContainer } from './InputContainer';
import { InputField } from './InputField';
import { InputLabel } from './InputLabel';
import { InputDescription } from './InputDescription';
import { InputErrorMessage } from './InputErrorMessage';
import { InputPrefix } from './InputPrefix';
import { InputSuffix } from './InputSuffix';
import { InputLeadingIcon } from './InputLeadingIcon';
import { InputTrailingIcon } from './InputTrailingIcon';

const Input = Object.assign(InputRoot, {
  Container: InputContainer,
  Field: InputField,
  Label: InputLabel,
  Description: InputDescription,
  ErrorMessage: InputErrorMessage,
  Prefix: InputPrefix,
  Suffix: InputSuffix,
  LeadingIcon: InputLeadingIcon,
  TrailingIcon: InputTrailingIcon,
});

export { Input };

export type {
  InputContainerProps,
  InputDescriptionProps,
  InputErrorMessageProps,
  InputFieldProps,
  InputLabelProps,
  InputLeadingIconProps,
  InputPrefixProps,
  InputProps,
  InputSize,
  InputSuffixProps,
  InputTrailingIconProps,
} from './types';
