import { createComponentBase } from '../../core';

import type {
  InputChipProps,
  InputChipsProps,
  InputClearButtonProps,
  InputDecrementProps,
  InputFieldProps,
  InputIncrementProps,
  InputLeadingIconProps,
  InputPrefixProps,
  InputProps,
  InputRevealButtonProps,
  InputSpinnerProps,
  InputStepperProps,
  InputStrengthProps,
  InputSuffixProps,
  InputTrailingIconProps,
} from './types';

// @archetype inherited — wraps Spar Input
export const InputBase = createComponentBase<InputProps, 'root'>({
  name: 'Input',
  slots: ['root'] as const,
  classes: { root: 'tk-input' },
});

// @archetype inherited — wraps Spar InputField
export const InputFieldBase = createComponentBase<InputFieldProps, 'root'>({
  name: 'InputField',
  slots: ['root'] as const,
  classes: { root: 'tk-input-field' },
});

// @archetype react-enhancement — no Spar equivalent
export const InputPrefixBase = createComponentBase<InputPrefixProps, 'root'>({
  name: 'InputPrefix',
  slots: ['root'] as const,
  classes: { root: 'tk-input-prefix' },
});

// @archetype react-enhancement — no Spar equivalent
export const InputSuffixBase = createComponentBase<InputSuffixProps, 'root'>({
  name: 'InputSuffix',
  slots: ['root'] as const,
  classes: { root: 'tk-input-suffix' },
});

// @archetype react-enhancement — no Spar equivalent
export const InputLeadingIconBase = createComponentBase<InputLeadingIconProps, 'root'>({
  name: 'InputLeadingIcon',
  slots: ['root'] as const,
  classes: { root: 'tk-input-leading-icon' },
});

// @archetype react-enhancement — no Spar equivalent
export const InputTrailingIconBase = createComponentBase<InputTrailingIconProps, 'root'>({
  name: 'InputTrailingIcon',
  slots: ['root'] as const,
  classes: { root: 'tk-input-trailing-icon' },
});

// @archetype react-enhancement — no Spar equivalent
export const InputClearButtonBase = createComponentBase<InputClearButtonProps, 'root'>({
  name: 'InputClearButton',
  slots: ['root'] as const,
  classes: { root: 'tk-input-clear-button' },
});

// @archetype react-enhancement — no Spar equivalent
export const InputSpinnerBase = createComponentBase<InputSpinnerProps, 'root'>({
  name: 'InputSpinner',
  slots: ['root'] as const,
  classes: { root: 'tk-input-spinner' },
});

// @archetype react-enhancement — no Spar equivalent
export const InputRevealButtonBase = createComponentBase<InputRevealButtonProps, 'root'>({
  name: 'InputRevealButton',
  slots: ['root'] as const,
  classes: { root: 'tk-input-reveal-button' },
});

// @archetype react-enhancement — no Spar equivalent
export const InputStrengthBase = createComponentBase<InputStrengthProps, 'root'>({
  name: 'InputStrength',
  slots: ['root'] as const,
  classes: { root: 'tk-input-strength' },
});

// @archetype react-enhancement — no Spar equivalent; native input owns number behavior
export const InputStepperBase = createComponentBase<InputStepperProps, 'root'>({
  name: 'InputStepper',
  slots: ['root'] as const,
  classes: { root: 'tk-input-stepper' },
});

// @archetype react-enhancement — no Spar equivalent; calls native input.stepDown()
export const InputDecrementBase = createComponentBase<InputDecrementProps, 'root'>({
  name: 'InputDecrement',
  slots: ['root'] as const,
  classes: { root: 'tk-input-decrement' },
});

// @archetype react-enhancement — no Spar equivalent; calls native input.stepUp()
export const InputIncrementBase = createComponentBase<InputIncrementProps, 'root'>({
  name: 'InputIncrement',
  slots: ['root'] as const,
  classes: { root: 'tk-input-increment' },
});

// @archetype react-enhancement — no Spar equivalent; owns internal chips array state
export const InputChipsBase = createComponentBase<InputChipsProps, 'root'>({
  name: 'InputChips',
  slots: ['root'] as const,
  classes: { root: 'tk-input-chips' },
});

// @archetype react-enhancement — no Spar equivalent; removable tag token
export const InputChipBase = createComponentBase<InputChipProps, 'root' | 'label' | 'remove'>({
  name: 'InputChip',
  slots: ['root', 'label', 'remove'] as const,
  classes: { root: 'tk-input-chip', label: 'tk-input-chip-label', remove: 'tk-input-chip-remove' },
});
