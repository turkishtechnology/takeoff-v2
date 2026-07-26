import type { SliderOrientation, SliderSize, SliderTooltip, SliderTrackMode, SliderVariant } from './types';

export const DEFAULT_ORIENTATION: SliderOrientation = 'horizontal';
export const DEFAULT_SIZE: SliderSize = 'base';
export const DEFAULT_VARIANT: SliderVariant = 'primary';
export const DEFAULT_TOOLTIP: SliderTooltip = 'auto';
export const DEFAULT_TRACK: SliderTrackMode = 'normal';

// No minimum gap between range thumbs by default; a positive value disables
// crossing (thumbs clamp against each other instead of swapping).
export const DEFAULT_MIN_DISTANCE = 0;

export const DEFAULT_MIN = 0;
export const DEFAULT_MAX = 100;
export const DEFAULT_STEP = 1;

// Span used to synthesize a max when the given one is invalid (non-finite or
// at/below min) — its own constant so changing the default ceiling never
// silently changes the fallback range. Mirrors Progress's DEFAULT_RANGE.
export const DEFAULT_SPAN = 100;

// PageUp/PageDown move by this multiple of `step`, the conventional coarse
// increment from the APG slider pattern.
export const PAGE_STEP_MULTIPLIER = 10;

// Ticks are one DOM node per step, so a fine step over a wide range can
// explode the tree (0–100 @ step 0.1 = 1001 nodes). Past this count the ticks
// are dropped with a dev-only warning rather than silently hanging the page.
export const MAX_TICKS = 100;

// Joins the two readouts of a range slider in `Slider.Value`. An en dash (not
// a hyphen) is the typographic convention for a numeric span.
export const RANGE_VALUE_SEPARATOR = ' – ';

// Accessible names for a two-handle range, where minimum/maximum reads better
// than a position. Ranges with more handles fall back to a positional name —
// see `thumbLabel` in helpers.
export const RANGE_THUMB_LABELS = ['Minimum', 'Maximum'] as const;
