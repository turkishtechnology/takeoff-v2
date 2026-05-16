import { createComponentBase } from '../../core';

import type { SwitchProps, SwitchSlot } from './types';

/**
 * Slot vocabulary for `Switch`. Every non-root part is React-enhancement —
 * `SparSwitch` is a leaf primitive with no compound counterparts, so the
 * wrapper owns these DOM nodes and their styling hooks alone (see
 * `packages/react-spar/docs/coding-standards.md` → Composition archetypes).
 *
 * Field-level concerns (`label`, `description`, `error message`) live on
 * `<Field>` and are NOT duplicated here. The Switch wrapper exposes only the
 * visual anatomy that is unique to the control itself.
 */
export const SwitchBase = createComponentBase<SwitchProps, SwitchSlot>({
  name: 'Switch',
  slots: ['root', 'indicator', 'thumb'] as const,
  classes: {
    root: 'tk-toggle',
    // @archetype react-enhancement — visible track ("input container" in tokens CSS).
    indicator: 'tk-toggle-input-container',
    // @archetype react-enhancement — sliding thumb inside the track.
    thumb: 'tk-toggle-thumb',
  },
});
