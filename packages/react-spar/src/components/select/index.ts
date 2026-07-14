import { Select as SelectRoot } from './Select';
import { SelectTrigger } from './SelectTrigger';
import { SelectIndicator } from './SelectIndicator';
import { SelectContent } from './SelectContent';
import { SelectViewport } from './SelectViewport';
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
  SelectGroupProps,
  SelectIndicatorProps,
  SelectIndicatorRenderState,
  SelectItemProps,
  SelectLabelProps,
  SelectProps,
  SelectSeparatorProps,
  SelectSize,
  SelectTriggerProps,
  SelectViewportProps,
} from './types';
