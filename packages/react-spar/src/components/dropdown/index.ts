import { Dropdown as DropdownRoot } from './Dropdown';
import { DropdownArrow } from './DropdownArrow';
import { DropdownContent } from './DropdownContent';
import { DropdownGroup } from './DropdownGroup';
import { DropdownItem } from './DropdownItem';
import { DropdownLabel } from './DropdownLabel';
import { DropdownSeparator } from './DropdownSeparator';
import { DropdownTrigger } from './DropdownTrigger';

const Dropdown = Object.assign(DropdownRoot, {
  Trigger: DropdownTrigger,
  Content: DropdownContent,
  Item: DropdownItem,
  Group: DropdownGroup,
  Label: DropdownLabel,
  Separator: DropdownSeparator,
  Arrow: DropdownArrow,
});

export { Dropdown };

export type {
  DropdownArrowProps,
  DropdownContentProps,
  DropdownContentWidth,
  DropdownGroupProps,
  DropdownItemProps,
  DropdownLabelProps,
  DropdownProps,
  DropdownSeparatorProps,
  DropdownSize,
  DropdownTriggerProps,
} from './types';
