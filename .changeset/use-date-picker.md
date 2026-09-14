---
'@takeoff-ui/react-spar': minor
---

`useDatePicker` — the text/`Date` bridge for the date picker composition.

There is still no `DatePicker` component: a date picker is `Popover` +
`Calendar`, composed by the consumer. This hook owns no anatomy and renders
nothing, so every element stays the consumer's to place. What it removes is the
one part of the composition that was neither short nor situational — keeping a
typed string and a `Date` in step in both directions, and deriving the mask
bounds from the same pair of dates the grid gets, so a date the calendar rejects
cannot be typed either.

```tsx
const picker = useDatePicker({ min: MIN, max: MAX });

<Popover {...picker.popoverProps}>
  <Input>
    <Input.Field placeholder="dd/mm/yyyy" {...picker.inputProps} />
    <Popover.Trigger classNames={{ root: 'tk-input-action' }}>
      …
    </Popover.Trigger>
  </Input>
  <Popover.Content classNames={{ root: 'tk-datepicker-panel' }}>
    <Calendar {...picker.calendarProps} />
  </Popover.Content>
</Popover>;
```

Each group is an ordinary object a caller may spread, override one key of, or
ignore. `setValue` drives the whole picker from outside — a preset button, a
reset, a value restored from a form — and `format` / `delimiter` cover the
field's shape without a formatter wired into `onChange`.

The displayed month is deliberately not part of it: `Calendar` now follows a
value set from outside the grid, so a third piece of state would be a second
writer to a month the grid already moves.

It is the only hook the package publishes. `createSafeContext`,
`useControllableState` and `useContentWidthStyle` stay internal — they are
authoring tools for components in this package, where `useDatePicker` exists
precisely because this pattern has no component to put it inside.
