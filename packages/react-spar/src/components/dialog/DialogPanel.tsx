import type { ElementType } from 'react';
import { DialogContent as SparDialogContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useNestedLayerDismissHandlers } from '../../hooks';
import { useComponentTheme } from '../../provider';

import { DialogPanelBase } from './base';
import { useDialogOwnContext } from './context';
import type { DialogPanelProps, DialogPanelSlot } from './types';

export const DialogPanel = <T extends ElementType = 'div'>(props: DialogPanelProps<T>) => {
  const theme = useComponentTheme('DialogPanel');
  const { dismissible } = useDialogOwnContext();

  const { rootAttrs, rest } = composeRootAttrs<DialogPanelProps, DialogPanelSlot>(DialogPanelBase, props as DialogPanelProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  // Presses inside a portaled descendant (Select / Popover / Dropdown content)
  // are not outside presses; see `useNestedLayerDismissHandlers`.
  const dismissHandlers = useNestedLayerDismissHandlers({ dismissible, instanceProps: sparProps, rootAttrs });

  return (
    <SparDialogContent {...sparProps} {...rootAttrs} ref={ref} {...dismissHandlers}>
      {children}
    </SparDialogContent>
  );
};

DialogPanel.displayName = 'Dialog.Panel';
