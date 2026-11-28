import { createSafeContext } from '../../hooks';

import type { TimeBounds, TimeParts, TimePickerSteps } from './helpers';
import type { TimePickerFormat, TimePickerLabels, TimePickerMeridiemPlacement, TimePickerMode, TimePickerUnit } from './types';

export interface TimePickerContextValue {
  /** The time the body renders: the committed value, or the reference time while nothing is picked. */
  parts: TimeParts;
  /** False until the first commit; the root mirrors it as `data-empty` so the recipe can dim an untouched panel. */
  hasValue: boolean;
  mode: TimePickerMode;
  /** Mirrors the root's `compact`; the `dial` body reads it to stack rather than sit side by side. */
  compact: boolean;
  timeFormat: TimePickerFormat;
  /** Where AM/PM is picked. The unit stays in {@link units} either way — only its rendering moves. */
  meridiem: TimePickerMeridiemPlacement;
  /** Called by `TimePicker.Meridiem` on mount; the root only warns about a missing toggle when none reports in. */
  registerMeridiem: (present: boolean) => void;
  steps: TimePickerSteps;
  /** `minTime` / `maxTime` reduced to seconds since midnight. */
  bounds: TimeBounds;
  /**
   * The consumer's `isTimeUnavailable`, already rejoined with the day the panel
   * commits on so the parts the body reasons in never leak out as a public
   * type. `undefined` when no predicate was passed.
   */
  isUnavailable?: (candidate: TimeParts, unit: TimePickerUnit) => boolean;
  /** Merged over {@link DEFAULT_LABELS}, so every key is present. */
  labels: Required<TimePickerLabels>;
  /**
   * The units this panel carries, coarsest-to-finest in reading order. Also what
   * decides which finer units are free to satisfy a bound: a second that has no
   * control is pinned to the value's own and cannot help one pass. A meridiem
   * rendered as a toggle is still listed here — it moved, it did not go away.
   */
  units: readonly TimePickerUnit[];
  /** Resolved disabled state (own prop or inherited from a surrounding `Field`). */
  disabled: boolean;
  /** Resolved read-only state — the value renders but no interaction commits. */
  readOnly: boolean;
  /** Resolved invalid state, published as `aria-invalid` on every spinbutton. */
  invalid: boolean;
  /** Resolved required state, published as `aria-required` on every spinbutton. */
  required: boolean;
  /**
   * Writes a displayed unit value, clamping the finer units back inside the
   * bounds. A no-op while disabled or read-only, so callers do not each repeat
   * the guard.
   */
  setUnitValue: (unit: TimePickerUnit, value: number) => void;
  /** Which field the dial edits. `clock` only; `basic` has a column per unit and no active one. */
  activeUnit: 'hour' | 'minute';
  setActiveUnit: (unit: 'hour' | 'minute') => void;
  /** `id` of the surrounding Field's description, or its error message while invalid. */
  describedBy?: string;
}

export const [TimePickerProvider, useTimePickerContext] = createSafeContext<TimePickerContextValue>('TimePickerProvider');
