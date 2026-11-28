import { Select as SelectRoot } from './Select';
import { SelectTrigger } from './SelectTrigger';
import { SelectContent } from './SelectContent';
import { SelectViewport } from './SelectViewport';
import { SelectSearch } from './SelectSearch';
import { SelectItem } from './SelectItem';
import { SelectGroup } from './SelectGroup';
import { SelectLabel } from './SelectLabel';
import { SelectSeparator } from './SelectSeparator';
import { SelectArrow } from './SelectArrow';
export { useSelectContext, useSelectGroupContext, useSelectItemContext, useSelectCollectionContext } from './hooks';

const Select = SelectRoot as typeof SelectRoot & {
  Root: typeof SelectRoot;
  Trigger: typeof SelectTrigger;
  Content: typeof SelectContent;
  Viewport: typeof SelectViewport;
  Search: typeof SelectSearch;
  Item: typeof SelectItem;
  Group: typeof SelectGroup;
  Label: typeof SelectLabel;
  Separator: typeof SelectSeparator;
  Arrow: typeof SelectArrow;
};

Select.Root = SelectRoot;
Select.Trigger = SelectTrigger;
Select.Content = SelectContent;
Select.Viewport = SelectViewport;
Select.Search = SelectSearch;
Select.Item = SelectItem;
Select.Group = SelectGroup;
Select.Label = SelectLabel;
Select.Separator = SelectSeparator;
Select.Arrow = SelectArrow;

export { Select, SelectRoot, SelectTrigger, SelectContent, SelectViewport, SelectSearch, SelectItem, SelectGroup, SelectLabel, SelectSeparator, SelectArrow };

export type {
  SelectProps,
  SelectTriggerProps,
  SelectTriggerRenderProps,
  SelectContentProps,
  SelectViewportProps,
  SelectSearchProps,
  SelectSearchOwnProps,
  SelectItemProps,
  SelectItemRenderProps,
  SelectGroupProps,
  SelectLabelProps,
  SelectSeparatorProps,
  SelectArrowProps,
  SelectContextValue,
} from './types';
