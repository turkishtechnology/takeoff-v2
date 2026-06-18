import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AlertActionsBase } from './base';
import type { AlertActionsProps, AlertActionsSlot } from './types';

export const AlertActions = <T extends ElementType = 'div'>(props: AlertActionsProps<T>) => {
  const theme = useComponentTheme('AlertActions');

  const { rootAttrs, rest } = composeRootAttrs<AlertActionsProps, AlertActionsSlot>(AlertActionsBase, props as AlertActionsProps<'div'>, theme);

  const { as, children, ref, ...actionsProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...actionsProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

AlertActions.displayName = 'Alert.Actions';
