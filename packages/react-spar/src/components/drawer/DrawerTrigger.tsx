import type { ElementType } from 'react';
import { DialogTrigger as SparDialogTrigger } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { DrawerTriggerBase } from './base';
import type { DrawerTriggerProps } from './types';

export const DrawerTrigger = <T extends ElementType = 'button'>(props: DrawerTriggerProps<T>) => {
  const theme = useComponentTheme('DrawerTrigger' as never);

  const { rootAttrs, rest } = composeRootAttrs(DrawerTriggerBase, props as DrawerTriggerProps<'button'>, theme);

  const { children, ref, ...triggerProps } = rest;

  return (
    <SparDialogTrigger {...triggerProps} ref={ref} {...rootAttrs}>
      {children}
    </SparDialogTrigger>
  );
};

DrawerTrigger.displayName = 'DrawerTrigger';
