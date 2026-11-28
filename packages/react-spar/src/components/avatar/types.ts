import type { ElementType, ReactNode, Ref } from 'react';
import type {
  AvatarFallbackProps as SparAvatarFallbackProps,
  AvatarImageLoadingStatus as SparAvatarImageLoadingStatus,
  AvatarImageProps as SparAvatarImageProps,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap, TakeoffHTMLProps } from '../../core';
import type { BadgeVariant } from '../badge';

export type AvatarSize = 'xxsmall' | 'xsmall' | 'small' | 'base' | 'large' | 'xlarge' | 'xxlarge';
export type AvatarVariant = 'primary' | 'light' | 'success' | 'info' | 'warning' | 'danger';
export type AvatarAppearance = 'filled' | 'filledLight';
export type AvatarImageLoadingStatus = SparAvatarImageLoadingStatus;

export type AvatarSlot = 'root';
export type AvatarImageSlot = 'root';
export type AvatarFallbackSlot = 'root' | 'icon';
export type AvatarBadgeSlot = 'root';
export type AvatarGroupSlot = 'root' | 'overflow';

export interface AvatarOwnProps {
  /**
   * Size scale: 20 / 24 / 32 / 48 / 64 / 96 / 160px. Inside `Avatar.Group`
   * the group's `size` applies unless this is set.
   * @defaultValue 'base'
   */
  size?: AvatarSize;
  /**
   * Color of the fallback (initials or icon).
   * @defaultValue 'primary'
   */
  variant?: AvatarVariant;
  /**
   * `filled` paints the brand color behind light text; `filledLight` a tint of
   * `variant` behind dark text.
   * @defaultValue 'filled'
   */
  appearance?: AvatarAppearance;
  /**
   * Renders a circle instead of a rounded square. Inside `Avatar.Group` the
   * group's `rounded` applies unless this is set.
   * @defaultValue false
   */
  rounded?: boolean;
  /**
   * Removes the drop shadow.
   * @defaultValue false
   */
  hideShadow?: boolean;
  /**
   * The person or entity the avatar stands for. When set, the avatar is one
   * `role="img"` named by it, and the image and fallback are hidden from
   * assistive technology so the name is announced once.
   */
  name?: string;
  /** `Avatar.Image`, `Avatar.Fallback` and `Avatar.Badge`. */
  children?: ReactNode;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AvatarSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AvatarSlot>;
}

export type AvatarProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, AvatarOwnProps>;

export interface AvatarImageOwnProps {
  /**
   * Describes the picture. Required unless the root has a `name`, which then
   * names the whole avatar and the image is marked decorative.
   */
  alt?: string;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AvatarImageSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AvatarImageSlot>;
}

export type AvatarImageProps<T extends ElementType = 'img'> = PolymorphicProps<
  'img',
  T,
  AvatarImageOwnProps &
    // Spar owns the loading lifecycle; only its status callback is exposed.
    // `src`, `srcSet`, `crossOrigin` etc. are native `img` attributes.
    Pick<SparAvatarImageProps, 'onLoadingStatusChange'>
>;

export interface AvatarFallbackOwnProps {
  /** Initials or any content. Without children the default person glyph renders. */
  children?: ReactNode;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AvatarFallbackSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AvatarFallbackSlot>;
}

export type AvatarFallbackProps<T extends ElementType = 'span'> = PolymorphicProps<
  'span',
  T,
  AvatarFallbackOwnProps &
    // Only the render delay is exposed; when to show is Spar's loading status.
    Pick<SparAvatarFallbackProps, 'delayMs'>
>;

export interface AvatarBadgeProps extends Omit<TakeoffHTMLProps<'span'>, 'children'> {
  /**
   * Badge color, e.g. a presence status.
   * @defaultValue 'success'
   */
  variant?: BadgeVariant;
  /** Content such as a count. Without children the badge is a dot. */
  children?: ReactNode;
  /** Ref forwarded to the badge element. */
  ref?: Ref<HTMLSpanElement>;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AvatarBadgeSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AvatarBadgeSlot>;
}

export interface AvatarGroupOwnProps {
  /**
   * Size of every avatar in the group (an avatar's own `size` wins) and of the
   * overflow avatar.
   * @defaultValue 'base'
   */
  size?: AvatarSize;
  /**
   * Renders every avatar in the group (an avatar's own `rounded` wins) and the
   * overflow avatar as circles.
   * @defaultValue false
   */
  rounded?: boolean;
  /**
   * Sets the avatars on one bordered pill and hides their badges.
   * @defaultValue false
   */
  compact?: boolean;
  /**
   * Shows at most this many avatars; the rest collapse into one `+N` avatar.
   */
  max?: number;
  /**
   * Visible text of the overflow avatar. `{count}` is the number hidden.
   * Blank falls back to the default.
   * @defaultValue '+{count}'
   */
  overflowLabel?: string;
  /**
   * Accessible name of the overflow avatar. `{count}` is the number hidden.
   * Blank falls back to the default.
   * @defaultValue '{count} more'
   */
  overflowAriaLabel?: string;
  /** `Avatar` elements. */
  children?: ReactNode;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<AvatarGroupSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<AvatarGroupSlot>;
}

export type AvatarGroupProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, AvatarGroupOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Avatar: import('../../core').ComponentThemeConfig<AvatarProps, AvatarSlot>;
    AvatarImage: import('../../core').ComponentThemeConfig<AvatarImageProps, AvatarImageSlot>;
    AvatarFallback: import('../../core').ComponentThemeConfig<AvatarFallbackProps, AvatarFallbackSlot>;
    AvatarBadge: import('../../core').ComponentThemeConfig<AvatarBadgeProps, AvatarBadgeSlot>;
    AvatarGroup: import('../../core').ComponentThemeConfig<AvatarGroupProps, AvatarGroupSlot>;
  }
}
