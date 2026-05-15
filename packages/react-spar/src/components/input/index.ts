import { Input as InputRoot } from './Input';
import { InputContainer } from './InputContainer';
import { InputField } from './InputField';
import { InputPrefix } from './InputPrefix';
import { InputSuffix } from './InputSuffix';

const Input = Object.assign(InputRoot, {
  Container: InputContainer,
  Field: InputField,
  Prefix: InputPrefix,
  Suffix: InputSuffix,
});

export { Input };

export type { InputContainerProps, InputFieldProps, InputPrefixProps, InputProps, InputSize, InputSuffixProps } from './types';
