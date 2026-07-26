import type { CSSProperties } from 'react';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SkeletonBase } from './base';
import { DEFAULT_ANIMATION, DEFAULT_SHAPE } from './defaults';
import type { SkeletonProps, SkeletonSlot } from './types';

const toCssSize = (value: number | string | undefined): string | undefined => (typeof value === 'number' ? `${value}px` : value);

export const Skeleton = (props: SkeletonProps) => {
  const theme = useComponentTheme('Skeleton');

  const { rootAttrs, rest } = composeRootAttrs<SkeletonProps, SkeletonSlot>(SkeletonBase, props, theme, {
    stateAttrs: ({ shape = DEFAULT_SHAPE, animation = DEFAULT_ANIMATION }) => ({
      'data-type': shape,
      'data-animation': animation,
    }),
  });

  // Consumed only as root data-* hooks above; destructured so the <span>
  // doesn't receive unknown DOM attributes.
  const { shape: _shape, animation: _animation, width, height, ref, style, ...nativeProps } = rest;
  const { style: slotStyle, ...slotAttrs } = rootAttrs as Record<string, unknown> & { style?: CSSProperties };

  const shimmerSlotAttrs = buildSlotAttrs(SkeletonBase.getSlotProps('shimmer'), 'shimmer' as SkeletonSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  // The dimensions are the design-system invariant the recipe sizes with;
  // layered after the instance and slot styles so neither can override them
  // (Progress indicator precedent for continuous values). Keys are written
  // only when the prop is set — an unconditional `undefined` would clobber a
  // custom property the consumer passed through `style`.
  const sizeVars = {
    ...(width !== undefined && { '--tk-skeleton-width': toCssSize(width) }),
    ...(height !== undefined && { '--tk-skeleton-height': toCssSize(height) }),
  } as CSSProperties;

  return (
    <span aria-hidden="true" {...nativeProps} {...slotAttrs} style={{ ...style, ...slotStyle, ...sizeVars }} ref={ref}>
      <span {...shimmerSlotAttrs} aria-hidden="true" />
    </span>
  );
};

Skeleton.displayName = 'Skeleton';
