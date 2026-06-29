import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AlertContentBase } from './base';
import type { AlertContentProps, AlertContentSlot } from './types';

export const AlertContent = <T extends ElementType = 'div'>(props: AlertContentProps<T>) => {
  const theme = useComponentTheme('AlertContent');

  const { rootAttrs, rest } = composeRootAttrs<AlertContentProps, AlertContentSlot>(AlertContentBase, props as AlertContentProps<'div'>, theme);

  const { as, children, ref, ...contentProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...contentProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

AlertContent.displayName = 'Alert.Content';
