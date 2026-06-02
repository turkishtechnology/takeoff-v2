import type { ElementType } from 'react';
import { DialogContent as SparDialogContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogContentBase } from './base';
import { useDialogOwnContext } from './context';
import type { DialogContentProps, DialogContentSlot } from './types';

const preventDefault = (e: Event) => e.preventDefault();

export const DialogContent = <T extends ElementType = 'div'>(props: DialogContentProps<T>) => {
  const theme = useComponentTheme('DialogContent');
  const { dismissable, variant } = useDialogOwnContext();

  const { rootAttrs, rest } = composeRootAttrs<DialogContentProps, DialogContentSlot>(DialogContentBase, props as DialogContentProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-variant': variant,
    }),
  });
  const { children, ref, ...sparProps } = rest;

  const dismissHandlers = !dismissable && {
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

DialogContent.displayName = 'Dialog.Content';
