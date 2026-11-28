import { createComponentBase } from '../../core';

import type { ToggleButtonGroupItemProps, ToggleButtonGroupItemSlot, ToggleButtonGroupProps } from './types';

// @archetype inherited — wraps Spar's ToggleGroup (the role="group" div). Spar
// owns selection, roving focus, arrow / Home / End and emits
// `data-orientation` / `data-disabled` / `data-multiple`; the wrapper adds the
// visual hooks `data-type`, `data-size` and `data-rounded`.
export const ToggleButtonGroupBase = createComponentBase<ToggleButtonGroupProps, 'root'>({
  name: 'ToggleButtonGroup',
  slots: ['root'] as const,
  classes: { root: 'tk-toggle-button-group' },
});

// @archetype inherited — wraps SparToggleGroupItem (a Spar Button toggle, so
// `aria-pressed` / `data-pressed` / `data-disabled` are Spar's). The wrapper
// adds `data-variant` / `data-type` (appearance) / `data-size` /
// `data-icon-only` and the internal `content` / `label` slots (Button's names).
export const ToggleButtonGroupItemBase = createComponentBase<ToggleButtonGroupItemProps, ToggleButtonGroupItemSlot>({
  name: 'ToggleButtonGroupItem',
  slots: ['root', 'content', 'label'] as const,
  classes: {
    root: 'tk-toggle-button-group-item',
    content: 'tk-toggle-button-group-item-content',
    label: 'tk-toggle-button-group-item-label',
  },
});
