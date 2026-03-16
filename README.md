# takeoff-spar

Monorepo for `@takeoff-ui/react-spar`.

## Current-Phase Source Of Truth

This repository is currently in the architecture freeze defined by Task 1. If
another document conflicts with the statements below, this `README.md` and
[Current-Phase Architecture](./internal-docs/react-spar/architecture.md) win.

## Scope Guardrails

- This backlog and codebase target `takeoff-spar` only.
- `takeoff-ui` is a reference source for parity and migration analysis. It is
  not the target repo for current-phase work.
- The only external runtime dependency in this phase is
  `@turkish-technology/spar`.
- Tokens, icons, fonts, reset, recipes, and global styles stay internal/static
  in this repository during the current phase.
- `@takeoff-ui/design-tokens`, `@takeoff-ui/icons`, `@spar/utils`,
  `@takeoff-ui/vue-spar`, and tailwind or design-token monorepo splits are
  future-state ideas only. Do not document or implement them as active
  dependencies in this repo.

## React Compatibility Policy

- The current-phase consumer baseline is React 19 only.
- The locked dependency record in this repo resolves
  `@turkish-technology/spar@0.1.3`, which declares `react >=19.0.0` and
  `react-dom >=19.0.0` as peer dependencies.
- `@takeoff-ui/react-spar` must not claim React 18 support in package metadata,
  docs, demos, or acceptance criteria until `@turkish-technology/spar` publishes
  and validates an explicit React 18-compatible peer range.

## Delivery Gates

- Task 2 must close before Task 10 and later component delivery starts.
- Task 3 must close before any component can be treated as publishable.

## Workspace

- `packages/react-spar` — `@takeoff-ui/react-spar`, the package being
  productized in this repo
- `apps/docs` — public product docs and component demos
- `apps/react-app` — local integration app; Task 11 will turn it into a consumer
  smoke app
- `internal-docs/react-spar` — repo-maintainer architecture, backlog, and
  research notes that are intentionally not rendered in Docusaurus

## Documentation

- [Current-Phase Architecture](./internal-docs/react-spar/architecture.md) —
  single source of truth for scope, dependencies, and layer boundaries
- [Current-Phase Backlog](./internal-docs/react-spar/backlog.md) — ordered
  backlog, guardrails, and blocking rules
- [Button Baseline](./internal-docs/react-spar/button-baseline.md) —
  current-state notes for the first Button slice
- [Reference Gap Analysis](./internal-docs/react-spar/reference-gap-analysis.md)
  — parity research only; not an architecture source of truth
- [Styling Implementation Prompt](./internal-docs/react-spar/styling-implementation-prompt.md)
  — internal execution artifact
