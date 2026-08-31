# Input

`Input` is a compound, accessible text input. The root renders Spar `Input`,
owns the bordered row, and hosts the field plus optional affixes, icons, and
actions. Wrap `Input` in a `Field` to attach a label, helper text, or error
message — the field-level state cascades into the input automatically.

## Usage

```tsx
import { Field, Input } from '@takeoff-ui/react-spar';
```

```tsx
<Field>
  <Field.Label />
  <Input>
    <Input.LeadingIcon />
    <Input.Prefix />
    <Input.Chips />
    <Input.Field />
    <Input.Suffix />
    <Input.TrailingIcon />
    <Input.ClearButton />
    <Input.Spinner />
    <Input.RevealButton />
    <Input.Stepper>
      <Input.Decrement />
      <Input.Increment />
    </Input.Stepper>
    <Input.Strength />
  </Input>
  <Field.Description />
  <Field.ErrorMessage />
</Field>
```

Compose the parts à la carte — an input only needs the ones its variant calls
for (password → `Input.RevealButton` / `Input.Strength`, number → the stepper,
tags → `Input.Chips`). `Input.Strength` is authored inside `Input` (it reads the
field value from context) but renders just below the bordered row, and
`Input.Chips` renders each committed tag as a removable [`Chip`](./chip).

## Playground

```tsx
function PlaygroundDemo() {
  return (
    <Field className="w-full max-w-90">
      <Field.Label>Passenger name</Field.Label>
      <Input>
        <Input.Field placeholder="Ada Lovelace" />
      </Input>
      <Field.Description>
        Match the name on your travel document.
      </Field.Description>
    </Field>
  );
}

render(<PlaygroundDemo />);
```

## Using with `Field`

`Field` is the generic ARIA wrapper. Setting `invalid`, `disabled`, `required`,
`optional`, or `readOnly` on `Field` cascades into the nested `Input`, and
`Field.Label`, `Field.Description`, and `Field.ErrorMessage` are wired to the
field control through shared IDs.

```tsx
function FieldWithInputDemo() {
  return (
    <div className="grid w-full max-w-90 gap-3">
      <Field required>
        <Field.Label>Email</Field.Label>
        <Input>
          <Input.Field type="email" placeholder="you@example.com" />
        </Input>
        <Field.Description>
          We will send a booking confirmation.
        </Field.Description>
      </Field>

      <Field invalid>
        <Field.Label>Phone number</Field.Label>
        <Input>
          <Input.Field defaultValue="not-a-phone" />
        </Input>
        <Field.ErrorMessage>Enter a valid phone number.</Field.ErrorMessage>
      </Field>

      <Field optional>
        <Field.Label>Frequent flyer number</Field.Label>
        <Input>
          <Input.Field placeholder="Optional" />
        </Input>
      </Field>

      <Field disabled>
        <Field.Label>Disabled</Field.Label>
        <Input>
          <Input.Field defaultValue="Booking locked" />
        </Input>
      </Field>

      <Field readOnly>
        <Field.Label>Read-only</Field.Label>
        <Input>
          <Input.Field defaultValue="TK-1928" />
        </Input>
      </Field>
    </div>
  );
}

render(<FieldWithInputDemo />);
```

## Sizes

```tsx
function SizesDemo() {
  return (
    <div className="grid w-full max-w-90 gap-3">
      <Field>
        <Field.Label>Small</Field.Label>
        <Input size="small">
          <Input.Field placeholder="Compact" />
        </Input>
      </Field>
      <Field>
        <Field.Label>Base</Field.Label>
        <Input size="base">
          <Input.Field placeholder="Default" />
        </Input>
      </Field>
      <Field>
        <Field.Label>Large</Field.Label>
        <Input size="large">
          <Input.Field placeholder="Roomy" />
        </Input>
      </Field>
    </div>
  );
}

render(<SizesDemo />);
```

## Prefix, Suffix & Icons

