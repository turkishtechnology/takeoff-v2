# takeoff-spar

Monorepo for `@takeoff-ui/react-spar` — a React 19 component library that wraps
`@turkish-technology/spar` primitives with the Takeoff visual contract.

## Scope Guardrails

- This codebase targets `takeoff-spar` only.
- `takeoff-ui` (Stencil) is a parity reference, not a build dependency.
- `@turkish-technology/spar` is the sole external runtime primitive.
- Tokens, icons, fonts, reset, recipes, and global styles are consumed from
  `@takeoff-design/tokens`, which `@takeoff-ui/react-spar` declares as an
  **exact-pinned peer dependency** — consumers install both packages directly
  with `pnpm add @takeoff-ui/react-spar @takeoff-design/tokens`. Each react-spar
  release pins to the exact tokens version it was tested against; the pin is
  bumped automatically via Changesets whenever tokens is re-released. The
  package does not bundle CSS — the token stylesheet must be imported explicitly
  by the consumer.
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
- `.agents/skills` — repo-local skills (per-component usage skills, component
  workflow, changelog)
- `docs/` — component authoring contract
- `.changeset` — changesets-driven release automation

## Documentation

- [Component authoring contract](./docs/component-authoring-contract.md) — layer
  responsibilities, the no-adapter-hook rule, the upstream-first rule, public
  compound policy, and the review checklist
- [Coding standards](./packages/react-spar/docs/coding-standards.md)
- [Data attribute vocabulary](./packages/react-spar/docs/data-attribute-vocabulary.md)

AI skills — consuming the library:

- [`.agents/skills/takeoff-ui`](./.agents/skills/takeoff-ui/SKILL.md) — the
  entry point: install, provider, theming, the slot/customization model, and the
  component map that routes to the per-component skills
- `.agents/skills/takeoff-<component>` — one skill per shipped component (28 in
  total, `takeoff-accordion` … `takeoff-tooltip`), each with import, examples,
  key props, accessibility notes, and a verbatim Copy-page doc under
  `references/`

AI workflows — building the library:

- [`.agents/skills/takeoff-component-workflow`](./.agents/skills/takeoff-component-workflow/SKILL.md)
  — contract / implement / review / fix-blockers / final-verify modes for
  component work
- [`.agents/skills/generate-component-docs`](./.agents/skills/generate-component-docs/SKILL.md)
  — generate a component's Docusaurus documentation page
- [`.agents/skills/generate-changelog`](./.agents/skills/generate-changelog/SKILL.md)
  — append a release entry to the docs changelog

## Getting started

```bash
pnpm install
pnpm dev:docs    # Docusaurus dev server
pnpm --filter @takeoff-ui/react-spar test
pnpm --filter @takeoff-ui/react-spar build
```

### Cleaning

```bash
pnpm clean            # build outputs + caches (dist, build, .docusaurus, .turbo, .vite, docs webpack cache)
pnpm clean:modules    # every node_modules (run pnpm install after)
pnpm clean:all        # clean + clean:modules + delete pnpm-lock.yaml — full reset
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
| `pnpm dev:docs`                             | Dev server. The docs `predev` hook performs the same prep as `prebuild`.                                                                                                                                           |

Why the split matters:

- `apps/docs/tsconfig.json` path-aliases `@takeoff-ui/react-spar` to source.
  That removes the previous `precheck-types` hook that ran the package's full
  ESM + CJS + DTS build before every typecheck.
- Codegen and package builds remain available as named scripts (`generate:api`,
  `build:react-spar`) used by `predev` / `prebuild` and CI's build step. They
  are not implicit side effects of validation.
- The docs API tables under `apps/docs/src/docs-files/<component>/api.mdx` are
  committed and verified for drift in CI; do not edit them by hand.
