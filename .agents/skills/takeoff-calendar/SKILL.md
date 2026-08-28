---
name: takeoff-calendar
description:
  'Inline month grid for picking a day, a range, or several days. This is the
  Calendar from @takeoff-ui/react-spar (Takeoff UI / Spar React). Use WHENEVER
  building, adding, importing, styling, or fixing a calendar, month view, date
  grid, inline date selector, day picker, date range selector, or
  booking/availability grid in a React app that uses @takeoff-ui/react-spar /
  Takeoff / Spar. Triggers: calendar, takeoff calendar, month grid, day picker,
  date range, react-day-picker.'
---

# Calendar — @takeoff-ui/react-spar

`Calendar` renders a month grid so users can pick a single day, a continuous
range, or several separate days, always in view rather than behind a trigger.

**When to use:** Inline date selection — booking grids, availability views,
filters with a permanently visible month. For a value typed into a text field
with the grid in a popover, compose `Input` (with a `date` mask) and `Popover`
around it.

Calendar wraps `react-day-picker`, which owns date arithmetic, selection,
keyboard navigation and ARIA. Takeoff owns the visuals: every rendered class is
`tk-calendar-*` and no library stylesheet is needed.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill). Then import:

```tsx
import { Calendar } from '@takeoff-ui/react-spar';
```

`Calendar` is a single component: it has no compound parts, because every node
below the root is rendered by the engine. Reach the anatomy through `classNames`
/ `slotProps` keys instead (`root`, `months`, `month`, `nav`,
`previousMonthButton`, `nextMonthButton`, `chevron`, `monthCaption`,
`captionLabel`, `dropdowns`, `dropdownRoot`, `dropdown`, `monthGrid`,
`weekdays`, `weekday`, `weeks`, `week`, `weekNumber`, `weekNumberHeader`, `day`,
`dayButton`, `footer`).

## Basic usage

```tsx
import { useState } from 'react';
import { Calendar } from '@takeoff-ui/react-spar';

function DepartureCalendar() {
  const [date, setDate] = useState<Date>();

  return <Calendar value={date} onValueChange={setDate} />;
}
```

Values are `Date` objects. `value` + `onValueChange` is the controlled pair;
`defaultValue` is the uncontrolled one.

## Examples

### Range selection

```tsx
import { useState } from 'react';
import { Calendar, type CalendarRange } from '@takeoff-ui/react-spar';

function StayRange() {
  const [range, setRange] = useState<CalendarRange>();

  return (
    <Calendar
      mode="range"
      value={range}
      onValueChange={setRange}
      min={2}
      max={14}
      excludeDisabled
      numberOfMonths={2}
    />
  );
}
```

`min` / `max` bound how many days the range may span, and `excludeDisabled`
forbids a range that would swallow a disabled day.

### Several separate days

```tsx
import { useState } from 'react';
import { Calendar } from '@takeoff-ui/react-spar';

function ShiftDays() {
  const [days, setDays] = useState<Date[]>();

  return (
    <Calendar mode="multiple" value={days} onValueChange={setDays} max={5} />
  );
}
```

### Restricting what can be picked

```tsx
<Calendar
  minDate={new Date(2026, 7, 1)}
  maxDate={new Date(2026, 8, 30)}
  disabledDates={[new Date(2026, 7, 15)]}
  disabledWeekDays={[0, 6]}
  firstDayOfWeekIndex={1}
/>
```

`minDate` / `maxDate` bound navigation _and_ selection. `disabledWeekDays` takes
weekday indices (`0` = Sunday). `firstDayOfWeekIndex` moves the first column.
For a whitelist, pass `allowedDates` — every unlisted day is then disabled (an
empty array means "no whitelist"):

```tsx
<Calendar allowedDates={[new Date(2026, 7, 3), new Date(2026, 7, 4)]} />
```

### Sizes, week numbers, and a month/year picker

```tsx
<Calendar
  size="small"
  captionLayout="dropdown"
  showWeekNumber
  showOutsideDays
  fixedWeeks
  footer="Departure dates only"
/>
```

`size` is `'small' | 'base'` — the two day-cell scales the design system defines
for a picking grid (40px and 32px). `captionLayout` swaps the month label for
`<select>` navigation
(`'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'`), and `navLayout`
(`'around' | 'after'`) moves the arrows.

