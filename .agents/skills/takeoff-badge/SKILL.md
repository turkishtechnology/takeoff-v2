---
name: takeoff-badge
description:
  "Build a Badge — the small status/count/category label from
  @takeoff-ui/react-spar (Takeoff UI / Spar React). Triggers when you need a
  status pill, count badge, notification dot, label/tag/chip,
  'new'/'active'/'verified' indicator, or a number bubble on an icon. Use this
  skill WHENEVER building, adding, importing, styling, or fixing a Badge (or
  related status/count/label UI) in a React app that uses @takeoff-ui/react-spar
  / Takeoff / Spar."
---

# Badge — @takeoff-ui/react-spar

`Badge` is a small visual label used to highlight status, count, or category. It
is a standalone Takeoff component (no upstream Spar primitive).

**When to use:** Reach for `Badge` for inline status pills, category tags, count
bubbles, notification dots, and overlay indicators on icons/avatars. Not for
dismissible filter chips with actions or interactive selection — use a dedicated
chip/tag component for that.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Badge } from '@takeoff-ui/react-spar';
```

## Basic usage

```tsx
<Badge variant="success">Active</Badge>
```

## Examples

### Variants

```tsx
<div className="flex flex-wrap gap-3">
  <Badge variant="primary">Primary</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="neutral">Neutral</Badge>
  <Badge variant="info">Info</Badge>
  <Badge variant="success">Success</Badge>
  <Badge variant="danger">Danger</Badge>
  <Badge variant="warning">Warning</Badge>
  <Badge variant="verified">Verified</Badge>
</div>
```

Full variant set also includes `purple`, `cyan`, `business`, `teal`, `white`,
`dark`.

### Appearances and sizes

```tsx
<div className="flex flex-wrap items-center gap-3">
  <Badge appearance="filled">Filled</Badge>
  <Badge appearance="filledLight">Filled Light</Badge>
  <Badge appearance="outlined">Outlined</Badge>
  <Badge appearance="text">Text</Badge>

  <Badge size="small">Small</Badge>
  <Badge size="base">Base</Badge>
  <Badge size="large">Large</Badge>
</div>
```

### Rounded count pills

```tsx
<div className="flex flex-wrap gap-3">
  <Badge rounded>12</Badge>
  <Badge variant="danger" rounded>
    99+
  </Badge>
  <Badge variant="success" rounded>
    New
  </Badge>
</div>
```

### Icons

```tsx
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { BlockIconOutlinedRounded } from '@takeoff-icons/react/block';

<div className="flex flex-wrap gap-3">
  <Badge
    variant="success"
    startContent={<CheckIconOutlinedRounded width={20} height={20} />}
  >
    Verified
  </Badge>
  <Badge
    variant="danger"
    endContent={<BlockIconOutlinedRounded width={20} height={20} />}
  >
    Offline
  </Badge>
</div>;
```

### Dot and float overlay

```tsx
import { NotificationIconOutlinedRounded } from '@takeoff-icons/react/notification';

<div className="flex items-center gap-8">
  {/* minimal status dot — children/startContent/endContent are ignored when `dot` */}
  <Badge variant="success" dot />

  {/* count bubble floated over an icon */}
  <div className="relative">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-200">
      <NotificationIconOutlinedRounded width={32} height={32} />
    </div>
    <Badge
      variant="danger"
      appearance="filledLight"
      size="large"
      rounded
      className="absolute -right-3 -top-3"
    >
      3
    </Badge>
  </div>
</div>;
```

## Key props

| Prop           | Type                                                            | Default     | Notes                                                                                                                                                |
| -------------- | --------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode`                                               | -           | Badge content.                                                                                                                                       |
| `variant`      | `BadgeVariant`                                                  | `'primary'` | Color: `primary`, `secondary`, `neutral`, `info`, `success`, `danger`, `warning`, `verified`, `purple`, `cyan`, `business`, `teal`, `white`, `dark`. |
| `appearance`   | `BadgeAppearance`                                               | `'filled'`  | `filled`, `filledLight`, `outlined`, `text`.                                                                                                         |
| `size`         | `BadgeSize`                                                     | `'base'`    | `small`, `base`, `large`.                                                                                                                            |
| `rounded`      | `boolean`                                                       | `false`     | Pill-shaped, fully rounded corners.                                                                                                                  |
| `dot`          | `boolean`                                                       | `false`     | Minimal 8×8px colored dot; ignores children, `startContent`, `endContent`.                                                                           |
| `startContent` | `React.ReactNode`                                               | -           | Content before children, typically an icon.                                                                                                          |
| `endContent`   | `React.ReactNode`                                               | -           | Content after children.                                                                                                                              |
| `className`    | `string`                                                        | -           | Appends classes to the root slot.                                                                                                                    |
| `classNames`   | `Partial<Record<BadgeSlot, string>>`                            | -           | Per-slot extra classes (`root`, `label`, `icon`).                                                                                                    |
| `slotProps`    | `Partial<Record<BadgeSlot, React.HTMLAttributes<HTMLElement>>>` | -           | Per-slot HTML-attribute overrides.                                                                                                                   |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Badge renders a non-interactive `<span>` and adds no live-region role. Do not
  use it as a button or rely on it to announce dynamic changes.
- Do not communicate status by color alone; include visible text or an
  accessible equivalent in the surrounding content.
- A `dot` badge intentionally removes children and icon content. Treat it as
  decorative unless its meaning is also conveyed elsewhere.
- When a changing badge must be announced, put the appropriate live-region
  semantics on a stable surrounding element rather than making every Badge a
  global `role="status"`.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/badge
- Source: `packages/react-spar/src/components/badge/`
