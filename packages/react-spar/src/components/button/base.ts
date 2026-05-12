import { createComponentBase } from '../../core';

import type { ButtonProps, ButtonSlot } from './types';

export const ButtonBase = createComponentBase<ButtonProps, ButtonSlot>({
  name: 'Button',
  slots: ['root', 'icon', 'label', 'spinner'] as const,
  classes: {
    root: 'tk-button',
    icon: 'tk-button-icon',
    label: 'tk-button-label',
    spinner: 'tk-button-spinner',
  },
});
