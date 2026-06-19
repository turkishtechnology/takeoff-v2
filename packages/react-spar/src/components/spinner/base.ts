import { createComponentBase } from '../../core';

import type { SpinnerProps, SpinnerSlot } from './types';

// @archetype react-enhancement — no upstream Spar primitive for Spinner
export const SpinnerBase = createComponentBase<SpinnerProps, SpinnerSlot>({
  name: 'Spinner',
  slots: ['root', 'indicator'] as const,
  classes: {
    root: 'tk-spinner',
    indicator: 'tk-spinner-indicator',
  },
});
