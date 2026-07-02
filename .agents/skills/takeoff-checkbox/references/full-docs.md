# Checkbox

`Checkbox` is a compound, accessible toggle control. The root owns visual state
(`size`, plus inherited `invalid` / `disabled` / `required` / `optional` /
`readOnly`), and `Checkbox.Indicator` is the bordered box that hosts the icon.
Wrap `Checkbox` in a `Field` to attach a form-level label, description, or error
message — the field-level state cascades into the checkbox automatically.

## Usage

```tsx
import { Checkbox, Field } from '@takeoff-ui/react-spar';
```

```tsx
<Field>
  <Field.Label />
  <Checkbox>
    <Checkbox.Indicator />
  </Checkbox>
  <Field.Description />
  <Field.ErrorMessage />
</Field>
```

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Field>
      <Field.Label>Notifications</Field.Label>
      <Checkbox defaultChecked>
        <Checkbox.Indicator />
      </Checkbox>
      <Field.Description>
        We will only email you when a saved route drops in price.
      </Field.Description>
    </Field>
  );
}

render(<PlaygroundDemo />);
```

## Using with `Field`

`Field` is the generic ARIA wrapper. Setting `invalid`, `disabled`, `required`,
`optional`, or `readOnly` on `Field` cascades into the nested `Checkbox`, and
`Field.Label`, `Field.Description`, and `Field.ErrorMessage` are wired to the
field control through shared IDs.

```tsx
function FieldWithCheckboxDemo() {
  return (
    <div className="grid gap-3">
      <Field required>
        <Field.Label>Email me booking updates</Field.Label>
        <Checkbox defaultChecked>
          <Checkbox.Indicator />
        </Checkbox>
      </Field>

      <Field>
        <Field.Label>Subscribe to fare alerts</Field.Label>
        <Checkbox>
          <Checkbox.Indicator />
        </Checkbox>
        <Field.Description>
          We will only email you when a saved route drops in price.
        </Field.Description>
      </Field>

      <Field invalid>
        <Field.Label>I accept the booking terms</Field.Label>
        <Checkbox>
          <Checkbox.Indicator />
        </Checkbox>
        <Field.ErrorMessage>
          You must accept the terms to continue.
        </Field.ErrorMessage>
      </Field>

      <Field disabled>
        <Field.Label>Disabled option</Field.Label>
        <Checkbox>
          <Checkbox.Indicator />
        </Checkbox>
      </Field>

      <Field readOnly>
        <Field.Label>Read-only selection</Field.Label>
        <Checkbox defaultChecked>
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
    </div>
  );
}

render(<FieldWithCheckboxDemo />);
```

## Controlled

```tsx
function ControlledCheckboxDemo() {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="grid gap-3">
      <Badge className="w-fit" variant="neutral" appearance="outlined">
        Terms {accepted ? 'accepted' : 'not accepted'}
      </Badge>
      <Field>
        <Field.Label>I accept the booking terms</Field.Label>
        <Checkbox checked={accepted} onChange={setAccepted}>
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
    </div>
  );
}

