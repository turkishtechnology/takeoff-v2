import { createComponentBase } from '../../core';

import type { DividerProps, DividerSlot } from './types';

// @archetype react-enhancement — no upstream Spar primitive for Divider; the
// takeoff layer owns the `tk-divider` classes and the separator semantics.
// The `label` slot is wrapper-owned (like Spinner's `indicator`): children
// render inside it between the CSS-drawn line segments.
export const DividerBase = createComponentBase<DividerProps, DividerSlot>({
  name: 'Divider',
  slots: ['root', 'label'] as const,
  classes: {
    root: 'tk-divider',
    label: 'tk-divider-label',
  },
});
