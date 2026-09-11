---
name: takeoff-datepicker
description:
  Build a date picker in @takeoff-ui/react-spar by composing Popover and
  Calendar. Use when the task mentions a date picker, date field, date input,
  date range picker, calendar popover, or a masked date entry.
---

# DatePicker

**There is no `DatePicker` component.** A date picker is `Popover` + `Calendar`,
composed in the consumer's own component. Do not look for one, and do not build
a wrapper that hides the composition — the wiring differs per form in ways a
component would have to guess at.

Both halves already own their behaviour: `Popover` the disclosure, positioning,
dismissal and focus return; `Calendar` the grid, its keyboard model, the
restriction matchers and all three selection modes. What you write is the join
between them — and for a typable field, `useDatePicker` writes most of it.

## Setup

```tsx
import {
  Calendar,
  Field,
  Input,
  Popover,
  useDatePicker,
} from '@takeoff-ui/react-spar';
```

## The shape

```tsx
<Popover>
  <Popover.Trigger>…</Popover.Trigger>
  <Popover.Content classNames={{ root: 'tk-datepicker-panel' }}>
    <Calendar />
  </Popover.Content>
</Popover>
```

`tk-datepicker-panel` is **required**, not decoration. Popover's content box is
a text bubble — capped at 296px with its own padding — so an unmodified panel
clips a calendar. The class lifts the cap and the padding and drops the
calendar's standalone border. Nothing emits it; apply it through `classNames`.

The panel keeps the grid's own geometry: `Calendar` pins the body box, so a
four-week month and a six-week one are the same height and the panel does not
resize under the pointer as you page through months.

## Examples

### Button trigger

Close on select by controlling `open`.

```tsx
function DatePickerDemo() {
  const [date, setDate] = React.useState();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger as={Button} variant="neutral">
        {date ? date.toLocaleDateString() : 'Pick a date'}
      </Popover.Trigger>
      <Popover.Content
        align="start"
        classNames={{ root: 'tk-datepicker-panel' }}
      >
        <Calendar
          value={date}
          onValueChange={next => {
            setDate(next);
            setOpen(false);
          }}
        />
      </Popover.Content>
    </Popover>
  );
}
```

### Masked text field

`useDatePicker` owns the text/`Date` bridge: the field only ever accepts a whole
date in the shape asked for, a completed one becomes a `Date`, a picked day is
written back as text, and one pair of dates bounds the grid **and** the mask —
give the bounds only to the grid and a date the calendar rejects can still be
typed.

```tsx
function MaskedDatePicker() {
  const picker = useDatePicker({
    min: new Date(2026, 7, 10),
    max: new Date(2026, 7, 20),
  });

  return (
    <Field>
      <Field.Label>Departure</Field.Label>
      <Popover {...picker.popoverProps}>
        <Input>
          <Input.Field placeholder="dd/mm/yyyy" {...picker.inputProps} />
          <Input.ClearButton />
          <Popover.Trigger
            aria-label="Select date"
            classNames={{ root: 'tk-input-action' }}
          >
            <CalendarIconOutlinedRounded width={20} height={20} />
          </Popover.Trigger>
        </Input>
        <Popover.Content
          align="end"
          classNames={{ root: 'tk-datepicker-panel' }}
        >
          <Calendar {...picker.calendarProps} />
        </Popover.Content>
      </Popover>
    </Field>
  );
}
```

Each group is an ordinary object — spread it, override one key of it, or ignore
it. `picker.setValue(date)` drives the whole picker from outside (a preset, a
reset, a value restored from a form), `format` and `delimiter` change the
field's shape, and `onValueChange` reports every change from either half.

`inputProps.onKeyDown` is what opens the panel on `ArrowDown`; drop it when the
field is read-only. Without the hook, read `onValueChange` rather than
`onChange` on a masked field — `meta.iso` hands over the date without a parse,
and `meta.completed` says when one has arrived.

### Range

`mode` behaves no differently inside a popover. A range is not finished on the
first click, so do **not** close on select — `react-day-picker` can return a
filled range on the first click, so "is this finished?" cannot be read off the
value. Let Escape or an outside click dismiss it.

```tsx
<Popover>
  <Popover.Trigger as={Button} variant="neutral">
    {label}
  </Popover.Trigger>
  <Popover.Content align="start" classNames={{ root: 'tk-datepicker-panel' }}>
    <Calendar
      mode="range"
      value={range}
      onValueChange={setRange}
      numberOfMonths={2}
    />
  </Popover.Content>
</Popover>
```

