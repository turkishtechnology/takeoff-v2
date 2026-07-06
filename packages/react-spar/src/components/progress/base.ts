import { createComponentBase } from '../../core';

import type { ProgressIndicatorProps, ProgressProps } from './types';

// @archetype react-enhancement — Spar ships no Progress primitive (same
// no-upstream situation as Table). The wrapper owns the value
// clamping, the progressbar ARIA surface, and the DOM anatomy; if a Spar
// Progress primitive lands upstream, these parts must migrate to Inherited
// in the same release (composition-archetype rule 3).
//
// The root doubles as the track and renders `Progress.Indicator` by default;
// consumers can still compose the indicator explicitly for slot overrides.
export const ProgressBase = createComponentBase<ProgressProps, 'root'>({
  name: 'Progress',
  slots: ['root'] as const,
  classes: { root: 'tk-progress' },
});

// @archetype react-enhancement — no upstream part; decorative (aria-hidden)
// filled portion. Renders the DOM the root's appearance calls for and writes
// the progress inline: bar width (linear) or arc stroke-dashoffset (circular).
export const ProgressIndicatorBase = createComponentBase<ProgressIndicatorProps, 'root'>({
  name: 'ProgressIndicator',
  slots: ['root'] as const,
  classes: { root: 'tk-progress-indicator' },
});
