---
name: takeoff-select
description:
  'Build an accessible custom dropdown Select (combobox/listbox) — the Select
  from @takeoff-ui/react-spar (Takeoff UI / Spar React). Use WHENEVER building,
  adding, importing, styling, or fixing a Select, dropdown, picker, combobox,
  single-choice option list, or form field with selectable options
  (cabin/country/fare pickers, grouped option menus) in a React app that uses
  @takeoff-ui/react-spar / Takeoff / Spar. Covers Select.Trigger,
  Select.Content, Select.Item, groups, separators, sizes, controlled value,
  invalid state, and Field integration.'
---

# Select — @takeoff-ui/react-spar

`Select` is a fully-keyboard, accessible custom select: state (value, open,
disabled, required) lives on the root, the trigger renders the collapsed button,
and the content portals a positioned dropdown.

**When to use:** Single-choice dropdown pickers where you want a styled,
portalled listbox instead of a native `<select>`. Wrap in a `Field` to attach a
label, helper text, or error message. Not for free-text or async option
filtering — and not a multi-select.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Field, Select } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Select.Trigger` — the collapsed combobox button; shows the selected item's
  `label` or `placeholder`, plus a disclosure indicator.
- `Select.Content` — the portalled `role="listbox"` dropdown panel (positioned
  with Floating UI).
- `Select.Viewport` — optional bounded scroll container for long option lists.
- `Select.Item` — a selectable option; needs a `value` and a `label` (text used
  for typeahead + trigger display).
- `Select.Group` — groups related items under a label.
- `Select.Label` — section heading inside a `Select.Group`.
- `Select.Separator` — visual divider between groups/items.
- `Select.Arrow` — optional pointer from the panel toward the trigger.
- `Select.Indicator` — standalone disclosure glyph for full render-prop layouts.

## Basic usage

```tsx
<Field className="max-w-90" required>
  <Field.Label>Cabin</Field.Label>
  <Select defaultValue="economy">
    <Select.Trigger placeholder="Pick a cabin" />
    <Select.Content>
      <Select.Item value="economy" label="Economy">
        Economy
      </Select.Item>
      <Select.Item value="business" label="Business">
        Business
      </Select.Item>
      <Select.Item value="first" label="First class">
        First class
      </Select.Item>
    </Select.Content>
  </Select>
  <Field.Description>Select the cabin for this itinerary.</Field.Description>
</Field>
```

## Examples

### Controlled value

```tsx
import { useState } from 'react';

function ControlledSelect() {
  const [value, setValue] = useState('eco');
  return (
    <Select value={value} onChange={setValue}>
      <Select.Trigger placeholder="Pick a fare" />
      <Select.Content>
        <Select.Item value="eco" label="Eco">
          Eco
        </Select.Item>
        <Select.Item value="flex" label="Eco Flex">
          Eco Flex
        </Select.Item>
        <Select.Item value="biz" label="Business">
          Business
        </Select.Item>
      </Select.Content>
    </Select>
  );
}
```

### Sizes

```tsx
<Select size="small">{/* … */}</Select>
<Select size="base">{/* … */}</Select>
<Select size="large">{/* … */}</Select>
```

`size` accepts `'small' | 'base' | 'large'` (default `'base'`).

### Groups, separator, disabled item

```tsx
<Select className="max-w-90" defaultValue="ist">
  <Select.Trigger placeholder="Choose origin" />
  <Select.Content>
    <Select.Group>
      <Select.Label>Türkiye</Select.Label>
      <Select.Item value="ist" label="Istanbul">
        Istanbul
      </Select.Item>
      <Select.Item value="ank" label="Ankara">
        Ankara
      </Select.Item>
    </Select.Group>
    <Select.Separator />
    <Select.Group>
      <Select.Label>Europe</Select.Label>
      <Select.Item value="lhr" label="London Heathrow">
        London Heathrow
      </Select.Item>
      <Select.Item value="fra" disabled label="Frankfurt (unavailable)">
        Frankfurt (unavailable)
      </Select.Item>
    </Select.Group>
  </Select.Content>
