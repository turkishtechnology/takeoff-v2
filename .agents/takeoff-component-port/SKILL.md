---
name: takeoff-component-port
description:
  Uses takeoff-ui as the original component and design-system reference,
  extracts shared styling into takeoff-design/tokens, and delivers the React
  package in takeoff-spar. Use when doing component parity work, "bilesen port",
  shared token recipe authoring, or React wrapper implementation across
  takeoff-ui, takeoff-design, and takeoff-spar.
---

# Takeoff Component Port

## When to use this skill

Use this skill when the task is to move a component through this direction:

- `takeoff-ui` provides the original implementation and the design-system
  reference
- `takeoff-design/packages/tokens` becomes the shared style distribution layer
- `takeoff-spar` exposes the design system as the React package

Use it for component parity work, extracting reusable styling into the tokens
package, or building a React wrapper that stays faithful to the original
`takeoff-ui` component.

## Architecture intent

- `takeoff-ui` is the first-built library and the main reference for component
  behavior, DOM shape, API contract, and visual intent.
- `takeoff-design/packages/tokens` is the shared styling package being built so
  styles can be distributed and consumed consistently by `takeoff-spar` now and
  by `takeoff-ui` or other packages over time.
- `takeoff-spar` is the React delivery layer being developed so the same design
  system can be consumed as a React package.
- The porting workflow exists to turn an existing `takeoff-ui` component into a
  reusable shared-style plus React-package form, without losing the original
  design-system behavior.

## Quick start

1. Confirm the target component name and derive `ComponentName`,
   `component-name`, and `componentName`.
2. From the `takeoff-spar` repo root, run
   `python3 agent/takeoff-component-port/scripts/check_port_context.py <ComponentName>`.
3. Read `[references/workflow.md](references/workflow.md)`.
4. If the porting pattern is unclear, read
   `[references/live-button.md](references/live-button.md)`.
5. After implementation and builds, run
   `python3 agent/takeoff-component-port/scripts/verify_port_artifacts.py <ComponentName>`.

## Hard rules

- Live repo state wins over stale prompt text.
- Start from `takeoff-ui` first. Do not treat `takeoff-spar` as the primary
  source when the original component already exists in `takeoff-ui`.
- `takeoff-design/packages/tokens` owns shared styling and compiled CSS
  distribution.
- `react-spar` ships the React package as JS and types, not component CSS.
- Prefer moving reusable style logic into `takeoff-design/packages/tokens` so
  `takeoff-spar` consumes it now and `takeoff-ui` plus other packages can
  consume it later.
- Convert Shadow DOM and class-only styling hooks into slot classes plus
  `data-*` attributes that the React layer can control.
- Every selector added in a token recipe must have a matching slot class or
  `data-*` hook in the React component.
- Use the live `button` files in `takeoff-spar` as the React adaptation example,
  not as a replacement for `takeoff-ui` source analysis.
- If a sibling repo is missing locally, continue with the available evidence and
  state the gap explicitly.

## Additional resources

- `[references/workflow.md](references/workflow.md)` - end-to-end port workflow
  and repo-aware path fixes
- `[references/live-button.md](references/live-button.md)` - verified live
  Button baseline and porting patterns
- `[scripts/check_port_context.py](scripts/check_port_context.py)` - confirms
  sibling repo layout and expected source files
- `[scripts/verify_port_artifacts.py](scripts/verify_port_artifacts.py)` -
  checks built CSS and `react-spar` artifact expectations
