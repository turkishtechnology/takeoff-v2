import { createComponentBase } from '../../core';

import type { GlobeSpinnerLabelProps, GlobeSpinnerLabelSlot, GlobeSpinnerProps, GlobeSpinnerSlot } from './types';

// @archetype react-enhancement — no upstream Spar primitive for a loader; the
// takeoff layer owns the SVG anatomy and the `tk-globe-spinner` classes.
export const GlobeSpinnerBase = createComponentBase<GlobeSpinnerProps, GlobeSpinnerSlot>({
  name: 'GlobeSpinner',
  slots: ['root', 'indicator'] as const,
  classes: {
    root: 'tk-globe-spinner',
    indicator: 'tk-globe-spinner-indicator',
  },
});

// @archetype react-enhancement — renders an SVG `<text><textPath>` on the
// root's arc; no upstream equivalent.
export const GlobeSpinnerLabelBase = createComponentBase<GlobeSpinnerLabelProps, GlobeSpinnerLabelSlot>({
  name: 'GlobeSpinnerLabel',
  slots: ['root'] as const,
  classes: { root: 'tk-globe-spinner-label' },
});
