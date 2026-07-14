import type { ProgressAppearance, ProgressSize, ProgressVariant } from './types';

export const DEFAULT_APPEARANCE: ProgressAppearance = 'linear';
export const DEFAULT_SIZE: ProgressSize = 'base';
export const DEFAULT_VARIANT: ProgressVariant = 'primary';
export const DEFAULT_MIN = 0;
export const DEFAULT_MAX = 100;
// Span used to synthesize a max when the given one is invalid (non-finite or
// at/below min) — its own constant so changing the default ceiling never
// silently changes the fallback range.
export const DEFAULT_RANGE = 100;
export const DEFAULT_ARIA_LABEL = 'Progress';

// Shared ring geometry — the Track svg (viewBox + rail circle) and the
// Indicator arc circle must agree on these for the arc to sit on the rail.
export const RING_VIEWBOX = '0 0 40 40';
export const RING_CENTER = 20;
export const RING_RADIUS = 18;
