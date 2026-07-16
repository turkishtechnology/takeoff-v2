import { createComponentBase } from '../../core';

import type { ProgressIndicatorProps, ProgressProps, ProgressTrackProps, ProgressValueProps } from './types';

// @archetype react-enhancement — Spar ships no Progress primitive (same
// no-upstream situation as Table). The wrapper owns the value
// clamping, the progressbar ARIA surface, and the DOM anatomy; if a Spar
// Progress primitive lands upstream, these parts must migrate to Inherited
// in the same release (composition-archetype rule 3).
//
// The root is the a11y owner and layout wrapper (Root/Track/Indicator/Value
// anatomy, as in Base UI / Chakra / Ark). It renders the default anatomy —
// Track wrapping Indicator — for both appearances; consumers can still
// compose the parts explicitly for slot overrides.
export const ProgressBase = createComponentBase<ProgressProps, 'root'>({
  name: 'Progress',
  slots: ['root'] as const,
  classes: { root: 'tk-progress' },
});

// @archetype react-enhancement — no upstream part; the rail the indicator
// fills. Renders the DOM the root's appearance calls for: a rail <div> for
// linear, the ring <svg> for circular — with the rail circle as its own
// 'rail' slot (same internal-slot pattern as FieldLabel's asterisk).
export const ProgressTrackBase = createComponentBase<ProgressTrackProps, 'root' | 'rail'>({
  name: 'ProgressTrack',
  slots: ['root', 'rail'] as const,
  classes: { root: 'tk-progress-track', rail: 'tk-progress-rail' },
});

// @archetype react-enhancement — no upstream part; the decorative filled
// portion. Renders the DOM the root's appearance calls for and writes the
// progress inline: fill <span> width (linear) or arc <circle>
// stroke-dashoffset (circular).
export const ProgressIndicatorBase = createComponentBase<ProgressIndicatorProps, 'root'>({
  name: 'ProgressIndicator',
  slots: ['root'] as const,
  classes: { root: 'tk-progress-indicator' },
});

// @archetype react-enhancement — no upstream part; decorative (aria-hidden)
// value/status text. Sits in flow next to the track for linear roots and is
// centered inside the ring by the recipe for circular ones.
export const ProgressValueBase = createComponentBase<ProgressValueProps, 'root'>({
  name: 'ProgressValue',
  slots: ['root'] as const,
  classes: { root: 'tk-progress-value' },
});
