import type { ElementType, ReactNode } from 'react';
import type { InputProps as SparInputProps, InputFieldProps as SparInputFieldProps, PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type InputSize = 'small' | 'base' | 'large';

export type InputSlot = 'root';
export type InputContainerSlot = 'root' | 'startContent' | 'endContent';
export type InputFieldSlot = 'root';
export type InputPrefixSlot = 'root';
export type InputSuffixSlot = 'root';

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
    Pick<SparInputProps, 'id' | 'isInvalid' | 'disabled' | 'required' | 'readOnly'>
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

/**
 * Visual row wrapping the field plus optional prefix, suffix, leading/trailing
 * icons. Mirrors the SCSS `.tk-input-container` and is where state attributes
 * (`data-invalid`, `data-disabled`, `data-readonly`) land for styling the
 * bordered input row.
 */
export interface InputContainerOwnProps {
  /**
   * Content rendered before the field — typically an icon, but accepts any
   * node (chip, button, etc.). Rendered inside the `startContent` slot
   * (`.tk-input-start-content`).
   */
  startContent?: ReactNode;
  /**
   * Content rendered after the field. Same shape as `startContent`, rendered
   * inside the `endContent` slot (`.tk-input-end-content`).
   */
  endContent?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<InputContainerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<InputContainerSlot>;
  children?: ReactNode;
}

export type InputContainerProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, InputContainerOwnProps>;

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

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Input: import('../../core').ComponentThemeConfig<InputProps, InputSlot>;
    InputContainer: import('../../core').ComponentThemeConfig<InputContainerProps, InputContainerSlot>;
    InputField: import('../../core').ComponentThemeConfig<InputFieldProps, InputFieldSlot>;
    InputPrefix: import('../../core').ComponentThemeConfig<InputPrefixProps, InputPrefixSlot>;
    InputSuffix: import('../../core').ComponentThemeConfig<InputSuffixProps, InputSuffixSlot>;
  }
}
