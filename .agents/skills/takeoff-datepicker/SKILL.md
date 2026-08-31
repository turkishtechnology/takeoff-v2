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
a wrapper that hides the composition — the wiring is short, and it differs per
form in ways a component would have to guess at.

Both halves already own their behaviour: `Popover` the disclosure, positioning,
dismissal and focus return; `Calendar` the grid, its keyboard model, the
restriction matchers and all three selection modes. What you write is the join
between them.

## Setup

```tsx
import { Calendar, Field, Input, Popover } from '@takeoff-ui/react-spar';
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
clips a calendar. The class lifts the cap and the padding, drops the calendar's
standalone border, and lets the panel follow a short month instead of holding a
six-week box. Nothing emits it; apply it through `classNames`.

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

The field is an `Input.Field` with a date mask, so it only ever accepts a whole
date in the shape asked for. Read `onValueChange`, not `onChange`: `meta.iso`
hands over the date without a parse, and `meta.completed` says when one has
arrived.

Three things have to be kept in step, and each is a common miss:

1. **Bound both halves from one pair of dates.** `minDate` / `maxDate` bound the
   grid; the mask takes the same bounds as ISO through `dateMin` / `dateMax`.
   Give them only to the grid and a date the calendar rejects can still be
   typed.
2. **Hold the calendar's `month` in state** so a typed date moves the panel. The
   grid does not follow a value set from outside it.
3. **Write the formatted date back on select**, or the field goes stale.

```tsx
const MIN = new Date(2026, 7, 10);
const MAX = new Date(2026, 7, 20);
const iso = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const format = v =>
  v
    ? `${String(v.getDate()).padStart(2, '0')}/${String(v.getMonth() + 1).padStart(2, '0')}/${v.getFullYear()}`
    : '';

const DATE_MASK = {
  date: true,
  datePattern: ['d', 'm', 'Y'],
  delimiter: '/',
  dateMin: iso(MIN),
  dateMax: iso(MAX),
};

function MaskedDatePicker() {
  const [date, setDate] = React.useState();
  const [month, setMonth] = React.useState(MIN);
  const [text, setText] = React.useState('');
  const [open, setOpen] = React.useState(false);

  return (
    <Field>
      <Field.Label>Departure</Field.Label>
      <Popover open={open} onOpenChange={setOpen}>
        <Input>
          <Input.Field
            placeholder="dd/mm/yyyy"
            mask={DATE_MASK}
            value={text}
            onValueChange={(next, meta) => {
              setText(next);
              if (next === '') return setDate(undefined);
              if (!meta.completed || !meta.iso) return;
              const [y, m, d] = meta.iso.split('-').map(Number);
              const picked = new Date(y, m - 1, d);
              setDate(picked);
              setMonth(picked);
            }}
            onKeyDown={event => {
              if (event.key !== 'ArrowDown') return;
              event.preventDefault();
              setOpen(true);
            }}
          />
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
          <Calendar
            value={date}
            month={month}
            onMonthChange={setMonth}
            minDate={MIN}
            maxDate={MAX}
            onValueChange={next => {
              setDate(next);
              setText(format(next));
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover>
    </Field>
  );
}
```

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

`Calendar`'s `footer` takes any node, so shortcuts live inside the panel. A
preset has to move the value, the field text **and** the month.

```tsx
<Calendar
  value={date}
  month={month}
  onMonthChange={setMonth}
  onValueChange={commit}
  footer={
    <div
      className="flex w-full flex-wrap justify-center gap-1"
      role="group"
      aria-label="Date presets"
    >
      <Button variant="neutral" onClick={() => commit(new Date())}>
        Today
      </Button>
    </div>
  }
/>
```

### Inline

No popover, no composition — use `Calendar` on its own.

## Key props

Everything comes from the two components. Nothing on this page is picker-owned.

| Prop                                                  | Owner       | Notes                                                                    |
| ----------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `open` / `defaultOpen` / `onOpenChange`               | Popover     | Control it when you need close-on-select or `ArrowDown` to open.         |
| `side` / `align`                                      | Popover     | `bottom` / `end` suits a trigger at a field's inline end.                |
| `mode`                                                | Calendar    | `single` (default), `multiple`, `range`.                                 |
| `value` / `onValueChange`                             | Calendar    | Typed by `mode`: `Date`, `Date[]`, or `{ from, to }`.                    |
| `month` / `onMonthChange` / `defaultMonth`            | Calendar    | Hold `month` in state to make typing move the panel.                     |
| `minDate` / `maxDate`                                 | Calendar    | Mirror onto the mask as `dateMin` / `dateMax` when the field is typable. |
| `disabledDates` / `allowedDates` / `disabledWeekDays` | Calendar    | Mirror any rule the mask cannot express onto the value too.              |
| `mask` / `onValueChange`                              | Input.Field | See `takeoff-input` for the mask vocabulary.                             |

## Styling hooks

| Class                 | Applies to        | What it does                                                                                                    |
| --------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `tk-datepicker-panel` | `Popover.Content` | Required. Lifts the bubble's width cap and padding so a calendar fits; lets the panel follow a short month.     |
| `tk-input-action`     | `Popover.Trigger` | Owned by Input. Opts an in-field trigger into the Input action-button rules, so it matches `Input.ClearButton`. |

## Accessibility

- The trigger is a real button — give it an `aria-label` when its content is
  only an icon.
- `ArrowDown` in the field should open the panel, so the calendar is reachable
  without leaving the keyboard.
- Wrap the composition in `Field` for label, description and error wiring.
- The panel is not modal: it does not trap focus, and Escape or an outside click
  dismisses it.

## Reference

Full page with live demos: `apps/docs/docs/components/datepicker.mdx`. The
decision record for why this is a pattern and not a component, including the
arguments against, is `datepicker-contract.md` at the repo root.

Related skills: `takeoff-calendar` (the grid), `takeoff-popover` (the
disclosure), `takeoff-input` (the field and its mask), `takeoff-field`.
