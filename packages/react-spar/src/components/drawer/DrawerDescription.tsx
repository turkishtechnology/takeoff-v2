import { DialogDescription as SparDialogDescription } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerDescriptionBase } from './base';
import type { DrawerDescriptionProps } from './types';

export const DrawerDescription = (props: DrawerDescriptionProps) => {
  const theme = useComponentTheme('DrawerDescription');

  const { rootAttrs, rest } = composeRootAttrs(DrawerDescriptionBase, props, theme);

  const { children, ref, ...descProps } = rest;

  return (
    <SparDialogDescription {...descProps} ref={ref} {...rootAttrs}>
      {children}
    </SparDialogDescription>
  );
};

DrawerDescription.displayName = 'DrawerDescription';
