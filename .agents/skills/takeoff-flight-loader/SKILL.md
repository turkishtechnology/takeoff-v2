---
name: takeoff-flight-loader
description:
  'Branded loading card with logo, a plane taking off from a runway, tagline,
  indeterminate bar and status text — the FlightLoader from
  @takeoff-ui/react-spar (Takeoff UI / Spar React). Trigger when you need a
  branded page loader card, admin panel loading screen, takeoff / airplane
  loading animation, or a loader with logo and "Loading…" text. Use this skill
  WHENEVER building, adding, importing, styling, or fixing a FlightLoader in a
  React app that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# FlightLoader — @takeoff-ui/react-spar

A branded loading card: logo, a plane taking off from a runway, a tagline, an
indeterminate bar and a status line. Logo and texts are consumer-supplied.

**When to use:** Page or panel loads in admin and back-office screens. Not this
— use `Spinner` for inline loading; use `GlobeSpinner` for a circular branded
loader without a card.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { FlightLoader } from '@takeoff-ui/react-spar';
```

## Basic usage

```tsx
<FlightLoader aria-labelledby="page-loader-status">
  <FlightLoader.Logo src={logoUrl} alt="Company" />
  <FlightLoader.Tagline>Widen your world</FlightLoader.Tagline>
  <FlightLoader.Status id="page-loader-status">Loading…</FlightLoader.Status>
</FlightLoader>
```

## Examples

### Full-screen overlay

`FlightLoader` is only the card; center it in your own overlay.

```tsx
<div className="fixed inset-0 z-50 grid place-items-center bg-white/90">
  <FlightLoader>
    <FlightLoader.Status>Loading…</FlightLoader.Status>
  </FlightLoader>
</div>
```

### Off-palette accent

```tsx
<FlightLoader style={{ '--tk-flight-loader-accent': '#0a7c86' }}>
  <FlightLoader.Status>Loading…</FlightLoader.Status>
</FlightLoader>
```

## Key props

| Prop              | Type                                                                                                       | Default     | Notes                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------- |
| `variant`         | `SpinnerVariant` — `'primary' \| 'secondary' \| 'neutral' \| 'info' \| 'success' \| 'danger' \| 'warning'` | `'primary'` | Plane tail + bar color. Off-palette: `--tk-flight-loader-accent`. |
| `as`              | `ElementType`                                                                                              | `'div'`     | Polymorphic root.                                                 |
| `aria-label`      | `string`                                                                                                   | `'Loading'` | Accessible name of the status.                                    |
| `aria-labelledby` | `string`                                                                                                   | -           | Point it at `FlightLoader.Status`; drops the default name.        |
| `aria-hidden`     | `boolean`                                                                                                  | `false`     | Decorative loader; drops status role + default name.              |
| `classNames`      | `Partial<Record<'root' \| 'scene' \| 'progress', string>>`                                                 | -           | Per-slot extra classes.                                           |
| `slotProps`       | `Partial<Record<'root' \| 'scene' \| 'progress', React.HTMLAttributes<HTMLElement>>>`                      | -           | Per-slot HTML-attribute overrides.                                |

Parts: `FlightLoader.Logo` (`img`), `FlightLoader.Tagline` (`p`),
`FlightLoader.Status` (`p`). All are optional, polymorphic, and may be written
in any order — the recipe places them as logo, scene, tagline, progress, status.

## Accessibility

- Polite `status` named `Loading` by default, same as `Spinner`.
- Scene and progress bar are `aria-hidden`.
- Reduced motion slows the animation instead of stopping it.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs:
  https://takeoff-v2.app.turkishtechlab.com/docs/components/flight-loader
- Source: `packages/react-spar/src/components/flight-loader/`
