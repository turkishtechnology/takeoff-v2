---
name: takeoff-input
description:
  'Accessible compound text Input from @takeoff-ui/react-spar (Takeoff UI / Spar
  React) — bordered field with prefix/suffix, icons, clear/reveal, spinner,
  password strength, number stepper/counter, and tag chips. Triggers: text
  input, text field, form input, search box, password field, number stepper,
  tag/chips, textarea. Use this skill WHENEVER building, adding, importing,
  styling, or fixing an Input/text field in a React app using
  @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Input — @takeoff-ui/react-spar

`Input` is a compound, accessible text input: the root renders the bordered row
and hosts the field plus optional affixes, icons, and actions.

**When to use:** Any single-line (or `as="textarea"`) text entry — search boxes,
email/password fields, numeric steppers/counters, tag/chips fields. Wrap it in a
`Field` to attach a label, helper text, or error message; field-level state
(`invalid`, `disabled`, `required`, `optional`, `readOnly`) cascades into the
input automatically.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Field, Input } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Input.Field` — the actual `<input>` (or `as="textarea"`); native attrs
  (`type`, `placeholder`, `min`/`max`/`step`, `rows`) pass through.
- `Input.Prefix` / `Input.Suffix` — inline text affixes flanking the field.
- `Input.LeadingIcon` / `Input.TrailingIcon` — decorative icons (default
  `aria-hidden`).
- `Input.ClearButton` — focusable button that clears the value (`onClear`).
- `Input.Spinner` — inline loading spinner. `Input.RevealButton` — toggles
  password visibility.
- `Input.Strength` — four-segment password strength meter (reads the live
  value).
- `Input.Stepper` wrapping `Input.Decrement` / `Input.Increment` — native number
  stepping (`stepDown()` / `stepUp()`).
- `Input.Chips` — turns the field into a `string[]` tag field, each tag a
  removable `Chip`.

## Basic usage

```tsx
<Field className="w-full max-w-90">
  <Field.Label>Passenger name</Field.Label>
  <Input>
    <Input.Field placeholder="Ada Lovelace" />
  </Input>
  <Field.Description>Match the name on your travel document.</Field.Description>
</Field>
```

## Examples

### Field states (invalid / required / disabled)

State on `Field` (`invalid`, `required`, `disabled`, `optional`, `readOnly`)
cascades into the nested `Input`.

```tsx
<Field required>
  <Field.Label>Email</Field.Label>
  <Input>
    <Input.Field type="email" placeholder="you@example.com" />
  </Input>
  <Field.Description>We will send a booking confirmation.</Field.Description>
</Field>

<Field invalid>
  <Field.Label>Phone number</Field.Label>
  <Input>
    <Input.Field defaultValue="not-a-phone" />
  </Input>
  <Field.ErrorMessage>Enter a valid phone number.</Field.ErrorMessage>
</Field>
```

### Sizes

```tsx
<Input size="small"><Input.Field placeholder="Compact" /></Input>
<Input size="base"><Input.Field placeholder="Default" /></Input>
<Input size="large"><Input.Field placeholder="Roomy" /></Input>
```

### Prefix, suffix & icons

```tsx
import { SearchIconOutlinedRounded } from '@takeoff-icons/react/search';

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
  </Input>
</Field>
```

### Password (reveal + strength)

```tsx
import { LockOpenIconOutlinedRounded } from '@takeoff-icons/react/lock-open';

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
</Field>;
```

### Number stepper & counter

```tsx
{
  /* Stepper: native min/max/step, buttons call stepUp()/stepDown() */
}
<Input>
  <Input.Field
    type="number"
    defaultValue={1}
    inputMode="numeric"
    min={0}
    max={9}
    step={1}
  />
  <Input.Stepper>
    <Input.Decrement />
    <Input.Increment />
  </Input.Stepper>
</Input>;

{
  /* Counter: opt in with data-layout="counter", buttons flank a centered value */
}
<Input data-layout="counter">
  <Input.Decrement aria-label="Remove passenger">−</Input.Decrement>
  <Input.Field type="number" defaultValue={2} inputMode="numeric" />
  <Input.Increment aria-label="Add passenger">+</Input.Increment>
</Input>;
```

### Tag chips (controlled)

```tsx
import { useState } from 'react';

