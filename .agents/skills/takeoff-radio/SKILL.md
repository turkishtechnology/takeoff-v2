---
name: takeoff-radio
description:
  'Build a Radio group (single-choice, mutually exclusive options) — the Radio
  from @takeoff-ui/react-spar (Takeoff UI / Spar React). Trigger when adding or
  styling radio buttons, radiogroup, single-select option lists, cabin/seat/plan
  pickers, exclusive choice forms, or controlled radio inputs. Use this skill
  WHENEVER building, adding, importing, styling, or fixing a Radio (or related
  single-choice UI) in a React app that uses @takeoff-ui/react-spar / Takeoff /
  Spar. Not for multi-select — use a checkbox group there.'
---

# Radio — @takeoff-ui/react-spar

`Radio` lets users pick a single option from a small, mutually exclusive set.
The root owns group state (`value` / `defaultValue` / `onChange`) and cascades
`size`, `position`, and `invalid` to every item.

**When to use:** Any single-choice form control: cabin/seat/plan/payment
pickers, exclusive option lists. Not this — for multiple selections from a list
use a checkbox group, not Radio.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Radio } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Radio` — root; renders `role="radiogroup"`, owns the group value and
  cascading props.
- `Radio.Item` — one selectable option; requires a `value`. Wraps a hidden
  `<input type="radio">`.
- `Radio.Indicator` — the decorative dot/fill (`aria-hidden`). Place inside each
  item.
- `Radio.Label` — labels the item; compose helper text or richer markup directly
  inside it.

## Basic usage

```tsx
<Radio aria-label="Cabin class" defaultValue="economy">
  <Radio.Item value="economy">
    <Radio.Indicator />
    <Radio.Label>Economy</Radio.Label>
  </Radio.Item>
  <Radio.Item value="business">
    <Radio.Indicator />
    <Radio.Label>Business</Radio.Label>
  </Radio.Item>
  <Radio.Item value="first">
    <Radio.Indicator />
    <Radio.Label>First</Radio.Label>
  </Radio.Item>
</Radio>
```

Compose helper text inside `Radio.Label` alongside the label text:

```tsx
<Radio.Label>
  Economy
  <span className="text-text-base text-(length:--desktop-body-xs-size) leading-(--desktop-body-xs-line-height) font-normal">
    Standard fare with carry-on baggage.
  </span>
</Radio.Label>
```

## Examples

### Sizes

`size` on the root cascades to every item: `'small' | 'base' | 'large'` (default
`'base'`).

```tsx
<Radio aria-label="Seat" size="small" defaultValue="aisle">
  <Radio.Item value="aisle">
    <Radio.Indicator />
    <Radio.Label>Aisle</Radio.Label>
  </Radio.Item>
  <Radio.Item value="window">
    <Radio.Indicator />
    <Radio.Label>Window</Radio.Label>
  </Radio.Item>
</Radio>
```

### Layout — horizontal, spread, indicator position

`orientation="horizontal"` for inline choices, `spread` to stretch items along
the axis, `position="right"` to move the indicator to the trailing edge.
Per-item `position` overrides the group default.

```tsx
<Radio
  aria-label="Trip type"
  orientation="horizontal"
  spread
  defaultValue="round"
>
  <Radio.Item value="one">
    <Radio.Indicator />
    <Radio.Label>One-way</Radio.Label>
  </Radio.Item>
  <Radio.Item value="round">
    <Radio.Indicator />
    <Radio.Label>Round trip</Radio.Label>
  </Radio.Item>
  <Radio.Item value="multi">
    <Radio.Indicator />
    <Radio.Label>Multi-city</Radio.Label>
  </Radio.Item>
</Radio>
```

### Controlled

Note: `import { useState } from 'react';`

```tsx
const [value, setValue] = useState('return');

