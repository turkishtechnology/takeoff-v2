import { Tabs as TabsRoot } from './Tabs';
import { TabsList } from './TabsList';
import { TabsTrigger } from './TabsTrigger';
import { TabsContent } from './TabsContent';

const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

export { Tabs };

export type { TabsActivationMode, TabsAppearance, TabsContentProps, TabsListProps, TabsProps, TabsSize, TabsTriggerProps, TabsTriggerRenderProps, TabsVariant } from './types';
