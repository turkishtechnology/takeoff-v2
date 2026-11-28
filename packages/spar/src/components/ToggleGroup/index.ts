import { ToggleGroup as ToggleGroupRoot } from './ToggleGroup';
import { ToggleGroupItem } from './ToggleGroupItem';
export { useToggleGroupContext } from './hooks';

const ToggleGroup = ToggleGroupRoot as typeof ToggleGroupRoot & {
  Root: typeof ToggleGroupRoot;
  Item: typeof ToggleGroupItem;
};

ToggleGroup.Root = ToggleGroupRoot;
ToggleGroup.Item = ToggleGroupItem;

export { ToggleGroup, ToggleGroupRoot, ToggleGroupItem };

export type { ToggleGroupProps, ToggleGroupItemProps, ToggleGroupOwnProps, ToggleGroupItemOwnProps, ToggleGroupValue } from './types';
