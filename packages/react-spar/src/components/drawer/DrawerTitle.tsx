import type { ElementType } from 'react';
import { DialogTitle as SparDialogTitle } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerTitleBase } from './base';
import type { DrawerTitleProps } from './types';

export const DrawerTitle = <T extends ElementType = 'h5'>(props: DrawerTitleProps<T>) => {
  const theme = useComponentTheme('DrawerTitle');

  const { rootAttrs, rest } = composeRootAttrs(DrawerTitleBase, props as DrawerTitleProps<'h5'>, theme);

  const { level = 5, children, ref, ...titleProps } = rest;

  return (
    <SparDialogTitle {...titleProps} level={level} ref={ref} {...rootAttrs}>
      {children}
    </SparDialogTitle>
  );
};

DrawerTitle.displayName = 'Drawer.Title';