### Presets

`Calendar`'s `footer` takes any node, so shortcuts live inside the panel. Set
the value and everything else follows: `picker.setValue` writes the field text,
and the grid scrolls to a date that lands in another month.

```tsx
<Calendar
  {...picker.calendarProps}
  footer={
    <div
      className="flex w-full flex-wrap justify-center gap-1"
      role="group"
      aria-label="Date presets"
    >
      <Button variant="neutral" onClick={() => picker.setValue(new Date())}>
        Today
      </Button>
    </div>
  }
/>
```

### Localization

Two halves, and they have to agree: the grid takes a `locale` object, the field
takes the matching `delimiter` — which is both what the mask inserts and what is
written back on select.

```tsx
import { tr } from 'react-day-picker/locale';

const picker = useDatePicker({ delimiter: '.' });

<Input.Field placeholder="gg.aa.yyyy" {...picker.inputProps} />
<Calendar {...picker.calendarProps} locale={tr} />;
```

Import only the locales you use, so only those are bundled. The field writes
`dd<delimiter>mm<delimiter>yyyy`; a locale that puts the month first needs
`format` too, plus a mask whose `datePattern` matches. The rest of the grid's
localization is `Calendar`'s — `firstDayOfWeekIndex`, `numerals`, `dir="rtl"` —
see `takeoff-calendar`.

### Inline

No popover, no composition — use `Calendar` on its own.

## Key props

Everything comes from the two components, plus the hook that joins them.

| Prop                                                  | Owner         | Notes                                                                          |
| ----------------------------------------------------- | ------------- | ------------------------------------------------------------------------------ |
| `min` / `max` / `defaultValue`                        | useDatePicker | Bounds reach the grid and the mask from one pair of dates.                     |
| `format` / `delimiter`                                | useDatePicker | The field's shape. Default `dd/mm/yyyy`.                                       |
| `setValue` / `onValueChange`                          | useDatePicker | Drive the picker from outside; report every change from either half.           |
| `open` / `defaultOpen` / `onOpenChange`               | Popover       | `popoverProps` covers it — control it yourself for close-on-select in a range. |
| `side` / `align`                                      | Popover       | `bottom` / `end` suits a trigger at a field's inline end.                      |
| `mode`                                                | Calendar      | `single` (default), `multiple`, `range`.                                       |
| `value` / `onValueChange`                             | Calendar      | Typed by `mode`: `Date`, `Date[]`, or `{ from, to }`.                          |
| `month` / `onMonthChange` / `defaultMonth`            | Calendar      | Only when the parent must own the displayed month; the grid follows the value. |
| `minDate` / `maxDate`                                 | Calendar      | Mirror onto the mask as `dateMin` / `dateMax` when the field is typable.       |
| `disabledDates` / `allowedDates` / `disabledWeekDays` | Calendar      | Mirror any rule the mask cannot express onto the value too.                    |
| `mask` / `onValueChange`                              | Input.Field   | See `takeoff-input` for the mask vocabulary.                                   |

## Styling hooks

| Class                 | Applies to        | What it does                                                                                                    |
| --------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `tk-datepicker-panel` | `Popover.Content` | Required. Lifts the bubble's width cap and padding so a calendar fits, and drops the grid's standalone border.  |
| `tk-input-action`     | `Popover.Trigger` | Owned by Input. Opts an in-field trigger into the Input action-button rules, so it matches `Input.ClearButton`. |

## Accessibility

- The trigger is a real button — give it an `aria-label` when its content is
  only an icon.
- `ArrowDown` in the field should open the panel, so the calendar is reachable
  without leaving the keyboard. `inputProps.onKeyDown` already does this.
- Wrap the composition in `Field` for label, description and error wiring.
- The panel is not modal: it does not trap focus, and Escape or an outside click
  dismisses it.

## Reference

Full page with live demos: `apps/docs/docs/components/datepicker.mdx`. The
decision record for why this is a pattern and not a component, including the
arguments against, is `docs/datepicker-contract.md`.

Related skills: `takeoff-calendar` (the grid), `takeoff-popover` (the
disclosure), `takeoff-input` (the field and its mask), `takeoff-field`.
