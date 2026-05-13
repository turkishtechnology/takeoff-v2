import { DialogClose as SparDialogClose } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerCloseButtonBase } from './base';
import type { DrawerCloseButtonProps } from './types';

export const DrawerCloseButton = (props: DrawerCloseButtonProps) => {
  const theme = useComponentTheme('DrawerCloseButton');

  const { rootAttrs, rest } = composeRootAttrs(DrawerCloseButtonBase, props, theme);

  const { children, ref, ...closeProps } = rest;

  return (
    <SparDialogClose {...closeProps} ref={ref} {...rootAttrs}>
      {children}
    </SparDialogClose>
  );
};

DrawerCloseButton.displayName = 'DrawerCloseButton';
