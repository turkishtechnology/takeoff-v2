import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerHeaderBase } from './base';
import { DEFAULT_HEADER_TYPE } from './defaults';
import type { DrawerHeaderProps } from './types';

export const DrawerHeader = <T extends ElementType = 'div'>(props: DrawerHeaderProps<T>) => {
  const theme = useComponentTheme('DrawerHeader');

  const { rootAttrs, rest } = composeRootAttrs(DrawerHeaderBase, props as DrawerHeaderProps<'div'>, theme);

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
