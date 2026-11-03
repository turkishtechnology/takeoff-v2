import type { ElementType } from 'react';
import { DialogContent as SparDialogContent } from '@turkish-technology/spar';

import { blockDismiss, composeRootAttrs, useNestedLayerDismissGuard } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogPanelBase } from './base';
import { useDialogOwnContext } from './context';
import type { DialogPanelProps, DialogPanelSlot } from './types';

export const DialogPanel = <T extends ElementType = 'div'>(props: DialogPanelProps<T>) => {
  const theme = useComponentTheme('DialogPanel');
  const { dismissible } = useDialogOwnContext();

  const { rootAttrs, rest } = composeRootAttrs<DialogPanelProps, DialogPanelSlot>(DialogPanelBase, props as DialogPanelProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  // `rootAttrs` (theme / `slotProps.root`) is spread after the instance props
  // and wins for the same key, so the guard wraps whichever handler would
  // otherwise have been applied.
  const consumerPointerDownCapture = (rootAttrs.onPointerDownCapture ?? sparProps.onPointerDownCapture) as typeof sparProps.onPointerDownCapture;
  const { onPointerDownCapture, guardOutside } = useNestedLayerDismissGuard(consumerPointerDownCapture);

  // Presses inside a portaled descendant (Select / Popover / Dropdown content)
  // are not outside presses; see `useNestedLayerDismissGuard`.
  // When not dismissible, `blockDismiss` still vetoes genuine outside presses.
  const outside = <E extends Event>(handler?: (event: E) => void) => guardOutside(dismissible ? handler : blockDismiss(handler));
  const dismissHandlers = {
    ...(!dismissible && { onEscapeKeyDown: blockDismiss(sparProps.onEscapeKeyDown) }),
    onPointerDownOutside: outside(sparProps.onPointerDownOutside),
    onInteractOutside: outside(sparProps.onInteractOutside),
  };

  return (
    <SparDialogContent {...sparProps} {...rootAttrs} ref={ref} {...dismissHandlers} onPointerDownCapture={onPointerDownCapture}>
      {children}
    </SparDialogContent>
  );
};

DialogPanel.displayName = 'Dialog.Panel';
