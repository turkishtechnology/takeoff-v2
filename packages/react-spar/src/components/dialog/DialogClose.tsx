import type { ElementType } from 'react';
import { DialogClose as SparDialogClose } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogCloseBase } from './base';
import type { DialogCloseProps, DialogCloseSlot } from './types';

export const DialogClose = <T extends ElementType = 'button'>(props: DialogCloseProps<T>) => {
  const theme = useComponentTheme('DialogClose');

  const { rootAttrs, rest } = composeRootAttrs<DialogCloseProps, DialogCloseSlot>(DialogCloseBase, props as DialogCloseProps<'button'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDialogClose {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDialogClose>
  );
};

DialogClose.displayName = 'Dialog.Close';
