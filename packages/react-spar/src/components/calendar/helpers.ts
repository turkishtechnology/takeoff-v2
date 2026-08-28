import type { Ref } from 'react';
import type { Matcher } from 'react-day-picker';

/**
 * Same calendar day in local time. Deliberately not `date-fns`' `isSameDay`:
 * the comparison is three integer reads, and keeping it here means the wrapper
 * imports no date library of its own.
 */
export const isSameCalendarDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();

export interface CalendarRestrictions {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  allowedDates?: Date[];
  disabledWeekDays?: number[];
}

/**
 * Translates Takeoff Core's restriction vocabulary into the engine's `Matcher`
 * list. Pure prop mapping — step 4 of the upstream-first rule — so the engine
 * keeps owning what "disabled" means for a day.
 *
 * `minDate` / `maxDate` are inclusive, which is why they become `before` /
 * `after` matchers (the engine reads both exclusively).
 *
 * An **empty** `allowedDates` array is treated as "no whitelist", matching
 * Core's `allowedDates = []` default. A non-empty one disables every unlisted
 * day, and combines with the other restrictions rather than overriding them.
 */
export const buildDisabledMatchers = ({ minDate, maxDate, disabledDates, allowedDates, disabledWeekDays }: CalendarRestrictions): Matcher[] | undefined => {
  const matchers: Matcher[] = [];

  if (minDate) matchers.push({ before: minDate });
  if (maxDate) matchers.push({ after: maxDate });
  if (disabledDates?.length) matchers.push(disabledDates);
  if (disabledWeekDays?.length) matchers.push({ dayOfWeek: disabledWeekDays });
  if (allowedDates?.length) {
    const allowed = allowedDates;
    matchers.push((date: Date) => !allowed.some(candidate => isSameCalendarDay(candidate, date)));
  }

  return matchers.length ? matchers : undefined;
};

/** Writes a node into either ref form. Used to serve two refs from one node. */
export const assignRef = <T>(ref: Ref<T> | undefined, node: T | null): void => {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref) {
    (ref as { current: T | null }).current = node;
  }
};

/** Core pages years twelve at a time, aligned to a multiple of twelve. */
export const YEARS_PER_PAGE = 12;

export const yearPageStart = (year: number): number => Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;

/** A month is reachable while any part of it falls inside the bounds. */
export const isMonthInBounds = (year: number, month: number, minDate?: Date, maxDate?: Date): boolean => {
  if (minDate && new Date(year, month + 1, 0, 23, 59, 59, 999) < minDate) return false;
  if (maxDate && new Date(year, month, 1) > maxDate) return false;
  return true;
};

/** Same rule as {@link isMonthInBounds}, widened to the whole year. */
export const isYearInBounds = (year: number, minDate?: Date, maxDate?: Date): boolean => {
  if (minDate && year < minDate.getFullYear()) return false;
  if (maxDate && year > maxDate.getFullYear()) return false;
  return true;
};
