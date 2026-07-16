import { createComponentBase } from '../../core';

import type { SkeletonProps, SkeletonSlot } from './types';

// @archetype react-enhancement — no upstream Spar primitive for Skeleton
export const SkeletonBase = createComponentBase<SkeletonProps, SkeletonSlot>({
  name: 'Skeleton',
  slots: ['root', 'shimmer'] as const,
  classes: {
    root: 'tk-skeleton',
    shimmer: 'tk-skeleton-shimmer',
  },
});
