import type { ElementType } from 'react';
import { DialogClose as SparDialogClose } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogCloseButtonBase } from './base';
import type { DialogCloseButtonProps, DialogCloseButtonSlot } from './types';

export const DialogCloseButton = <T extends ElementType = 'button'>(props: DialogCloseButtonProps<T>) => {
  const theme = useComponentTheme('DialogCloseButton');

  const { rootAttrs, rest } = composeRootAttrs<DialogCloseButtonProps, DialogCloseButtonSlot>(DialogCloseButtonBase, props as DialogCloseButtonProps<'button'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDialogClose {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDialogClose>
  );
};

DialogCloseButton.displayName = 'DialogCloseButton';