render(<ControlledCheckboxDemo />);
```

## Indeterminate

`indeterminate` overrides `checked` and `defaultChecked` while set, and emits
`aria-checked="mixed"`. The first user toggle transitions out of the mixed state
— `onChange` is always called with a plain `boolean`. In uncontrolled mode, set
`indeterminate` only on the initial render and clear it from your own state
after the first change.

```tsx
function IndeterminateCheckboxDemo() {
  const [items, setItems] = useState({
    seat: true,
    meal: false,
    baggage: false,
  });

  const values = Object.values(items);
  const allChecked = values.every(Boolean);
  const noneChecked = values.every(v => !v);
  const indeterminate = !allChecked && !noneChecked;

  const toggleAll = next => {
    setItems({ seat: next, meal: next, baggage: next });
  };

  return (
    <div className="grid gap-3">
      <Field>
        <Field.Label>All extras</Field.Label>
        <Checkbox
          checked={allChecked}
          indeterminate={indeterminate}
          onChange={toggleAll}
        >
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
      <div className="grid gap-3" style={{ paddingLeft: 24 }}>
        <Field>
          <Field.Label>Extra legroom seat</Field.Label>
          <Checkbox
            checked={items.seat}
            onChange={v => setItems({ ...items, seat: v })}
          >
            <Checkbox.Indicator />
          </Checkbox>
        </Field>
        <Field>
          <Field.Label>Special meal</Field.Label>
          <Checkbox
            checked={items.meal}
            onChange={v => setItems({ ...items, meal: v })}
          >
            <Checkbox.Indicator />
          </Checkbox>
        </Field>
        <Field>
          <Field.Label>Extra baggage</Field.Label>
          <Checkbox
            checked={items.baggage}
            onChange={v => setItems({ ...items, baggage: v })}
          >
            <Checkbox.Indicator />
          </Checkbox>
        </Field>
      </div>
    </div>
  );
}

render(<IndeterminateCheckboxDemo />);
```

## Sizes

```tsx
function SizeDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      <Field>
        <Field.Label>Small</Field.Label>
        <Checkbox size="small" defaultChecked>
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
      <Field>
        <Field.Label>Base</Field.Label>
        <Checkbox size="base" defaultChecked>
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
    </div>
  );
}

render(<SizeDemo />);
```

## Custom Icon

`Checkbox.Indicator` accepts function children that receive the current
`checked` and `indeterminate` state, so you can render different glyphs per
state without mounting two icons. Passing a `ReactNode` instead replaces the
default `icon` slot entirely.

```tsx
function CustomIconDemo() {
  return (
    <div className="grid gap-3">
      <Field>
        <Field.Label>Favorite this route</Field.Label>
        <Checkbox defaultChecked>
          <Checkbox.Indicator>
            {({ checked }) => (checked ? <StarIconOutlinedRounded /> : null)}
          </Checkbox.Indicator>
        </Checkbox>
      </Field>
    </div>
  );
}

render(<CustomIconDemo />);
```

## Disabled, Read-Only, and Invalid

```tsx
function StateDemo() {
  return (
    <div className="grid gap-3">
      <Field disabled>
        <Field.Label>Disabled option</Field.Label>
        <Checkbox>
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
      <Field disabled>
        <Field.Label>Disabled and selected</Field.Label>
        <Checkbox defaultChecked>
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
      <Field readOnly>
        <Field.Label>Read-only selection</Field.Label>
        <Checkbox defaultChecked>
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
      <Field invalid required>
        <Field.Label>I accept the booking terms</Field.Label>
        <Checkbox>
          <Checkbox.Indicator />
        </Checkbox>
        <Field.ErrorMessage>
          You must accept the terms to continue.
        </Field.ErrorMessage>
      </Field>
    </div>
  );
}

render(<StateDemo />);
```

## Form Submission

When `name` is set, Spar renders a synchronized hidden checkbox input for native
form submission. Multiple checkboxes sharing the same `name` produce an array
via `FormData.getAll`.

```tsx
function CheckboxFormDemo() {
  const [saved, setSaved] = useState('Not submitted');

  return (
    <form
      className="grid gap-3"
      onSubmit={event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const picked = data.getAll('extras');
        setSaved(picked.length ? picked.join(', ') : 'No extras');
      }}
    >
      <Field>
        <Field.Label>Extra legroom seat</Field.Label>
        <Checkbox name="extras" value="seat" defaultChecked>
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
      <Field>
        <Field.Label>Special meal</Field.Label>
        <Checkbox name="extras" value="meal">
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
      <Field>
        <Field.Label>Extra baggage</Field.Label>
        <Checkbox name="extras" value="baggage">
          <Checkbox.Indicator />
        </Checkbox>
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit">Save</Button>
        <Badge variant="neutral" appearance="outlined">
          {saved}
        </Badge>
      </div>
    </form>
  );
}

