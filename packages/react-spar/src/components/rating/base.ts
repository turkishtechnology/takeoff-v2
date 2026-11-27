import { createComponentBase } from '../../core';

import type { RatingItemProps, RatingItemSlot, RatingProps } from './types';

// @archetype inherited — wraps Spar's Radio (the radiogroup). Spar owns value
// state, keyboard, ARIA, Field inheritance and form submission; the wrapper
// adds the class, `data-type`, and the numeric value API.
export const RatingBase = createComponentBase<RatingProps, 'root'>({
  name: 'Rating',
  slots: ['root'] as const,
  classes: { root: 'tk-rating' },
});

// @archetype inherited — wraps Spar's RadioItem (`role="radio"` plus a hidden
// native radio). The wrapper derives `data-fill` / `data-level` from Spar's
// group value and renders the decorative glyph (`icon`) and the `showValue`
// text (`value`) as internal slots.
export const RatingItemBase = createComponentBase<RatingItemProps, RatingItemSlot>({
  name: 'RatingItem',
  slots: ['root', 'icon', 'value'] as const,
  classes: {
    root: 'tk-rating-item',
    icon: 'tk-rating-icon',
    value: 'tk-rating-value',
  },
});
