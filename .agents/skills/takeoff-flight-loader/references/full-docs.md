# FlightLoader

A branded loading card for page and panel loads in admin and back-office
screens. Every text and the logo are supplied by the consumer.

## Usage

```tsx
import { FlightLoader } from '@takeoff-ui/react-spar';
```

```tsx
<FlightLoader>
  <FlightLoader.Logo src={logoUrl} alt="Company" />
  <FlightLoader.Tagline>Widen your world</FlightLoader.Tagline>
  <FlightLoader.Status>Loading…</FlightLoader.Status>
</FlightLoader>
```

## Playground

## Anatomy

The plane, runway and progress bar are always rendered by the root.
`FlightLoader.Logo`, `FlightLoader.Tagline` and `FlightLoader.Status` are
optional and may be written in any order — the recipe places them as logo,
scene, tagline, progress, status.

## Color

`variant` sets the accent (plane tail and progress bar). For a color outside the
palette, set `--tk-flight-loader-accent` on the root;
`--tk-flight-loader-plane`, `--tk-flight-loader-detail` and
`--tk-flight-loader-runway` work the same way.

## Full-screen overlay

`FlightLoader` is only the card. Center it in your own overlay, or render it
inside a `Dialog` when the page behind must be blocked.

## Accessibility

`FlightLoader` renders a polite `status` named `Loading` by default. Point
`aria-labelledby` at `FlightLoader.Status` to name it from the visible text. The
scene and the progress bar are hidden from assistive technology. Under
`prefers-reduced-motion: reduce` the motion slows down rather than stopping.
