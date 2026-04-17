---
number: 0001
title: React 19-only peer range
status: accepted
date: 2026-04-17
tags: [architecture, peer-deps, react]
---

## Context

`@turkish-technology/spar@0.1.3` declares React 19 as its peer range. Spar is
the only runtime primitive for this package, so React 19 is the effective floor
for every wrapper.

Advertising React 18 compatibility without a validated Spar build would:

- break at runtime for consumers who trust our peer range
- mask behavioral divergence caused by React 18's concurrent scheduling
- force us to maintain speculative dual-version test matrices with no real
  coverage

## Decision

`@takeoff-ui/react-spar` targets React 19 only. Package metadata, docs, demos,
tests, and acceptance criteria must not claim React 18 support.

The peer range will be widened to include React 18 only after
`@turkish-technology/spar` publishes an explicit React 18-compatible build and
this repo has a green React 18 test pass.

## Consequences

- Consumers on React 18 cannot adopt this package until both primitive and
  wrapper are re-qualified. Migration guidance must be explicit.
- New components can use React 19 idioms directly, including `ref` as a regular
  prop.
- Docs, READMEs, and the Docusaurus site should state the React 19 floor on
  every install page.
- The smoke app and docs app are free to rely on React 19 features without
  adding compatibility shims.

## References

- [`README.md`](../../README.md) — React Compatibility Policy
- [`apps/docs/docs/intro.md`](../../apps/docs/docs/intro.md) — public install
  page
- `@turkish-technology/spar` peer dependency declaration
