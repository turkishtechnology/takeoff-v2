import { createComponentBase } from '../../core';

import type { TabsContentProps, TabsListProps, TabsProps, TabsTriggerProps } from './types';

export const TabsBase = createComponentBase<TabsProps, 'root'>({
  name: 'Tabs',
  slots: ['root'] as const,
  classes: { root: 'tk-tabs' },
});

export const TabsListBase = createComponentBase<TabsListProps, 'root'>({
  name: 'TabsList',
  slots: ['root'] as const,
  classes: { root: 'tk-tabs-list' },
});

export const TabsTriggerBase = createComponentBase<TabsTriggerProps, 'root'>({
  name: 'TabsTrigger',
  slots: ['root'] as const,
  classes: { root: 'tk-tabs-trigger' },
});

export const TabsContentBase = createComponentBase<TabsContentProps, 'root'>({
  name: 'TabsContent',
  slots: ['root'] as const,
  classes: { root: 'tk-tabs-content' },
});
