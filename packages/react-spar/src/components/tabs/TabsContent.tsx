import type { ElementType } from 'react';
import { TabsContent as SparTabsContent } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TabsContentBase } from './base';
import type { TabsContentProps } from './types';

export const TabsContent = <T extends ElementType = 'div'>(props: TabsContentProps<T>) => {
  const theme = useComponentTheme('TabsContent');
  const { rootAttrs, rest } = composeRootAttrs(TabsContentBase, props as TabsContentProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparTabsContent {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparTabsContent>
  );
};

TabsContent.displayName = 'Tabs.Content';
