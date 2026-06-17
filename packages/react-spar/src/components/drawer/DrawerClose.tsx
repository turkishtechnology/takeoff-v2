import type { ElementType } from 'react';
import { DialogClose as SparDialogClose } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerCloseBase } from './base';
import type { DrawerCloseProps } from './types';

export const DrawerClose = <T extends ElementType = 'button'>(props: DrawerCloseProps<T>) => {
  const theme = useComponentTheme('DrawerClose');

  const { rootAttrs, rest } = composeRootAttrs(DrawerCloseBase, props as DrawerCloseProps<'button'>, theme);

  const { children, ref, ...closeProps } = rest;

  return (
    <SparDialogClose {...closeProps} ref={ref} {...rootAttrs}>
      {children}
    </SparDialogClose>
  );
};

DrawerClose.displayName = 'Drawer.Close';
