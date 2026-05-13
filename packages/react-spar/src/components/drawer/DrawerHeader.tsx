import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerHeaderBase } from './base';
import { DEFAULT_HEADER_TYPE } from './defaults';
import type { DrawerHeaderProps } from './types';

export const DrawerHeader = (props: DrawerHeaderProps) => {
  const theme = useComponentTheme('DrawerHeader');

  const { rootAttrs, rest } = composeRootAttrs(DrawerHeaderBase, props, theme);

  const { headerType = DEFAULT_HEADER_TYPE, children, ref, ...headerProps } = rest;

  const finalRootAttrs = {
    ...rootAttrs,
    'data-header-type': headerType,
  };

  return (
    <div {...headerProps} ref={ref} {...finalRootAttrs}>
      {children}
    </div>
  );
};

DrawerHeader.displayName = 'DrawerHeader';
