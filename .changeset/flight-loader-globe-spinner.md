---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add two branded loaders. `GlobeSpinner` is a circular loader: an accent arc
orbits a rotating globe, a plane leads it and `GlobeSpinner.Label` rides inside
the arc. `FlightLoader` is a loading card with a plane taking off from a runway,
an indeterminate bar and the `FlightLoader.Logo`, `FlightLoader.Tagline` and
`FlightLoader.Status` parts. Both use `variant` for the accent color, accept
`--tk-globe-spinner-accent` / `--tk-flight-loader-accent` for off-palette
colors, keep `Spinner`'s `status` semantics, and slow down (rather than stop)
under `prefers-reduced-motion`. The tokens package ships the `globe-spinner` and
`flight-loader` recipes.
