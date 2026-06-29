import type { ElementType } from 'react';
import { DialogContent as SparDialogContent } from '@turkish-technology/spar';

import { blockDismiss, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogPanelBase } from './base';
import { useDialogOwnContext } from './context';
import type { DialogPanelProps, DialogPanelSlot } from './types';

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
