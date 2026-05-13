import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerBodyBase } from './base';
import type { DrawerBodyProps } from './types';

export const DrawerBody = (props: DrawerBodyProps) => {
  const theme = useComponentTheme('DrawerBody');

  const { rootAttrs, rest } = composeRootAttrs(DrawerBodyBase, props, theme);

  const { children, ref, ...bodyProps } = rest;

  return (
    <div {...bodyProps} ref={ref} {...rootAttrs}>
      {children}
    </div>
  );
};

DrawerBody.displayName = 'DrawerBody';
