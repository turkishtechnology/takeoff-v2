# Live Button Baseline

Use this reference when the older porting prompt is ambiguous or when a new
component needs a concrete example of the current monorepo contract. Button
shows the intended direction of the work:

- `takeoff-ui` contains the original component and the design-system reference
- `takeoff-design/packages/tokens` contains the shared style layer being built
  out from that reference
- `takeoff-spar` contains the React package adaptation that consumes the shared
  style contract

## Reference entrypoints

Read the smallest useful slice first. Expand only when the current task needs
more detail.

- `takeoff-ui/packages/core/src/components/tk-button/` - original Button
  implementation and design-system reference
- `takeoff-design/packages/tokens/tokens/component/button.json` - shared
  dimension tokens extracted for distribution
- `takeoff-design/packages/tokens/styles/recipes/_button.scss` - shared recipe
  logic and selectors
- `takeoff-design/packages/tokens/styles/_index.scss` - shared style wiring into
  compiled CSS
- `takeoff-spar/packages/react-spar/src/components/button/` - React adaptation
  baseline (`Button.tsx`, `types.ts`, `style.ts`)
- `takeoff-spar/packages/react-spar/src/components/index.ts` - component barrel
- `takeoff-spar/packages/react-spar/src/theme/recipes.ts` - slot registry

## Layer roles in this example

- Read `takeoff-ui` first when you need the original API, DOM shape, events, and
  visual behavior.
- Read `takeoff-design/packages/tokens` when you need to understand how shared
  styling is being extracted and distributed.
- Read `takeoff-spar` when you need the React-side adaptation pattern, slot
  classes, and `data-*` hooks.

## Verified takeoff-design facts

- Button tokens live in `packages/tokens/tokens/component/button.json`.
- Button recipe lives in `packages/tokens/styles/recipes/_button.scss`.
- `packages/tokens/styles/_index.scss` loads the recipe with
  `@use 'recipes/button';`, emits keyframes with
  `@include button.button-keyframes;`, and applies the recipe to `.tk-button`.
- `@takeoff-design/tokens/css/default/theme.css` resolves to
  `packages/tokens/dist/css/default/theme.css` after build.
- This package is the shared style distribution point that `takeoff-spar`
  consumes now and `takeoff-ui` plus other downstream packages are expected to
  consume over time.

## Verified takeoff-spar facts

- The component folder is lowercase:
  `packages/react-spar/src/components/button/`.
- `style.ts` exports these slot class names:
  - `root` -> `tk-button`
  - `label` -> `tk-button-label`
  - `icon` -> `tk-button-icon`
  - `leadingIcon` -> `tk-button-leading-icon`
  - `trailingIcon` -> `tk-button-trailing-icon`
  - `spinner` -> `tk-button-spinner`
- `Button.tsx` drives styling with these data attributes:
  - `data-disabled`
  - `data-loading`
  - `data-type`
  - `data-variant`
  - `data-size`
  - `data-mode`
  - `data-full-width`
  - `data-icon-only`
  - `data-rounded`
  - `data-underline`
- `packages/react-spar/scripts/build.js` explicitly keeps CSS out of the emitted
  package.
- `packages/react-spar/package.json` keeps `@takeoff-design/tokens` as a peer
  dependency.
- This package is the React delivery layer, not the owner of the shared styling
  contract.

## Important divergence from Stencil Button

- The Stencil `type` prop exposes `filled`, `filledLight`, `outlined`, and
  `text`.
- The live React wrapper also exposes `elevated`.
- Treat that difference as a deliberate live-repo exception to verify, not as a
  rule to copy into every component.

## Porting implications

- Start from `takeoff-ui` when defining what the component is supposed to do and
  look like.
- Move reusable styling into `takeoff-design/packages/tokens` so the style
  contract is distributable.
- Keep `takeoff-spar` focused on React adaptation and package delivery.
- A React component should expose only the slot classes and `data-*` hooks the
  recipe actually needs.
- A token recipe should avoid assuming Shadow DOM selectors survive the port.
- When the old prompt conflicts with these live files, the live files win.
