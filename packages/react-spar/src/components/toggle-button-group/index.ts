import { ToggleButtonGroup as ToggleButtonGroupRoot } from './ToggleButtonGroup';
import { ToggleButtonGroupItem } from './ToggleButtonGroupItem';

const ToggleButtonGroup = Object.assign(ToggleButtonGroupRoot, {
  Item: ToggleButtonGroupItem,
});

export { ToggleButtonGroup };

export type {
  ToggleButtonGroupAppearance,
  ToggleButtonGroupItemProps,
  ToggleButtonGroupItemSlot,
  ToggleButtonGroupProps,
  ToggleButtonGroupSize,
  ToggleButtonGroupSlot,
  ToggleButtonGroupType,
  ToggleButtonGroupValue,
  ToggleButtonGroupVariant,
} from './types';