<Radio aria-label="Refund preference" value={value} onChange={setValue}>
  <Radio.Item value="return">
    <Radio.Indicator />
    <Radio.Label>Refund to original payment</Radio.Label>
  </Radio.Item>
  <Radio.Item value="voucher">
    <Radio.Indicator />
    <Radio.Label>Travel voucher</Radio.Label>
  </Radio.Item>
</Radio>;
```

### Disabled item & invalid group

`disabled` on a single `Radio.Item` skips pointer and keyboard activation.
`invalid` (and `required`) on the root marks the whole group.

```tsx
<Radio aria-label="Passport type" invalid required defaultValue="standard">
  <Radio.Item value="standard">
    <Radio.Indicator />
    <Radio.Label>Standard passport</Radio.Label>
  </Radio.Item>
  <Radio.Item value="diplomatic" disabled>
    <Radio.Indicator />
    <Radio.Label>Diplomatic passport (unavailable)</Radio.Label>
  </Radio.Item>
</Radio>
```

### Item render-prop

`Radio.Item` accepts a function child receiving per-item Spar state
(`isChecked`, `disabled`, `isFocused`, `select`):

```tsx
<Radio.Item value="exit">
  {({ isChecked }) => (
    <>
      <Radio.Indicator />
      <Radio.Label>
        Exit row
        <span className="text-text-base text-(length:--desktop-body-xs-size) leading-(--desktop-body-xs-line-height) font-normal">
          {isChecked
            ? 'Selected — extra legroom.'
            : 'Extra legroom, eligibility required.'}
        </span>
      </Radio.Label>
    </>
  )}
</Radio.Item>
```

## Key props

### `Radio` (root)

| Prop            | Type                           | Default      | Notes                                                                            |
| --------------- | ------------------------------ | ------------ | -------------------------------------------------------------------------------- |
| `value`         | `string`                       | -            | Controlled selected value; pair with `onChange`.                                 |
| `defaultValue`  | `string`                       | -            | Uncontrolled initial selection.                                                  |
| `onChange`      | `(value: string) => void`      | -            | Fires when the selection changes.                                                |
| `size`          | `'small' \| 'base' \| 'large'` | `'base'`     | Cascades to items.                                                               |
| `orientation`   | `'vertical' \| 'horizontal'`   | `'vertical'` | Group layout axis.                                                               |
| `position`      | `'left' \| 'right'`            | `'left'`     | Indicator placement; item can override.                                          |
| `spread`        | `boolean`                      | `false`      | Stretch items to share the group axis.                                           |
| `invalid`       | `boolean`                      | `false`      | Visually invalid group; sets `aria-invalid`. Inherited from a `<Field invalid>`. |
| `required`      | `boolean`                      | `false`      | Surfaces required state.                                                         |
| `selectOnFocus` | `boolean`                      | `true`       | Set `false` to decouple focus from selection.                                    |
| `autoFocus`     | `boolean`                      | `false`      | Move focus into the group on mount.                                              |

### `Radio.Item`

| Prop       | Type                | Default   | Notes                                                |
| ---------- | ------------------- | --------- | ---------------------------------------------------- |
| `value`    | `string`            | -         | Required. Identifies this option in the group.       |
| `position` | `'left' \| 'right'` | inherited | Override the group indicator position for this item. |
| `disabled` | `boolean`           | `false`   | Skip pointer + keyboard activation for this item.    |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Root renders `role="radiogroup"`; each `Radio.Item` is a
  `<label role="radio">` wrapping a hidden `<input type="radio">`, so the group
  participates in native form submission.
- Always provide a group label via `aria-label` or `aria-labelledby`.
  `Radio.Label` labels the individual item.
- `Radio.Indicator` is decorative (`aria-hidden`); checked state is surfaced via
  `aria-checked` on the item.
- Keyboard: `Tab` enters the group (lands on the checked or first item); `↓`/`→`
  next + select; `↑`/`←` previous + select; `Space` selects the focused item.
  Disabled items are skipped.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/radio
- Source: `packages/react-spar/src/components/radio/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Radio
