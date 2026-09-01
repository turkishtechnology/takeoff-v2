---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add `TimePicker` — an inline panel for picking a time of day, with two bodies
over one value model.

`columns` stacks each unit as a spinning column. `dial` pairs two large number
fields with a dial, and picking an hour hands the turn to the minutes. Both
commit a `Date`, so the picker pairs with `Calendar` and with any form that
already stores a moment.

```tsx
<TimePicker
  className="tk-timepicker-panel"
  aria-labelledby="timer-heading"
  value={time}
  onValueChange={setTime}
>
  <TimePicker.Header>
    <h5 id="timer-heading">Timer</h5>
  </TimePicker.Header>
  <TimePicker.Body />
  <TimePicker.Footer>
    <Button onClick={apply}>Continue</Button>
  </TimePicker.Footer>
</TimePicker>
```

- **`TimePicker.Body` is the picking surface**; the root is a chrome-free state
  owner, so a bare body drops into a `Popover.Content` and the opt-in
  `tk-timepicker-panel` class draws a standalone panel — the split
  `tk-datepicker-panel` already makes. Header and Footer are optional layout
  rows, and the panel ships no trigger: whether a picker commits live or behind
  an Apply button is a per-form answer, so it is composed.
- **The columns are drawn at the strip scale** — 40px cells with 14px digits,
  every cell in one ink and the selection band alone marking the choice. That is
  the smaller of the two scales the design draws; the 48px/20px one reads as
  oversized in use. Both are reachable either way through the
  `--tk-timepicker-*` palette.
- **`compact` is the shorter form of either body** — the dial stacks under its
  number fields instead of sitting beside them, and the column body drops the
  spinning columns for those same fields. A column-placed meridiem comes along
  as a two-cell box beside them rather than a third number field.
- **`size` scales the columns** — `base` is a 40px cell with 14px digits,
  `small` a 32px cell with 12px digits in the recessive ink, for a picker
  sitting beside something else. Two values because the design draws two, the
  same call Calendar makes for its day cell. `columns` only; the dial has one
  drawn scale.
- **`type` treats the panel** — `basic` | `divided` | `light` | `dark` |
  `primary`. Unlike Calendar's `headerType` the treatment reaches the body, not
  just the header, so the prop is `type`. Every colour in the recipe resolves
  through one `--tk-timepicker-*` palette on the root, which is both how a
  treatment is expressed and the supported way to build one the package does not
  ship.
- **The product vocabulary is preserved**: `timeFormat` (`12` / `24`),
  `hourStep`, `minuteStep`, `minTime` / `maxTime`. The bounds take a `Date`,
  matching Calendar's `minDate` / `maxDate`, and only their time of day is read.
  `showSeconds` and `secondStep` are new, from the seconds column the design
  defines.
- **`meridiem` places AM/PM** — `column` (default) gives it a spinning column of
  its own; `toggle` hands it to a composed `TimePicker.Meridiem`, a
  `role="radiogroup"` segmented control the consumer places (typically in the
  header), one tab stop with the arrows moving between the two halves. For
  panels where a fourth column will not fit. The prop decides the form and the
  part decides where, rather than one registering with the other, so the layout
  never waits on an effect.
- **`isTimeUnavailable` closes individual times inside the bounds** — a lunch
  hour, a booked slot. Asked once per rendered cell with the time that cell
  would commit and the unit being asked about, so a column of hours asks 24
  times rather than resolving 1440 minutes.
- **`name` / `form` submit the value** through a hidden field carrying `HH:mm`
  (or `HH:mm:ss` with `showSeconds`) — the shape a native `<input type="time">`
  posts. Empty until something is picked, so a `required` field is not silently
  satisfied with midnight.
- **A coarse unit is judged by whether any finer value it allows is in bounds.**
  Under a 17:30 ceiling the hour 17 stays selectable and picking it pulls the
  minutes down, rather than stranding the column on a value it cannot leave. A
  bound that lands off the step grid is spliced into the column that shows it.
- **Each unit is one tab stop and one `role="spinbutton"`.** The value cells,
  the arrows and the whole dial are pointer affordances — hidden from assistive
  tech, out of the tab order — because every value they offer is reachable from
  the unit they drive.
- Tokens ship `_timepicker.scss`, built from the Figma `component/timepicker`
  values.
