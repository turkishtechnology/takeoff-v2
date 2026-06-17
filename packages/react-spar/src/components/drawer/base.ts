import { createComponentBase } from '../../core';

import type {
  DrawerBodyProps,
  DrawerCloseProps,
  DrawerDescriptionProps,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerOverlayProps,
  DrawerPanelProps,
  DrawerProps,
  DrawerTitleProps,
  DrawerTriggerProps,
} from './types';

export const DrawerBase = createComponentBase<DrawerProps, 'root'>({
  name: 'Drawer',
  slots: ['root'] as const,
  classes: { root: 'tk-drawer' },
});

export const DrawerOverlayBase = createComponentBase<DrawerOverlayProps, 'root'>({
  name: 'DrawerOverlay',
  slots: ['root'] as const,
  classes: { root: 'tk-drawer-overlay' },
});

export const DrawerPanelBase = createComponentBase<DrawerPanelProps, 'root'>({
  name: 'DrawerPanel',
  slots: ['root'] as const,
  classes: { root: 'tk-drawer-panel' },
});

export const DrawerHeaderBase = createComponentBase<DrawerHeaderProps, 'root'>({
  name: 'DrawerHeader',
  slots: ['root'] as const,
  classes: { root: 'tk-drawer-header' },
});

export const DrawerTitleBase = createComponentBase<DrawerTitleProps, 'root'>({
  name: 'DrawerTitle',
  slots: ['root'] as const,
  classes: { root: 'tk-drawer-title' },
});

export const DrawerDescriptionBase = createComponentBase<DrawerDescriptionProps, 'root'>({
  name: 'DrawerDescription',
  slots: ['root'] as const,
  classes: { root: 'tk-drawer-description' },
});

export const DrawerBodyBase = createComponentBase<DrawerBodyProps, 'root'>({
  name: 'DrawerBody',
  slots: ['root'] as const,
  classes: { root: 'tk-drawer-body' },
});

export const DrawerFooterBase = createComponentBase<DrawerFooterProps, 'root'>({
  name: 'DrawerFooter',
  slots: ['root'] as const,
  classes: { root: 'tk-drawer-footer' },
});

export const DrawerCloseBase = createComponentBase<DrawerCloseProps, 'root'>({
  name: 'DrawerClose',
  slots: ['root'] as const,
  classes: { root: 'tk-drawer-close' },
});

export const DrawerTriggerBase = createComponentBase<DrawerTriggerProps, 'root'>({
  name: 'DrawerTrigger',
  slots: ['root'] as const,
  classes: { root: 'tk-drawer-trigger' },
});
