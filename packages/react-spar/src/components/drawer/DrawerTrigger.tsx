import { DialogTrigger as SparDialogTrigger } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerTriggerBase } from './base';
import type { DrawerTriggerProps } from './types';

export const DrawerTrigger = (props: DrawerTriggerProps) => {
  const theme = useComponentTheme('DrawerTrigger' as never);

  const { rootAttrs, rest } = composeRootAttrs(DrawerTriggerBase, props, theme);

  const { children, ref, ...triggerProps } = rest;

  return (
    <SparDialogTrigger {...triggerProps} ref={ref} {...rootAttrs}>
      {children}
    </SparDialogTrigger>
  );
};

DrawerTrigger.displayName = 'DrawerTrigger';