</Select>
```

### Invalid state

```tsx
<Select className="max-w-90" invalid>
  <Select.Trigger placeholder="Required field" />
  <Select.Content>
    <Select.Item value="a" label="Option A">
      Option A
    </Select.Item>
    <Select.Item value="b" label="Option B">
      Option B
    </Select.Item>
  </Select.Content>
</Select>
```

### Custom indicator

`Select.Trigger` renders a chevron that flips with the open state by default.
Pass `indicator` a node, a render function `({ isOpen }) => …`, or `false` to
hide it.

```tsx
<Select.Trigger
  placeholder="Custom icon"
  indicator={({ isOpen }) => (isOpen ? '▲' : '▼')}
/>
```

For full layout control, give `Select.Trigger` a render-prop `children` (opts
out of the built-in indicator/value wrapper) and place a standalone
`Select.Indicator`:

```tsx
<Select.Trigger>
  {({ label }) => (
    <>
      <span className="tk-select-value">{label || 'Choose a city'}</span>
      <Select.Indicator>
        {({ isOpen }) => (isOpen ? '▲' : '▼')}
      </Select.Indicator>
    </>
  )}
</Select.Trigger>
```

## Key props

| Prop                                 | Type                                                | Default                 | Notes                                             |
| ------------------------------------ | --------------------------------------------------- | ----------------------- | ------------------------------------------------- |
| `value`                              | `string`                                            | -                       | Controlled selected value (pair with `onChange`). |
| `defaultValue`                       | `string`                                            | -                       | Uncontrolled initial value.                       |
| `onChange`                           | `(value: string) => void`                           | -                       | Fires when selection changes.                     |
| `size`                               | `'small' \| 'base' \| 'large'`                      | `'base'`                | Size scale.                                       |
| `invalid`                            | `boolean`                                           | `false`                 | Danger-state styling for validation.              |
| `disabled` / `required` / `readOnly` | `boolean`                                           | -                       | Form state; inherited from a wrapping `Field`.    |
| `open` / `defaultOpen`               | `boolean`                                           | - / `false`             | Controlled / uncontrolled open state.             |
| `onOpenChange`                       | `(open: boolean) => void`                           | -                       | Fires when the dropdown opens/closes.             |
| `contentWidth`                       | `'trigger' \| 'content' \| number \| string`        | `'trigger'`             | How the panel computes its width.                 |
| `Select.Trigger` `placeholder`       | `React.ReactNode`                                   | -                       | Shown when no value is selected.                  |
| `Select.Trigger` `indicator`         | `boolean \| ReactNode \| ((s:{isOpen})=>ReactNode)` | `true`                  | Disclosure indicator; `false` hides it.           |
| `Select.Content` `side` / `align`    | `Side` / `Align`                                    | `'bottom'` / `'center'` | Floating UI positioning.                          |
| `Select.Item` `value` / `label`      | `string`                                            | -                       | Option value + display/typeahead text.            |
| `Select.Item` `disabled`             | `boolean`                                           | `false`                 | Disables the option.                              |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- `Select.Trigger` is a button with `role="combobox"`,
  `aria-haspopup="listbox"`, and `aria-expanded`.
- `Select.Content` is a `role="listbox"` portalled to `document.body` and
  positioned with Floating UI.
- Use `Select.Viewport` when options may overflow. Keep `Select.Arrow` outside
  the viewport so scrolling does not clip it.
- The trigger exposes the selected item's `label` (or `placeholder`) as its
  accessible name; inside a `Field` it also gets `aria-labelledby` from the
  Field label.
- Keyboard: Enter/Space opens or selects; ↓/↑ open and move highlight; Home/End
  jump to first/last; Esc closes without changing selection; typing characters
  does typeahead to the first matching item.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/select
- Source: `packages/react-spar/src/components/select/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Select
