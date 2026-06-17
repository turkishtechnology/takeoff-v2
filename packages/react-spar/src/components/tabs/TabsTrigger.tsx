import type { ElementType } from 'react';
import { TabsTrigger as SparTabsTrigger } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TabsTriggerBase } from './base';
import { useTabsOwnContext } from './context';
import type { TabsTriggerProps } from './types';

export const TabsTrigger = <T extends ElementType = 'button'>(props: TabsTriggerProps<T>) => {
  const theme = useComponentTheme('TabsTrigger');
  const { size, variant, appearance } = useTabsOwnContext('Tabs.Trigger');

  const { rootAttrs, rest } = composeRootAttrs(TabsTriggerBase, props as TabsTriggerProps<'button'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
      'data-variant': variant,
      'data-type': appearance,
    }),
  });

  const { children, ref, ...sparProps } = rest;

  return (
    <SparTabsTrigger {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparTabsTrigger>
  );
};

TabsTrigger.displayName = 'Tabs.Trigger';
