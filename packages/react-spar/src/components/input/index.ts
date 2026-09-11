import { Input as InputRoot } from './Input';
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
});

export { Input };

// Spar's masking vocabulary, re-exported here rather than re-declared. `mask` is
// a Spar-owned contract, so a consumer writing a resolver (or composing one of
// the built-ins) must reach the exact same types the primitive validates
// against — a parallel copy in takeoff-v2 would be a second source of truth.
// Scoped to the Input barrel because Input is the only surface that takes it.
export { createDateMask, createNumberMask, createTimeMask } from '@turkish-technology/spar';

export type {
  Mask,
  MaskChangeMeta,
  MaskCommonOptions,
  MaskDateOptions,
  MaskDateToken,
  MaskNumberOptions,
  MaskPattern,
  MaskPreset,
  MaskRegexOptions,
  MaskResolver,
  MaskResolverContext,
  MaskResolverResult,
  MaskShapeOptions,
  MaskTimeOptions,
  MaskTimeToken,
} from '@turkish-technology/spar';

export type {
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
