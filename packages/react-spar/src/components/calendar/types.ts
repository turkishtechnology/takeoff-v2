import type { Ref } from 'react';
import type { DateRange, PropsBase as DayPickerBaseProps } from 'react-day-picker';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/**
 * Calendar is the catalog's second **third-party-engine** component (Table is the
 * first): its state core is `react-day-picker`, not a Spar primitive — Spar ships
 * no date component. These public types are therefore **v2-owned** and carry no
 * `Pick<SparCalendarProps, …>` boundary; there is no `SparCalendar` to pick from,
 * so the `check-spar-pick.mjs` guard does not apply. Engine props are still
 * inherited through `Pick<DayPickerBaseProps, …>` rather than re-declared, so a
 * change upstream reaches this contract automatically. See
 * `calendar-contract.md`.
 */

/** Selection mode. Takeoff Core defines `single` / `range`; `multiple` extends it. */
export type CalendarMode = 'single' | 'range' | 'multiple';

/**
 * Grid scale → root `data-size`.
 *
 * Two values, not three: the design system defines exactly two day-cell sizes
 * for a picking grid (`datepicker-items-base-size` / `-small-size`). An input
 * row has a `large`, a month grid does not, so a component that pairs a field
 * with this grid should resolve its own `large` to `base` — the mapping Takeoff
 * Core makes (`size === 'small' ? 'small' : 'base'`).
 *
 * @defaultValue 'base'
 */
export type CalendarSize = 'small' | 'base';

/** A selected range. `to` is undefined while the range is half-picked. */
export type CalendarRange = DateRange;

/**
 * Slot vocabulary for `classNames` / `slotProps`. Calendar has a single public
 * component, so every anatomy node is reached through these keys rather than a
 * compound part — the nodes are rendered by the engine and are not
 * consumer-placeable (Table precedent, `calendar-contract.md` → Public compound
 * parts).
 */
export type CalendarSlot =
  | 'root'
  | 'months'
  | 'month'
  | 'nav'
  | 'previousMonthButton'
  | 'nextMonthButton'
  | 'chevron'
  | 'monthCaption'
  | 'captionLabel'
  | 'dropdowns'
  | 'dropdownRoot'
  | 'dropdown'
  | 'monthGrid'
  | 'weekdays'
  | 'weekday'
  | 'weeks'
  | 'week'
  | 'weekNumber'
  | 'weekNumberHeader'
  | 'day'
  | 'dayButton'
  | 'footer';

/**
 * First day of the week, `0` = Sunday. Takeoff Core's `firstDayOfWeekIndex`
 * vocabulary, mapped onto the engine's `weekStartsOn`.
 */
