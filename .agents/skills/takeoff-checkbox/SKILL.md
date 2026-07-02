---
name: takeoff-checkbox
description:
  'Compound, accessible checkbox toggle control — the Checkbox from
  @takeoff-ui/react-spar (Takeoff UI / Spar React). Use WHENEVER building,
  adding, importing, styling, or fixing a checkbox, tickbox, boolean toggle,
  accept-terms control, indeterminate/tri-state parent checkbox, select-all, or
  multi-select form option in a React app that uses @takeoff-ui/react-spar /
  Takeoff / Spar. Pair with Field for label, description, and error message
  wiring.'
---

# Checkbox — @takeoff-ui/react-spar

`Checkbox` is a compound, accessible toggle control whose root owns visual state
(`size`, plus inherited `invalid` / `disabled` / `required` / `readOnly`), while
`Checkbox.Indicator` is the bordered box that hosts the check icon.

**When to use:** Boolean opt-in/opt-out controls, accept-terms gates,
multi-select lists, and tri-state "select all" parents. Wrap in `Field` to
attach a label, description, or error message that cascades state into the
checkbox. Not this — use `takeoff-switch` for an on/off settings toggle and
`takeoff-radio-group` for mutually-exclusive choices.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Checkbox, Field } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Checkbox.Indicator` — the bordered box that hosts the check/icon slot.
  Accepts a `ReactNode` (replaces the default icon) or a function child
  `({ checked, indeterminate }) => ReactNode` to render per-state glyphs.

## Basic usage

```tsx
<Field>
  <Field.Label>Notifications</Field.Label>
  <Checkbox defaultChecked>
    <Checkbox.Indicator />
  </Checkbox>
  <Field.Description>
    We will only email you when a saved route drops in price.
  </Field.Description>
</Field>
```

## Examples

### Controlled

`onChange` always fires with a plain `boolean`. Note
`import { useState } from 'react';`.

```tsx
const [accepted, setAccepted] = useState(false);

<Field>
  <Field.Label>I accept the booking terms</Field.Label>
  <Checkbox checked={accepted} onChange={setAccepted}>
    <Checkbox.Indicator />
  </Checkbox>
</Field>;
```

### Indeterminate (select-all)

`indeterminate` overrides `checked`/`defaultChecked` while set and emits
`aria-checked="mixed"`. The first toggle transitions out of the mixed state.

```tsx
const [items, setItems] = useState({ seat: true, meal: false, baggage: false });

const values = Object.values(items);
const allChecked = values.every(Boolean);
const indeterminate = !allChecked && !values.every(v => !v);

<Field>
  <Field.Label>All extras</Field.Label>
  <Checkbox
    checked={allChecked}
    indeterminate={indeterminate}
    onChange={next => setItems({ seat: next, meal: next, baggage: next })}
  >
    <Checkbox.Indicator />
  </Checkbox>
</Field>;
// ...child checkboxes drive items.seat / items.meal / items.baggage
```

### Sizes

```tsx
<Checkbox size="small" defaultChecked>
  <Checkbox.Indicator />
</Checkbox>
<Checkbox size="base" defaultChecked>
  <Checkbox.Indicator />
</Checkbox>
```

### Custom icon

`Checkbox.Indicator` function children receive `{ checked, indeterminate }`.
Icons ship in the separate `@takeoff-icons/react` package.

```tsx
import { StarIconOutlinedRounded } from '@takeoff-icons/react/star';

<Field>
  <Field.Label>Favorite this route</Field.Label>
  <Checkbox defaultChecked>
    <Checkbox.Indicator>
      {({ checked }) => (checked ? <StarIconOutlinedRounded /> : null)}
    </Checkbox.Indicator>
  </Checkbox>
</Field>;
```

### Field state cascade (disabled / read-only / invalid)

Setting `invalid`, `disabled`, `required`, `optional`, or `readOnly` on `Field`
cascades into the nested `Checkbox`.

```tsx
<Field invalid required>
  <Field.Label>I accept the booking terms</Field.Label>
  <Checkbox>
    <Checkbox.Indicator />
  </Checkbox>
  <Field.ErrorMessage>
    You must accept the terms to continue.
  </Field.ErrorMessage>
</Field>
```

### Form submission

With `name` set, Spar renders a synced hidden input. Multiple checkboxes sharing
a `name` produce an array via `FormData.getAll`.

```tsx
<Checkbox name="extras" value="seat" defaultChecked>
  <Checkbox.Indicator />
</Checkbox>
<Checkbox name="extras" value="meal">
  <Checkbox.Indicator />
</Checkbox>
```

## Key props

| Prop                                 | Type                                                       | Default  | Notes                                                                                          |
| ------------------------------------ | ---------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `checked`                            | `boolean`                                                  | —        | Controlled checked state.                                                                      |
| `defaultChecked`                     | `boolean`                                                  | —        | Uncontrolled initial checked state.                                                            |
| `onChange`                           | `(checked: boolean) => void`                               | —        | Fires with a plain boolean, even from the indeterminate state.                                 |
| `indeterminate`                      | `boolean`                                                  | `false`  | Mixed visual + ARIA state; overrides `checked`/`defaultChecked`, emits `aria-checked="mixed"`. |
| `invalid`                            | `boolean`                                                  | `false`  | Marks the checkbox visually invalid (or inherit from `Field invalid`).                         |
| `size`                               | `'small' \| 'base'`                                        | `'base'` | Size scale.                                                                                    |
| `name`                               | `string`                                                   | —        | Renders a hidden input for native form submission.                                             |
| `value`                              | `string`                                                   | —        | Submitted value when `name` is set.                                                            |
| `disabled` / `readOnly` / `required` | `boolean`                                                  | `false`  | Usually inherited from the wrapping `Field`.                                                   |
| `classNames`                         | `Partial<Record<'root' \| 'indicator' \| 'icon', string>>` | —        | Per-slot class overrides.                                                                      |
| `children`                           | `ReactNode \| (state: CheckboxRenderProps) => ReactNode`   | —        | Compound anatomy, or render function exposing Spar tri-state.                                  |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- `Checkbox` renders a focusable control with `role="checkbox"` and reflects
  value through `aria-checked` (including `"mixed"` for indeterminate).
- `Field.Label`, `Field.Description`, and `Field.ErrorMessage` wire to the
  control via stable IDs (`aria-labelledby`, `aria-describedby`,
  `aria-invalid`).
- `required` is surfaced via the input's native `required` / `aria-required`;
  the asterisk in `Field.Label` is decorative.
- Disabled checkboxes leave the tab order. Read-only checkboxes stay focusable
  but do not change value.
- Keyboard: `Space` toggles the focused checkbox; `Tab` moves focus to the next
  tabbable UI.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/checkbox
- Source: `packages/react-spar/src/components/checkbox/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Checkbox
