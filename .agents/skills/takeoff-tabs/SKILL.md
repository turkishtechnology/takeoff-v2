---
name: takeoff-tabs
description:
  'Build tabbed/segmented interfaces with the Tabs component from
  @takeoff-ui/react-spar (Takeoff UI / Spar React). Use WHENEVER building,
  adding, importing, styling, or fixing tabs, tab bars, tablists, tabbed panels,
  segmented controls, tab navigation, switchers, or panel switching in a React
  app that uses @takeoff-ui/react-spar / Takeoff / Spar. Covers Tabs.List,
  Tabs.Trigger, Tabs.Content, controlled value, sizes, variants, appearance, and
  vertical orientation.'
---

# Tabs — @takeoff-ui/react-spar

A compound tabs component (built on Spar primitives) for switching between
mutually exclusive panels of content.

**When to use:** Reach for Tabs whenever a UI needs a tablist that swaps panels
— settings sections, detail views, segmented controls. Not for accordions or
wizards/steppers; use a dedicated component for those.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Tabs } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Tabs` — root; holds selection state and the
  `size`/`variant`/`appearance`/`orientation` config.
- `Tabs.List` — the `role="tablist"` container. Pass `aria-label`.
- `Tabs.Trigger` — a selectable `role="tab"` button; needs a `value`. Supports
  `disabled` and render-prop children.
- `Tabs.Content` — a `role="tabpanel"` for a matching `value`; lazy-mounts by
  default.

## Basic usage

```tsx
<Tabs defaultValue="overview" className="w-120">
  <Tabs.List aria-label="Booking details">
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="passengers">Passengers</Tabs.Trigger>
    <Tabs.Trigger value="payments">Payments</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">Istanbul to London · TK1985</Tabs.Content>
  <Tabs.Content value="passengers">2 passengers · seats 12A/12B</Tabs.Content>
  <Tabs.Content value="payments">Paid · card ending 2046</Tabs.Content>
</Tabs>
```

## Examples

### Controlled state

Use `value` + `onValueChange` when other UI must react to the current tab.
Requires `import { useState } from 'react'`.

```tsx
const [value, setValue] = useState('scheduled');

return (
  <Tabs value={value} onValueChange={setValue} className="w-120">
    <Tabs.List aria-label="Flight status">
      <Tabs.Trigger value="scheduled">Scheduled</Tabs.Trigger>
      <Tabs.Trigger value="boarding">Boarding</Tabs.Trigger>
      <Tabs.Trigger value="delayed">Delayed</Tabs.Trigger>
    </Tabs.List>
  </Tabs>
);
```

### Sizes

`size` on the root scales every trigger in the set: `small`, `base` (default),
`large`.

```tsx
<Tabs size="large" defaultValue="one" className="w-120">
  <Tabs.List aria-label="Large tabs">
    <Tabs.Trigger value="one">One-way</Tabs.Trigger>
    <Tabs.Trigger value="round">Round trip</Tabs.Trigger>
    <Tabs.Trigger value="multi">Multi-city</Tabs.Trigger>
  </Tabs.List>
</Tabs>
```

### Appearance & variant

`appearance` switches the tab style (`basic`, `compact`, `divided`, `expanded`);
`variant` recolors the active tab (`primary`, `info`, `neutral`).

```tsx
<Tabs appearance="divided" variant="info" defaultValue="flights">
  <Tabs.List aria-label="Search tabs">
    <Tabs.Trigger value="flights">Flights</Tabs.Trigger>
    <Tabs.Trigger value="hotels">Hotels</Tabs.Trigger>
    <Tabs.Trigger value="cars">Cars</Tabs.Trigger>
  </Tabs.List>
</Tabs>
```

### Vertical orientation

`orientation="vertical"` lays the tablist out as side navigation.

```tsx
<Tabs orientation="vertical" defaultValue="fare" className="w-120">
  <Tabs.List aria-label="Fare details" className="w-40 shrink-0">
    <Tabs.Trigger value="fare">Fare</Tabs.Trigger>
    <Tabs.Trigger value="baggage">Baggage</Tabs.Trigger>
    <Tabs.Trigger value="rules">Rules</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="fare">
    Flexible economy fare with same-day change.
  </Tabs.Content>
  <Tabs.Content value="baggage">
    One cabin bag and one checked bag up to 23 kg.
  </Tabs.Content>
  <Tabs.Content value="rules">Refundable before departure.</Tabs.Content>
</Tabs>
```

### Render-prop triggers

`Tabs.Trigger` children may be a function receiving
`{ isSelected, disabled, isFocused, orientation, select }`.

```tsx
<Tabs defaultValue="mobile">
  <Tabs.List aria-label="Check-in channel">
    <Tabs.Trigger value="mobile">
      {({ isSelected }) => (isSelected ? 'Mobile selected' : 'Mobile')}
    </Tabs.Trigger>
    <Tabs.Trigger value="counter">Counter</Tabs.Trigger>
    <Tabs.Trigger value="kiosk" disabled>
      Kiosk closed
    </Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="mobile">
    Mobile check-in opens 24h before departure.
  </Tabs.Content>
  <Tabs.Content value="counter">
    Counters open 3h before departure.
  </Tabs.Content>
</Tabs>
```

## Key props

| Prop                 | Type                                              | Default        | Notes                                                      |
| -------------------- | ------------------------------------------------- | -------------- | ---------------------------------------------------------- |
| `defaultValue`       | `string`                                          | -              | Initial selected tab (uncontrolled).                       |
| `value`              | `string`                                          | -              | Selected tab (controlled); pair with `onValueChange`.      |
| `onValueChange`      | `(value: string) => void`                         | -              | Fires when selection changes.                              |
| `size`               | `'small' \| 'base' \| 'large'`                    | `'base'`       | Scales all triggers; cascades via context.                 |
| `variant`            | `'primary' \| 'info' \| 'neutral'`                | `'primary'`    | Active-tab color treatment.                                |
| `appearance`         | `'basic' \| 'compact' \| 'divided' \| 'expanded'` | `'basic'`      | Visual tab style.                                          |
| `orientation`        | `'horizontal' \| 'vertical'`                      | `'horizontal'` | Tablist layout direction.                                  |
| `activationMode`     | `'automatic' \| 'manual'`                         | `'automatic'`  | `manual` requires Enter/Space to activate the focused tab. |
| `Trigger value`      | `string`                                          | -              | Required id matching a `Tabs.Content value`.               |
| `Trigger disabled`   | `boolean`                                         | `false`        | Skips the tab in keyboard navigation.                      |
| `Content value`      | `string`                                          | -              | Matches a trigger's `value`.                               |
| `Content forceMount` | `boolean`                                         | `false`        | Keep an inactive panel mounted in the DOM.                 |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- `Tabs.List` renders `role="tablist"` and wires `aria-orientation`; always give
  it an `aria-label`.
- `Tabs.Trigger` renders a `role="tab"` button with `aria-selected` and
  `aria-controls` linking its panel.
- `Tabs.Content` renders `role="tabpanel"` and lazy-mounts by default; use
  `forceMount` to keep inactive panels in the DOM.
- Keyboard: Tab moves focus into the active tab then panel; ↓/→ next tab, ↑/←
  previous (per orientation); Home/End jump to first/last enabled tab;
  Enter/Space activate when `activationMode="manual"`.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/tabs
- Source: `packages/react-spar/src/components/tabs/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Tabs
