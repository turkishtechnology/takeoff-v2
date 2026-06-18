import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AlertDescriptionBase } from './base';
import type { AlertDescriptionProps, AlertDescriptionSlot } from './types';

export const AlertDescription = <T extends ElementType = 'p'>(props: AlertDescriptionProps<T>) => {
  const theme = useComponentTheme('AlertDescription');

  const { rootAttrs, rest } = composeRootAttrs<AlertDescriptionProps, AlertDescriptionSlot>(AlertDescriptionBase, props as AlertDescriptionProps<'p'>, theme);

  const { as, children, ref, ...descriptionProps } = rest;
  const Component = (as ?? 'p') as ElementType;

  return (
    <Component {...descriptionProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

AlertDescription.displayName = 'Alert.Description';
