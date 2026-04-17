---
number: 0008
title: Path aliases over TypeScript project references
status: accepted
date: 2026-04-17
tags: [typescript, monorepo, build]
---

## Context

The workspace has two apps (`apps/docs`, `apps/react-app`) and one library
(`packages/react-spar`). All three share a single root `tsconfig.json` with
`strict: true`; the docs app additionally uses path aliases to import the
library source directly (`@takeoff-ui/react-spar` →
`packages/react-spar/src/index.ts`).

TypeScript project references (`composite: true`, per-package `tsconfig` with
`references` edges) are the canonical monorepo pattern once a workspace has
enough independent compilation units to benefit from incremental build caches
and explicit dependency graphs. They add real cost: per-package `tsconfig`
files, a build-mode toolchain, and a dependency graph maintained by hand or by
generator.

Community guidance (Nx 2026, the JS ecosystem outlook) places the break-even
around ten or more packages, or when a flat `tsc --noEmit` across the workspace
is noticeably slow.

## Decision

We will continue using path aliases and a single root `tsconfig.json`. The
library is consumed by apps through a bundler-resolved path alias in development
and through the published package in production. No `composite`/`references`
wiring is introduced.

A revisit is warranted when **either** of the following tripwires fires:

- The workspace exceeds roughly ten TypeScript projects (apps + packages
  combined), or
- `pnpm check-types` at the workspace root exceeds roughly ten seconds on a
  clean checkout.

Until then, project references are tracked under the "Industry-watch" bucket and
are not on the backlog.

## Consequences

- New packages join the workspace by adding a `package.json` and (if they export
  types) a local `tsconfig.json` that extends the root; no `references` edges
  need to be threaded.
- The trade-off is that a whole-workspace type-check runs as one compilation
  pass instead of a DAG. That is acceptable today and is the load-bearing
  assumption of this decision — when it stops being true, the tripwires fire.
- Consumers of the library outside this repo see a standard published package;
  none of the in-repo alias machinery leaks into the distributed artifact.

## References

- [`tsconfig.json`](../../tsconfig.json) — root compiler options.
- [`apps/docs/tsconfig.json`](../../apps/docs/tsconfig.json) — path alias to
  library source.
- [`docs/proposals/milestone-audit-alignments.md`](../proposals/milestone-audit-alignments.md)
  — audit that surfaced this implicit decision.
