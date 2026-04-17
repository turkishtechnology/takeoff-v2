---
number: 0006
title: Docs site type-checks under the shipped `@docusaurus/tsconfig`
status: accepted
date: 2026-04-17
tags: [typescript, monorepo, docs]
---

## Context

`apps/docs/tsconfig.json` extends `@docusaurus/tsconfig`, which does not enable
`strict`. The rest of the workspace (root `tsconfig.json`,
`packages/react-spar`, `apps/react-app`) runs under `strict: true`.

The mismatch is load-bearing for one escape hatch in
`packages/react-spar/src/provider.tsx`: `useComponentTheme<K>` indexes a
`Partial<ComponentsThemeMap>[K]` with a generic key and returns the value as
`ComponentCustomizationRegistry[K] | undefined`. Under non-strict-null checks
the indexed access keeps its optional modifier and fails the variance check
against the declared return type. The helper asserts through `unknown` to bridge
this. Without that cast the docs site fails to type-check.

Two paths were considered:

- **(a)** Accept the cast as load-bearing — treat the docs-site's non-strict
  type-checking as a fixed constraint from the upstream `@docusaurus/tsconfig`,
  and record the cast's purpose.
- **(b)** Flip the docs site to `strict: true`, surface whatever breaks in
  Docusaurus-generated types, and remove the cast.

## Decision

We will accept the cast (option a). Ownership of the docs-site's type-strictness
belongs to upstream `@docusaurus/tsconfig`; bending the docs site alone to
`strict: true` would fork that compiler config for one escape hatch that isn't
on the wrapper library's hot path.

The cast in `useComponentTheme` is the single sanctioned escape hatch for this
variance mismatch and must carry an inline comment that names this ADR. If the
docs site ever moves to a `strict`-compatible baseline (upstream or by
overriding a small set of options), the cast can be deleted without a behavior
change — that is the explicit exit condition for this decision.

## Consequences

- `useComponentTheme` permanently owns one inline comment explaining the cast
  and pointing at this ADR, so a future contributor does not attempt to "clean
  it up" and re-break the docs build.
- New generic helpers that touch `Partial<…>[K]` in the public API surface are
  held to the same standard: either structurally safe without a cast, or
  carrying a comment that references this ADR.
- Flipping the docs site to `strict: true` becomes a clerical change (delete the
  cast, delete the comment, update this ADR's status) rather than a debug
  session.

## References

- [`packages/react-spar/src/provider.tsx`](../../packages/react-spar/src/provider.tsx)
  — the `useComponentTheme` cast.
- [`apps/docs/tsconfig.json`](../../apps/docs/tsconfig.json) — the non-strict
  baseline.
- [`docs/proposals/milestone-audit-alignments.md`](../proposals/milestone-audit-alignments.md)
  — audit that surfaced this decision.
