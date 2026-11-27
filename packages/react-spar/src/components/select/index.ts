import { Select as SelectRoot } from './Select';
import { SelectTrigger } from './SelectTrigger';
import { SelectIndicator } from './SelectIndicator';
import { SelectContent } from './SelectContent';
import { SelectViewport } from './SelectViewport';
import { SelectSearch } from './SelectSearch';
import { SelectEmpty } from './SelectEmpty';
import { SelectItem } from './SelectItem';
import { SelectGroup } from './SelectGroup';
import { SelectLabel } from './SelectLabel';
import { SelectSeparator } from './SelectSeparator';
import { SelectArrow } from './SelectArrow';

const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Indicator: SelectIndicator,
  Content: SelectContent,
  Viewport: SelectViewport,
  Search: SelectSearch,
  Empty: SelectEmpty,
  Item: SelectItem,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
  Arrow: SelectArrow,
});

export { Select };

export type {
  SelectArrowProps,
  SelectContentProps,
  SelectEmptyProps,
  SelectGroupProps,
  SelectIndicatorProps,
  SelectIndicatorRenderState,
  SelectItemProps,
  SelectLabelProps,
  SelectProps,
  SelectSearchProps,
  SelectSeparatorProps,
  SelectSize,
  SelectTriggerProps,
  SelectViewportProps,
} from './types';
