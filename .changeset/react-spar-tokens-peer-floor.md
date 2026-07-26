---
'@takeoff-ui/react-spar': patch
---

Raise the `@takeoff-design/tokens` peer-dependency floor from `>=0.1.2 <1.0.0`
to `>=0.3.0 <1.0.0`.

`react-spar` ships components (Stepper, Progress, Skeleton, Slider) whose CSS
recipes (`tk-stepper`, `tk-progress`, `tk-skeleton`, `tk-slider`) are only
present in `@takeoff-design/tokens@0.3.0`. The previous `>=0.1.2` floor let a
consumer satisfy the peer range with a tokens version too old to carry those
recipes, rendering those components unstyled with no install-time warning.

**Migration:** ensure `@takeoff-design/tokens` is on `>=0.3.0`
(`pnpm add @takeoff-design/tokens@latest`). Installs already on tokens `0.3.0`+
need no action.
