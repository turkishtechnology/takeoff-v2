import { Select as SelectRoot } from './Select';
import { SelectTrigger } from './SelectTrigger';
import { SelectIndicator } from './SelectIndicator';
import { SelectContent } from './SelectContent';
import { SelectItem } from './SelectItem';
import { SelectGroup } from './SelectGroup';
import { SelectLabel } from './SelectLabel';
import { SelectSeparator } from './SelectSeparator';

const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Indicator: SelectIndicator,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
});

export { Select };

export type {
  SelectContentProps,
  SelectGroupProps,
  SelectIndicatorProps,
  SelectIndicatorRenderState,
  SelectItemProps,
  SelectLabelProps,
  SelectProps,
  SelectSeparatorProps,
  SelectSize,
  SelectTriggerProps,
} from './types';