render(<CheckboxFormDemo />);
```

## Accessibility

- `Field.Label`, `Field.Description`, and `Field.ErrorMessage` are wired to the
  control via stable IDs derived from the `Field` root (`aria-labelledby`,
  `aria-describedby`, `aria-invalid`).
- `Checkbox` renders a focusable control with `role="checkbox"` and reflects its
  value through `aria-checked` (including `"mixed"` for the indeterminate
  state).
- The asterisk inside `Field.Label` is decorative — `required` is also surfaced
  to assistive tech via the input's native `required` / `aria-required`.
- Disabled checkboxes are removed from the tab order. Read-only checkboxes
  remain focusable and do not change value.

| Key   | Behavior                            |
| ----- | ----------------------------------- |
| Space | Toggle the focused checkbox.        |
| Tab   | Move focus to the next tabbable UI. |

## API Reference

### Checkbox {#checkbox}

See
[Spar Checkbox docs](https://spar.app.turkishtechlab.com/docs/Components/Checkbox)
for primitive behavior.

#### Props {#checkbox-props}

| Name          | Type                                                                   | Default | Description                                                                                                         |
| ------------- | ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| children      | `React.ReactNode \| ((state: CheckboxRenderProps) => React.ReactNode)` | -       | Compound children for checkbox anatomy, or a render function exposing Spar tri-state.                               |
| indeterminate | `boolean`                                                              | false   | Indeterminate (mixed) visual + ARIA state. Overrides `checked` / `defaultChecked` and emits `aria-checked="mixed"`. |
| invalid       | `boolean`                                                              | false   | Marks the checkbox as visually invalid.                                                                             |
| size          | `CheckboxSize`                                                         | 'base'  | Size scale.                                                                                                         |
| classNames    | `Partial<Record<CheckboxSlot, string>>`                                | -       | Per-slot class name overrides.                                                                                      |
| slotProps     | `Partial<Record<CheckboxSlot, React.HTMLAttributes<HTMLElement>>>`     | -       | Per-slot HTML attribute overrides.                                                                                  |
| className     | `string`                                                               | -       | Appends custom classes to the root slot of this part.                                                               |

#### Data attributes {#checkbox-data-attributes}

| Attribute          | Applied when        | Purpose                                                                     |
| ------------------ | ------------------- | --------------------------------------------------------------------------- |
| data-slot="root"   | Always              | Stable selector for the root slot.                                          |
| data-size          | Always              | Reflects the resolved `size` prop so theme recipes can scope size variants. |
| data-invalid       | `invalid` is true.  | Marks invalid visual state for theme recipes.                               |
| data-checked       | When checked.       | Spar checked-state hook.                                                    |
| data-indeterminate | When indeterminate. | Spar indeterminate-state hook.                                              |
| data-disabled      | `disabled` is true. | Spar disabled-state hook.                                                   |
| data-readonly      | `readOnly` is true. | Spar read-only-state hook.                                                  |
| data-required      | `required` is true. | Spar required-state hook.                                                   |

### Checkbox.Indicator {#checkbox-indicator}

#### Data attributes {#checkbox-indicator-data-attributes}

| Attribute             | Applied when | Purpose                                 |
| --------------------- | ------------ | --------------------------------------- |
| data-slot="indicator" | Always       | Stable selector for the indicator slot. |
| data-slot="icon"      | Always       | Stable selector for the icon slot.      |

### Type Definitions {#checkbox-type-definitions}

| Name                         | Definition                                                                                                                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CheckboxRenderProps          | `{ checked: CheckedState; setChecked: (checked: CheckedState) => void; disabled: boolean; readOnly: boolean; required: boolean; invalid: boolean; isFocused: boolean; isHovered: boolean; isPressed: boolean }` |
| CheckboxSize                 | `'small' \| 'base'`                                                                                                                                                                                             |
| CheckboxSlot                 | `'root' \| 'indicator' \| 'icon'`                                                                                                                                                                               |
| CheckboxIndicatorRenderProps | `{ checked: boolean; indeterminate: boolean }`                                                                                                                                                                  |
