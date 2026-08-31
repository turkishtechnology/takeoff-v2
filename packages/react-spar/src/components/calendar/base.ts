import { createComponentBase } from '../../core';

import type { CalendarProps, CalendarSlot } from './types';

/**
 * Single multi-slot base for the whole Calendar. Like Table, Calendar exposes no
 * public sub-components: every node below the root is rendered by the engine
 * (`react-day-picker`), so a consumer cannot place one. The wrapper reaches
 * those nodes through a `components` override map and addresses them by the slot
 * keys below (`classNames` / `slotProps`), which is the same surface a compound
 * part would have exposed.
 *
 * @archetype react-enhancement — Calendar has no upstream Spar primitive (Spar
 * ships no date/calendar component). The state engine is `react-day-picker` and
 * every emitted class name plus every `data-slot` anchor is v2-owned. See
 * `docs/component-authoring-contract.md` → Layer responsibilities.
 *
 * Data-attribute vocabulary (data-attribute-vocabulary.md rule 10 — Calendar is
 * a v2-owned react-enhancement over a third-party engine, so it records its
 * decisions here; the shipped entry lives under "Component-specific decisions →
 * Calendar"):
 *   Root:  data-size, data-header-type, data-view (v2 visual vocabulary) +
 *          data-slot.
 *   Caption trigger / month-year board: data-view names the board each one
 *          opens or shows; the board's cells carry data-selected / data-disabled
 *          because these nodes are wrapper-rendered, so the engine emits nothing
 *          for them.
 *   Every other node: data-slot only.
 *
 * @bypass Nav — the engine's `Nav` hard-codes chevron orientation (it never
 * flips for `dir="rtl"` outside `navLayout="around"`) and knows only month
 * paging, so it cannot carry Core's year arrows or page a month/year board. The
 * override rebuilds the row but still delegates day-view clicks to the engine's
 * own handlers, so `pagedNavigation`, `numberOfMonths` and the navigation
 * bounds stay upstream.
 *
 * `navLayout="around"` is the one layout the engine never asks `Nav` for — it
 * renders the two month buttons itself, inside the month — so the
 * `PreviousMonthButton` / `NextMonthButton` overrides carry the board stepping
 * there instead. That row has no place for the year pair, the same way a
 * `dropdown*` caption has none, and needs none: on the year board the single
 * arrows step a year, which walks off the end of a twelve-year page on its own.
 *
 * @bypass Chevron — the engine draws inline polygons; icon rendering is a
 * takeoff-spar responsibility, so the glyph comes from `@takeoff-icons`.
 *
 * @bypass MonthGrid — `react-day-picker` has no month or year view, so the
 * `view` boards are wrapper-rendered: `MonthGrid` swaps the body while a board
 * is open. Only the body is replaced — the displayed month stays the engine's
 * through `goToMonth`, and a board belongs to the calendar rather than to a
 * month, so `numberOfMonths` is mapped to 1 for as long as one is open (a prop
 * mapping, not a fourth override).
 *
 * Deliberately **not** mirrored (rule 7 — the engine already owns them):
 *   Root:     data-mode, data-required, data-multiple-months, data-week-numbers,
 *             data-broadcast-calendar, data-nav-layout
 *   Day cell: data-day, data-month, data-selected, data-disabled, data-hidden,
 *             data-outside, data-focused, data-today
 * The recipe consumes those attributes directly rather than a wrapper copy.
 *
 * One documented gap: `dropdownRoot` (the span wrapping the month/year
 * `<select>`, rendered only by `captionLayout="dropdown*"`) is **class-only** —
 * the engine hardcodes that node's attributes, so it receives no `data-slot`
 * and `slotProps.dropdownRoot` does not reach it. Reimplementing the engine's
 * dropdown composition to win one anchor is not worth the upstream-drift risk;
 * the `<select>` itself, which carries the semantics, is anchored as `dropdown`.
 */
export const CalendarBase = createComponentBase<CalendarProps, CalendarSlot>({
  name: 'Calendar',
  slots: [
    'root',
    'months',
    'month',
    'nav',
    'previousMonthButton',
    'nextMonthButton',
    'previousYearButton',
    'nextYearButton',
    'chevron',
    'monthCaption',
    'captionLabel',
    'captionTrigger',
    'dropdowns',
    'dropdownRoot',
    'dropdown',
    'monthGrid',
    'monthYearGrid',
    'monthYearCell',
    'weekdays',
    'weekday',
    'weeks',
    'week',
    'weekNumber',
    'weekNumberHeader',
    'day',
    'dayButton',
    'footer',
  ] as const,
  classes: {
    root: 'tk-calendar',
    months: 'tk-calendar-months',
    month: 'tk-calendar-month',
    nav: 'tk-calendar-nav',
    previousMonthButton: 'tk-calendar-nav-previous-month',
    nextMonthButton: 'tk-calendar-nav-next-month',
    previousYearButton: 'tk-calendar-nav-previous-year',
    nextYearButton: 'tk-calendar-nav-next-year',
    chevron: 'tk-calendar-chevron',
    monthCaption: 'tk-calendar-month-caption',
    captionLabel: 'tk-calendar-caption-label',
    captionTrigger: 'tk-calendar-caption-trigger',
    dropdowns: 'tk-calendar-dropdowns',
    dropdownRoot: 'tk-calendar-dropdown-root',
    dropdown: 'tk-calendar-dropdown',
    monthGrid: 'tk-calendar-month-grid',
    monthYearGrid: 'tk-calendar-month-year-grid',
    monthYearCell: 'tk-calendar-month-year-cell',
    weekdays: 'tk-calendar-weekdays',
    weekday: 'tk-calendar-weekday',
    weeks: 'tk-calendar-weeks',
    week: 'tk-calendar-week',
    weekNumber: 'tk-calendar-week-number',
    weekNumberHeader: 'tk-calendar-week-number-header',
    day: 'tk-calendar-day',
    dayButton: 'tk-calendar-day-button',
    footer: 'tk-calendar-footer',
  },
});

/**
 * Range position is the one selection state the engine expresses **only** as a
 * class name — unlike `selected` / `today` / `outside` / `disabled`, it has no
 * `data-*` counterpart on the day cell. So these three keys are fed to the
 * engine's `classNames` map alongside the anatomy slots above, and the recipe
 * keys on them for the range fill.
 *
 * They are not `CalendarSlot` entries: a range position is a *state* of the day
 * node, not an anatomy owner node, so it gets no `data-slot` of its own and is
 * not addressable through `slotProps`.
 */
export const calendarRangeClassNames = {
  range_start: 'tk-calendar-day-range-start',
  range_middle: 'tk-calendar-day-range-middle',
  range_end: 'tk-calendar-day-range-end',
} as const;
