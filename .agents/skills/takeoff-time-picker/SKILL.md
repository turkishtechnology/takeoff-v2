---
name: takeoff-time-picker
description:
  'Inline panel for picking a time of day, as spinning unit columns or as a dial
  with two number fields. This is the TimePicker from @takeoff-ui/react-spar
  (Takeoff UI / Spar React). Use WHENEVER building, adding, importing, styling,
  or fixing a time picker, time field, hour/minute selector, clock face, AM/PM
  toggle, duration picker, or a time popover in a React app that uses
  @takeoff-ui/react-spar / Takeoff / Spar. Triggers: timepicker, time picker,
  takeoff timepicker, hour minute, clock picker, AM PM, timeFormat.'
---

# TimePicker — @takeoff-ui/react-spar

`TimePicker` picks a time of day inline — a panel that is always visible rather
than one hidden behind a trigger. The value is a `Date`, so it pairs with
`Calendar` and with any form that already stores a moment.

**When to use:** Picking an hour and a minute — a departure time, a reminder, a
shift start. For a trigger-and-panel picker, compose it inside a `Popover`; the
panel ships no trigger of its own.

There is no upstream Spar primitive and no third-party engine, so the wrapper
owns the value math, the keyboard surface and the ARIA wiring. Every rendered
class is `tk-timepicker-*` and no library stylesheet is needed.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill). Then import:

```tsx
import { TimePicker } from '@takeoff-ui/react-spar';
```

## Anatomy

```tsx
<TimePicker>
  <TimePicker.Header>
    <TimePicker.Meridiem />
  </TimePicker.Header>
  <TimePicker.Body />
  <TimePicker.Footer />
</TimePicker>
```

The root is a chrome-free state owner and renders no picking surface of its own,
so **`TimePicker.Body` is required**. `Header` and `Footer` are optional chrome
— drop them when the panel lives inside a `Popover.Content` that draws its own
surface. Both are layout rows: a heading, a close button, the confirm actions go
in as children. `Meridiem` is the AM/PM toggle, placed wherever it belongs; it
renders nothing unless `meridiem="toggle"` asks for it.

For a standalone panel — surface, border, radius and shadow — add the opt-in
`tk-timepicker-panel` class to the root. It is a class rather than a prop for
the same reason `tk-datepicker-panel` is: whether the picker draws its own
surface depends on what it is sitting in.

Everything below the body — a column, a value cell, an arrow, a dial mark — is
generated from the resolved units and the step props, so a consumer cannot place
one. Reach them through `classNames` / `slotProps` keys instead (`root`,
`columns`, `column`, `highlight`, `previousTrigger`, `nextTrigger`, `chevron`,
`valueGroup`, `value`, `separator`, `inputGroup`, `input`, `inputValue`,
`inputLabel`, `inputStack`, `inputOption`, `dial`, `dialFace`, `dialHand`,
`dialCap`, `dialNumber`). `TimePicker.Meridiem` carries its own two: `root` and
`option`.

## Basic usage

```tsx
import { useState } from 'react';
import { TimePicker } from '@takeoff-ui/react-spar';

function DepartureTime() {
  const [time, setTime] = useState<Date>();

  return (
    <TimePicker
      className="tk-timepicker-panel"
      value={time}
      onValueChange={setTime}
    >
      <TimePicker.Body />
    </TimePicker>
  );
}
```

`value` + `onValueChange` is the controlled pair; `defaultValue` is the
uncontrolled one. `onValueChange` always receives a full `Date`: while nothing
is picked the panel shows `referenceDate` (today at midnight by default), and
the first pick lands on that day.

## Examples

### The dial

```tsx
<TimePicker mode="dial" value={time} onValueChange={setTime}>
  <TimePicker.Body />
</TimePicker>
```

