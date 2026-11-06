# GlobeSpinner

A branded circular loader for full-page or panel loading states. The accent arc,
the plane and the label orbit a globe that turns on its own axis.

## Usage

```tsx
import { GlobeSpinner } from '@takeoff-ui/react-spar';
```

```tsx
<GlobeSpinner aria-label="Loading">
  <GlobeSpinner.Label>Widen your world</GlobeSpinner.Label>
</GlobeSpinner>
```

## Playground

## Label

`GlobeSpinner.Label` is stretched along the arc, so short and long texts both
fill it evenly. Keep it to about 20 characters; it is rendered in upper case.
The label is decorative — the status is named by `aria-label` (default
`Loading`) or `aria-labelledby`.

## Variants

`variant` sets the arc color from the Takeoff palette.

## Custom color

For a color outside the palette, set `--tk-globe-spinner-accent` on the root.
`--tk-globe-spinner-track`, `--tk-globe-spinner-ocean`,
`--tk-globe-spinner-land`, `--tk-globe-spinner-plane` and
`--tk-globe-spinner-label-color` work the same way.

## Sizes

The label is not legible below `base` (128px). Use `Spinner` for inline loading.

## Accessibility

`GlobeSpinner` renders a polite `status` named `Loading` by default, like
`Spinner`. The whole SVG — label included — is hidden from assistive technology.
Under `prefers-reduced-motion: reduce` the motion slows down rather than
stopping, so the loader does not look frozen.