```tsx
function AdornmentsDemo() {
  return (
    <div className="grid w-full max-w-90 gap-3">
      <Field>
        <Field.Label>Amount</Field.Label>
        <Input>
          <Input.Prefix>USD</Input.Prefix>
          <Input.Field placeholder="0.00" inputMode="decimal" />
          <Input.Suffix>.00</Input.Suffix>
        </Input>
      </Field>

      <Field>
        <Field.Label>Search flights</Field.Label>
        <Input>
          <Input.LeadingIcon>
            <SearchIconOutlinedRounded width={16} height={16} />
          </Input.LeadingIcon>
          <Input.Field placeholder="IST to LHR" />
          <Input.TrailingIcon>
            <TakeoffRocketIconOutlinedRounded width={16} height={16} />
          </Input.TrailingIcon>
        </Input>
      </Field>
    </div>
  );
}

render(<AdornmentsDemo />);
```

## Actions

```tsx
function ActionsDemo() {
  const [loading, setLoading] = React.useState(false);

  return (
    <div className="flex flex-col gap-4 w-full max-w-90">
      <Field>
        <Field.Label>Search booking</Field.Label>
        <Input>
          <Input.Field defaultValue="TK1928" />
          <Input.ClearButton />
        </Input>
      </Field>

      <Field>
        <Field.Label>PNR lookup</Field.Label>
        <Input>
          <Input.Field
            placeholder="ABC123"
            onFocus={() => setLoading(true)}
            onBlur={() => setLoading(false)}
          />
          {loading && <Input.Spinner />}
        </Input>
      </Field>

      <Field>
        <Field.Label>Password</Field.Label>
        <Input>
          <Input.Field type="password" placeholder="Enter password" />
          <Input.RevealButton />
        </Input>
      </Field>
    </div>
  );
}

render(<ActionsDemo />);
```

## Password

Compose a password field from the design-system parts: a leading lock icon,
`Input.RevealButton` to toggle visibility, and `Input.Strength` for the
four-segment strength meter. The meter grades the live field value (length plus
upper/lower case, digits, and symbols) and recolours from weak to strong.

```tsx
function PasswordDemo() {
  return (
    <div className="w-full max-w-90">
      <Field required>
        <Field.Label>Password</Field.Label>
        <Input>
          <Input.LeadingIcon>
            <LockOpenIconOutlinedRounded />
          </Input.LeadingIcon>
          <Input.Field type="password" placeholder="Enter password" />
          <Input.RevealButton />
          <Input.Strength />
        </Input>
        <Field.Description>
          Use 8+ characters with a mix of letters, numbers & symbols.
        </Field.Description>
      </Field>
    </div>
  );
}

render(<PasswordDemo />);
```

## Number

`Input.Field type="number"` passes the native numeric attributes — `min`, `max`,
`step`, and `inputMode` — straight through to the control. Compose
`Input.Stepper` when the design needs explicit increment and decrement buttons;
the buttons use the native input stepping API.

```tsx
function NumberDemo() {
  return (
    <div className="w-full max-w-90">
      <Field>
        <Field.Label>Checked bags</Field.Label>
        <Input>
          <Input.Field type="number" defaultValue={1} inputMode="numeric" />
          <Input.Stepper>
            <Input.Decrement />
            <Input.Increment />
          </Input.Stepper>
        </Input>
        <Field.Description>Type a value or use the steppers.</Field.Description>
      </Field>
    </div>
  );
}

render(<NumberDemo />);
```

Number stepping is delegated to the native input: `Input.Decrement` /
`Input.Increment` call `stepDown()` / `stepUp()`. Add `min`, `max`, and `step`
to `Input.Field` to bound the value — at a limit the browser keeps the value
instead of stepping past it (the platform validates typed values rather than
clamping on blur).

## Counter

The counter layout centers the value between brand-coloured buttons. Select it
with `data-layout="counter"` on the `Input` root and place `Input.Decrement` /
`Input.Increment` flanking `Input.Field`. The recipe keys on the explicit
attribute, so the look no longer depends on where the buttons sit in the DOM.

