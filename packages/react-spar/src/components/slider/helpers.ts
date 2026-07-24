import type { CSSProperties } from 'react';

import { DEFAULT_MAX, DEFAULT_MIN, DEFAULT_SPAN, DEFAULT_STEP, RANGE_THUMB_LABELS } from './defaults';
import type { SliderOrientation, SliderValue } from './types';

/** Resolved numeric surface every part reads from. */
export interface SliderBounds {
  min: number;
  max: number;
  step: number;
}

export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

// Number of decimals a value carries, including the exponent form Number
// stringifies small steps into (1e-7). Used to re-round after step math so
// `0.1 * 3` does not surface as 0.30000000000000004 in the committed value.
const decimalsOf = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  const text = String(value);
  const exponent = text.indexOf('e-');
  if (exponent !== -1) {
    const fraction = text.slice(0, exponent).split('.')[1]?.length ?? 0;
    return fraction + Number(text.slice(exponent + 2));
  }
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
};

const roundTo = (value: number, decimals: number): number => (decimals > 0 ? Number(value.toFixed(Math.min(decimals, 15))) : Math.round(value));

/**
 * Resolves the numeric surface in one place so the ARIA attributes, the
 * rendered offsets, and the committed value can never disagree: non-finite
 * bounds fall back to the defaults, a max at or below min falls back to a
 * DEFAULT_SPAN above min, and a non-positive step falls back to the default.
 */
export const resolveBounds = (rawMin: number = DEFAULT_MIN, rawMax: number = DEFAULT_MAX, rawStep: number = DEFAULT_STEP): SliderBounds => {
  const min = Number.isFinite(rawMin) ? rawMin : DEFAULT_MIN;
  const max = Number.isFinite(rawMax) && rawMax > min ? rawMax : min + DEFAULT_SPAN;
  const step = Number.isFinite(rawStep) && rawStep > 0 ? rawStep : DEFAULT_STEP;
  return { min, max, step };
};

/** Snaps a raw value onto the step grid counted from `min`, then clamps it. */
export const snap = (value: number, { min, max, step }: SliderBounds): number => {
  if (!Number.isFinite(value)) return min;
  const steps = Math.round((value - min) / step);
  const snapped = min + steps * step;
  return clamp(roundTo(snapped, Math.max(decimalsOf(step), decimalsOf(min))), min, max);
};

/**
 * `(… * 100) / span` rather than a pre-divided fraction keeps round
 * percentages exact (0.3 * 100 floats to 30.000000000000004); the clamp
 * re-tightens boundary cases IEEE-754 division can nudge past the edge.
 */
export const toPercent = (value: number, { min, max }: SliderBounds): number => clamp(((value - min) * 100) / (max - min), 0, 100);

/** Inverse of `toPercent` — maps a 0–1 track ratio back onto the value scale. */
export const fromRatio = (ratio: number, { min, max }: SliderBounds): number => min + ratio * (max - min);

/** The rail box, as much of it as the geometry needs. */
export interface RailRect {
  left: number;
  width: number;
  bottom: number;
  height: number;
}

/** Reads the event coordinate that travels along the rail. */
export const pointerCoord = (event: { clientX: number; clientY: number }, orientation: SliderOrientation): number => (orientation === 'vertical' ? event.clientY : event.clientX);

/**
 * Maps a pointer coordinate onto the value scale using the measured rail.
 * Kept pure — free of the ref read — so the geometry is unit-testable without
 * a DOM, and so both axes resolve through exactly one function.
 *
 * A vertical rail runs bottom-to-top: its bottom edge is `min`, so the ratio is
 * measured upward from it and the axis inverts relative to horizontal.
 */
export const valueFromPointer = (rect: RailRect, point: number, bounds: SliderBounds, orientation: SliderOrientation): number => {
  const ratio = orientation === 'vertical' ? (rect.height === 0 ? 0 : (rect.bottom - point) / rect.height) : rect.width === 0 ? 0 : (point - rect.left) / rect.width;
  return snap(fromRatio(clamp(ratio, 0, 1), bounds), bounds);
};

/**
 * Positions a part along the rail. Written as an inline style because a
 * continuous value is not a `data-*` hook; the logical property flips with the
 * axis so the same percentage reads correctly in both orientations (and in RTL
 * for the horizontal one).
 */
