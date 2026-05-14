import { createComponentBase } from '../../core';

import type { ButtonProps, ButtonSlot } from './types';

export const ButtonBase = createComponentBase<ButtonProps, ButtonSlot>({
  name: 'Button',
  slots: ['root', 'content', 'label', 'spinner'] as const,
  classes: {
    root: 'tk-button',
    content: 'tk-button-content',
    label: 'tk-button-label',
    spinner: 'tk-button-spinner',
  },
});