```tsx
function CounterDemo() {
  return (
    <div className="w-full max-w-90">
      <Field>
        <Field.Label>Passengers</Field.Label>
        <Input data-layout="counter">
          <Input.Decrement aria-label="Remove passenger">−</Input.Decrement>
          <Input.Field type="number" defaultValue={2} inputMode="numeric" />
          <Input.Increment aria-label="Add passenger">+</Input.Increment>
        </Input>
        <Field.Description>Steppers flank a centered value.</Field.Description>
      </Field>
    </div>
  );
}

render(<CounterDemo />);
```

> **Migration:** earlier the counter look was selected purely by DOM placement —
> `Input.Decrement` / `Input.Increment` as direct children flanking the field.
> That detection is gone; add `data-layout="counter"` to the `Input` root to opt
> in. Without it the same markup now renders as a plain left-aligned field.

## Chips

`Input.Chips` turns the input into a tag field. It owns the `string[]` value
(controlled via `value` / `onValueChange`, or uncontrolled via `defaultValue`)
and renders each tag as a removable [`Chip`](./chip) (in the neutral / outlined
parity look). Place it next to `Input.Field`: Enter (or the optional `separator`
character) commits the trimmed field text and Backspace on an empty field
removes the last tag. `max` caps the tag count — commits past the cap are
ignored — and `allowDuplicates` permits repeats.

```tsx
function ChipsDemo() {
  const [tags, setTags] = React.useState(['Istanbul', 'London']);
  return (
    <div className="w-full max-w-90">
      <Field>
        <Field.Label>Destinations</Field.Label>
        <Input>
          <Input.Chips value={tags} onValueChange={setTags} separator="," />
          <Input.Field placeholder="Type a city and press Enter" />
        </Input>
        <Field.Description>
          Press Enter or comma to add a destination. Backspace removes the last
          one.
        </Field.Description>
      </Field>
    </div>
  );
}

render(<ChipsDemo />);
```

Object-valued tags and per-chip options are out of scope for now; the chips
value is a `string[]`.

## Masking

`Input.Field` takes a `mask`. While it is set the displayed value is the masked
projection of what was typed, and `onValueChange(value, meta)` reports every
edit.

Do **not** wire a formatter into `onChange` instead. Two reasons: deletes and
undo/redo are applied to the control imperatively — the mask writes
`element.value` and preventDefaults the event — so they never surface as a React
change event and a formatter would miss them entirely. And rewriting the value
of a controlled input moves the caret to the end, so it has to be put back at an
offset that accounts for separators the mask just inserted or removed; deriving
that by diffing old and new value is where caret bugs live. The mask reads
`beforeinput`, where the operation is stated outright rather than inferred.

```tsx
<Input.Field
  mask={{ date: true, datePattern: ['d', 'm', 'Y'], delimiter: '/' }}
  value={value}
  onValueChange={(next, meta) => {
    setValue(next);
    if (meta.completed) submit(meta.iso); // '1995-12-31'
  }}
/>
```

`meta` carries `raw` (separators stripped), `completed`, and `iso` where the
mask defines a canonical machine value.

Four levels, in order of reach:

| Form                                                     | Use for                                              |
| -------------------------------------------------------- | ---------------------------------------------------- |
| `{ blocks: [4, 4, 4, 4], delimiter: ' ' }`               | A fixed shape — card numbers, IDs.                   |
| `{ date: true }` / `{ time: true }` / `{ number: true }` | Dates, clock times, grouped numbers.                 |
| `{ regex: /^[A-Z]{2}-\d{4}$/ }`                          | Anything a pattern describes; matched incrementally. |
| `(value, context) => ({ value })`                        | Everything else — IBAN, phone, card-type formatting. |

The presets are sugar for resolvers Spar ships. `createDateMask`,
`createTimeMask` and `createNumberMask` are exported, so a built-in can be
wrapped rather than reimplemented — a resolver written in userland gets exactly
what they get.

Bounds belong on both halves when a mask is paired with a picker: the `date`
preset takes `dateMin` / `dateMax` as ISO strings, so a date a calendar rejects
cannot be typed either.

## Textarea

```tsx
function TextareaDemo() {
  return (
    <div className="w-full max-w-90">
      <Field>
        <Field.Label>Special assistance note</Field.Label>
        <Input>
          <Input.Field
            as="textarea"
            rows={4}
            placeholder="Add any details for the airport team."
          />
        </Input>
        <Field.Description>
          This note is shared with the ground operations team.
        </Field.Description>
      </Field>
    </div>
  );
}

render(<TextareaDemo />);
```