export type CalendarWeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Props shared by every selection mode.
 *
 * The `Pick<DayPickerBaseProps, …>` below is the layout/navigation,
 * localization and a11y-naming surface inherited from the engine. These pass
 * through untranslated because the engine owns the behavior behind each one.
 *
 * Excluded on purpose: `selected` / `onSelect` (renamed to the `value` /
 * `onValueChange` pair below, so there is one source of truth), `required`
 * (collides with the form-`required` semantics Spar's Field chain owns),
 * `disabled` / `hidden` raw matchers (the Core-vocabulary props above compile
 * down to them; exposing both would make precedence ambiguous), `modifiers` /
 * `modifiersClassNames` / `modifiersStyles` / `styles` / `components` /
 * `dateLib` (engine extension points — `components` and the `classNames` keys
 * are how this wrapper implements its own anatomy, so handing them to an
 * instance would let it delete `data-slot` anchors), the per-day DOM events
 * (`onDayClick` and friends — no Core counterpart, and `onValueChange` covers
 * selection), `animate` (its classes need keyframes this package's recipe does
 * not ship yet), and `className` / `style` (owned by the wrapper's own
 * `className` and `slotProps.root`).
 */
export interface CalendarOwnProps extends Pick<
  DayPickerBaseProps,
  | 'id'
  | 'month'
  | 'defaultMonth'
  | 'onMonthChange'
  | 'numberOfMonths'
  | 'pagedNavigation'
  | 'reverseMonths'
  | 'reverseYears'
  | 'hideNavigation'
  | 'disableNavigation'
  | 'captionLayout'
  | 'navLayout'
  | 'fixedWeeks'
  | 'hideWeekdays'
  | 'showOutsideDays'
  | 'showWeekNumber'
  | 'broadcastCalendar'
  | 'ISOWeek'
  | 'timeZone'
  | 'today'
  | 'autoFocus'
  | 'dir'
  | 'locale'
  | 'numerals'
  | 'formatters'
  | 'labels'
  | 'footer'
  | 'role'
  | 'aria-label'
  | 'aria-labelledby'
> {
  /**
   * Size scale → root `data-size`.
   * @defaultValue 'base'
   */
  size?: CalendarSize;
  /**
   * Earliest selectable date, inclusive. Bounds both navigation (the engine's
   * `startMonth`) and selection (a `{ before }` disabled matcher).
   */
  minDate?: Date;
  /**
   * Latest selectable date, inclusive. Bounds both navigation (the engine's
   * `endMonth`) and selection (an `{ after }` disabled matcher).
   */
  maxDate?: Date;
  /** Individual dates that cannot be selected. */
  disabledDates?: Date[];
  /**
   * Whitelist: when set, every date **not** listed is disabled. Combines with
   * `disabledDates` / `disabledWeekDays` / `minDate` / `maxDate` — a date must
   * pass all of them to be selectable.
   */
  allowedDates?: Date[];
  /** Weekday indices that cannot be selected, `0` = Sunday. */
  disabledWeekDays?: number[];
  /**
   * First day of the week, `0` = Sunday. Defaults to the locale's own first day.
   */
  firstDayOfWeekIndex?: CalendarWeekStart;
  /** Extra class on the root element. */
  className?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CalendarSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CalendarSlot>;
  /** Ref to the root element. */
  ref?: Ref<HTMLDivElement>;
}

/** Single-date selection (the default mode). */
export interface CalendarSingleProps extends CalendarOwnProps {
  /**
   * Selection mode.
   * @defaultValue 'single'
   */
  mode?: 'single';
  /** Selected date (controlled). */
  value?: Date;
  /** Initially selected date (uncontrolled). */
  defaultValue?: Date;
  /** Fires with the new selection, or `undefined` when it is cleared. */
  onValueChange?: (value: Date | undefined) => void;
}

/** Multiple discrete dates. */
export interface CalendarMultipleProps extends CalendarOwnProps {
  mode: 'multiple';
  /** Selected dates (controlled). */
  value?: Date[];
  /** Initially selected dates (uncontrolled). */
  defaultValue?: Date[];
  /** Fires with the new selection, or `undefined` when it is cleared. */
  onValueChange?: (value: Date[] | undefined) => void;
  /** Fewest dates that may be selected. */
  min?: number;
  /** Most dates that may be selected. */
  max?: number;
}

/** A continuous range. */
export interface CalendarRangeProps extends CalendarOwnProps {
  mode: 'range';
  /** Selected range (controlled). */
  value?: CalendarRange;
  /** Initially selected range (uncontrolled). */
  defaultValue?: CalendarRange;
  /** Fires with the new range, or `undefined` when it is cleared. */
  onValueChange?: (value: CalendarRange | undefined) => void;
  /** Fewest days the range may span. */
  min?: number;
  /** Most days the range may span. */
  max?: number;
  /** Forbid a range that would contain a disabled date. */
  excludeDisabled?: boolean;
}

/**
 * Public props for Calendar. The `mode` discriminant decides the shape of
 * `value` / `defaultValue` / `onValueChange`, mirroring the engine's own
 * discriminated union.
 */
export type CalendarProps = CalendarSingleProps | CalendarMultipleProps | CalendarRangeProps;

/** The union's value payload, for callers that need it non-narrowed. */
export type CalendarValue = Date | Date[] | CalendarRange | undefined;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Calendar: import('../../core').ComponentThemeConfig<CalendarProps, CalendarSlot>;
  }
}
