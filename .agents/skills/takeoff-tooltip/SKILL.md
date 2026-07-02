---
name: takeoff-tooltip
description:
  'Floating hover/focus label that shows brief contextual info, with variant,
  header, description, and arrow slots. This is the Tooltip from
  @takeoff-ui/react-spar (Takeoff UI / Spar React). Use WHENEVER building,
  adding, importing, styling, or fixing a tooltip, hover hint, info bubble,
  hover tip, focus hint, or aria-describedby helper text in a React app that
  uses @takeoff-ui/react-spar / Takeoff / Spar. Covers variants, placement
  (side/align), provider delay groups, arrow, and controlled open state.'
---

# Tooltip — @takeoff-ui/react-spar

`Tooltip` displays a floating label on hover or focus to provide brief
contextual information, wrapping the Spar headless Tooltip primitive with
Takeoff variant, header, description, and arrow slots.

**When to use:** Brief, non-interactive hints attached to a trigger element
(button, icon). For rich interactive overlays opened on click use a Popover
instead; for click-dismissable menus use a Dropdown.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Tooltip } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Tooltip` — root; owns open state, delay, and ARIA wiring.
- `Tooltip.Provider` — wraps a group to share `delayDuration` /
  `skipDelayDuration`.
- `Tooltip.Trigger` — the hover/focus target; use `as={Button}` to render any
  element.
- `Tooltip.Content` — the floating panel; takes `variant`, `side`, `align`.
- `Tooltip.Header` — optional bold title line inside content.
- `Tooltip.Description` — the body text inside content.
- `Tooltip.Arrow` — optional pointer arrow attached to content.

## Basic usage

```tsx
import { Tooltip, Button } from '@takeoff-ui/react-spar';

<Tooltip>
  <Tooltip.Trigger as={Button}>Hover me</Tooltip.Trigger>
  <Tooltip.Content>
    <Tooltip.Description>Simple tooltip</Tooltip.Description>
  </Tooltip.Content>
</Tooltip>;
```

## Examples

### Variants

```tsx
import { Tooltip, Button } from '@takeoff-ui/react-spar';

// variant: 'white' | 'dark' | 'info' | 'success' | 'warning' | 'danger' | 'neutral'
<Tooltip>
  <Tooltip.Trigger as={Button}>Info</Tooltip.Trigger>
  <Tooltip.Content variant="info">
    <Tooltip.Description>Info variant</Tooltip.Description>
  </Tooltip.Content>
</Tooltip>;
```

### Placement

```tsx
import { Tooltip, Button } from '@takeoff-ui/react-spar';

// side: 'top' | 'right' | 'bottom' | 'left'  ·  align: 'start' | 'center' | 'end'
<Tooltip>
  <Tooltip.Trigger as={Button}>Right</Tooltip.Trigger>
  <Tooltip.Content side="right" align="center">
    <Tooltip.Description>Positioned right</Tooltip.Description>
  </Tooltip.Content>
</Tooltip>;
```

### Header, description & arrow

```tsx
import { Tooltip, Button } from '@takeoff-ui/react-spar';

<Tooltip>
  <Tooltip.Trigger as={Button}>With header</Tooltip.Trigger>
  <Tooltip.Content variant="info">
    <Tooltip.Header>Important</Tooltip.Header>
    <Tooltip.Description>
      This tooltip has a header and description.
    </Tooltip.Description>
    <Tooltip.Arrow />
  </Tooltip.Content>
</Tooltip>;
```

### Provider (shared delay group)

Share `delayDuration` and a `skipDelayDuration` window so that once one tooltip
opens, moving to a sibling within the window opens it instantly. Recommended for
toolbar clusters (WCAG 1.4.13).

```tsx
import { Tooltip, Button } from '@takeoff-ui/react-spar';

<Tooltip.Provider delayDuration={300} skipDelayDuration={150}>
  <Tooltip>
    <Tooltip.Trigger as={Button}>First</Tooltip.Trigger>
    <Tooltip.Content>
      <Tooltip.Description>
        Hover, then move to the next one
      </Tooltip.Description>
    </Tooltip.Content>
  </Tooltip>
  <Tooltip>
    <Tooltip.Trigger as={Button}>Second</Tooltip.Trigger>
    <Tooltip.Content>
      <Tooltip.Description>
        Opens instantly within skip window
      </Tooltip.Description>
    </Tooltip.Content>
  </Tooltip>
</Tooltip.Provider>;
```

### Controlled

```tsx
import { useState } from 'react';
import { Tooltip, Button } from '@takeoff-ui/react-spar';

function ControlledTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger as={Button}>Controlled</Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Description>Controlled tooltip</Tooltip.Description>
        </Tooltip.Content>
      </Tooltip>
      <Button onClick={() => setOpen(!open)}>{open ? 'Hide' : 'Show'}</Button>
    </>
  );
}
```

## Key props

| Prop                                  | Type                      | Default         | Notes                                                                              |
| ------------------------------------- | ------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `open`                                | `boolean`                 | –               | Controlled visibility (pair with `onOpenChange`). On `Tooltip`.                    |
| `defaultOpen`                         | `boolean`                 | `false`         | Uncontrolled initial open state. On `Tooltip`.                                     |
| `onOpenChange`                        | `(open: boolean) => void` | –               | Fires when open state changes. On `Tooltip`.                                       |
| `disabled`                            | `boolean`                 | `false`         | Disables the tooltip. On `Tooltip`.                                                |
| `delay` / `hideDelay`                 | `number`                  | – / `0`         | Override provider show/hide delay for this tooltip.                                |
| `variant`                             | `TooltipVariant`          | `'white'`       | Color: white, dark, info, success, warning, danger, neutral. On `Tooltip.Content`. |
| `side`                                | `Side`                    | `'top'`         | Preferred placement: top, right, bottom, left. On `Tooltip.Content`.               |
| `align`                               | `Align`                   | `'center'`      | Alignment: start, center, end. On `Tooltip.Content`.                               |
| `container`                           | `HTMLElement \| null`     | `document.body` | Portal target for content. On `Tooltip.Content`.                                   |
| `delayDuration` / `skipDelayDuration` | `number`                  | –               | Shared show delay / skip window. On `Tooltip.Provider`.                            |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Trigger gets `aria-describedby` pointing at the content; content has
  `role="tooltip"`.
- Respects WCAG 1.4.13 — hoverable content stays visible while the pointer is
  over it.
- Escape dismisses the tooltip and returns focus to the trigger.
- Tab focusing the trigger shows the tooltip; blur hides it.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/tooltip
- Source: `packages/react-spar/src/components/tooltip/`
- Spar primitive: https://spar.app.turkishtechlab.com/docs/Components/Tooltip
