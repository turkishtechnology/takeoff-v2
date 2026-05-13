import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerBodyBase } from './base';
import type { DrawerBodyProps } from './types';

export const DrawerBody = <T extends ElementType = 'div'>(props: DrawerBodyProps<T>) => {
  const theme = useComponentTheme('DrawerBody');

  const { rootAttrs, rest } = composeRootAttrs(DrawerBodyBase, props as DrawerBodyProps<'div'>, theme);

  const { as, children, ref, ...bodyProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...bodyProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

DrawerBody.displayName = 'DrawerBody';
