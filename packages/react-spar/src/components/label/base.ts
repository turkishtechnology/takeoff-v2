import { createComponentBase } from '../../core';

import type { LabelProps, LabelSlot } from './types';

// @archetype react-enhancement — no upstream Spar primitive for standalone Label
export const LabelBase = createComponentBase<LabelProps, LabelSlot>({
  name: 'Label',
  slots: ['root'] as const,
  classes: { root: 'tk-label' },
});
