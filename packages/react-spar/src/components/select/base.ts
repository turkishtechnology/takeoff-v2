import { createComponentBase } from '../../core';

import type {
  SelectContentProps,
  SelectGroupProps,
  SelectIndicatorProps,
  SelectItemProps,
  SelectLabelProps,
  SelectProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectTriggerSlot,
  SelectViewportProps,
} from './types';

export const SelectBase = createComponentBase<SelectProps, 'root'>({
  name: 'Select',
  slots: ['root'] as const,
  classes: { root: 'tk-select' },
});

export const SelectTriggerBase = createComponentBase<SelectTriggerProps, SelectTriggerSlot>({
  name: 'SelectTrigger',
  slots: ['root', 'value', 'indicator'] as const,
  classes: {
    root: 'tk-select-trigger',
    // Truncating value region wrapping the selected label/placeholder; pins the
    // indicator to the trailing edge of the `space-between` trigger.
    value: 'tk-select-value',
    // Wrapper around the built-in trigger indicator. Shares the
    // `tk-select-indicator` recipe with the standalone Select.Indicator so both
    // entry points style identically.
    indicator: 'tk-select-indicator',
  },
});

export const SelectIndicatorBase = createComponentBase<SelectIndicatorProps, 'root'>({
  name: 'SelectIndicator',
  slots: ['root'] as const,
  classes: { root: 'tk-select-indicator' },
});

export const SelectContentBase = createComponentBase<SelectContentProps, 'root'>({
  name: 'SelectContent',
  slots: ['root'] as const,
  classes: { root: 'tk-select-content' },
});

export const SelectViewportBase = createComponentBase<SelectViewportProps, 'root'>({
  name: 'SelectViewport',
  slots: ['root'] as const,
  classes: { root: 'tk-select-viewport' },
});

export const SelectItemBase = createComponentBase<SelectItemProps, 'root'>({
  name: 'SelectItem',
  slots: ['root'] as const,
  classes: { root: 'tk-select-item' },
});

export const SelectGroupBase = createComponentBase<SelectGroupProps, 'root'>({
  name: 'SelectGroup',
  slots: ['root'] as const,
  classes: { root: 'tk-select-group' },
});

export const SelectLabelBase = createComponentBase<SelectLabelProps, 'root'>({
  name: 'SelectLabel',
  slots: ['root'] as const,
  classes: { root: 'tk-select-label' },
});

export const SelectSeparatorBase = createComponentBase<SelectSeparatorProps, 'root'>({
  name: 'SelectSeparator',
  slots: ['root'] as const,
  classes: { root: 'tk-select-separator' },
});
