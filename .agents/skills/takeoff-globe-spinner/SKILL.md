---
name: takeoff-globe-spinner
description:
  'Branded circular loader with a rotating globe, an orbiting accent arc, a
  plane and a short text on the arc — the GlobeSpinner from
  @takeoff-ui/react-spar (Takeoff UI / Spar React). Trigger when you need a
  branded page or panel loader, splash/boot loader, globe or plane loading
  animation, or a circular loader with a slogan. Use this skill WHENEVER
  building, adding, importing, styling, or fixing a GlobeSpinner in a React app
  that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# GlobeSpinner — @takeoff-ui/react-spar

A branded indeterminate loader: an accent arc orbits a rotating globe, a plane
leads the arc and `GlobeSpinner.Label` rides inside it.

**When to use:** Full-page, panel or boot loading where brand presence matters.
Not this — use `Spinner` for inline or compact loading (buttons, inputs, table
cells); use `FlightLoader` for a card with logo and status text.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { GlobeSpinner } from '@takeoff-ui/react-spar';
```

## Basic usage

```tsx
<GlobeSpinner aria-label="Loading dashboard">
  <GlobeSpinner.Label>Widen your world</GlobeSpinner.Label>
</GlobeSpinner>
```

## Examples

### Variant and size

```tsx
<GlobeSpinner variant="info" size="large" aria-label="Loading">
  <GlobeSpinner.Label>Please wait</GlobeSpinner.Label>
</GlobeSpinner>
```

### Off-palette color

```tsx
<GlobeSpinner
  aria-label="Loading"
  style={{ '--tk-globe-spinner-accent': '#0a7c86' }}
>
  <GlobeSpinner.Label>Any color</GlobeSpinner.Label>
</GlobeSpinner>
```

## Key props

| Prop              | Type                                                                                                       | Default     | Notes                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------- |
| `size`            | `'base' \| 'large' \| 'xlarge'`                                                                            | `'base'`    | 128 / 192 / 256 px. The label is unreadable below base. |
| `variant`         | `SpinnerVariant` — `'primary' \| 'secondary' \| 'neutral' \| 'info' \| 'success' \| 'danger' \| 'warning'` | `'primary'` | Arc color. Off-palette: `--tk-globe-spinner-accent`.    |
| `aria-label`      | `string`                                                                                                   | `'Loading'` | The arc label is decorative and never names the status. |
| `aria-labelledby` | `string`                                                                                                   | -           | ID of visible loading text; drops the default name.     |
| `aria-hidden`     | `boolean`                                                                                                  | `false`     | Decorative loader; drops status role + default name.    |
| `classNames`      | `Partial<Record<'root' \| 'indicator', string>>`                                                           | -           | Per-slot extra classes.                                 |
| `slotProps`       | `Partial<Record<'root' \| 'indicator', React.HTMLAttributes<HTMLElement>>>`                                | -           | Per-slot HTML-attribute overrides.                      |

`GlobeSpinner.Label` takes a `string` child (about 20 characters; shown in upper
case and stretched along the arc), plus `className` / `classNames` /
`slotProps`. It must be a direct child of `GlobeSpinner` — it renders inside the
SVG, so pass no other children.

## Accessibility

- Polite `status` named `Loading` by default, same as `Spinner`.
- The SVG, label included, is `aria-hidden`.
- Reduced motion slows the animation instead of stopping it.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs:
  https://takeoff-v2.app.turkishtechlab.com/docs/components/globe-spinner
- Source: `packages/react-spar/src/components/globe-spinner/`