`mode="dial"` swaps the columns for two large number fields and a dial;
`compact` stacks the dial under them. On a column body `compact` drops the
spinning columns for those same fields. A column-placed meridiem joins them as a
two-cell box rather than a third number field, since it has two values and not
sixty. The dial edits whichever field is active, and picking an hour hands the
turn to the minutes.

On a 24-hour clock the dial shows the half-day the value is already in — 00–11
or 12–23 — because twelve positions carry twelve hours.

### Twelve-hour clock and seconds

```tsx
<TimePicker timeFormat="12" showSeconds value={time} onValueChange={setTime}>
  <TimePicker.Body />
</TimePicker>
```

`timeFormat="12"` renumbers the hours 1–12 and adds an AM/PM column; the toggle
keeps the hour and swaps the half-day, so 1:45 PM becomes 1:45 AM rather than
jumping twelve hours. `showSeconds` adds a third column — `columns` only, since
the dial has two fields by design.

### Where AM/PM lives

```tsx
<TimePicker timeFormat="12" meridiem="toggle">
  <TimePicker.Header>
    <TimePicker.Meridiem />
  </TimePicker.Header>
  <TimePicker.Body />
</TimePicker>
```

By default the meridiem gets a spinning column of its own. `meridiem="toggle"`
takes it out of that row and hands it to a composed `TimePicker.Meridiem` — a
two-option segmented control you place yourself, typically in the header. Reach
for it when a fourth column will not fit, as in a panel beside a calendar.

The prop decides the form, the part decides where — two together rather than one
registering with the other, so the layout never waits on an effect and a server
render matches the first client one. `TimePicker.Meridiem` renders nothing under
`meridiem="column"` or a 24-hour clock, so it is safe to leave composed; asking
for the toggle without composing it warns in development.

The toggle is a `role="radiogroup"`: one tab stop, arrows moving between the two
halves. It serves both bodies.

### Steps and bounds

```tsx
<TimePicker
  minuteStep={15}
  minTime={new Date(2026, 8, 1, 9, 0)}
  maxTime={new Date(2026, 8, 1, 17, 30)}
/>
```

`minTime` / `maxTime` are inclusive, and **only their time of day is read** —
the date part is ignored, so a bound can be written with any convenient day.

A coarse unit is judged by whether _any_ finer value it allows falls inside the
bounds. Under a 17:30 ceiling the hour 17 stays selectable, and picking it pulls
the minutes down to 30 rather than leaving the column stuck at a value it cannot
leave.

A bound that lands off the step grid is still reachable: the column splices the
shown value into its list, so `minTime` 09:07 under a 15-minute step renders
`00 / 07 / 15` rather than a column with no cell for the value it is displaying.

### Closing individual times

```tsx
<TimePicker
  minTime={openAt}
  maxTime={closeAt}
  isTimeUnavailable={(time, unit) => unit === 'minute' && isTaken(time)}
/>
```

`minTime` / `maxTime` draw the outer bounds; `isTimeUnavailable` rejects
individual times inside them — a closed lunch hour, a slot already booked.

The predicate is asked **once per rendered cell**, with the time that cell would
commit and the unit being asked about, so answering is a comparison rather than
a scan: a column of hours asks 24 times, not 1440. A coarse unit is asked about
itself only, so closing 12:00–12:30 means answering `false` for the hour 12
(some of it is open) and `true` for the minutes inside it.

Unlike the bounds, an unavailable time is only made unselectable — the finer
units are not pulled onto a legal value, because there is no bound to pull them
to. Arrow keys step over unavailable values rather than landing on them.

### Submitting in a form

```tsx
<form action="/book">
  <TimePicker name="departure" defaultValue={time}>
    <TimePicker.Body />
  </TimePicker>
</form>
```

`name` renders a hidden field carrying `HH:mm` — or `HH:mm:ss` with
`showSeconds` — the same shape a native `<input type="time">` submits. It stays
empty until something is picked, so a `required` form field is not silently
satisfied with midnight. `form` targets a form the picker does not sit inside.

