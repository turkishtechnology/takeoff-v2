import { createComponentBase } from '../../core';

import type { SwitchProps, SwitchSlot } from './types';

export const SwitchBase = createComponentBase<SwitchProps, SwitchSlot>({
  name: 'Switch',
  slots: ['root', 'control', 'track', 'thumb'] as const,
  classes: {
    root: 'tk-toggle',
    control: 'tk-toggle-control',
    track: 'tk-toggle-input-container',
    thumb: 'tk-toggle-thumb',
  },
});
