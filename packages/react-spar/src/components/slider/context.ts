import type { RefObject } from 'react';

import { createSafeContext } from '../../hooks';

import type { SliderBounds } from './helpers';
import type { SliderOrientation } from './types';

export interface SliderContextValue {
  /** Committed thumb values — one entry for a single slider, two ascending entries for a range. */
  values: number[];
  /** Resolved `min` / `max` / `step`; every part reads the bounds from here so the ARIA surface and the rendered offsets cannot drift. */
  bounds: SliderBounds;
  /** Mirrors the root's `range` prop. */
  range: boolean;
  /** Minimum gap kept between adjacent range thumbs, in value units; each thumb subtracts it from its neighbour when publishing `aria-valuemin` / `aria-valuemax`, so a handle never announces a bound its clamp forbids. */
  minDistance: number;
  /** Axis the rail runs along; every part reads it so the geometry and the ARIA surface stay in step. */
  orientation: SliderOrientation;
  /** Resolved disabled state (own prop or inherited from a surrounding `Field`). */
  disabled: boolean;
  /** Resolved read-only state — the value renders but no interaction commits. */
  readOnly: boolean;
  /** Resolved invalid state; thumbs expose it as `aria-invalid`. */
  invalid: boolean;
  /** Resolved required state; thumbs expose it as `aria-required`. */
  required: boolean;
  /** Index of the thumb currently being dragged, or `null` when idle. */
  draggingIndex: number | null;
  /** Attached by `Slider.Track`; the root measures it to map pointer coordinates onto the value scale. */
  trackRef: RefObject<HTMLDivElement | null>;
  /** Each thumb registers its node here by index so the root can move focus onto the handle a drag or track press activates — including the swapped handle after a drag crosses its neighbour. */
  thumbRefs: RefObject<(HTMLElement | null)[]>;
  /** Each thumb registers its resolved disabled state here by index; the root reads it to skip disabled handles as drag/keyboard targets and to treat them as walls a neighbour cannot push past. */
  thumbDisabledRef: RefObject<boolean[]>;
  /** Formats a value for the drag tooltip and `aria-valuetext`; `undefined` when the consumer passed no formatter. */
  formatValue?: (value: number) => string;
  /** Moves a thumb from the keyboard, clamping it against its neighbour. */
  setThumbValue: (index: number, next: number) => void;
  /** Starts a drag on `index`. `seek` moves the thumb to `point` along the active axis — a track press seeks, a thumb grab does not, so grabbing a handle never jumps its value. */
  startDrag: (index: number, point: number, seek: boolean) => void;
  /** Maps a viewport coordinate along the active axis onto the value scale, using the measured track. */
  valueFromPoint: (point: number) => number;
  /** `id` a surrounding `Field.Label` points its `htmlFor` at; taken by the first thumb so the label focuses a real control. */
  fieldId?: string;
  /** `id` of the surrounding `Field.Label`; range thumbs reference it alongside their own accessible name. */
  labelId?: string;
  /** `id` of the surrounding Field's description, or its error message while invalid. */
  describedBy?: string;
}

export const [SliderProvider, useSliderContext] = createSafeContext<SliderContextValue>('SliderProvider');
