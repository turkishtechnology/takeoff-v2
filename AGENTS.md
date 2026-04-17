# AGENTS.md

## Project overview

- This repository is the monorepo for `@takeoff-ui/react-spar`.
- Primary package code lives in `packages/react-spar/`.
- Public docs live in `apps/docs/`.
- Local smoke/integration app lives in `apps/react-app/`.

## Canonical contract

Before proposing API changes or new customization surfaces, consult:

- `docs/contract-model.md` — parity, divergence taxonomy, breaking-change rules
- `docs/api-decision-framework.md` — per-component API decision template
- `docs/decisions/README.md` — durable repo-wide decisions (ADRs)

Cross-component architectural choices must be recorded as ADRs under
`docs/decisions/`. Single-component port notes belong with the component, not
here.

## Repository expectations

- Use `pnpm` for workspace commands.
- Preserve the React 19-only contract across code, tests, docs, and examples.
- Treat `takeoff-ui` as a parity reference, not a build dependency.
- Treat `@turkish-technology/spar` as the only external runtime primitive.
- Do not introduce bundled component CSS in `@takeoff-ui/react-spar`.
- Preserve the stable Takeoff parity wrapper surface even when adding React-only
  customization layers.
- Treat emitted slot classes and documented `data-*` hooks as styling contract,
  not incidental implementation detail.

## Skill routing

- Use `$generate-component` before scaffolding a new React Spar component.
- Use `$takeoff-component-port` when porting, reviewing, or correcting component
  parity across `takeoff-ui`, `takeoff-design`, `spar`, and `takeoff-spar`.
- Use `$takeoff-component-port` when deciding whether a component should remain
  wrapper-only or add `slotProps`, render overrides, or public compound parts.

## Build and test commands

Pure validation boundaries (no codegen, no package builds run as side effects):

- `pnpm check-types` — every package runs `tsc --noEmit` only
- `pnpm lint` — every package runs `eslint .` only
- `pnpm --filter @takeoff-ui/react-spar test` — vitest against source

Doc-integrity gate (re-runs codegen and fails on diff in
`apps/docs/src/docs-files`):

- `pnpm --filter docs verify:generated-api`

Prep + build (where docs codegen and package builds intentionally run):

- `pnpm install`
- `pnpm dev:docs` / `pnpm dev:react`
- `pnpm --filter @takeoff-ui/react-spar build`
- `pnpm build` (full workspace build via turbo)

See [README — Validation workflow](./README.md#validation-workflow) for the
canonical contract on what each command guarantees.
