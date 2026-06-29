import { createComponentBase } from '../../core';

import type { ToastProps, ToastSlot, ToasterProps, ToasterSlot } from './types';

// @archetype inherited — wraps Spar Toaster and adds the Takeoff viewport class.
export const ToasterBase = createComponentBase<ToasterProps, ToasterSlot>({
  name: 'Toaster',
  slots: ['root'] as const,
  classes: {
    root: 'tk-toaster',
  },
});

// @archetype inherited — wraps Spar Toast.Root and renders Takeoff Alert anatomy.
export const ToastBase = createComponentBase<ToastProps, ToastSlot>({
  name: 'Toast',
  slots: ['root'] as const,
  classes: {
    root: 'tk-toast',
  },
});
