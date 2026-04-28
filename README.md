# takeoff-spar

Monorepo for `@takeoff-ui/react-spar` — a React 19 component library that wraps
`@turkish-technology/spar` primitives with the Takeoff visual contract.

## Scope Guardrails

- This codebase targets `takeoff-spar` only.
- `takeoff-ui` (Stencil) is a parity reference, not a build dependency.
- `@turkish-technology/spar` is the sole external runtime primitive.
- Tokens, icons, fonts, reset, recipes, and global styles are consumed from
  `@takeoff-design/tokens` (peer dependency). The package does not bundle CSS.
- `@takeoff-ui/vue-spar`, `@spar/utils`, and further monorepo splits are
  future-state ideas only. Do not document or implement them as active
  dependencies in this repo.

## React Compatibility Policy

- Consumer baseline: **React 19 only.**
- `@turkish-technology/spar@0.1.3` declares `react >=19.0.0` and
  `react-dom >=19.0.0` as peer dependencies.
- `@takeoff-ui/react-spar` must not claim React 18 support in package metadata,
  docs, demos, or acceptance criteria until `@turkish-technology/spar` publishes
  and validates an explicit React 18-compatible peer range.

## Workspace

- `packages/react-spar` — `@takeoff-ui/react-spar`, the published package
- `apps/docs` — Docusaurus site for public docs and component demos
- `apps/react-app` — local integration / smoke app
- `.agents/skills` and `.claude/skills` — repo-local skills (component port,
  alignment worksheet generation, blueprint authoring, changelog automation)
- `docs/` — repo-wide canonical contract (see Documentation below)
- `.changeset` — changesets-driven release automation
- `tools/` — per-component API alignment worksheets used to drive port
  decisions; see
  [`docs/api-decision-framework.md`](./docs/api-decision-framework.md)

## Documentation

Repo contract (canonical):

- [Contract model](./docs/contract-model.md) — parity rules, divergence
  taxonomy, breaking-change and migration-safety definitions
- [Public API decision framework](./docs/api-decision-framework.md) — how
  per-component API shapes are decided
- [Component architecture](./docs/component-architecture.md) — folder, file, and
  responsibility layout every component implements
- [Component port readiness](./docs/component-port-readiness.md) — the merge
  gate every component passes before shipping
- [Component API audit](./docs/component-api-audit.md) — comparative API surface
  for the active port batch
- [Architectural decisions](./docs/decisions/README.md) — durable repo-wide
  decision records (ADRs)

Live reference:

- [Coding standards](./packages/react-spar/docs/CODING_STANDARDS.md)
- [Data attribute vocabulary](./packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md)

Repo-local skills (canonical paths):

- [`.claude/skills/generate-api-alignment`](./.claude/skills/generate-api-alignment/SKILL.md)
  — scaffold or refresh a `tools/<component>-api-alignment.html` worksheet
- [`.claude/skills/generate-component-blueprint`](./.claude/skills/generate-component-blueprint/SKILL.md)
  — produce a source-backed API and anatomy decision document
- [`.claude/skills/generate-changelog`](./.claude/skills/generate-changelog/SKILL.md)
  — append a release entry to the docs changelog

## Getting started

```bash
pnpm install
pnpm dev:docs    # Docusaurus dev server
pnpm dev:react   # smoke app
pnpm --filter @takeoff-ui/react-spar test
pnpm --filter @takeoff-ui/react-spar build
```

## Validation workflow

The workspace is split into **pure validation boundaries** and **prep / build
steps**. CI calls each by name so the log makes the intent obvious.

| Command                                     | Guarantee                                                                                                                                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm check-types`                          | Pure. Each package runs `tsc --noEmit` only — no codegen, no package builds.                                                                                                                                       |
| `pnpm lint`                                 | Pure. Each package runs `eslint .` only.                                                                                                                                                                           |
| `pnpm --filter @takeoff-ui/react-spar test` | Pure. Vitest. Reads source files; no upstream build required.                                                                                                                                                      |
| `pnpm --filter docs verify:generated-api`   | Doc-integrity gate. Re-runs the docs API codegen and fails CI if it changes any tracked file in `apps/docs/src/docs-files`.                                                                                        |
| `pnpm build`                                | Builds packages then the docs site (turbo respects `^build`). The docs `prebuild` hook runs `generate:api` and rebuilds `@takeoff-ui/react-spar` so a direct `pnpm --filter docs build` still works without turbo. |
| `pnpm dev:docs` / `pnpm dev:react`          | Dev servers. The docs `predev` hook performs the same prep as `prebuild`.                                                                                                                                          |

Why the split matters:

- `apps/docs/tsconfig.json` path-aliases `@takeoff-ui/react-spar` to source,
  matching `apps/react-app`. That removes the previous `precheck-types` hook
  that ran the package's full ESM + CJS + DTS build before every typecheck.
- Codegen and package builds remain available as named scripts (`generate:api`,
  `build:react-spar`) used by `predev` / `prebuild` and CI's build step. They
  are not implicit side effects of validation.
- The docs API tables under `apps/docs/src/docs-files/<component>/api.mdx` are
  committed and verified for drift in CI; do not edit them by hand.
