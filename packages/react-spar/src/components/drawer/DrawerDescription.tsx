import type { ElementType } from 'react';
import { DialogDescription as SparDialogDescription } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerDescriptionBase } from './base';
import type { DrawerDescriptionProps } from './types';

export const DrawerDescription = <T extends ElementType = 'p'>(props: DrawerDescriptionProps<T>) => {
  const theme = useComponentTheme('DrawerDescription');

  const { rootAttrs, rest } = composeRootAttrs(DrawerDescriptionBase, props as DrawerDescriptionProps<'p'>, theme);

  const { children, ref, ...descProps } = rest;

  return (
    <SparDialogDescription {...descProps} ref={ref} {...rootAttrs}>
      {children}
    </SparDialogDescription>
  );
};

DrawerDescription.displayName = 'DrawerDescription';