export const offsetStyle = (percent: number, orientation: SliderOrientation): CSSProperties =>
  orientation === 'vertical' ? { insetBlockEnd: `${percent}%` } : { insetInlineStart: `${percent}%` };

/** Offsets *and* sizes a band along the rail — the filled portion. */
export const bandStyle = (start: number, end: number, orientation: SliderOrientation): CSSProperties =>
  orientation === 'vertical' ? { insetBlockEnd: `${start}%`, height: `${end - start}%` } : { insetInlineStart: `${start}%`, width: `${end - start}%` };

/**
 * Normalizes any accepted value shape into the internal thumb array: one
 * entry for a single slider, two ascending entries for a range. Every entry
 * is snapped and clamped, so an out-of-range or off-grid prop can never reach
 * the rendered offsets.
 */
export const normalizeValues = (value: SliderValue | undefined, range: boolean, bounds: SliderBounds): number[] => {
  if (range) {
    const seeded = Array.isArray(value) && value.length >= 2 ? value : [bounds.min, bounds.max];
    // Sorted rather than pair-swapped so any handle count normalizes the same
    // way: the array a consumer passes decides how many thumbs render.
    return seeded.map(entry => snap(entry, bounds)).sort((a, b) => a - b);
  }
  return [snap(Array.isArray(value) ? value[0] : (value ?? bounds.min), bounds)];
};

/** Converts the internal thumb array back into the committed public shape. */
export const toCommittedValue = (values: number[], range: boolean): SliderValue => (range ? [...values] : values[0]);

/**
 * Form field name for one thumb of a range. A two-handle range keeps the
 * conventional `-min` / `-max` pair; past two there is no min/max pairing, so
 * each handle submits under a 1-based positional suffix instead — every value
 * still reaches the form.
 */
export const rangeInputName = (name: string, index: number, count: number): string => (count === 2 ? (index === 0 ? `${name}-min` : `${name}-max`) : `${name}-${index + 1}`);

export const valuesEqual = (a: number[], b: number[]): boolean => a.length === b.length && a.every((entry, index) => entry === b[index]);

/**
 * Accessible name for a handle. A two-handle range reads best as
 * minimum/maximum; beyond that the pair vocabulary breaks down, so the name
 * falls back to the handle's position. A single slider takes its name from the
 * surrounding Field (or a consumer `aria-label`) instead.
 */
export const thumbLabel = (index: number, count: number): string | undefined => {
  if (count < 2) return undefined;
  if (count === 2) return RANGE_THUMB_LABELS[index];
  return `Value ${index + 1}`;
};

/**
 * Index of the thumb a track press should grab. Ties (the press landing
 * exactly between two thumbs, including both thumbs resting on the same
 * value) resolve to the later thumb so a range collapsed at `min` can still
 * be opened by pressing to its right.
 *
 * A `disabled` handle is skipped so the press grabs the nearest *movable*
 * thumb instead of dead-ending on a handle it cannot drag. If every thumb is
 * disabled the nearest one is returned anyway (the caller's own disabled guard
 * then no-ops the press).
 */
export const closestThumbIndex = (values: number[], target: number, disabled: boolean[] = []): number => {
  let index = 0;
  let best = Infinity;
  let found = false;
  values.forEach((entry, current) => {
    if (disabled[current]) return;
    const distance = Math.abs(entry - target);
    if (distance <= best) {
      best = distance;
      index = current;
      found = true;
    }
  });
  if (found) return index;

  values.forEach((entry, current) => {
    const distance = Math.abs(entry - target);
    if (distance <= best) {
      best = distance;
      index = current;
    }
  });
  return index;
};

/**
 * The `[min, max]` value slot a thumb may occupy: bounded by its neighbours,
 * pulled in by `minDistance` so adjacent thumbs keep a gap (0 = touching
 * allowed). The keyboard clamp, the drag clamp, and each thumb's
 * `aria-valuemin` / `aria-valuemax` all read from here so they can never
 * disagree.
 *
 * When two neighbours sit closer than `2 × minDistance` the gap cannot be
 * honoured and the gapped bounds invert (`lower > upper`); an unguarded clamp
 * then collapses the value below its left neighbour — a non-ascending array and
 * an inverted ARIA range. The gap is simply unsatisfiable there, so we fall
 * back to the hard neighbour bounds and let the thumbs touch.
 */
