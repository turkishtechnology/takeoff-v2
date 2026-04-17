# Workflow

## Goal

Move a component from the original `takeoff-ui` implementation into the current
stack without losing contract clarity:

- `takeoff-ui` remains the source of truth for public API, visual intent, and
  baseline behavior.
- `takeoff-design/packages/tokens` becomes the shared style distribution layer.
- `spar` provides behavior and accessibility primitives when available.
- `takeoff-spar` delivers the final React package.

## 1. Resolve context first

1. Derive `ComponentName`, `component-name`, and `componentName`.
2. Assume sibling repos at `../takeoff-ui`, `../takeoff-design`, and optionally
   `../spar`. Do not ask the user for repo locations unless the required repos
   cannot be found locally.
3. Run:

   ```bash
   python3 scripts/check_port_context.py <ComponentName> --repo-root ../..
   ```

4. Read the printed checklist before editing. Treat missing `takeoff-ui` or
   `takeoff-design` as blockers. Treat missing `spar` as a warning unless the
   task depends on confirming a matching primitive.

## 2. Read the stack in the right order

Read source material in this order:

1. `takeoff-ui`
2. `spar`
3. `takeoff-design`
4. live `takeoff-spar` patterns

Minimum reads:

- `../takeoff-ui/packages/core/src/components/tk-<component-name>/`
- `../spar/packages/spar/src/components/<ComponentName>/` when it exists
- `../takeoff-design/packages/tokens/tokens/component/<component-name>.json`
  when it exists
- `../takeoff-design/packages/tokens/styles/recipes/_<component-name>.scss` when
  it exists
- `../takeoff-design/packages/tokens/styles/_index.scss`
- `packages/react-spar/src/components/button/`
- `packages/react-spar/src/components/index.ts`
- `packages/react-spar/src/styling/slot-registry.ts`

## 3. Build a parity matrix before editing

Capture these layers explicitly:

- props, defaults, events, and controlled vs uncontrolled behavior
- DOM ownership:
  - visual owner
  - interactive owner
  - semantic owner
- state and keyboard behavior
- accessibility contract
- slot, class, and `data-*` hooks
- docs, README, smoke app, and export expectations

Treat every mismatch as one of the classifications defined in
[adaptation-policy.md](adaptation-policy.md).

## 4. Choose the component archetype

Before implementation, classify the component using
[archetypes.md](archetypes.md). This determines what to prioritize:

- leaf component
- form control
- compound or disclosure component
- overlay component
- layout or structural component

If the component is compound, map sub-parts explicitly. Do not flatten
subcomponent responsibilities into one wrapper file.

## 5. Decide the customization surface

Before implementation, write down the public React surface the component will
support:

- parity wrapper only
- wrapper + `slotProps`
- wrapper + render overrides
- wrapper + public compound parts

Do this per component, then per slot.

For each slot, classify it as one of:

- structural
- content-bearing
- decorative

Default rules:

- structural slots may accept `slotProps`, but they should not be replaced by
  free-form render overrides
- content-bearing and decorative slots may accept render overrides if the
  canonical slot owner node stays intact
- public compound parts are usually required for disclosure and overlay
  components when consumers need full ownership of structural slots
- leaf components usually stay wrapper-first unless the slot graph becomes
  meaningfully consumer-owned

If public compound parts exist, the parity wrapper should compose the same parts
internally so slot classes, `data-*` hooks, and semantics stay aligned.

## 6. Make the primitive decision explicitly

If `spar` has a relevant primitive:

- use it by default
- adapt around it before rewriting behavior
- keep custom logic limited to contract translation and visual structure

If `spar` does not have a primitive:

- use native HTML with explicit accessibility handling
- state the gap in the final report

If `spar` has only a partial fit:

- preserve its behavior and a11y ownership where possible
- document the missing fit as `technical-adaptation` or `forbidden-divergence`,
  never silently

## 7. Update the shared style layer

When touching `takeoff-design`:

- add or update component tokens only for dimension-like values
- keep recipe selectors tied to actual React slot classes or `data-*` hooks
- keep render overrides inside canonical slot owner nodes so recipe selectors do
  not lose their anchor
- wire the recipe through `styles/_index.scss`
- remove stale selectors that no longer map to rendered DOM

## 8. Update the React layer

When touching `takeoff-spar`:

- keep the wrapper thin
- let `spar` own behavior and accessibility whenever possible
- translate Stencil events into idiomatic React callbacks and drop the original
  `tk` prefix
- use React-only ergonomics only when they preserve or improve the contract
  without surprising consumers
- keep slot classes stable and readable
- keep canonical slot owner nodes stable across wrapper, render overrides, and
  public compound parts
- keep migration rationale out of component comments unless it affects the
  public contract directly

React may be more ergonomic than Web Components, but the port must still explain
what changed and why.

## 9. Update the public contract

Treat these as required surfaces, not optional polish:

- `packages/react-spar/README.md`
- `apps/docs`
- `apps/react-app`
- package exports and peer dependency expectations

Any install path, import path, or theming instruction that does not match the
real package behavior is a bug.

Public docs should describe actual usage, imports, and user-visible behavior. Do
not add Stencil-to-React migration notes there unless consumers need that
information to use the component correctly.

If a component supports `slotProps`, render overrides, or public compound parts,
the docs should say so explicitly and should separate those surfaces from the
strict-parity wrapper path.

## 10. Validate before closing

Use [validation-matrix.md](validation-matrix.md) and then run:

```bash
python3 scripts/verify_port_artifacts.py <ComponentName> --repo-root ../..
```

Minimum closing checks:

- repo-level typecheck, lint, and build
- `takeoff-design` build when tokens or recipes changed
- no CSS emitted from `react-spar`
- token CSS imported from the real public path
- no stale `@takeoff-ui/react-spar/styles` references
- recipe selectors backed by rendered class names

## 11. Final report format

Return a short report with:

- archetype
- primitive decision
- customization surface decision
- slot inventory and ownership split
- difference classification
- touched files
- validations run
- residual risks
