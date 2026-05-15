import { createComponentBase } from '../../core';

import type { RadioDescriptionProps, RadioIndicatorProps, RadioIndicatorSlot, RadioItemProps, RadioLabelProps, RadioProps, RadioTextProps } from './types';

// @archetype inherited — wraps SparRadioRoot (the radiogroup div). Wrapper
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
// (`data-size`, `data-type`, `data-position`, `data-invalid`) and adds the
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

// @archetype react-enhancement — Spar Radio exposes no Text part.
export const RadioTextBase = createComponentBase<RadioTextProps, 'root'>({
  name: 'RadioText',
  slots: ['root'] as const,
  classes: { root: 'tk-radio-text' },
});

// @archetype react-enhancement — Spar Radio exposes no Label part.
export const RadioLabelBase = createComponentBase<RadioLabelProps, 'root'>({
  name: 'RadioLabel',
  slots: ['root'] as const,
  classes: { root: 'tk-radio-label' },
});

// @archetype react-enhancement — Spar Radio exposes no Description part.
export const RadioDescriptionBase = createComponentBase<RadioDescriptionProps, 'root'>({
  name: 'RadioDescription',
  slots: ['root'] as const,
  classes: { root: 'tk-radio-description' },
});
