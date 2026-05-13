import type { ElementType, ReactNode } from 'react';
import type { ButtonProps as SparButtonProps, PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'info' | 'success' | 'danger' | 'warning' | 'white' | 'black';

export type ButtonAppearance = 'filled' | 'filledLight' | 'outlined' | 'text';

export type ButtonSize = 'small' | 'base' | 'large';

export type ButtonSlot = 'root' | 'icon' | 'label' | 'spinner';

/**
 * Visual + slot props owned by takeoff-v2 (not exposed by Spar).
 */
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
}

/**
 * Public props for the Button. Polymorphic via `as` (e.g. render as `<a>` for
 * link-styled buttons) — `as`, ref, and the native attributes of the rendered
 * element are inherited from Spar's `PolymorphicProps`.
 */
export type ButtonProps<T extends ElementType = 'button'> = PolymorphicProps<
  'button',
  T,
  ButtonOwnProps &
    // Toggle-button + loading surface from Spar. `disabled` is inherited from
    // the polymorphic element's native attributes (not picked).
    Pick<SparButtonProps, 'isPressed' | 'onPressedChange' | 'isLoading'>
>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Button: import('../../core').ComponentThemeConfig<ButtonProps, ButtonSlot>;
  }
}
