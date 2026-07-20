---
name: takeoff-accordion
description:
  'Build collapsible expand/collapse sections with the Accordion from
  @takeoff-ui/react-spar (Takeoff UI / Spar React). Trigger contexts: accordion,
  collapsible panels, expandable sections, FAQ list, disclosure groups,
  show/hide content. Use this skill WHENEVER building, adding, importing,
  styling, or fixing an Accordion (or related collapsible/disclosure UI) in a
  React app that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Accordion — @takeoff-ui/react-spar

`Accordion` organizes related content into collapsible sections so users can
scan dense pages and open only the details they need.

**When to use:** Grouped collapsible sections (FAQs, settings panels, itinerary
details) where open/closed state is owned by Spar. Not this — for a single
standalone show/hide toggle reach for a disclosure/collapse primitive instead.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Accordion } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Accordion` — root disclosure container; owns state/behavior props (`type`,
  `mode`, `size`, `multiple`, `value`, `collapsible`, `orientation`).
- `Accordion.Item` — one section; needs a stable `value`; accepts `disabled`.
- `Accordion.Header` — heading wrapper rendering an `h1`–`h6` (`level`, default
  3).
- `Accordion.Trigger` — native `<button>` toggling its panel; its text is the
  accessible label.
- `Accordion.Indicator` — opt-in disclosure affordance; accepts children or a
  `({ isOpen }) =>` render prop.
- `Accordion.Content` — collapsible panel body (`forceMount` to keep mounted
  when closed).

## Basic usage

```tsx
<Accordion className="w-full max-w-90" defaultValue="fare">
  <Accordion.Item value="fare">
    <Accordion.Header>
      <Accordion.Trigger>
        Fare conditions
        <Accordion.Indicator />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      Review refund windows, change fees, and cabin rules before confirming the
      itinerary.
    </Accordion.Content>
  </Accordion.Item>

  <Accordion.Item value="baggage">
    <Accordion.Header>
      <Accordion.Trigger>
        Baggage allowance
        <Accordion.Indicator />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      Carry-on, checked baggage, and sports equipment allowances stay grouped in
      one panel.
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

## Examples

### Multiple open panels

```tsx
<Accordion
  multiple
  className="w-full max-w-90"
  defaultValue={['boarding', 'baggage']}
  mode="compact"
  type="divided"
>
  <Accordion.Item value="boarding">
    <Accordion.Header>
      <Accordion.Trigger>
        Boarding pass
        <Accordion.Indicator />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      Mobile pass availability, airport counter fallbacks, and printable rules.
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="baggage">
    <Accordion.Header>
      <Accordion.Trigger>
        Bag drop
        <Accordion.Indicator />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      Multiple panels can stay open when users compare related instructions.
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Controlled

```tsx
import { useState } from 'react';

function ControlledAccordion() {
  const [value, setValue] = useState('documents');

  return (
    <Accordion
      value={value}
      onValueChange={setValue}
      collapsible
      className="w-full max-w-90"
    >
      <Accordion.Item value="documents">
        <Accordion.Header>
          <Accordion.Trigger>
            Travel documents
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Controlled state lets app logic decide which task stays expanded.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="seat">
        <Accordion.Header>
          <Accordion.Trigger>
            Seat selection
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Pair value with onValueChange to sync the open panel with route or
          form state.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
```

### Custom indicator

```tsx
import { AddIconOutlinedRounded } from '@takeoff-icons/react/add';
import { RemoveIconOutlinedRounded } from '@takeoff-icons/react/remove';

<Accordion className="w-full max-w-90" defaultValue="service" size="large">
  <Accordion.Item value="service">
    <Accordion.Header level={2}>
      <Accordion.Trigger>
        <Accordion.Indicator>
          {({ isOpen }) =>
            isOpen ? <RemoveIconOutlinedRounded /> : <AddIconOutlinedRounded />
          }
        </Accordion.Indicator>
        Service options
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      Place Accordion.Indicator before or after the title; swap its content via
      children or the ({'{'} isOpen {'}'}) render prop.
    </Accordion.Content>
  </Accordion.Item>
</Accordion>;
```

### Disabled item

Mark a section non-interactive with `disabled` on the `Accordion.Item` (the
trigger renders disabled and ignores pointer/keyboard activation):

```tsx
<Accordion.Item value="locked" disabled>
  <Accordion.Header>
    <Accordion.Trigger>
      Loyalty upgrades (coming soon)
      <Accordion.Indicator />
    </Accordion.Trigger>
  </Accordion.Header>
  <Accordion.Content>
    Disabled items ignore both pointer and keyboard activation.
  </Accordion.Content>
</Accordion.Item>
```

## Key props

| Prop                   | Type                                 | Default      | Notes                                                                 |
| ---------------------- | ------------------------------------ | ------------ | --------------------------------------------------------------------- |
| `type`                 | `'grouped' \| 'divided'`             | `'grouped'`  | Root: visual grouping.                                                |
| `mode`                 | `'default' \| 'compact'`             | `'default'`  | Root: density; pairs with any `type`.                                 |
| `size`                 | `'base' \| 'large'`                  | `'base'`     | Root: size scale.                                                     |
| `multiple`             | `boolean`                            | `false`      | Root: allow several items open at once.                               |
| `defaultValue`         | `AccordionValue \| AccordionValue[]` | -            | Root: uncontrolled initial open item(s).                              |
| `value`                | `AccordionValue \| AccordionValue[]` | -            | Root: controlled open item(s).                                        |
| `onValueChange`        | `(next) => void`                     | -            | Root: fires when open value changes (scalar single / array multiple). |
| `collapsible`          | `boolean`                            | `true`       | Root: in single mode, allow closing the active item.                  |
| `disabled`             | `boolean`                            | `false`      | Root: disable every item.                                             |
| `orientation`          | `'vertical' \| 'horizontal'`         | `'vertical'` | Root: keyboard nav direction.                                         |
| `value` (Item)         | `string \| number`                   | -            | `Accordion.Item`: stable identity (required).                         |
| `disabled` (Item)      | `boolean`                            | `false`      | `Accordion.Item`: disable this section.                               |
| `level` (Header)       | `number`                             | `3`          | `Accordion.Header`: heading level 1-6.                                |
| `forceMount` (Content) | `boolean`                            | `false`      | `Accordion.Content`: keep mounted when closed (e.g. in-page search).  |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Each `Accordion.Trigger` renders a native `<button>` with `aria-expanded` and
  `aria-controls` pointing at its panel.
- Each `Accordion.Content` is a `role="region"` labelled by its trigger via
  `aria-labelledby`.
- `Accordion.Header` renders an `h1`–`h6`; pick the `level` that fits the
  document outline.
- Stable trigger/panel ids derive from the `id` on `Accordion.Item`; set it for
  deterministic markup.
- Keyboard: Enter/Space toggles the focused trigger; ↓/↑ (or →/← when
  `orientation="horizontal"`) move between triggers; Home/End jump to
  first/last. Disabled items skip pointer and keyboard activation and expose
  `data-disabled`.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/accordion
- Source: `packages/react-spar/src/components/accordion/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Accordion
