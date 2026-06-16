import type { ElementType } from 'react';
import { DialogTitle as SparDialogTitle } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DialogTitleBase } from './base';
import type { DialogTitleProps, DialogTitleSlot } from './types';

export const DialogTitle = <T extends ElementType = 'h5'>(props: DialogTitleProps<T>) => {
  const theme = useComponentTheme('DialogTitle');

  const { rootAttrs, rest } = composeRootAttrs<DialogTitleProps, DialogTitleSlot>(DialogTitleBase, props as DialogTitleProps<'h5'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparDialogTitle {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparDialogTitle>
  );
};

DialogTitle.displayName = 'Dialog.Title';
