import type { ElementType } from 'react';
import { TabsList as SparTabsList } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TabsListBase } from './base';
import { useTabsOwnContext } from './context';
import type { TabsListProps } from './types';

export const TabsList = <T extends ElementType = 'div'>(props: TabsListProps<T>) => {
  const theme = useComponentTheme('TabsList');
  const { size, variant, appearance } = useTabsOwnContext('Tabs.List');

  const { rootAttrs, rest } = composeRootAttrs(TabsListBase, props as TabsListProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-size': size,
      'data-variant': variant,
      'data-type': appearance,
    }),
  });

  const { children, ref, ...sparProps } = rest;

  return (
    <SparTabsList {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparTabsList>
  );
};

TabsList.displayName = 'Tabs.List';
