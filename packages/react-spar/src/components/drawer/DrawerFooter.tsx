import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerFooterBase } from './base';
import { DEFAULT_FOOTER_TYPE } from './defaults';
import type { DrawerFooterProps } from './types';

export const DrawerFooter = <T extends ElementType = 'div'>(props: DrawerFooterProps<T>) => {
  const theme = useComponentTheme('DrawerFooter');

  const { rootAttrs, rest } = composeRootAttrs(DrawerFooterBase, props as DrawerFooterProps<'div'>, theme, {
    stateAttrs: ({ footerType = DEFAULT_FOOTER_TYPE }) => ({
      'data-footer-type': footerType,
    }),
  });

  const { as, footerType: _footerType, children, ref, ...footerProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...footerProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

DrawerFooter.displayName = 'Drawer.Footer';
