import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerHeaderBase } from './base';
import { DEFAULT_HEADER_TYPE } from './defaults';
import type { DrawerHeaderProps } from './types';

export const DrawerHeader = <T extends ElementType = 'div'>(props: DrawerHeaderProps<T>) => {
  const theme = useComponentTheme('DrawerHeader');

  const { rootAttrs, rest } = composeRootAttrs(DrawerHeaderBase, props as DrawerHeaderProps<'div'>, theme, {
    stateAttrs: ({ headerType = DEFAULT_HEADER_TYPE }) => ({
      'data-header-type': headerType,
    }),
  });

  const { as, headerType: _headerType, children, ref, ...headerProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...headerProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

DrawerHeader.displayName = 'Drawer.Header';
