import { DialogTitle as SparDialogTitle } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerTitleBase } from './base';
import type { DrawerTitleProps } from './types';

export const DrawerTitle = (props: DrawerTitleProps) => {
  const theme = useComponentTheme('DrawerTitle');

  const { rootAttrs, rest } = composeRootAttrs(DrawerTitleBase, props, theme);

  const { level = 5, children, ref, ...titleProps } = rest;

  return (
    <SparDialogTitle {...titleProps} level={level} ref={ref} {...rootAttrs}>
      {children}
    </SparDialogTitle>
  );
};

DrawerTitle.displayName = 'DrawerTitle';
