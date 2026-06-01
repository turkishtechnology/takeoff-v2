import type { ElementType, ReactNode } from 'react';
import type { InputProps as SparInputProps, InputFieldProps as SparInputFieldProps, PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type InputSize = 'small' | 'base' | 'large';

export type InputSlot = 'root';
export type InputFieldSlot = 'root';
export type InputPrefixSlot = 'root';
export type InputSuffixSlot = 'root';
export type InputLeadingIconSlot = 'root';
export type InputTrailingIconSlot = 'root';
export type InputClearButtonSlot = 'root';
export type InputSpinnerSlot = 'root';
export type InputRevealButtonSlot = 'root';
export type InputStrengthSlot = 'root';
export type InputStepperSlot = 'root';
export type InputDecrementSlot = 'root';
export type InputIncrementSlot = 'root';
export type InputChipsSlot = 'root';
export type InputChipSlot = 'root' | 'label' | 'remove';

/**
 * Visual + slot props owned by takeoff-v2 for the Input root. The `size`
 * cascades to descendants through a visual context so InputField renders at
 * the same scale without consumers having to repeat the prop.
 */
export interface InputOwnProps {
  /**
   * Size scale.
   * @defaultValue 'base'
   */
  size?: InputSize;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputSlot>;
}

/**
 * Public props for the Input root. Polymorphic via `as`; ref and the native
 * attributes of the rendered element are inherited from Spar's
 * `PolymorphicProps`.
 */
export type InputProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  InputOwnProps &
    // Spar Input root: identity + form/a11y state (invalid, disabled, required,
    // readOnly). These drive the shared ID/context Spar provides to compound
    // children and the canonical `data-*` it emits on the root.
    Pick<SparInputProps, 'id' | 'invalid' | 'disabled' | 'required' | 'readOnly'>
>;

export interface InputFieldOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputFieldSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputFieldSlot>;
}

export type InputFieldProps<T extends ElementType = 'input'> = PolymorphicProps<
  'input',
  T,
  InputFieldOwnProps &
    // Auto-focus on mount; the rest of the input surface (value, onChange,
    // placeholder, etc.) is inherited from the polymorphic native element.
    Pick<SparInputFieldProps, 'autoFocus'>
>;

export interface InputPrefixOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputPrefixSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputPrefixSlot>;
  children?: ReactNode;
}

export type InputPrefixProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, InputPrefixOwnProps>;

export interface InputSuffixOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputSuffixSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputSuffixSlot>;
  children?: ReactNode;
}

export type InputSuffixProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, InputSuffixOwnProps>;

export interface InputLeadingIconOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputLeadingIconSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputLeadingIconSlot>;
  children?: ReactNode;
}

export type InputLeadingIconProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, InputLeadingIconOwnProps>;

export interface InputTrailingIconOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputTrailingIconSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputTrailingIconSlot>;
  children?: ReactNode;
}

export type InputTrailingIconProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, InputTrailingIconOwnProps>;

export interface InputClearButtonOwnProps {
  /** Called after the field value is cleared. */
  onClear?: () => void;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputClearButtonSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputClearButtonSlot>;
  children?: ReactNode;
}

export type InputClearButtonProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, InputClearButtonOwnProps>;

export interface InputSpinnerOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputSpinnerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputSpinnerSlot>;
  children?: ReactNode;
}

export type InputSpinnerProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, InputSpinnerOwnProps>;

export interface InputRevealButtonOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputRevealButtonSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputRevealButtonSlot>;
  children?: ReactNode;
}

export type InputRevealButtonProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, InputRevealButtonOwnProps>;

export interface InputStrengthOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputStrengthSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputStrengthSlot>;
  children?: ReactNode;
}

/**
 * Password strength meter rendered below the bordered row. It derives its
 * level from the field value cascaded through the Input context, so it must be
 * placed inside `Input` (it is hoisted out of the bordered row at render time).
 */
export type InputStrengthProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, InputStrengthOwnProps>;

export interface InputStepperOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputStepperSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputStepperSlot>;
  children?: ReactNode;
}

export type InputStepperProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, InputStepperOwnProps>;

export interface InputDecrementOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputDecrementSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputDecrementSlot>;
  children?: ReactNode;
}

export type InputDecrementProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, InputDecrementOwnProps>;

export interface InputIncrementOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputIncrementSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputIncrementSlot>;
  children?: ReactNode;
}

export type InputIncrementProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, InputIncrementOwnProps>;

export interface InputChipsOwnProps {
  /**
   * Committed tags (controlled). Pair with `onValueChange`. Spar's Input is a
   * scalar primitive with no array model, so the chips value is owned here as a
   * react-enhancement rather than picked from Spar.
   */
  value?: string[];
  /** Initial tags for uncontrolled usage. */
  defaultValue?: string[];
  /** Called with the next tag array after a commit or removal. */
  onValueChange?: (value: string[]) => void;
  /** Optional character that commits the field text as a tag (Enter always commits). */
  separator?: string;
  /** Maximum number of tags. Further commits are ignored once reached. */
  max?: number;
  /** Allow committing a tag that already exists. @defaultValue false */
  allowDuplicates?: boolean;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputChipsSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputChipsSlot>;
  children?: ReactNode;
}

/**
 * Chips region rendered next to `Input.Field`. Owns the tag array and attaches
 * its key handling (Enter to commit, Backspace to remove the last tag) to the
 * shared field ref so `Input.Field` stays generic.
 */
export type InputChipsProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, InputChipsOwnProps>;

export interface InputChipOwnProps {
  /** Called when the remove control is activated. */
  onRemove?: () => void;
  /** Render the remove control. @defaultValue true */
  removable?: boolean;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputChipSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputChipSlot>;
  children?: ReactNode;
}

export type InputChipProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, InputChipOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Input: import('../../core').ComponentThemeConfig<InputProps, InputSlot>;
    InputField: import('../../core').ComponentThemeConfig<InputFieldProps, InputFieldSlot>;
    InputPrefix: import('../../core').ComponentThemeConfig<InputPrefixProps, InputPrefixSlot>;
    InputSuffix: import('../../core').ComponentThemeConfig<InputSuffixProps, InputSuffixSlot>;
    InputLeadingIcon: import('../../core').ComponentThemeConfig<InputLeadingIconProps, InputLeadingIconSlot>;
    InputTrailingIcon: import('../../core').ComponentThemeConfig<InputTrailingIconProps, InputTrailingIconSlot>;
    InputClearButton: import('../../core').ComponentThemeConfig<InputClearButtonProps, InputClearButtonSlot>;
    InputSpinner: import('../../core').ComponentThemeConfig<InputSpinnerProps, InputSpinnerSlot>;
    InputRevealButton: import('../../core').ComponentThemeConfig<InputRevealButtonProps, InputRevealButtonSlot>;
    InputStrength: import('../../core').ComponentThemeConfig<InputStrengthProps, InputStrengthSlot>;
    InputStepper: import('../../core').ComponentThemeConfig<InputStepperProps, InputStepperSlot>;
    InputDecrement: import('../../core').ComponentThemeConfig<InputDecrementProps, InputDecrementSlot>;
    InputIncrement: import('../../core').ComponentThemeConfig<InputIncrementProps, InputIncrementSlot>;
    InputChips: import('../../core').ComponentThemeConfig<InputChipsProps, InputChipsSlot>;
    InputChip: import('../../core').ComponentThemeConfig<InputChipProps, InputChipSlot>;
  }
}
