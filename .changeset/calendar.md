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
