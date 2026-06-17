import type { ElementType } from 'react';
import { DialogContent as SparDialogContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogPanelBase } from './base';
import { useDialogOwnContext } from './context';
import type { DialogPanelProps, DialogPanelSlot } from './types';

// When the dialog is non-dismissible, block the close while still invoking the
// consumer's own handler (if any), so a passed `onEscapeKeyDown` /
// `onPointerDownOutside` / `onInteractOutside` is preserved rather than silently
// overwritten. `preventDefault` is called first so the consumer cannot
// accidentally re-enable the close.
const blockDismiss =
  <E extends { preventDefault: () => void }>(handler?: (event: E) => void) =>
  (event: E) => {
    event.preventDefault();
    handler?.(event);
  };

export const DialogPanel = <T extends ElementType = 'div'>(props: DialogPanelProps<T>) => {
  const theme = useComponentTheme('DialogPanel');
  const { dismissible } = useDialogOwnContext();

  const { rootAttrs, rest } = composeRootAttrs<DialogPanelProps, DialogPanelSlot>(DialogPanelBase, props as DialogPanelProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  const dismissHandlers = !dismissible && {
    onEscapeKeyDown: blockDismiss(sparProps.onEscapeKeyDown),
    onPointerDownOutside: blockDismiss(sparProps.onPointerDownOutside),
    onInteractOutside: blockDismiss(sparProps.onInteractOutside),
  };

  return (
    <SparDialogContent {...sparProps} {...rootAttrs} ref={ref} {...dismissHandlers}>
      {children}
    </SparDialogContent>
  );
};

DialogPanel.displayName = 'Dialog.Panel';
