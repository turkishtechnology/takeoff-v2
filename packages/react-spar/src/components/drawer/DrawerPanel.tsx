import type { ElementType } from 'react';
import { DialogContent as SparDialogContent } from '@turkish-technology/spar';

import { blockDismiss, composeRootAttrs, useNestedLayerDismissGuard } from '../../core';
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

  // `rootAttrs` (theme / `slotProps.root`) is spread after the instance props
  // and wins for the same key, so the guard wraps whichever handler would
  // otherwise have been applied.
  const consumerPointerDownCapture = (rootAttrs.onPointerDownCapture ?? panelProps.onPointerDownCapture) as typeof panelProps.onPointerDownCapture;
  const { onPointerDownCapture, guardOutside } = useNestedLayerDismissGuard(consumerPointerDownCapture);

  // Presses inside a portaled descendant (Select / Popover / Dropdown content)
  // are not outside presses; see `useNestedLayerDismissGuard`.
  // When not dismissible, `blockDismiss` still vetoes genuine outside presses.
  const outside = <E extends Event>(handler?: (event: E) => void) => guardOutside(dismissible ? handler : blockDismiss(handler));
  const dismissHandlers = {
    ...(!dismissible && { onEscapeKeyDown: blockDismiss(panelProps.onEscapeKeyDown) }),
    onPointerDownOutside: outside(panelProps.onPointerDownOutside),
    onInteractOutside: outside(panelProps.onInteractOutside),
  };
  return (
    <SparDialogContent {...panelProps} container={container} ref={ref} {...rootAttrs} {...dismissHandlers} onPointerDownCapture={onPointerDownCapture}>
      {children}
    </SparDialogContent>
  );
};

DrawerPanel.displayName = 'Drawer.Panel';