## Customizing slots

Every compound part forwards `slotProps` (native attributes, `style`, `aria-*`)
to its slot owner node, and `classNames` for CSS classes — so you can shape a
part without re-implementing it. This search template rounds the root into a
pill, tints the leading icon with the brand colour, and turns off the field's
autocomplete, all through `slotProps`.

```tsx
function SearchTemplate() {
  return (
    <div className="w-full max-w-90">
      <Field>
        <Field.Label>Search flights</Field.Label>
        <Input slotProps={{ root: { style: { borderRadius: '9999px' } } }}>
          <Input.LeadingIcon
            slotProps={{ root: { style: { color: 'var(--primary-base)' } } }}
          >
            <SearchIconOutlinedRounded width={16} height={16} />
          </Input.LeadingIcon>
          <Input.Field
            placeholder="Where to?"
            slotProps={{
              root: { autoComplete: 'off', style: { fontWeight: 500 } },
            }}
          />
        </Input>
      </Field>
    </div>
  );
}

render(<SearchTemplate />);
```

## Accessibility

- `Field.Label`, `Field.Description`, and `Field.ErrorMessage` are wired to the
  control via stable IDs derived from the `Field` root (`aria-labelledby`,
  `aria-describedby`, `aria-invalid`).
- The asterisk inside `Field.Label` is decorative — `required` is also surfaced
  to assistive tech via the input's native `required` / `aria-required`.
- `Input.LeadingIcon` and `Input.TrailingIcon` default to `aria-hidden="true"`.
  Use `Input.ClearButton` or `Input.RevealButton` for focusable actions.
- `Input.Decrement` and `Input.Increment` default to icon-only button labels of
  "Decrement value" and "Increment value". Native `type="number"` keeps the
  spinbutton semantics.

## API Reference

### Input {#input}

