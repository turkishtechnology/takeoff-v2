import { createComponentBase } from '../../core';

import type {
  SelectContentProps,
  SelectGroupProps,
  SelectItemProps,
  SelectItemTextProps,
  SelectLabelProps,
  SelectProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectValueProps,
} from './types';

export const SelectBase = createComponentBase<SelectProps, 'root'>({
  name: 'Select',
  slots: ['root'] as const,
  classes: { root: 'tk-select' },
});

export const SelectTriggerBase = createComponentBase<SelectTriggerProps, 'root'>({
  name: 'SelectTrigger',
  slots: ['root'] as const,
  classes: { root: 'tk-select-trigger' },
});

export const SelectValueBase = createComponentBase<SelectValueProps, 'root'>({
  name: 'SelectValue',
  slots: ['root'] as const,
  classes: { root: 'tk-select-value' },
});

export const SelectContentBase = createComponentBase<SelectContentProps, 'root'>({
  name: 'SelectContent',
  slots: ['root'] as const,
  classes: { root: 'tk-select-content' },
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

export const SelectItemTextBase = createComponentBase<SelectItemTextProps, 'root'>({
  name: 'SelectItemText',
  slots: ['root'] as const,
  classes: { root: 'tk-select-item-text' },
});

export const SelectSeparatorBase = createComponentBase<SelectSeparatorProps, 'root'>({
  name: 'SelectSeparator',
  slots: ['root'] as const,
  classes: { root: 'tk-select-separator' },
});
