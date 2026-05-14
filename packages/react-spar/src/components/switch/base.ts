import { createComponentBase } from '../../core';

import type { SwitchProps, SwitchSlot } from './types';

export const SwitchBase = createComponentBase<SwitchProps, SwitchSlot>({
  name: 'Switch',
  slots: ['root', 'control', 'track', 'thumb', 'label', 'hint'] as const,
  classes: {
    root: 'tk-toggle',
    control: 'tk-toggle-control',
    track: 'tk-toggle-input-container',
    thumb: 'tk-toggle-thumb',
    label: 'tk-toggle-label',
    hint: 'tk-toggle-hint',
  },
});
