import { DIAL_MINUTE_STEP, DIAL_POSITIONS } from './defaults';
import type { TimePickerFormat, TimePickerUnit } from './types';

/**
 * A time of day, detached from any date. The wrapper reasons in this shape and
 * only rejoins a `Date` when it commits, so the date part of a bound — or of a
 * value being edited — can never leak into the arithmetic.
 */
export interface TimeParts {
  hour: number;
  minute: number;
  second: number;
}

export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const HOURS_PER_HALF_DAY = 12;

/** Reads the time of day out of a `Date`, in local time as the rest of the package does. */
export const toTimeParts = (date: Date): TimeParts => ({ hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() });

/** Rejoins a time of day with a day, keeping that day's year/month/date and dropping sub-second precision. */
export const withTimeParts = (day: Date, parts: TimeParts): Date => new Date(day.getFullYear(), day.getMonth(), day.getDate(), parts.hour, parts.minute, parts.second, 0);

/** Seconds since midnight — the scalar every comparison runs on. */
export const toDaySeconds = ({ hour, minute, second }: TimeParts): number => (hour * MINUTES_PER_HOUR + minute) * SECONDS_PER_MINUTE + second;

export const timePartsEqual = (left: TimeParts, right: TimeParts): boolean => left.hour === right.hour && left.minute === right.minute && left.second === right.second;

/** Midnight on the day of `date` — the reference day an emitted time falls on while nothing is selected. */
export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Bounds, already reduced to seconds since midnight. `undefined` on either end
 * means unbounded; the date part of the `Date` a consumer passed is dropped
 * here, which is what makes `minTime` / `maxTime` a time of day rather than a
 * moment.
 */
export interface TimeBounds {
  min?: number;
  max?: number;
}

export const toTimeBounds = (minTime?: Date, maxTime?: Date): TimeBounds => ({
  min: minTime ? toDaySeconds(toTimeParts(minTime)) : undefined,
  max: maxTime ? toDaySeconds(toTimeParts(maxTime)) : undefined,
});

export const isWithinBounds = (parts: TimeParts, bounds: TimeBounds): boolean => {
  const seconds = toDaySeconds(parts);
  if (bounds.min !== undefined && seconds < bounds.min) return false;
  if (bounds.max !== undefined && seconds > bounds.max) return false;
  return true;
};