### In a popover

```tsx
<Popover open={open} onOpenChange={setOpen}>
  <Popover.Trigger as={Button}>{label}</Popover.Trigger>
  <Popover.Content className="p-0">
    <TimePicker value={draft} onValueChange={setDraft}>
      <TimePicker.Body />
      <TimePicker.Footer>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button onClick={apply}>Apply</Button>
      </TimePicker.Footer>
    </TimePicker>
  </Popover.Content>
</Popover>
```

The panel ships no trigger, and no commit model. Whether the picker writes live
or behind an Apply button is a per-form answer, so it is composed rather than
configured.

### Panel treatments

```tsx
<TimePicker type="dark" value={time} onValueChange={setTime}>
  <TimePicker.Body />
</TimePicker>
```

`type` treats the panel: `divided` only rules the header and footer off the
picking surface; `light` tints the surface and flips the selection band to white
against it; `dark` and `primary` repaint it outright. Unlike Calendar's
`headerType` the treatment reaches the body and not just the header, which is
why the prop is `type` here.

Every colour the recipe uses resolves through one `--tk-timepicker-*` palette on
the root, so a treatment is a block of custom-property overrides. Override those
directly for a treatment the package does not ship.

A treatment repaints the panel, not the content composed into it: a `Button` in
the footer carries its own colours, so `dark` and `primary` need
`variant="white"` to read against the surface.

### Naming the units

```tsx
<TimePicker labels={{ hour: 'Saat', minute: 'Dakika' }} />
```

`labels` supplies the accessible names, and the two captions the `dial` body
prints under its fields. The package has no locale layer of its own — an app in
another language passes its own strings, the way `Calendar` takes its month
names from the consumer.

### Inside a Field

```tsx
<Field required>
  <Field.Label>Departure time</Field.Label>
  <TimePicker value={time} onValueChange={setTime}>
    <TimePicker.Body />
  </TimePicker>
  <Field.Description>Local time at the departure airport.</Field.Description>
</Field>
```

`disabled` / `readOnly` / `invalid` / `required` are inherited from a
surrounding `Field`; a direct prop still wins.

## Key props

| Prop                   | Type                           | Default     | Notes                                                                                                          |
| ---------------------- | ------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `mode`                 | `'basic' \| 'clock'`           | `'basic'`   | Which body renders → `data-mode`.                                                                              |
| `type`                 | `'basic' \| 'light' \| 'dark'` | `'basic'`   | Panel treatment → `data-type`. Repaints the surface, band and ink.                                             |
| `size`                 | `'small' \| 'base'`            | `'base'`    | Column scale → `data-size`. `small` is a 32px cell with 12px digits in the recessive ink. `columns` only.      |
| `value`                | `Date`                         | -           | Controlled selection; only the time of day is read.                                                            |
| `defaultValue`         | `Date`                         | -           | Uncontrolled initial selection.                                                                                |
| `onValueChange`        | `(value: Date) => void`        | -           | Fires with the new time, always a full `Date`.                                                                 |
| `referenceDate`        | `Date`                         | today 00:00 | The day an emitted time falls on, and the time shown before anything is picked.                                |
| `timeFormat`           | `'12' \| '24'`                 | `'24'`      | Twelve-hour clocks gain an AM/PM unit → `data-time-format`.                                                    |
| `meridiem`             | `'column' \| 'toggle'`         | `'column'`  | Where AM/PM is picked. Read only under `timeFormat="12"`.                                                      |
| `hourStep`             | `number`                       | `1`         | Distance between selectable hours.                                                                             |
| `minuteStep`           | `number`                       | `1`         | Distance between selectable minutes.                                                                           |
| `secondStep`           | `number`                       | `1`         | Distance between selectable seconds.                                                                           |
| `showSeconds`          | `boolean`                      | `false`     | Adds a seconds column. `columns` only.                                                                         |
| `compact`              | `boolean`                      | `false`     | The shorter form of either body: the dial stacks under its fields, the column body drops the columns for them. |
| `minTime` / `maxTime`  | `Date`                         | -           | Inclusive bounds; the date part is ignored.                                                                    |
| `isTimeUnavailable`    | `(time, unit) => boolean`      | -           | Rejects individual times the bounds allow. Asked once per cell.                                                |
| `name` / `form`        | `string`                       | -           | Submits `HH:mm` (or `HH:mm:ss`) through a hidden field.                                                        |
| `labels`               | `TimePickerLabels`             | English     | Unit names, and the `dial` body's field captions.                                                              |
| `disabled`             | `boolean`                      | -           | Blocks interaction and drops the units out of the tab order.                                                   |
| `readOnly`             | `boolean`                      | -           | Focusable and readable, commits nothing.                                                                       |
| `invalid` / `required` | `boolean`                      | -           | State hooks; also published on each unit as `aria-*`.                                                          |

