import type { ReactNode, Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap, TakeoffHTMLProps } from '../../core';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'info'
  | 'success'
  | 'danger'
  | 'warning'
  | 'verified'
  | 'purple'
  | 'cyan'
  | 'business'
  | 'teal'
  | 'white'
  | 'dark';

export type BadgeAppearance = 'filled' | 'filledLight' | 'outlined' | 'text';

export type BadgeSize = 'small' | 'base' | 'large';

export type BadgeSlot = 'root' | 'label' | 'icon';

export interface BadgeProps extends Omit<TakeoffHTMLProps<'span'>, 'children'> {
  /**
   * Color variant.
   * @defaultValue 'primary'
   */
  variant?: BadgeVariant;
  /**
   * Visual appearance.
   * @defaultValue 'filled'
   */
  appearance?: BadgeAppearance;
  /**
   * Size scale.
   * @defaultValue 'base'
   */
  size?: BadgeSize;
  /**
   * Renders a pill-shaped badge with fully rounded corners.
   * @defaultValue false
   */
  rounded?: boolean;
  /**
   * Renders a minimal colored dot (8×8px) with no content.
   * When true, children, startContent, and endContent are ignored.
   * @defaultValue false
   */
  dot?: boolean;
  /**
   * Content rendered before children — typically an icon.
   */
  startContent?: ReactNode;
  /**
   * Content rendered after children.
   */
  endContent?: ReactNode;
  /** Badge content. */
  children?: ReactNode;
  /** Ref forwarded to the root span element. */
  ref?: Ref<HTMLSpanElement>;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<BadgeSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<BadgeSlot>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Badge: import('../../core').ComponentThemeConfig<BadgeProps, BadgeSlot>;
  }
}
