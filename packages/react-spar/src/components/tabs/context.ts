import { createSafeContext } from '../../hooks';

import type { TabsAppearance, TabsSize, TabsVariant } from './types';

export interface TabsOwnContextValue {
  size: TabsSize;
  variant: TabsVariant;
  appearance: TabsAppearance;
}

export const [TabsOwnProvider, useTabsOwnContext] = createSafeContext<TabsOwnContextValue>('Tabs');
