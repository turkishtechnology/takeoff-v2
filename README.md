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
- `.agents` — agent skills (`generate-component`, `takeoff-component-port`)
- `docs/proposals` — open research and design proposals awaiting resolution
- `.changeset` — changesets-driven release automation

## Documentation

Live reference:

- [Coding standards](./packages/react-spar/docs/CODING_STANDARDS.md)
- [Data attribute vocabulary](./packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md)

Execution playbooks (internal):

- [Phase 1 implementation checklist](./packages/react-spar/docs/PHASE_1_IMPLEMENTATION_CHECKLIST.md)
- [Phase 2 implementation checklist](./packages/react-spar/docs/PHASE_2_IMPLEMENTATION_CHECKLIST.md)

Agent skills:

- [Component port skill](./.agents/takeoff-component-port/SKILL.md)
- [Generate component skill](./.agents/generate-component/SKILL.md)

Open research:

- [Docs consolidation R&D task](./docs/proposals/docs-consolidation.md) — drives
  the long-term home for every markdown file in this repo.

## Getting started

```bash
pnpm install
pnpm dev:docs    # Docusaurus dev server
pnpm dev:react   # smoke app
pnpm --filter @takeoff-ui/react-spar test
pnpm --filter @takeoff-ui/react-spar build
```
