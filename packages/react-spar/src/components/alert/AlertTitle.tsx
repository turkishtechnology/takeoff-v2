import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AlertTitleBase } from './base';
import type { AlertTitleProps, AlertTitleSlot } from './types';

export const AlertTitle = <T extends ElementType = 'h5'>(props: AlertTitleProps<T>) => {
  const theme = useComponentTheme('AlertTitle');

  const { rootAttrs, rest } = composeRootAttrs<AlertTitleProps, AlertTitleSlot>(AlertTitleBase, props as AlertTitleProps<'h5'>, theme);

  const { as, level = 5, children, ref, ...titleProps } = rest;
  const Component = (as ?? `h${level}`) as ElementType;

  return (
    <Component {...titleProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

AlertTitle.displayName = 'Alert.Title';