### Header types

```tsx
<Calendar headerType="primary" captionLayout="dropdown" />
```

`headerType` is Takeoff Core's `tk-datepicker` header vocabulary:
`'basic' | 'divided' | 'light' | 'primary' | 'dark'`. `basic` divides the month
row from the grid; the other four drop that divider and put the month and its
arrows inside a boxed surface, with `primary` and `dark` flipping the label,
arrows and dropdown carets to white.

### Month and year panels

```tsx
<Calendar defaultView="month" />
```

The month and the year in the caption are buttons that swap the day grid for a
twelve-month or twelve-year board. Picking a year drills down to that year's
months; picking a month returns to the days. Which board shows is a controlled
pair — `view` + `onViewChange` — with `defaultView` (`'day' | 'month' | 'year'`,
default `'day'`) for the uncontrolled case. The header carries two pairs of
arrows, each stepping one rung of the board it is on — the single ones move a
month, or a year on the year board; the double ones move a year, or a whole
twelve-year page — and `minDate` / `maxDate` disable out-of-range cells.

`react-day-picker` has no such view, so this is the one node the wrapper renders
itself — reach it through the `monthYearGrid` / `monthYearCell` /
`captionTrigger` slots. The boards are `role="grid"` with one tab stop and
arrow-key roving focus, and focus returns to the trigger once a month is picked.

A `dropdown*` caption keeps the engine's `<select>` pair instead of switch
buttons, and drops the year arrows since the year `<select>` covers them. The
boards still work there.

### Controlling the displayed month

```tsx
import { useState } from 'react';
import { Calendar } from '@takeoff-ui/react-spar';

function PinnedMonth() {
  const [month, setMonth] = useState(new Date(2026, 7, 1));

  return <Calendar month={month} onMonthChange={setMonth} />;
}
```

`defaultMonth` sets the initially displayed month without controlling it.

### Presets under the grid

`footer` takes any node, so shortcut buttons live there. Drive the controlled
`month` alongside the value, or a preset landing outside the visible month
selects a day that is off-screen.

```tsx
import { useState } from 'react';
import { Button, Calendar } from '@takeoff-ui/react-spar';

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'In a week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
];

function PresetCalendar() {
  const [date, setDate] = useState<Date>();
  const [month, setMonth] = useState(new Date());

  const pick = (days: number) => {
    const next = new Date();
    next.setDate(next.getDate() + days);
    setDate(next);
    setMonth(next);
  };

  return (
    <Calendar
      value={date}
      onValueChange={setDate}
      month={month}
      onMonthChange={setMonth}
      footer={
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="Date presets"
        >
          {PRESETS.map(preset => (
            <Button
              key={preset.label}
              size="small"
              appearance="text"
              onClick={() => pick(preset.days)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      }
    />
  );
}
```

The engine renders the footer as a polite live region (`role="status"`), which
suits status text more than controls. Static labels do not re-announce, but to
keep controls out of a live region entirely, render them as a sibling of
`<Calendar>` instead.

### Localization

```tsx
import { tr } from 'react-day-picker/locale';
import { Calendar } from '@takeoff-ui/react-spar';

<Calendar locale={tr} firstDayOfWeekIndex={1} />;
```

`locale` takes a `react-day-picker` locale object — import the one you need so
only that locale is bundled.

## Key props

