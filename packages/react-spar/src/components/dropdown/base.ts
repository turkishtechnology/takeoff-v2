import { createComponentBase } from '../../core';

import type { DropdownArrowProps, DropdownContentProps, DropdownGroupProps, DropdownItemProps, DropdownLabelProps, DropdownSeparatorProps, DropdownTriggerProps } from './types';

export const DropdownTriggerBase = createComponentBase<DropdownTriggerProps, 'root'>({
  name: 'DropdownTrigger',
  slots: ['root'] as const,
  classes: { root: 'tk-dropdown-trigger' },
});

export const DropdownContentBase = createComponentBase<DropdownContentProps, 'root'>({
  name: 'DropdownContent',
  slots: ['root'] as const,
  classes: { root: 'tk-dropdown-content' },
});

export const DropdownItemBase = createComponentBase<DropdownItemProps, 'root'>({
  name: 'DropdownItem',
  slots: ['root'] as const,
  classes: { root: 'tk-dropdown-item' },
});

export const DropdownGroupBase = createComponentBase<DropdownGroupProps, 'root'>({
  name: 'DropdownGroup',
  slots: ['root'] as const,
  classes: { root: 'tk-dropdown-group' },
});

export const DropdownLabelBase = createComponentBase<DropdownLabelProps, 'root'>({
  name: 'DropdownLabel',
  slots: ['root'] as const,
  classes: { root: 'tk-dropdown-label' },
});

export const DropdownSeparatorBase = createComponentBase<DropdownSeparatorProps, 'root'>({
  name: 'DropdownSeparator',
  slots: ['root'] as const,
  classes: { root: 'tk-dropdown-separator' },
});

export const DropdownArrowBase = createComponentBase<DropdownArrowProps, 'root'>({
  name: 'DropdownArrow',
  slots: ['root'] as const,
  classes: { root: 'tk-dropdown-arrow' },
});
