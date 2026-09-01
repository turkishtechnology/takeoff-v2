import type { TimePickerFormat, TimePickerLabels, TimePickerMeridiemPlacement, TimePickerMode, TimePickerSize, TimePickerType } from './types';

export const DEFAULT_MODE: TimePickerMode = 'columns';
export const DEFAULT_TYPE: TimePickerType = 'basic';
export const DEFAULT_SIZE: TimePickerSize = 'base';
export const DEFAULT_TIME_FORMAT: TimePickerFormat = '24';
export const DEFAULT_MERIDIEM: TimePickerMeridiemPlacement = 'column';

export const DEFAULT_HOUR_STEP = 1;
export const DEFAULT_MINUTE_STEP = 1;
export const DEFAULT_SECOND_STEP = 1;

/**
 * English names, because the package has no locale layer: Calendar takes its
 * month names from the consumer for the same reason. Merged per key, so an app
 * translating only `hour` / `minute` keeps the rest.
 */
export const DEFAULT_LABELS: Required<TimePickerLabels> = {
  hour: 'Hour',
  minute: 'Minute',
  second: 'Second',
  meridiem: 'AM/PM',
  am: 'AM',
  pm: 'PM',
};

/**
 * Cells a `columns` column shows: the value, plus one neighbour each side. The
 * design draws exactly three, and the middle one is what the selection band
 * sits behind — a different count would move the band off centre.
 */
export const COLUMN_NEIGHBOURS = 1;

/** PageUp / PageDown move by this many steps, the coarse increment from the APG spinbutton pattern. */
export const PAGE_STEP_MULTIPLIER = 5;

/** Positions on the dial, one per clock hour. */
export const DIAL_POSITIONS = 12;

/** Minutes between two dial positions — 60 / {@link DIAL_POSITIONS}. */
export const DIAL_MINUTE_STEP = 5;