| Prop                  | Type                                                             | Default      | Notes                                                                      |
| --------------------- | ---------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------- |
| `mode`                | `'single' \| 'range' \| 'multiple'`                              | `'single'`   | Decides the shape of `value` / `onValueChange`.                            |
| `value`               | `Date` \| `Date[]` \| `CalendarRange`                            | -            | Controlled selection; type follows `mode`.                                 |
| `defaultValue`        | same as `value`                                                  | -            | Uncontrolled initial selection.                                            |
| `onValueChange`       | `(value) => void`                                                | -            | Fires with the new selection, or `undefined` when cleared.                 |
| `size`                | `'small' \| 'base'`                                              | `'base'`     | Grid scale → `data-size`. Two scales by design; see above.                 |
| `headerType`          | `'basic' \| 'divided' \| 'light' \| 'primary' \| 'dark'`         | `'basic'`    | Caption-row treatment → `data-header-type`.                                |
| `view`                | `'day' \| 'month' \| 'year'`                                     | -            | Board the body shows (controlled) → `data-view`. Pair with `onViewChange`. |
| `defaultView`         | `'day' \| 'month' \| 'year'`                                     | `'day'`      | Board the body opens on, uncontrolled.                                     |
| `onViewChange`        | `(view) => void`                                                 | -            | Fires when the body moves to another board.                                |
| `minDate` / `maxDate` | `Date`                                                           | -            | Inclusive bounds on navigation and selection.                              |
| `disabledDates`       | `Date[]`                                                         | -            | Individual days that cannot be picked.                                     |
| `allowedDates`        | `Date[]`                                                         | -            | Whitelist; every unlisted day is disabled. Empty array = no whitelist.     |
| `disabledWeekDays`    | `number[]`                                                       | -            | Weekday indices to disable (`0` = Sunday).                                 |
| `firstDayOfWeekIndex` | `0-6`                                                            | locale's own | First column of the week.                                                  |
| `min` / `max`         | `number`                                                         | -            | Range span or selected-count bounds (`range` / `multiple` modes).          |
| `excludeDisabled`     | `boolean`                                                        | `false`      | Forbid a range containing a disabled day (`range` mode).                   |
| `numberOfMonths`      | `number`                                                         | `1`          | Months rendered side by side.                                              |
| `month`               | `Date`                                                           | -            | Controlled displayed month (pair with `onMonthChange`).                    |
| `defaultMonth`        | `Date`                                                           | today        | Initially displayed month.                                                 |
| `onMonthChange`       | `(month: Date) => void`                                          | -            | Fires when the displayed month moves.                                      |
| `captionLayout`       | `'label' \| 'dropdown' \| 'dropdown-months' \| 'dropdown-years'` | `'label'`    | Month/year label vs. `<select>` navigation.                                |
| `navLayout`           | `'around' \| 'after'`                                            | `'around'`   | Where the previous/next arrows sit.                                        |
| `locale`              | `react-day-picker` locale                                        | English      | Import from `react-day-picker/locale`.                                     |
| `footer`              | `ReactNode`                                                      | -            | Content under the grid, announced politely.                                |

Also passed through to the engine: `showOutsideDays`, `showWeekNumber`,
`fixedWeeks`, `hideWeekdays`, `hideNavigation`, `disableNavigation`,
`pagedNavigation`, `reverseMonths`, `reverseYears`, `broadcastCalendar`,
`ISOWeek`, `timeZone`, `today`, `autoFocus`, `dir`, `numerals`, `formatters`,
`labels`, `role`, `aria-label`, `aria-labelledby`.

## Styling hooks

- Root: `data-slot="root"`, `data-size`, `data-header-type`, plus the engine's
  own `data-mode`, `data-multiple-months`, `data-week-numbers`,
  `data-nav-layout`.
- Day cell: `data-slot="day"` plus `data-day` (ISO date), `data-selected`,
  `data-today`, `data-outside`, `data-disabled`, `data-focused`.
- Range position is a class, not an attribute: `.tk-calendar-day-range-start` /
  `-middle` / `-end`.
- Month/year panel: `data-slot="month-year-grid"` with `data-view="months"` or
  `"years"`, and cells carrying `data-selected` / `data-disabled`.

```tsx
<Calendar
  classNames={{ day: 'my-day', monthCaption: 'my-caption' }}
  slotProps={{ monthGrid: { 'aria-describedby': 'hint' } }}
/>
```

## Accessibility

- The grid is a real `role="grid"` table with a labelled month caption.
- Arrow keys move by day, `PageUp`/`PageDown` by month, `Home`/`End` to the week
  edges; `Enter` / `Space` select.
- Disabled and outside days are announced through the engine's own ARIA.
- Nav buttons stay in the tab order at the boundary and expose `aria-disabled`,
  so the layout does not shift.
- Chevrons are `aria-hidden`; the buttons carry the accessible names.

## Reference

- Source: `packages/react-spar/src/components/calendar/`
- Contract: `calendar-contract.md` (repo root)
- Engine docs: https://daypicker.dev
