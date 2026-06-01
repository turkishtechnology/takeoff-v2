import { Input as InputRoot } from './Input';
import { InputChip } from './InputChip';
import { InputChips } from './InputChips';
import { InputClearButton } from './InputClearButton';
import { InputDecrement } from './InputDecrement';
import { InputField } from './InputField';
import { InputIncrement } from './InputIncrement';
import { InputLeadingIcon } from './InputLeadingIcon';
import { InputPrefix } from './InputPrefix';
import { InputRevealButton } from './InputRevealButton';
import { InputSpinner } from './InputSpinner';
import { InputStepper } from './InputStepper';
import { InputStrength } from './InputStrength';
import { InputSuffix } from './InputSuffix';
import { InputTrailingIcon } from './InputTrailingIcon';

const Input = Object.assign(InputRoot, {
  Field: InputField,
  Prefix: InputPrefix,
  Suffix: InputSuffix,
  LeadingIcon: InputLeadingIcon,
  TrailingIcon: InputTrailingIcon,
  ClearButton: InputClearButton,
  Spinner: InputSpinner,
  RevealButton: InputRevealButton,
  Strength: InputStrength,
  Stepper: InputStepper,
  Decrement: InputDecrement,
  Increment: InputIncrement,
  Chips: InputChips,
  Chip: InputChip,
});

export { Input };

export type {
  InputChipProps,
  InputChipSlot,
  InputChipsProps,
  InputChipsSlot,
  InputClearButtonProps,
  InputClearButtonSlot,
  InputDecrementProps,
  InputDecrementSlot,
  InputFieldProps,
  InputFieldSlot,
  InputIncrementProps,
  InputIncrementSlot,
  InputLeadingIconProps,
  InputLeadingIconSlot,
  InputPrefixProps,
  InputPrefixSlot,
  InputProps,
  InputRevealButtonProps,
  InputRevealButtonSlot,
  InputSize,
  InputSlot,
  InputSpinnerProps,
  InputSpinnerSlot,
  InputStepperProps,
  InputStepperSlot,
  InputStrengthProps,
  InputStrengthSlot,
  InputSuffixProps,
  InputSuffixSlot,
  InputTrailingIconProps,
  InputTrailingIconSlot,
} from './types';
