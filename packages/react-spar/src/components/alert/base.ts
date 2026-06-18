import { createComponentBase } from '../../core';

import type { AlertActionsProps, AlertCloseProps, AlertContentProps, AlertDescriptionProps, AlertProps, AlertTitleProps } from './types';

// @archetype react-enhancement — no upstream Spar primitive for Alert; the
// takeoff layer owns the `tk-alert` classes and the compound-part structure.
export const AlertBase = createComponentBase<AlertProps, 'root'>({
  name: 'Alert',
  slots: ['root'] as const,
  classes: { root: 'tk-alert' },
});

export const AlertContentBase = createComponentBase<AlertContentProps, 'root'>({
  name: 'AlertContent',
  slots: ['root'] as const,
  classes: { root: 'tk-alert-content' },
});

export const AlertTitleBase = createComponentBase<AlertTitleProps, 'root'>({
  name: 'AlertTitle',
  slots: ['root'] as const,
  classes: { root: 'tk-alert-title' },
});

export const AlertDescriptionBase = createComponentBase<AlertDescriptionProps, 'root'>({
  name: 'AlertDescription',
  slots: ['root'] as const,
  classes: { root: 'tk-alert-description' },
});

export const AlertActionsBase = createComponentBase<AlertActionsProps, 'root'>({
  name: 'AlertActions',
  slots: ['root'] as const,
  classes: { root: 'tk-alert-actions' },
});

export const AlertCloseBase = createComponentBase<AlertCloseProps, 'root'>({
  name: 'AlertClose',
  slots: ['root'] as const,
  classes: { root: 'tk-alert-close' },
});
