import type { ElementType } from 'react';
import { DialogContent as SparDialogContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogPanelBase } from './base';
import { useDialogOwnContext } from './context';
import type { DialogPanelProps, DialogPanelSlot } from './types';

const preventDefault = (e: Event) => e.preventDefault();

export const DialogPanel = <T extends ElementType = 'div'>(props: DialogPanelProps<T>) => {
  const theme = useComponentTheme('DialogPanel');
  const { dismissible } = useDialogOwnContext();

  const { rootAttrs, rest } = composeRootAttrs<DialogPanelProps, DialogPanelSlot>(DialogPanelBase, props as DialogPanelProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  const dismissHandlers = !dismissible && {
    onEscapeKeyDown: preventDefault,
    onPointerDownOutside: preventDefault,
    onInteractOutside: preventDefault,
  };

  return (
    <SparDialogContent {...sparProps} {...rootAttrs} ref={ref} {...dismissHandlers}>
      {children}
    </SparDialogContent>
  );
};

DialogPanel.displayName = 'Dialog.Panel';
