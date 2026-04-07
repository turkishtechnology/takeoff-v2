# Workflow

## Goal

Turn a component that already exists in `takeoff-ui` into two downstream
outcomes:

- a shared style implementation in `takeoff-design/packages/tokens`
- a React package implementation in `takeoff-spar`

while keeping:

- prop, DOM, and behavior parity with `takeoff-ui`
- styling parity between the original component and the shared tokens package
- React wrapper behavior aligned with the live `button` implementation

## Architecture direction

- `takeoff-ui` is the first-built library and the main design-system reference.
- `takeoff-design/packages/tokens` is the shared styling layer being developed
  so styles can be distributed across packages.
- `takeoff-spar` is the React package being developed to expose the design
  system in React.
- The workflow is not "copy from takeoff-ui into takeoff-spar". It is "read the
  original component in takeoff-ui, extract shared styling into
  takeoff-design/tokens, then implement the React delivery layer in
  takeoff-spar".

## Verified repo-aware facts

- `takeoff-ui/packages/core/src/components/tk-button/` is the current source
  reference pattern.
- `takeoff-design` stores component tokens under
  `packages/tokens/tokens/component/`.
- `takeoff-design` stores SCSS recipes under `packages/tokens/styles/recipes/`.
- `takeoff-design/packages/tokens/styles/_index.scss` wires recipes into
  compiled output with `@use` and root selector emission.
- `takeoff-spar/packages/react-spar/src/components/` uses lowercase component
  folders such as `button/`.
- `packages/react-spar/package.json` keeps `@takeoff-design/tokens` as a peer
  dependency.
- `packages/react-spar/scripts/build.js` explicitly states that CSS is not
  bundled into `react-spar`.
- Consumer apps import `@takeoff-design/tokens/css/default/theme.css` directly.
- This skill exists because the shared styling package is being built now so
  `takeoff-spar` can consume it immediately and `takeoff-ui` plus other packages
  can consume it over time.

## 1. Resolve names and paths

1. Confirm the requested component name.
2. Derive:
   - `ComponentName`
   - `component-name`
   - `componentName`
3. Verify the local sibling repo layout:
   - current repo: `takeoff-spar`
   - sibling source repo: `../takeoff-ui`
   - sibling styling repo: `../takeoff-design`
4. Run
   `python3 agent/takeoff-component-port/scripts/check_port_context.py <ComponentName>`
   before editing from the `takeoff-spar` repo root.

## 2. Read the source library first

Read these files before changing anything:

- `takeoff-ui/packages/core/src/components/tk-<component-name>/tk-<component-name>.tsx`
- `takeoff-ui/packages/core/src/components/tk-<component-name>/tk-<component-name>.scss`
- `takeoff-design/packages/tokens/tokens/component/<component-name>.json` if it
  exists
- `takeoff-design/packages/tokens/styles/recipes/_<component-name>.scss` if it
  exists
- `takeoff-design/packages/tokens/styles/_index.scss`
- `takeoff-spar/packages/react-spar/src/components/button/Button.tsx`
- `takeoff-spar/packages/react-spar/src/components/button/types.ts`
- `takeoff-spar/packages/react-spar/src/components/button/style.ts`
- `takeoff-spar/packages/react-spar/src/components/index.ts`
- `takeoff-spar/packages/react-spar/src/theme/recipes.ts`

## 3. Analyze the Stencil source

Capture:

- every `@Prop()` name, type, and default value
- every `@Event()` and how it fires
- every `@State()`, `@Method()`, `@Watch()`, and lifecycle hook
- the rendered DOM structure and conditional branches
- semantic behavior such as form handling, disabled behavior, focus behavior,
  and link vs button logic

## 4. Analyze the source SCSS

Capture:

- `:host` rules and display behavior
- the base `.tk-<component-name>` selector
- variant axes such as `variant`, `type`, `size`, `mode`, and state classes
- mixins, keyframes, child selectors, and icon or spinner rules
- size, spacing, radius, and state-dependent visual rules

## 5. Diff against the token recipe

If a recipe already exists in `takeoff-design`, compare source vs recipe for:

- base properties
- color matrix across variants and states
- size, gap, radius, and padding values
- special states such as disabled, loading, underline, rounded, link mode, or
  pressed states
- recipe-only additions that React needs even if Stencil does not expose them
  directly

Keep recipe-only additions only when they are necessary for React behavior or do
not conflict with the source of truth. The goal here is to extract shared
styling out of the original component, not to let the React package become the
place where styling decisions drift.

## 6. Update the styling layer in takeoff-design

This is the shared distribution layer. Treat it as the place where reusable
styling is normalized so `takeoff-spar` can consume it now and `takeoff-ui` plus
other packages can consume it later.

