import { Select as SelectRoot } from './Select';
import { SelectTrigger } from './SelectTrigger';
import { SelectContent } from './SelectContent';
import { SelectItem } from './SelectItem';
import { SelectGroup } from './SelectGroup';
import { SelectLabel } from './SelectLabel';
import { SelectSeparator } from './SelectSeparator';

const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
});

export { Select };

export type { SelectContentProps, SelectGroupProps, SelectItemProps, SelectLabelProps, SelectProps, SelectSeparatorProps, SelectSize, SelectTriggerProps } from './types';
