import { createComponentBase } from '../../core';

import type { ChipProps, ChipSlot } from './types';

// @archetype react-enhancement — no upstream Spar primitive for Chip
export const ChipBase = createComponentBase<ChipProps, ChipSlot>({
  name: 'Chip',
  slots: ['root', 'label', 'remove'] as const,
  classes: {
    root: 'tk-chip',
    label: 'tk-chip-label',
    remove: 'tk-chip-remove',
  },
});
