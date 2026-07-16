---
name: takeoff-label
description:
  'Lightweight text Label for section titles, metadata, and explicit control
  associations — the Label from @takeoff-ui/react-spar (Takeoff UI / Spar
  React). Trigger when you need a form label, htmlFor association, field
  caption, required/optional/disabled/invalid label styling, or a standalone
  label primitive. Use this skill WHENEVER building, adding, importing, styling,
  or fixing a Label (or related label/caption UI) in a React app that uses
  @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Label — @takeoff-ui/react-spar

A lightweight text label for section titles, metadata, and explicit control
associations when a full `Field` layout is not needed.

**When to use:** Reach for `Label` when you only need the label primitive — a
section title, a caption, or a manual `htmlFor` association to a native control.
Not this — use **takeoff-field** (`Field` + `Field.Label`) for complete form
fields that wire the label, control, helper/error text, and
required/invalid/disabled/read-only state together with shared ARIA ids.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Label } from '@takeoff-ui/react-spar';
```

## Basic usage

```tsx
// Standalone label (section title / metadata)
<Label as="span">Payment Method</Label>

// Associate with a native control via htmlFor
<Label htmlFor="pnr">PNR</Label>
<input id="pnr" />
```

## Examples

### Section title

Use `as` to render the label as the right element; pass typography tokens via
`style` when it doubles as a heading.

```tsx
<Label
  as="h4"
  style={{
    fontFamily: 'var(--desktop-title-h4-font)',
    fontSize: 'var(--desktop-title-h4-size)',
    fontWeight: 'var(--desktop-title-h4-line-weight)',
    lineHeight: 'var(--desktop-title-h4-line-height)',
  }}
>
  Payment Method
</Label>
```

### State flags

`required`, `optional`, `disabled`, `readOnly`, and `invalid` are emitted as
`data-*` attributes on the label for styling only — they do NOT set
`required`/`disabled`/`readOnly`/`aria-invalid` on the related control. Set the
matching state on the control yourself (or use `Field`). A `required` label
renders a decorative asterisk after the text.

```tsx
<Label htmlFor="email" required>Required label</Label>
<input id="email" required />

<Label htmlFor="phone" optional>Optional label</Label>
<input id="phone" />

<Label htmlFor="locked" disabled>Disabled label</Label>
<input id="locked" disabled />

<Label htmlFor="ref" readOnly>Read-only label</Label>
<input id="ref" readOnly defaultValue="TK-1928" />

<Label htmlFor="bad" invalid>Invalid label</Label>
<input id="bad" aria-invalid="true" />
```

### Wiring to a Takeoff Input

Manual association is possible, but `Field` is usually the better choice. If you
wire it manually, set the base id on `Input` and point `htmlFor` at the field id
Spar generates (`${id}-field`).

```tsx
import { Label, Input } from '@takeoff-ui/react-spar';

<Label id="passenger-name-label" htmlFor="passenger-name-field">
  Passenger name
</Label>
<Input id="passenger-name">
  <Input.Field placeholder="Ada Lovelace" />
</Input>
```

### Label vs Field

When you need helper text, error text, invalid styling, or shared
disabled/read-only/required state, use `Field.Label` inside `Field` instead.

```tsx
import { Field, Input } from '@takeoff-ui/react-spar';

<Field className="w-full max-w-90" required>
  <Field.Label>Passenger email</Field.Label>
  <Input>
    <Input.Field type="email" placeholder="you@example.com" />
  </Input>
  <Field.Description>
    Use Field when the label, helper text, invalid state, and control should be
    wired together.
  </Field.Description>
</Field>;
```

## Key props

| Prop         | Type                                                         | Default | Notes                                                                       |
| ------------ | ------------------------------------------------------------ | ------- | --------------------------------------------------------------------------- |
| `children`   | `React.ReactNode`                                            | –       | Label content.                                                              |
| `as`         | element type                                                 | –       | Polymorphic element to render (e.g. `"span"`, `"h4"`); shown in docs demos. |
| `htmlFor`    | `string`                                                     | –       | Id of the associated control. For Takeoff `Input`, target `${id}-field`.    |
| `required`   | `boolean`                                                    | `false` | Styling-only flag → `data-required`; renders a decorative asterisk.         |
| `optional`   | `boolean`                                                    | `false` | Styling-only flag → `data-optional`.                                        |
| `disabled`   | `boolean`                                                    | `false` | Styling-only flag → `data-disabled`.                                        |
| `readOnly`   | `boolean`                                                    | `false` | Styling-only flag → `data-readonly`.                                        |
| `invalid`    | `boolean`                                                    | `false` | Styling-only flag → `data-invalid`.                                         |
| `className`  | `string`                                                     | –       | Appends custom classes to the root slot.                                    |
| `classNames` | `Partial<Record<"root", string>>`                            | –       | Per-slot extra classes.                                                     |
| `slotProps`  | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | –       | Per-slot HTML-attribute overrides.                                          |

The state flags emit `data-*` attributes for styling only — they never mutate
the associated control. Use `Field` when label and control state must stay
synchronized.

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- The default element is a native `<label>`; connect it to a native control with
  `htmlFor` and the control's `id`.
- When rendered polymorphically as `span`, a heading, or another element, Label
  no longer provides native form-label association.
- `required`, `optional`, `disabled`, `readOnly`, and `invalid` are styling
  hooks only. Mirror meaningful state on the control or use `Field` to
  synchronize it.
- The required asterisk is decorative. Required semantics must come from the
  associated control/Field state, not the glyph alone.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/label
- Source: `packages/react-spar/src/components/label/`
