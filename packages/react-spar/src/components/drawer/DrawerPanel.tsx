import type { ElementType } from 'react';
import { DialogContent as SparDialogContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerPanelBase } from './base';
import { useDrawerOwnContext } from './context';
import type { DrawerPanelProps } from './types';

const blockDismiss =
  <E extends { preventDefault: () => void }>(handler?: (event: E) => void) =>
  (event: E) => {
    event.preventDefault();
    handler?.(event);
  };

export const DrawerPanel = <T extends ElementType = 'div'>(props: DrawerPanelProps<T>) => {
  const theme = useComponentTheme('DrawerPanel');
  const { placement, dismissible } = useDrawerOwnContext();

  const { rootAttrs, rest } = composeRootAttrs(DrawerPanelBase, props as DrawerPanelProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-placement': placement,
    }),
  });

  const { container, children, ref, ...panelProps } = rest;

  const dismissHandlers = !dismissible && {
    onEscapeKeyDown: blockDismiss(panelProps.onEscapeKeyDown),
    onPointerDownOutside: blockDismiss(panelProps.onPointerDownOutside),
    onInteractOutside: blockDismiss(panelProps.onInteractOutside),
  };
  return (
    <SparDialogContent {...panelProps} container={container} ref={ref} {...rootAttrs} {...dismissHandlers}>
      {children}
    </SparDialogContent>
  );
};

DrawerPanel.displayName = 'Drawer.Panel';
