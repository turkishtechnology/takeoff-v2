import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { SwitchRenderProps as SparSwitchRenderProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type SwitchSize = 'xlarge' | 'large' | 'base' | 'small' | 'xsmall';
export type SwitchVariant = 'info' | 'success';
export type SwitchSlot = 'root' | 'control' | 'track' | 'thumb' | 'label' | 'hint';
export type SwitchRenderProps = SparSwitchRenderProps;

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'classNames' | 'onChange'> {
  /** Controlled checked state. */
  checked?: boolean;
  /** Uncontrolled initial checked state. */
  defaultChecked?: boolean;
  /** Fired when the checked state changes. */
  onChange?: (checked: boolean) => void;
  /**
   * Size scale.
   * @defaultValue 'base'
   */
  size?: SwitchSize;
  /**
   * Color variant used while checked.
   * @defaultValue 'info'
   */
  variant?: SwitchVariant;
  /**
   * Marks the switch as visually invalid.
   * @defaultValue false
   */
  invalid?: boolean;
  /** Disabled state — prevents interaction and removes the control from tab order. */
  disabled?: boolean;
  /** Read-only state — remains focusable but does not change value. */
  readOnly?: boolean;
  /** Required state for form validation. */
  required?: boolean;
  /** Form submission value. Forwarded to the underlying Spar primitive. */
  value?: string;
  /** ID of the external form this switch belongs to. */
  form?: string;
  /** Form field name. */
  name?: string;
  /** Compound children for switch anatomy, or a render function exposing Spar's state. */
  children?: ReactNode | ((state: SwitchRenderProps) => ReactNode);
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<SwitchSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<SwitchSlot>;
  ref?: Ref<HTMLDivElement>;
}

export interface SwitchControlProps extends ComponentPropsWithoutRef<'button'> {
  ref?: Ref<HTMLButtonElement>;
}

export interface SwitchTrackProps extends ComponentPropsWithoutRef<'span'> {
  ref?: Ref<HTMLSpanElement>;
}

export interface SwitchThumbProps extends ComponentPropsWithoutRef<'span'> {
  ref?: Ref<HTMLSpanElement>;
}

export interface SwitchLabelProps extends ComponentPropsWithoutRef<'span'> {
  ref?: Ref<HTMLSpanElement>;
}

export interface SwitchHintProps extends ComponentPropsWithoutRef<'span'> {
  /**
   * Leading icon rendered before the hint text. Pass `null` to hide.
   * @defaultValue a built-in info glyph
   */
  icon?: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Switch: import('../../core').ComponentThemeConfig<SwitchProps, SwitchSlot>;
  }
}
