---
name: takeoff-chip
description:
  "Compact inline label/tag with optional remove and clickable actions — the
  Chip from @takeoff-ui/react-spar (Takeoff UI / Spar React). Use WHENEVER
  building, adding, importing, styling, or fixing a chip, tag, pill,
  badge-label, filter chip, removable token, or selected-value chip in a React
  app that uses @takeoff-ui/react-spar / Takeoff / Spar. Triggers: 'add a chip',
  'filter chips', 'removable tag', 'dismissible label', 'selectable pill'."
---

# Chip — @takeoff-ui/react-spar

`Chip` is a compact inline label used for filters, entered values, and short
metadata, with an optional built-in remove action that dismisses the chip from
the DOM.

**When to use:** Reach for `Chip` for filter tags, entered/selected values, and
short status metadata. Make it `clickable` for filter selection or `removable`
for dismissible tokens. Not this — use takeoff-badge for non-interactive
count/status indicators.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Chip } from '@takeoff-ui/react-spar';
```

## Basic usage

```tsx
<Chip removable>Business class</Chip>
```

## Examples

### Variants

```tsx
<div className="flex flex-wrap gap-3">
  <Chip variant="primary">Primary</Chip>
  <Chip variant="success">Success</Chip>
  <Chip variant="danger">Danger</Chip>
  <Chip variant="warning">Warning</Chip>
  <Chip variant="info">Info</Chip>
  <Chip variant="neutral">Neutral</Chip>
</div>
```

Full variant set: `primary`, `secondary`, `neutral`, `info`, `success`,
`danger`, `warning`, `verified`, `purple`, `cyan`, `business`, `teal`, `white`,
`dark`.

### Appearances and sizes

```tsx
<div className="flex flex-wrap items-center gap-3">
  <Chip appearance="filled">Filled</Chip>
  <Chip appearance="filledLight">Filled Light</Chip>
  <Chip appearance="outlined">Outlined</Chip>
  <Chip size="small">Small</Chip>
  <Chip size="large">Large</Chip>
</div>
```

### Removable (parent owns the list)

By default a removable chip dismisses itself. When the parent renders chips from
an array, set `autoDismiss={false}` and drive state from `onRemove` to avoid two
sources of truth.

```tsx
import { useState } from 'react';

function Filters() {
  const [tags, setTags] = useState(['Cabin bag', 'Window seat', 'Meal']);

  return (
    <div className="flex flex-wrap gap-3">
      {tags.map(tag => (
        <Chip
          key={tag}
          variant="primary"
          removable
          autoDismiss={false}
          onRemove={() => setTags(prev => prev.filter(t => t !== tag))}
        >
          {tag}
        </Chip>
      ))}
    </div>
  );
}
```

### Clickable (filter selection)

```tsx
import { useState } from 'react';

function FareFilter() {
  const [selected, setSelected] = useState('Economy');

  return (
    <div className="flex flex-wrap gap-3">
      {['Economy', 'Business', 'Miles'].map(option => (
        <Chip
          key={option}
          clickable
          appearance={selected === option ? 'filled' : 'outlined'}
          variant={selected === option ? 'primary' : 'secondary'}
          onClick={() => setSelected(option)}
        >
          {option}
        </Chip>
      ))}
    </div>
  );
}
```

## Key props

| Prop          | Type                                | Default     | Notes                                                                   |
| ------------- | ----------------------------------- | ----------- | ----------------------------------------------------------------------- |
| `children`    | `React.ReactNode`                   | -           | Chip content.                                                           |
| `variant`     | `ChipVariant`                       | `'primary'` | Color variant (14 options).                                             |
| `appearance`  | `ChipAppearance`                    | `'filled'`  | `'filled' \| 'filledLight' \| 'outlined'`.                              |
| `size`        | `ChipSize`                          | `'base'`    | `'small' \| 'base' \| 'large'`.                                         |
| `removable`   | `boolean`                           | `false`     | Renders a labeled remove button in the tab sequence.                    |
| `clickable`   | `boolean`                           | `false`     | Makes the root keyboard-focusable and button-like.                      |
| `disabled`    | `boolean`                           | `false`     | Disables interaction and remove actions; removed from tab order.        |
| `autoDismiss` | `boolean`                           | `true`      | Self-dismiss after remove. Set `false` when the parent owns the list.   |
| `onRemove`    | `() => void`                        | -           | Fires on remove button press or focused-clickable `Backspace`/`Delete`. |
| `onClick`     | `(e) => void`                       | -           | Action handler for clickable chips.                                     |
| `classNames`  | `Partial<Record<ChipSlot, string>>` | -           | Per-slot extra classes (`root`/`label`/`remove`).                       |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Static (non-interactive) chip roots are not focusable.
- Clickable chips use a button-like root and respond to `Enter` and `Space`.
- The remove button is a labeled control in the tab sequence, activated with
  `Enter` or `Space`.
- Clickable removable chips also accept `Delete` and `Backspace` while the root
  is focused.
- Disabled chips do not receive focus and ignore remove actions.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/chip
- Source: `packages/react-spar/src/components/chip/`
