import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerBodyBase } from './base';
import type { DrawerBodyProps } from './types';

export const DrawerBody = <T extends ElementType = 'div'>(props: DrawerBodyProps<T>) => {
  const theme = useComponentTheme('DrawerBody');

  const { rootAttrs, rest } = composeRootAttrs(DrawerBodyBase, props as DrawerBodyProps<'div'>, theme);

  const { children, ref, ...bodyProps } = rest;

  return (
    <div {...bodyProps} ref={ref} {...rootAttrs}>
      {children}
    </div>
  );
};

DrawerBody.displayName = 'DrawerBody';
