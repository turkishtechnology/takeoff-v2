import { createComponentBase } from '../../core';

import type { BadgeProps, BadgeSlot } from './types';

// @archetype react-enhancement — no upstream Spar primitive for Badge
export const BadgeBase = createComponentBase<BadgeProps, BadgeSlot>({
  name: 'Badge',
  slots: ['root', 'label', 'icon'] as const,
  classes: {
    root: 'tk-badge',
    label: 'tk-badge-label',
    icon: 'tk-badge-icon',
  },
});
