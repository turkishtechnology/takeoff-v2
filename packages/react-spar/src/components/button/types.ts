import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'danger' | 'warning' | 'white' | 'black';

export type ButtonAppearance = 'filled' | 'filledLight' | 'outlined' | 'text';

export type ButtonSize = 'small' | 'base' | 'large';

export type ButtonSlot = 'root' | 'icon' | 'label' | 'spinner';

export interface ButtonOwnProps {
  /**
   * Color variant.
   * @defaultValue 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Visual appearance.
   * @defaultValue 'filled'
   */
  appearance?: ButtonAppearance;
  /**
   * Size scale.
   * @defaultValue 'base'
   */
  size?: ButtonSize;
  /**
   * Renders a pill-shaped (circular) button. Ideal for icon-only actions.
   * @defaultValue false
   */
  rounded?: boolean;
  /**
   * Loading state with screen reader support.
   * @defaultValue false
   */
  loading?: boolean;
  /**
   * Icon placed before children.
   */
  startIcon?: ReactNode;
  /**
   * Icon placed after children.
   */
  endIcon?: ReactNode;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<ButtonSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<ButtonSlot>;
  /** Ref forwarded to the root button element. */
  ref?: Ref<HTMLButtonElement>;
}

export type ButtonProps = ButtonOwnProps & Omit<ComponentPropsWithoutRef<'button'>, keyof ButtonOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Button: import('../../core').ComponentThemeConfig<ButtonProps, ButtonSlot>;
  }
}
