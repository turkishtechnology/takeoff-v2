---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add the Stepper compound component (`Stepper`, `Stepper.Item`, `Stepper.Title`,
`Stepper.Description`) with controlled/uncontrolled active-step state, linear
progression gating, status indicators, compact mode, and
orientation/size/reverse variants — plus the matching `tk-stepper` recipe in the
tokens package.

Accessibility and API surface:

- Localizable status suffixes through the root `completedLabel`/`errorLabel`
  props (default `'completed'`/`'error'`; an empty string drops the suffix).
- `Stepper.Description` links to the trigger via `aria-describedby` instead of
  inflating the accessible name, and now requires rendering inside
  `Stepper.Item`.
- `indicator` also accepts a `(state: StepperIndicatorState) => ReactNode`
  render function; returning `undefined` falls back to the built-in glyphs, so
  numbered steps surface the check once completed.
- Arrow keys (following `orientation`), Home, and End move focus between step
  triggers.
- `data-clickable` is no longer present on the active step — its press re-emits
  `onStepClick` but cannot change the selection — and a non-clickable active
  step no longer emits `onStepClick`.

Recipe:

- Rail endpoints are bound to `--stepper-items-rail-gap` and keep a symmetric
  clearance from the adjacent indicators.
- Reverse layouts mirror the default content/indicator spacing instead of
  double-counting the gap.
- Indicator surfaces and glyph colors use the theme-adaptive `--static-light`
  (dark-mode safe), with hover feedback on clickable steps and color transitions
  on the indicator.