## Styling hooks

- Root: `data-slot="root"`, `data-mode`, `data-compact`, `data-type`,
  `data-size`, `data-time-format`, `data-empty` (nothing picked yet), plus
  `data-disabled` / `data-readonly` / `data-invalid` / `data-required`.
- Body: `data-slot="root"` and `data-mode`, mirrored from the root so the two
  layouts can be styled without reaching through it.
- Unit: `data-slot="column"` (basic) or `"input"` (clock), with `data-unit`
  (`hour` / `minute` / `second` / `meridiem`) and, in the clock body,
  `data-active` on the field the dial is editing.
- Value cell: `data-slot="value"` with `data-selected` / `data-disabled` /
  `data-blank` (a padding cell past either end of the list).
- Dial: `data-slot="dial"` and the hands' `data-unit`; each hand and mark
  carries its angle inline as `--tk-timepicker-dial-angle` (a continuous value
  is not a `data-*` hook).

```tsx
<TimePicker.Body
  classNames={{ value: 'my-cell' }}
  slotProps={{ dial: { id: 'dial' } }}
/>
```

## Accessibility

- Each unit is one tab stop and one `role="spinbutton"`, carrying
  `aria-valuenow` / `aria-valuemin` / `aria-valuemax` / `aria-valuetext`. The
  meridiem announces its own words rather than `0` / `1`.
- <kbd>↑</kbd> / <kbd>↓</kbd> select the value drawn above / below, <kbd>Page
  Up</kbd> / <kbd>Page Down</kbd> move five, <kbd>Home</kbd> / <kbd>End</kbd>
  jump to the ends the bounds allow. Values the bounds forbid are stepped over
  rather than landed on.
- Digits type a value straight in: the first commits and waits a second for a
  second one, so `4` selects 4 and `45` selects 45. A pair naming no value —
  `99` minutes, `0` on a twelve-hour clock — falls back to its last digit rather
  than being dropped. <kbd>A</kbd> / <kbd>P</kbd> set the half-day, which has no
  digits of its own.
- The columns read top-to-bottom as ascending — 09, **10**, 11 — so <kbd>↑</kbd>
  selects the smaller value. This follows the layout rather than the APG
  spinbutton wording.
- The value cells, the arrows and the whole dial are pointer affordances: hidden
  from assistive tech and out of the tab order, because every value they offer
  is already reachable from the unit they drive.
- The panel is a `role="group"`. It takes its name from a surrounding `Field`
  label, or from an `aria-label` / `aria-labelledby` passed to the root — point
  the latter at your own heading inside `TimePicker.Header`, which is a layout
  row and claims no labelling role of its own.

## Reference

- Source: `packages/react-spar/src/components/time-picker/`
- Recipe: `packages/tokens/styles/recipes/_timepicker.scss`
- Contract: `docs/component-authoring-contract.md`
- Data attributes: `packages/react-spar/docs/data-attribute-vocabulary.md`
