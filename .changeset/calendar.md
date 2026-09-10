---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

New component: `Calendar`.

A month grid over `react-day-picker@10`. Spar ships no date primitive, so — like
`Table` over TanStack — the engine here is third-party and the wrapper owns
everything visual: a complete `classNames` map replaces the library's own, so no
`rdp-*` class reaches the DOM and no library stylesheet is imported. `data-slot`
anchors and `slotProps` reach the engine's internal nodes through a `components`
override map whose component identities are stable, so the grid is not remounted
between renders. Date arithmetic, selection, keyboard navigation and ARIA stay
upstream.

Its API speaks Takeoff Core's vocabulary rather than the engine's: `mode`
(`single` | `range` | `multiple`), `minDate` / `maxDate`, `disabledDates`,
`allowedDates`, `disabledWeekDays`, `firstDayOfWeekIndex` and `size`, each
mapped to the engine's `Matcher` / navigation props by a pure helper. `value` is
`Date`-based rather than Core's string: parsing and formatting a `dateFormat`
grammar in the wrapper would be behavior, not visual wrapping. `locale` takes an
object from `react-day-picker/locale`, since resolving a locale string would
mean bundling every locale.

Day contents can be customized with `renderDay`, which receives the date and
active modifiers while leaving the engine-owned day-button behavior intact.

The grid follows a value set from outside it. The engine reads `defaultMonth`
once and then owns the displayed month, so a preset button, a typed date or a
value restored from a form would select a day that is off-screen — every caller
had to hold a second piece of state and keep `setValue` and `setMonth` in step.
Setting the value is now enough. It is deliberately narrow: a passed `month`
wins outright (that parent is driving the grid), and only a selection landing in
a different month than the one on screen moves it, so navigation the user
performs is never undone.

```tsx
const [date, setDate] = useState<Date>();

<Calendar value={date} onValueChange={setDate} minDate={new Date()} />;
```

`@takeoff-design/tokens` ships the `tk-calendar-*` recipe. It is built on the
Figma `datepicker.*` token family — the one that describes a picking grid
(`-items-*` day cells, `-header-*` month row, `-body-*` grid, `-footer-*`) — so
day size, cell radius and every inset come from the design system rather than
from local values. The separate `calendar.*` family is left alone:
`calendar-activity-*` / `calendar-week-cell-*` belong to the activity calendar,
which is a different component.

That family is also why `size` has two values rather than three:
`datepicker-items-base-size` and `-small-size` are the only grid scales the
design defines — an input row has a `large`, a month grid does not.

Controlled-ness is decided by whether `value` is **passed**, not by whether it
currently holds a date — a picker's controlled value is `undefined` until
something is picked, so reading the value would make the ordinary
`const [date, setDate] = useState<Date>()` call site silently uncontrolled and
drop every parent-driven change after mount (a preset button, a reset, a saved
value arriving late).

Cells keep their own size rather than stretching: the grid is exactly as wide as
its seven columns, each one `datepicker-items-*-size` wide, with the exported
row gap between rows.

Day state is read from the attributes the engine already emits, with one
subtlety the design forced: in range mode the engine marks _every_ day of the
span `data-selected`, so the filled pill is scoped to the two ends and the
middle keeps the light band. The band itself is painted on a pseudo-element
rather than the cell, because `border-radius` is ignored on a table cell under
`border-collapse: collapse` — the layout the flush-column design needs.

Two Core header features have no `react-day-picker` counterpart, so the wrapper
supplies them. `headerType` (`basic` | `divided` | `light` | `primary` | `dark`)
is Core's `tk-datepicker` header vocabulary: `basic` divides the month row from
the grid, the rest drop that divider for a boxed surface, and the two filled
ones flip the label and arrows to white. The header also carries Core's second
pair of arrows: each pair steps one rung of the board it is on — the single ones
move a month, or a year on the year board; the double ones move a year, or a
whole twelve-year page.

`view` (`day` | `month` | `year`) is Core's view switch: the month and the year
in the caption are buttons that swap the day grid for a twelve-month or
twelve-year board. Which board shows is a third controlled pair — `view` +
`onViewChange`, with `defaultView` for the uncontrolled case, alongside the ones
for the selection and the displayed month. The boards are the one part of the
anatomy the engine does not render, so they are wrapper-owned — `role="grid"`
with one tab stop, arrow-key roving focus, `aria-selected` on the current cell,
focus moving into a board as it opens and back to the trigger once a month is
picked. Their accessible names come from the engine's own
`labels.labelMonthDropdown` / `labelYearDropdown`, so translating the calendar
translates the boards. Only the body is replaced: the displayed month stays the
engine's, through `goToMonth`. A `dropdown*` caption keeps the engine's
`<select>` pair instead of switch buttons and drops the year arrows, since the
year `<select>` covers them; the boards still work there.

One consequence worth calling out: since a board can replace the day grid on any
calendar, the body box is pinned on both — the day grid carries the same
`min-height` the month/year board does, so a four- or five-week month keeps the
six-week box instead of making the card shorter. Switching views does not resize
the card, paging months does not either, and `fixedWeeks` is not needed to stop
the month-to-month jump.

The card's width comes from the grid rather than the caption. The caption label
does not wrap, so a long month name would otherwise stretch the card and let it
shrink again on the next arrow — visible as the whole card twitching as you
page. A single-month calendar is therefore `width: min-content`; a
`numberOfMonths > 1` row, which is legitimately wider than one grid, is left
alone.