function Destinations() {
  const [tags, setTags] = useState(['Istanbul', 'London']);
  return (
    <Field>
      <Field.Label>Destinations</Field.Label>
      <Input>
        <Input.Chips value={tags} onValueChange={setTags} separator="," />
        <Input.Field placeholder="Type a city and press Enter" />
      </Input>
      <Field.Description>
        Press Enter or comma to add. Backspace removes the last one.
      </Field.Description>
    </Field>
  );
}
```

### Masked input (dates, numbers, patterns)

`mask` formats as the user types and keeps the caret where they put it. Read the
value from `onValueChange`, not `onChange`: deletes and undo are applied to the
control imperatively, so they never surface as a React change event.

`meta` carries `raw` (separators stripped), `completed`, and — for the date,
time and number presets — `iso`, a canonical machine value that needs no
parsing.

```tsx
function MaskedDate() {
  const [value, setValue] = React.useState('');

  return (
    <Field>
      <Field.Label>Date of birth</Field.Label>
      <Input>
        <Input.Field
          placeholder="dd/mm/yyyy"
          mask={{ date: true, datePattern: ['d', 'm', 'Y'], delimiter: '/' }}
          value={value}
          onValueChange={(next, meta) => {
            setValue(next);
            if (meta.completed) console.log(meta.iso); // '1995-12-31'
          }}
        />
      </Input>
    </Field>
  );
}
```

Four ways to write one, in order of reach: `blocks` for a fixed shape
(`{ blocks: [4, 4, 4, 4], delimiter: ' ' }`), the `date` / `time` / `number`
presets, `regex` for anything a pattern describes, and a plain function for the
rest. The factories behind the presets — `createDateMask`, `createTimeMask`,
`createNumberMask` — are exported, so a built-in can be wrapped rather than
reimplemented.

### Textarea

```tsx
<Input>
  <Input.Field as="textarea" rows={4} placeholder="Add any details." />
</Input>
```

## Key props

| Prop                                                     | Type                            | Default             | Notes                                                                                                            |
| -------------------------------------------------------- | ------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `size` (Input)                                           | `'small' \| 'base' \| 'large'`  | `'base'`            | Size scale; reflected as `data-size`.                                                                            |
| `disabled` / `required` / `readOnly` / `invalid` (Input) | `boolean`                       | —                   | Inherited from a wrapping `Field`.                                                                               |
| `slotProps` / `classNames` (all parts)                   | `Partial<Record<'root', …>>`    | —                   | Per-slot HTML attrs / class overrides.                                                                           |
| `as` (Input.Field)                                       | `'textarea'` etc.               | `input`             | Native attrs (`type`, `min`/`max`/`step`, `rows`, `inputMode`) pass through.                                     |
| `mask` (Input.Field)                                     | `Mask`                          | —                   | Formats as the user types. A `blocks` shape, a `date`/`time`/`number` preset, a `regex`, or a resolver function. |
| `onValueChange` (Input.Field)                            | `(value, meta) => void`         | —                   | The masked value plus `raw` / `completed` / `iso`. Use instead of `onChange` while `mask` is set.                |
| `onClear` (Input.ClearButton)                            | `() => void`                    | —                   | Fires after the value is cleared.                                                                                |
| `value` / `defaultValue` (Input.Chips)                   | `string[]`                      | —                   | Controlled / uncontrolled tag list.                                                                              |
| `onValueChange` (Input.Chips)                            | `(value: string[]) => void`     | —                   | Next tag array after a commit or removal.                                                                        |
| `separator` / `max` / `allowDuplicates` (Input.Chips)    | `string` / `number` / `boolean` | `—` / `—` / `false` | Commit char, tag cap, allow repeats.                                                                             |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- `Field.Label`, `Field.Description`, and `Field.ErrorMessage` wire to the
  control via stable IDs (`aria-labelledby`, `aria-describedby`,
  `aria-invalid`).
- The asterisk in `Field.Label` is decorative; `required` is also surfaced via
  the input's native `required` / `aria-required`.
- `Input.LeadingIcon` / `Input.TrailingIcon` default to `aria-hidden="true"`.
  Use `Input.ClearButton` / `Input.RevealButton` for focusable actions.
- `Input.Decrement` / `Input.Increment` default to "Decrement value" /
  "Increment value" labels; native `type="number"` keeps spinbutton semantics.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/input
- Source: `packages/react-spar/src/components/input/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Input