See [Spar Input docs](https://spar.app.turkishtechlab.com/docs/Components/Input)
for primitive behavior.

#### Props {#input-props}

| Name       | Type                                                         | Default | Description                                                                                                                                                    |
| ---------- | ------------------------------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children   | `React.ReactNode`                                            | -       | Compound parts (`Input.Field`, optional affixes, icons, clear/spinner/reveal/stepper actions). Wrap in a `Field` to attach labels and helper text.             |
| size       | `InputSize`                                                  | 'base'  | Size scale.                                                                                                                                                    |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot class name overrides.                                                                                                                                 |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                                                                                                                             |
| id         | `string`                                                     | -       | Custom base ID for ARIA relationships. If not provided, one will be generated automatically. Sub-element IDs are derived as `${id}-field`, `${id}-label`, etc. |
| disabled   | `boolean`                                                    | -       | Input disabled state. When inside a Field, inherited from Field.                                                                                               |
| required   | `boolean`                                                    | -       | Input required state. When inside a Field, inherited from Field.                                                                                               |
| readOnly   | `boolean`                                                    | -       | Input read-only state. When inside a Field, inherited from Field.                                                                                              |
| invalid    | `boolean`                                                    | -       | Input validation state. When inside a Field, inherited from Field.                                                                                             |
| className  | `string`                                                     | -       | Appends custom classes to the root slot of this part.                                                                                                          |

#### Data attributes {#input-data-attributes}

| Attribute             | Applied when              | Purpose                                                                                                                                                  |
| --------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data-slot="root"      | Always                    | Stable selector for wrapper styling on the root slot.                                                                                                    |
| data-size             | Always                    | Reflects the resolved `size` prop so theme recipes can scope size variants.                                                                              |
| data-layout="counter" | When set by the consumer. | Opts into the counter look (centered value, brand-coloured flanking `Input.Decrement` / `Input.Increment`). Replaces the former DOM-placement detection. |
| data-invalid          | When `invalid` is true.   | Theme hook for the invalid state. Emitted by Spar Input on the root.                                                                                     |
| data-disabled         | When `disabled` is true.  | Theme hook for the disabled state. Emitted by Spar Input.                                                                                                |
| data-required         | When `required` is true.  | Theme hook used by the parent `Field` to auto-render its required asterisk.                                                                              |
| data-readonly         | When `readOnly` is true.  | Theme hook for the read-only state. Emitted by Spar Input.                                                                                               |

### Input.Field {#input-field}

See [Spar Input docs](https://spar.app.turkishtechlab.com/docs/Components/Input)
for primitive behavior.

#### Props {#input-field-props}

| Name       | Type                                                         | Default | Description                                           |
| ---------- | ------------------------------------------------------------ | ------- | ----------------------------------------------------- |
| classNames | `Partial<Record<"root", string>>`                            | -       | Per-slot class name overrides.                        |
| slotProps  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                    |
| autoFocus  | `boolean`                                                    | false   | Whether to focus the input on mount                   |
| className  | `string`                                                     | -       | Appends custom classes to the root slot of this part. |

#### Data attributes {#input-field-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.Prefix {#input-prefix}

#### Data attributes {#input-prefix-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.Suffix {#input-suffix}

#### Data attributes {#input-suffix-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.LeadingIcon {#input-leading-icon}

#### Data attributes {#input-leading-icon-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.TrailingIcon {#input-trailing-icon}

#### Data attributes {#input-trailing-icon-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.ClearButton {#input-clear-button}

#### Events {#input-clear-button-events}

| Name    | Type         | Default | Description                              |
| ------- | ------------ | ------- | ---------------------------------------- |
| onClear | `() => void` | -       | Called after the field value is cleared. |

#### Data attributes {#input-clear-button-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.Spinner {#input-spinner}

#### Data attributes {#input-spinner-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.RevealButton {#input-reveal-button}

#### Data attributes {#input-reveal-button-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.Strength {#input-strength}

#### Data attributes {#input-strength-data-attributes}

| Attribute        | Applied when            | Purpose                                                                  |
| ---------------- | ----------------------- | ------------------------------------------------------------------------ |
| data-slot="root" | Always                  | Stable selector for wrapper styling on the root slot.                    |
| data-level       | On each filled segment. | Strength tier of the current field value: `weak`, `medium`, or `strong`. |

### Input.Stepper {#input-stepper}

#### Data attributes {#input-stepper-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.Decrement {#input-decrement}

#### Data attributes {#input-decrement-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.Increment {#input-increment}

#### Data attributes {#input-increment-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Input.Chips {#input-chips}

#### Props {#input-chips-props}

| Name            | Type                                                         | Default | Description                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children        | `React.ReactNode`                                            | -       | Optional extra content rendered after the auto-generated chip tokens.                                                                                                                                 |
| value           | `string[]`                                                   | -       | Committed tags (controlled). Pair with `onValueChange`. Spar's Input is a scalar primitive with no array model, so the chips value is owned here as a react-enhancement rather than picked from Spar. |
| defaultValue    | `string[]`                                                   | -       | Initial tags for uncontrolled usage.                                                                                                                                                                  |
| separator       | `string`                                                     | -       | Optional character that commits the field text as a tag (Enter always commits).                                                                                                                       |
| max             | `number`                                                     | -       | Maximum number of tags. Further commits are ignored once reached.                                                                                                                                     |
| allowDuplicates | `boolean`                                                    | false   | Allow committing a tag that already exists.                                                                                                                                                           |
| classNames      | `Partial<Record<"root", string>>`                            | -       | Per-slot class name overrides.                                                                                                                                                                        |
| slotProps       | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                                                                                                                                                                    |
| className       | `string`                                                     | -       | Appends custom classes to the root slot of this part.                                                                                                                                                 |

#### Events {#input-chips-events}

| Name          | Type                        | Default | Description                                               |
| ------------- | --------------------------- | ------- | --------------------------------------------------------- |
| onValueChange | `(value: string[]) => void` | -       | Called with the next tag array after a commit or removal. |

#### Data attributes {#input-chips-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Type Definitions {#input-type-definitions}

| Name      | Definition                     |
| --------- | ------------------------------ |
| InputSize | `'small' \| 'base' \| 'large'` |
