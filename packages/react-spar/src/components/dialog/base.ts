import { createComponentBase } from '../../core';

import type {
  DialogBodyProps,
  DialogBodySlot,
  DialogCloseButtonProps,
  DialogCloseButtonSlot,
  DialogPanelProps,
  DialogPanelSlot,
  DialogDescriptionProps,
  DialogDescriptionSlot,
  DialogFooterProps,
  DialogFooterSlot,
  DialogHeaderProps,
  DialogHeaderSlot,
  DialogOverlayProps,
  DialogOverlaySlot,
  DialogTitleProps,
  DialogTitleSlot,
  DialogTriggerProps,
  DialogTriggerSlot,
} from './types';

// @archetype inherited — wraps SparDialog.Trigger
export const DialogTriggerBase = createComponentBase<DialogTriggerProps, DialogTriggerSlot>({
  name: 'DialogTrigger',
  slots: ['root'] as const,
  classes: {
    root: 'tk-dialog-trigger',
  },
});

// @archetype inherited — wraps SparDialog.Overlay
export const DialogOverlayBase = createComponentBase<DialogOverlayProps, DialogOverlaySlot>({
  name: 'DialogOverlay',
  slots: ['root'] as const,
  classes: {
    root: 'tk-dialog-overlay',
  },
});

// @archetype inherited — wraps SparDialog.Content
export const DialogPanelBase = createComponentBase<DialogPanelProps, DialogPanelSlot>({
  name: 'DialogPanel',
  slots: ['root'] as const,
  classes: {
    root: 'tk-dialog-panel',
  },
});

// @archetype react-enhancement — no upstream equivalent
export const DialogHeaderBase = createComponentBase<DialogHeaderProps, DialogHeaderSlot>({
  name: 'DialogHeader',
  slots: ['root'] as const,
  classes: {
    root: 'tk-dialog-header',
  },
});

// @archetype inherited — wraps SparDialog.Title
export const DialogTitleBase = createComponentBase<DialogTitleProps, DialogTitleSlot>({
  name: 'DialogTitle',
  slots: ['root'] as const,
  classes: {
    root: 'tk-dialog-title',
  },
});

// @archetype inherited — wraps SparDialog.Description
export const DialogDescriptionBase = createComponentBase<DialogDescriptionProps, DialogDescriptionSlot>({
  name: 'DialogDescription',
  slots: ['root'] as const,
  classes: {
    root: 'tk-dialog-description',
  },
});

// @archetype react-enhancement — no upstream equivalent
export const DialogBodyBase = createComponentBase<DialogBodyProps, DialogBodySlot>({
  name: 'DialogBody',
  slots: ['root'] as const,
  classes: {
    root: 'tk-dialog-body',
  },
});

// @archetype react-enhancement — no upstream equivalent
export const DialogFooterBase = createComponentBase<DialogFooterProps, DialogFooterSlot>({
  name: 'DialogFooter',
  slots: ['root'] as const,
  classes: {
    root: 'tk-dialog-footer',
  },
});

// @archetype inherited — wraps SparDialog.Close
export const DialogCloseButtonBase = createComponentBase<DialogCloseButtonProps, DialogCloseButtonSlot>({
  name: 'DialogCloseButton',
  slots: ['root'] as const,
  classes: {
    root: 'tk-dialog-close-button',
  },
});
