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
 * `calendar-contract.md` → Behavior ownership.
 *
 * Data-attribute vocabulary (data-attribute-vocabulary.md rule 10 — Calendar is
 * a v2-owned react-enhancement over a third-party engine, so it records its
 * decisions here; the shipped entry lives under "Component-specific decisions →
 * Calendar"):
 *   Root:  data-size (v2 visual vocabulary) + data-slot.
 *   Every other node: data-slot only.
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
    'chevron',
    'monthCaption',
    'captionLabel',
    'dropdowns',
    'dropdownRoot',
    'dropdown',
    'monthGrid',
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
    previousMonthButton: 'tk-calendar-nav-previous',
    nextMonthButton: 'tk-calendar-nav-next',
    chevron: 'tk-calendar-chevron',
    monthCaption: 'tk-calendar-month-caption',
    captionLabel: 'tk-calendar-caption-label',
    dropdowns: 'tk-calendar-dropdowns',
    dropdownRoot: 'tk-calendar-dropdown-root',
    dropdown: 'tk-calendar-dropdown',
    monthGrid: 'tk-calendar-month-grid',
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