### Component tokens

- Create or update `packages/tokens/tokens/component/<component-name>.json` only
  when dimension-like tokens are needed.
- Keep this file focused on radius, spacing, padding, gap, and icon-size values.
- Do not introduce color tokens there.

### Recipe SCSS

- Create or update `packages/tokens/styles/recipes/_<component-name>.scss`.
- Keep reusable mixins inside the recipe file.
- Prefer selectors the React layer can drive through slot classes and `data-*`
  attributes.
- Keep child selectors explicit for named slots.

### Style entrypoint

Update `packages/tokens/styles/_index.scss` using the live `button` pattern:

- load the recipe module with `@use`
- emit root-level keyframes when needed
- attach the recipe mixin to `.tk-<component-name>`

## 7. Update the React layer in takeoff-spar

This layer exposes the design system as a React package. It should consume the
shared styling contract rather than redefining the design system locally.

### Files to create or edit

- `packages/react-spar/src/components/<component-name>/<ComponentName>.tsx`
- `packages/react-spar/src/components/<component-name>/types.ts`
- `packages/react-spar/src/components/<component-name>/style.ts`
- `packages/react-spar/src/components/<component-name>/index.ts`
- `packages/react-spar/src/components/index.ts`
- `packages/react-spar/src/theme/recipes.ts`

### `types.ts`

- Derive props from the Stencil `@Prop()` list.
- Export reusable union types separately.
- Add JSDoc comments and `@defaultValue` for props with defaults.
- Map Stencil events to React callbacks.
- Always include `children?: ReactNode`.
- Introduce React-only ergonomic props only when they preserve parity or
  composition without changing the contract.

### `style.ts`

- Export the slot list and slot type.
- Export stable class names for root and child slots.
- Ensure slot class names match the token recipe child selectors exactly.

### `<ComponentName>.tsx`

- Use the live `button` implementation as the reference shape for slot
  rendering, `joinClassNames`, and `data-*` hooks.
- Prefer a Spar primitive when one exists and adds semantics or accessibility.
- Fall back to native HTML when Spar has no equivalent primitive.
- Collect styling hooks in shared props.
- Boolean states should become `data-state=""` or `undefined`.
- Enum-like axes should become `data-axis="<value>"`.
- Every `data-*` attribute should correspond to a selector used in the recipe.
- Keep the React wrapper as an adaptation layer for the original design-system
  component, not as a new source of design truth.

## 8. Selector conversion rules

Convert Stencil and Shadow DOM hooks into React-friendly hooks:

- `:host` -> remove it and move needed layout rules onto the real root selector
  or wrapper logic
- `::slotted(*)` -> direct child or named slot element selectors
- `.variant-name` -> `[data-variant='variant-name']`
- `.type-name` -> `[data-type='type-name']`
- `.size-name` -> `[data-size='size-name']`
- `.disabled` or `:disabled` -> shared disabled handling backed by
  `data-disabled`, `disabled`, or `aria-disabled`
- `.loading` -> `[data-loading]`
- other state classes -> `data-*` hooks that mirror the recipe needs

## 9. Validate the result

1. Build `takeoff-design`.
2. Build `takeoff-spar`.
3. Run any available type checks for touched packages.
4. Render the component in an app that imports
   `@takeoff-design/tokens/css/default/theme.css`.
5. Run
   `python3 agent/takeoff-component-port/scripts/verify_port_artifacts.py <ComponentName>`
   from the `takeoff-spar` repo root.
6. Verify:
   - colors match `takeoff-ui`
   - sizes and spacing match `takeoff-ui`
   - disabled and loading states match
   - focus-visible behavior works
   - slot classes and `data-*` hooks match the recipe
   - `react-spar` still does not bundle CSS
   - the shared style output in `takeoff-design/tokens` is what downstream
     packages consume

## 10. Old prompt deltas to keep in mind

- Use `packages/tokens/styles/recipes/_<component-name>.scss`, not the older
  `styles/components` path.
- Update `packages/tokens/styles/_index.scss` using the live `@use` and root
  selector pattern rather than the older `@forward` example.
- Keep the `react-spar` component folder lowercase even when the component file
  is `ComponentName.tsx`.
- Treat old Button examples as historical only. Verify any exception against the
  live Button files first.

## 11. Decision rule when files disagree

- Start with `takeoff-ui` for original behavior, DOM, API, and visual intent.
- Use `takeoff-design/packages/tokens` as the target shared-style layer that
  should encode the reusable styling contract.
- Use `takeoff-spar` as the React adaptation example and final React delivery
  package.
- If `takeoff-spar` differs from `takeoff-ui`, do not assume the React version
  is automatically correct. Verify whether it is a deliberate adaptation or a
  drift that should be corrected.
