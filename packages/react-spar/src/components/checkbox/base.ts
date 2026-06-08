import { createComponentBase } from '../../core';

import type { CheckboxProps, CheckboxSlot } from './types';

/**
 * Slot vocabulary for `Checkbox`. Every non-root part is React-enhancement —
 * `SparCheckbox` is a leaf primitive with no compound counterparts, so the
 * wrapper owns these DOM nodes and their styling hooks alone (see
 * `packages/react-spar/docs/coding-standards.md` → Composition archetypes).
 */
export const CheckboxBase = createComponentBase<CheckboxProps, CheckboxSlot>({
  name: 'Checkbox',
  slots: ['root', 'indicator', 'icon', 'label'] as const,
  classes: {
    root: 'tk-checkbox',
    // @archetype react-enhancement — visible box (Core's `.mask`).
    indicator: 'tk-checkbox-indicator',
    // @archetype react-enhancement — check / dash glyph inside the indicator.
    icon: 'tk-checkbox-icon',
    // @archetype react-enhancement — visual text/content slot inside the root.
    label: 'tk-checkbox-label',
  },
});
