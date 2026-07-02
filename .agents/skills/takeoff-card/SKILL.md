---
name: takeoff-card
description:
  'Build a Card surface that groups related content and actions with consistent
  spacing, typography, and theming. This is the Card from @takeoff-ui/react-spar
  (Takeoff UI / Spar React), a compound component with Card.Header, Card.Title,
  Card.Description, Card.Body, and Card.Footer parts. Use this skill WHENEVER
  building, adding, importing, styling, or fixing a Card, content card, panel,
  tile, summary card, info box, or boxed/bordered content container in a React
  app that uses @takeoff-ui/react-spar / Takeoff / Spar. Trigger contexts: card
  layout, header/footer/body sections, card title, dashboard tiles,
  product/summary cards.'
---

# Card — @takeoff-ui/react-spar

`Card` groups related content and actions in a flexible surface, with compound
parts for consistent spacing, typography, and theming.

**When to use:** Reach for `Card` whenever you need a bordered surface that
bundles a heading, body content, and an optional action footer. Build the
structure from its compound parts rather than nesting raw divs.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Card } from '@takeoff-ui/react-spar';
```

## Compound parts

- `Card` — root surface wrapper.
- `Card.Header` — top region; styled via `headerType`.
- `Card.Title` — heading inside the header; controls semantic `level`.
- `Card.Description` — muted descriptive text.
- `Card.Body` — main content region.
- `Card.Footer` — bottom region for actions; styled via `footerType`.

## Basic usage

```tsx
<Card className="w-full max-w-120">
  <Card.Header>
    <Card.Title>Flight Summary</Card.Title>
  </Card.Header>
  <Card.Body>
    <Card.Description>IST to LHR · 18 Jun 2026</Card.Description>
  </Card.Body>
  <Card.Footer>
    <Button appearance="text">Details</Button>
    <Button>Check in</Button>
  </Card.Footer>
</Card>
```

`Button` is also exported from `@takeoff-ui/react-spar`.

## Examples

### Header types

`headerType` accepts `'basic' | 'divided' | 'light' | 'dark' | 'primary'`.

```tsx
<Card>
  <Card.Header headerType="divided">
    <Card.Title>Payment</Card.Title>
  </Card.Header>
  <Card.Body>
    <Card.Description>Card ending in 4242</Card.Description>
  </Card.Body>
</Card>
```

### Footer types

`footerType` accepts `'basic' | 'divided' | 'light'`.

```tsx
import { Button } from '@takeoff-ui/react-spar';

<Card>
  <Card.Header>
    <Card.Title>Delete project?</Card.Title>
  </Card.Header>
  <Card.Body>
    <Card.Description>This action cannot be undone.</Card.Description>
  </Card.Body>
  <Card.Footer footerType="divided">
    <Button variant="neutral" appearance="text">
      Cancel
    </Button>
    <Button>Confirm</Button>
  </Card.Footer>
</Card>;
```

### Title heading level

`Card.Title` renders a semantic heading; set `level` (1–6, default `5`) for
document outline correctness.

```tsx
<Card>
  <Card.Header>
    <Card.Title level={2}>Account overview</Card.Title>
  </Card.Header>
  <Card.Body>
    <Card.Description>Manage your subscription and billing.</Card.Description>
  </Card.Body>
</Card>
```

### Card with action and badge

```tsx
import { Badge, Button } from '@takeoff-ui/react-spar';

<Card className="w-full max-w-120">
  <Card.Header>
    <Card.Title>Flight Summary</Card.Title>
  </Card.Header>
  <Card.Body>
    <Card.Description>IST to LHR · 18 Jun 2026</Card.Description>
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm text-neutral-500">Departure</div>
        <div className="text-lg font-medium">09:40</div>
      </div>
      <Badge variant="success" appearance="filledLight">
        On time
      </Badge>
    </div>
  </Card.Body>
  <Card.Footer>
    <Button appearance="text">Details</Button>
    <Button>Check in</Button>
  </Card.Footer>
</Card>;
```

## Key props

| Prop                       | Type                                                         | Default   | Notes                                             |
| -------------------------- | ------------------------------------------------------------ | --------- | ------------------------------------------------- |
| `headerType` (Card.Header) | `'basic' \| 'divided' \| 'light' \| 'dark' \| 'primary'`     | `'basic'` | Visual style of the header region.                |
| `footerType` (Card.Footer) | `'basic' \| 'divided' \| 'light'`                            | `'basic'` | Visual style of the footer region.                |
| `level` (Card.Title)       | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                 | `5`       | Semantic heading level when `as` is not provided. |
| `classNames` (parts)       | `Partial<Record<"root", string>>`                            | –         | Per-slot extra classes.                           |
| `slotProps` (parts)        | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | –         | Per-slot HTML-attribute overrides.                |
| `className` (Card)         | `string`                                                     | –         | Classes on the root surface.                      |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/card
- Source: `packages/react-spar/src/components/card/`
