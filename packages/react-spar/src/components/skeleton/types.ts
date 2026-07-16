import type { Ref } from 'react';

import type { ClassNamesMap, SlotPropsMap, TakeoffHTMLProps } from '../../core';

export type SkeletonShape = 'rectangle' | 'circle';

export type SkeletonAnimation = 'shimmer' | 'none';

export type SkeletonSlot = 'root' | 'shimmer';

export interface SkeletonProps extends Omit<TakeoffHTMLProps<'span'>, 'children'> {
  /**
   * Placeholder silhouette. `rectangle` renders the rounded bar, `circle`
   * a full-radius disc whose diameter tracks `height`.
   * @defaultValue 'rectangle'
   */
  shape?: SkeletonShape;
  /**
   * Loading animation. `shimmer` sweeps the highlight strip across the bar;
   * `none` renders a static placeholder.
   * @defaultValue 'shimmer'
   */
  animation?: SkeletonAnimation;
  /**
   * Fixed width, number in px or any CSS length. Published to the recipe as
   * `--tk-skeleton-width`; defaults to filling the container.
   */
  width?: number | string;
  /**
   * Fixed height, number in px or any CSS length. Published to the recipe as
   * `--tk-skeleton-height`.
   */
  height?: number | string;
  /** Ref forwarded to the root span element. */
  ref?: Ref<HTMLSpanElement>;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<SkeletonSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<SkeletonSlot>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Skeleton: import('../../core').ComponentThemeConfig<SkeletonProps, SkeletonSlot>;
  }
}