/** Seconds since midnight back into a time of day. */
export const fromDaySeconds = (seconds: number): TimeParts => ({
  hour: Math.floor(seconds / (MINUTES_PER_HOUR * SECONDS_PER_MINUTE)),
  minute: Math.floor(seconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR,
  second: seconds % SECONDS_PER_MINUTE,
});

/**
 * Pulls a time inside the bounds, landing **on** the bound it crossed.
 *
 * The bound wins over the step grid on purpose: `minTime` is documented as
 * inclusive, so a 09:07 floor stays reachable under a 15-minute step. The
 * column that renders the value splices it into its list for the same reason —
 * see {@link unitValues}.
 */
export const clampToBounds = (parts: TimeParts, bounds: TimeBounds): TimeParts => {
  const seconds = toDaySeconds(parts);
  if (bounds.min !== undefined && seconds < bounds.min) return fromDaySeconds(bounds.min);
  if (bounds.max !== undefined && seconds > bounds.max) return fromDaySeconds(bounds.max);
  return parts;
};

/** Steps below 1 (or non-integer) would generate an unbounded or fractional column. */
export const resolveStep = (step: number | undefined, fallback: number): number => (typeof step === 'number' && Number.isInteger(step) && step >= 1 ? step : fallback);

/** `0` for AM, `1` for PM — the unit's value, in the same integer shape as the other three. */
export const meridiemOf = ({ hour }: TimeParts): 0 | 1 => (hour >= HOURS_PER_HALF_DAY ? 1 : 0);

/**
 * The value a unit currently holds, in the numbering that unit is *displayed*
 * in: a 12-hour clock shows 1–12, so midnight reads as 12 rather than 0.
 */
export const unitValue = (parts: TimeParts, unit: TimePickerUnit, format: TimePickerFormat): number => {
  switch (unit) {
    case 'hour':
      return format === '12' ? ((parts.hour + HOURS_PER_HALF_DAY - 1) % HOURS_PER_HALF_DAY) + 1 : parts.hour;
    case 'minute':
      return parts.minute;
    case 'second':
      return parts.second;
    case 'meridiem':
      return meridiemOf(parts);
  }
};

/**
 * Writes a displayed value back onto the time. The two 12-hour units are the
 * only interesting cases: an hour keeps the half-day it is in, and switching
 * the half-day keeps the hour — which is what makes the AM/PM column a toggle
 * rather than a twelve-hour jump.
 */
export const withUnitValue = (parts: TimeParts, unit: TimePickerUnit, format: TimePickerFormat, value: number): TimeParts => {
  switch (unit) {
    case 'hour':
      return { ...parts, hour: format === '12' ? (value % HOURS_PER_HALF_DAY) + meridiemOf(parts) * HOURS_PER_HALF_DAY : value };
    case 'minute':
      return { ...parts, minute: value };
    case 'second':
      return { ...parts, second: value };
    case 'meridiem':
      return { ...parts, hour: (parts.hour % HOURS_PER_HALF_DAY) + value * HOURS_PER_HALF_DAY };
  }
};

/** Step size for a unit; the meridiem has two values and no step of its own. */
const stepOf = (unit: TimePickerUnit, steps: TimePickerSteps): number => {
  switch (unit) {
    case 'hour':
      return steps.hour;
    case 'minute':
      return steps.minute;
    case 'second':
      return steps.second;
    case 'meridiem':
      return 1;
  }
};

export interface TimePickerSteps {
  hour: number;
  minute: number;
  second: number;
}

/**
 * Every value a unit's column offers, ascending.
 *
 * `current` is spliced in when the grid misses it, which happens whenever a
 * bound lands off-step (`minTime` 09:07 under a 15-minute step) or a consumer
 * hands in a value that was never on the grid. Without it the rendered column
 * would have no cell for the value it is showing, and its neighbours would be
 * read from the wrong position.
 */
export const unitValues = (unit: TimePickerUnit, format: TimePickerFormat, steps: TimePickerSteps, current: number): number[] => {
  if (unit === 'meridiem') return [0, 1];

  const step = stepOf(unit, steps);

  // A twelve-hour clock prints midnight and noon as `12`, so a column ordered
  // 1…12 puts the first hour of the half-day last. Everything that reads the
  // column as ordered — the bounds scan below, Home / End, the arrows — would
  // then have midnight following 11pm. Build it on the underlying 0…11 instead
  // and print the zero as `12`, which also lands the step grid on the same
  // hours a 24-hour clock steps through.
  if (unit === 'hour' && format === '12') {
    const values: number[] = [];
    for (let value = 0; value < HOURS_PER_HALF_DAY; value += step) values.push(value);

    const currentInHalfDay = current % HOURS_PER_HALF_DAY;
    if (!values.includes(currentInHalfDay)) values.push(currentInHalfDay);

    return values.sort((left, right) => left - right).map(value => value || HOURS_PER_HALF_DAY);
  }

  const last = unit === 'hour' ? HOURS_PER_DAY - 1 : MINUTES_PER_HOUR - 1;

  const values: number[] = [];
  for (let value = 0; value <= last; value += step) values.push(value);
  if (!values.includes(current) && current >= 0 && current <= last) values.push(current);

  return values.sort((left, right) => left - right);
};

/** Units finer than the given one, coarsest first. The meridiem is the coarsest of the four. */
const finerUnits = (unit: TimePickerUnit): TimePickerUnit[] => {
  switch (unit) {
    case 'meridiem':
      return ['hour', 'minute', 'second'];
    case 'hour':
      return ['minute', 'second'];
    case 'minute':
      return ['second'];
    case 'second':
      return [];
  }
};

/**
 * Whether a column may offer `value`.
 *
 * A coarse unit is judged by whether **any** finer combination it allows falls
 * inside the bounds, not by whether the currently shown one does. Under a
 * `maxTime` of 10:15, the hour 10 stays selectable and picking it pulls the
 * minutes down to 15 (the caller clamps); the alternative — judging 10 by the
 * minute that happens to be showing — makes the hour unreachable from 10:45 and
 * leaves the column with no way back.
 *
 * `freeUnits` is what the body actually renders: with no seconds column the
 * second is pinned to the value's own, so it is not free to help a bound pass.
 */
export const isUnitValueEnabled = (
  unit: TimePickerUnit,
  value: number,
  parts: TimeParts,
  format: TimePickerFormat,
  steps: TimePickerSteps,
  bounds: TimeBounds,
  freeUnits: readonly TimePickerUnit[],
  isUnavailable?: (candidate: TimeParts, unit: TimePickerUnit) => boolean,
): boolean => {
  const candidate = withUnitValue(parts, unit, format, value);

  // Asked about the candidate itself, not about every finer time inside it: a
  // consumer answering per unit costs one call per cell, where resolving "is
  // any second of this hour free" would cost 3600.
  if (isUnavailable?.(candidate, unit)) return false;

  if (bounds.min === undefined && bounds.max === undefined) return true;
  const free = finerUnits(unit).filter(finer => freeUnits.includes(finer));

  let low = candidate;
  let high = candidate;
  for (const finer of free) {
    const values = unitValues(finer, format, steps, unitValue(candidate, finer, format));
    low = withUnitValue(low, finer, format, values[0]);
    high = withUnitValue(high, finer, format, values[values.length - 1]);
  }

  const lowSeconds = toDaySeconds(low);
  const highSeconds = toDaySeconds(high);

  return (bounds.max === undefined || lowSeconds <= bounds.max) && (bounds.min === undefined || highSeconds >= bounds.min);
};

/**
 * The next selectable value `offset` positions away, or `undefined` when the
 * column has no such value. Disabled values are skipped rather than landed on,
 * so a held arrow key walks past a blocked stretch instead of stalling on it.
 */
export const stepUnitValue = (values: number[], current: number, offset: number, isEnabled: (value: number) => boolean): number | undefined => {
  const index = values.indexOf(current);
  if (index === -1) return undefined;

  const direction = Math.sign(offset);
  let remaining = Math.abs(offset);
  let cursor = index;
  let landed: number | undefined;

  while (remaining > 0) {
    cursor += direction;
    if (cursor < 0 || cursor >= values.length) break;
    if (!isEnabled(values[cursor])) continue;
    landed = values[cursor];
    remaining -= 1;
  }

  return landed;
};

/** First or last selectable value of a column, for Home / End. */
export const edgeUnitValue = (values: number[], edge: 'first' | 'last', isEnabled: (value: number) => boolean): number | undefined => {
  const ordered = edge === 'first' ? values : [...values].reverse();
  return ordered.find(isEnabled);
};

/** Two digits, as every rendered time value in the design is. */
export const padTime = (value: number): string => String(value).padStart(2, '0');

/**
 * The value a form submits: `HH:mm`, or `HH:mm:ss` once seconds are on show.
 *
 * This is what a native `<input type="time">` submits, so a server that already
 * parses one needs no new case — and unlike an ISO instant it carries no day or
 * offset the picker never asked about.
 */
export const toFormValue = (parts: TimeParts, withSeconds: boolean): string => `${padTime(parts.hour)}:${padTime(parts.minute)}${withSeconds ? `:${padTime(parts.second)}` : ''}`;

/**
 * One mark on the dial: the value it commits, the clock position it sits at,
 * and which ring carries it.
 */
export interface DialMark {
  value: number;
  /** 0 at the top, clockwise. Both rings share the twelve positions. */
  position: number;
  ring: 'outer' | 'inner';
}

/**
 * The hours the dial offers, in the same displayed numbering the hour column
 * uses.
 *
 * A 12-hour clock has twelve hours and twelve positions, so one ring carries
 * them. A 24-hour clock has twice as many: 00–11 take the outer ring and 12–23
 * the inner one, at the same twelve angles — the whole day on the face at once.
 * Showing only the half-day the value happens to be in would leave the other
 * twelve hours unreachable, since a 24-hour panel has no meridiem control to
 * move between them.
 */
export const dialHourMarks = (format: TimePickerFormat): DialMark[] => {
  if (format === '12') {
    return Array.from({ length: DIAL_POSITIONS }, (_, position) => ({
      value: position === 0 ? HOURS_PER_HALF_DAY : position,
      position,
      ring: 'outer' as const,
    }));
  }

  return Array.from({ length: HOURS_PER_DAY }, (_, hour) => ({
    value: hour,
    position: hour % DIAL_POSITIONS,
    ring: hour < DIAL_POSITIONS ? ('outer' as const) : ('inner' as const),
  }));
};

/** The minutes the dial offers — one every five, on the outer ring. */
export const dialMinuteMarks = (): DialMark[] =>
  Array.from({ length: DIAL_POSITIONS }, (_, position) => ({ value: position * DIAL_MINUTE_STEP, position, ring: 'outer' as const }));

/** Which ring an hour sits on, for the hand that has to reach it. */
export const dialHourRing = (parts: TimeParts, format: TimePickerFormat): 'outer' | 'inner' => (format === '24' && parts.hour >= DIAL_POSITIONS ? 'inner' : 'outer');

/** Degrees clockwise from the top for a dial position. */
export const dialAngle = (position: number): number => (position * 360) / DIAL_POSITIONS;