export const thumbBounds = (values: number[], index: number, bounds: SliderBounds, minDistance = 0): { min: number; max: number } => {
  const hardLower = index > 0 ? values[index - 1] : bounds.min;
  const hardUpper = index < values.length - 1 ? values[index + 1] : bounds.max;
  const lower = index > 0 ? hardLower + minDistance : bounds.min;
  const upper = index < values.length - 1 ? hardUpper - minDistance : bounds.max;
  return lower <= upper ? { min: lower, max: upper } : { min: hardLower, max: hardUpper };
};

/**
 * Writes `next` into `index`, keeping the array ascending by clamping against
 * the neighbouring thumb. Used by the keyboard surface, where a thumb must
 * never jump past its neighbour. `minDistance` widens that clamp so adjacent
 * thumbs keep a gap (0 = touching allowed). A disabled neighbour is already a
 * wall here, since the clamp stops at its value.
 */
export const withThumbClamped = (values: number[], index: number, next: number, bounds: SliderBounds, minDistance = 0): number[] => {
  const { min: lower, max: upper } = thumbBounds(values, index, bounds, minDistance);
  const updated = [...values];
  updated[index] = clamp(snap(next, bounds), lower, upper);
  return updated;
};

/**
 * Drag counterpart of `withThumbClamped`: when the dragged thumb crosses its
 * neighbour the two swap roles instead of sticking, matching Takeoff Core's
 * `tk-slider`. Returns the reordered values plus the index the pointer now
 * controls, which the caller keeps dragging.
 *
 * Crossing is turned off when a `minDistance` gap is required, or when an
 * adjacent thumb is `disabled` (a wall the dragged handle cannot push): in
 * either case the handle clamps against its neighbours and keeps its index.
 */
export const withThumbSwapped = (
  values: number[],
  index: number,
  next: number,
  bounds: SliderBounds,
  minDistance = 0,
  disabled: boolean[] = [],
): { values: number[]; index: number } => {
  const lowerBlocked = index > 0 && disabled[index - 1];
  const upperBlocked = index < values.length - 1 && disabled[index + 1];

  if (minDistance > 0 || lowerBlocked || upperBlocked) {
    const { min: lower, max: upper } = thumbBounds(values, index, bounds, minDistance);
    const updated = [...values];
    updated[index] = clamp(snap(next, bounds), lower, upper);
    return { values: updated, index };
  }

  const updated = [...values];
  updated[index] = snap(next, bounds);

  let active = index;
  while (active > 0 && updated[active] < updated[active - 1]) {
    [updated[active], updated[active - 1]] = [updated[active - 1], updated[active]];
    active -= 1;
  }
  while (active < updated.length - 1 && updated[active] > updated[active + 1]) {
    [updated[active], updated[active + 1]] = [updated[active + 1], updated[active]];
    active += 1;
  }

  return { values: updated, index: active };
};

/**
 * The display convention for a value, shared by the drag tooltip and
 * `Slider.Value` so the two readouts can never disagree: the root's formatter
 * when there is one, the raw number otherwise.
 */
export const formatValueText = (value: number, formatValue?: (value: number) => string): string => formatValue?.(value) ?? String(value);

/** Tick positions for `Slider.Ticks`, or `null` when the grid is too dense. */
export const tickPercents = ({ min, max, step }: SliderBounds, limit: number): number[] | null => {
  const raw = (max - min) / step;
  // Snap IEEE-754 dust off the quotient before flooring: an exact grid like
  // 0–1 @ step 0.1 divides as 9.999999999999998, so a bare `Math.floor` would
  // drop the tick at `max`. Round only when raw sits within a hair of an
  // integer; a genuinely off-grid max still floors to the last whole step.
  const steps = Math.abs(raw - Math.round(raw)) < 1e-9 ? Math.round(raw) : Math.floor(raw);
  const count = steps + 1;
  if (count > limit) return null;
  return Array.from({ length: count }, (_, index) => toPercent(min + index * step, { min, max, step }));
};
