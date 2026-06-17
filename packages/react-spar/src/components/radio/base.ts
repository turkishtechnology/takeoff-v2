import { createComponentBase } from '../../core';

import type { RadioIndicatorProps, RadioIndicatorSlot, RadioItemProps, RadioLabelProps, RadioProps } from './types';

// @archetype inherited — wraps Spar's Radio (the radiogroup div). Wrapper
// emits the canonical class + data-slot anchor. Group layout hooks
// (`data-position`, `data-spread`) are visual only; state/keyboard/ARIA stays
// in Spar.
export const RadioBase = createComponentBase<RadioProps, 'root'>({
  name: 'Radio',
  slots: ['root'] as const,
  classes: { root: 'tk-radio' },
});

// @archetype inherited — wraps SparRadioItem (the <label> root with hidden
// <input type="radio">). Wrapper layers cascade-driven visual data hooks
// (`data-size`, `data-position`, `data-invalid`) and adds the
// `tk-radio-item` class.
export const RadioItemBase = createComponentBase<RadioItemProps, 'root'>({
  name: 'RadioItem',
  slots: ['root'] as const,
  classes: { root: 'tk-radio-item' },
});

// @archetype react-enhancement — Spar Radio exposes no Indicator part; the
// wrapper owns the visible circle. The decorative inner fill (`icon`) is an
// internal slot — consumers customize it via this part's `slotProps.icon` /
// `classNames.icon`, not via a separate compound.
export const RadioIndicatorBase = createComponentBase<RadioIndicatorProps, RadioIndicatorSlot>({
  name: 'RadioIndicator',
  slots: ['root', 'icon'] as const,
  classes: {
    root: 'tk-radio-indicator',
    icon: 'tk-radio-icon',
  },
});

// @archetype react-enhancement — Spar Radio exposes no Label part. Acts as the
// per-item text container; consumers compose their own helper text / multi-line
// layout inside it (the wrapper does not ship a separate Description part).
export const RadioLabelBase = createComponentBase<RadioLabelProps, 'root'>({
  name: 'RadioLabel',
  slots: ['root'] as const,
  classes: { root: 'tk-radio-label' },
});
