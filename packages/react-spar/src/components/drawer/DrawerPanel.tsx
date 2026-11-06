import type { ElementType } from 'react';
import { DialogContent as SparDialogContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useNestedLayerDismissHandlers } from '../../hooks';
import { useComponentTheme } from '../../provider';

import { DrawerPanelBase } from './base';
import { useDrawerOwnContext } from './context';
import type { DrawerPanelProps } from './types';

export const DrawerPanel = <T extends ElementType = 'div'>(props: DrawerPanelProps<T>) => {
  const theme = useComponentTheme('DrawerPanel');
  const { placement, dismissible } = useDrawerOwnContext('Drawer.Panel');

  const { rootAttrs, rest } = composeRootAttrs(DrawerPanelBase, props as DrawerPanelProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-placement': placement,
    }),
  });

  const { container, children, ref, ...panelProps } = rest;

  // Presses inside a portaled descendant (Select / Popover / Dropdown content)
  // are not outside presses; see `useNestedLayerDismissHandlers`.
  const dismissHandlers = useNestedLayerDismissHandlers({ dismissible, instanceProps: panelProps, rootAttrs });

  return (
    <SparDialogContent {...panelProps} container={container} ref={ref} {...rootAttrs} {...dismissHandlers}>
      {children}
    </SparDialogContent>
  );
};

DrawerPanel.displayName = 'Drawer.Panel';
