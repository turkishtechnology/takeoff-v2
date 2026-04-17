---
number: 0004
title: takeoff-ui/core is a parity reference, not a dependency
status: accepted
date: 2026-04-17
tags: [architecture, parity, dependencies]
---

## Context

`takeoff-ui/core` is the Stencil-based component library that produces the
current `@takeoff-ui/react` bindings. Those bindings are the migration source
for this package.

Importing `takeoff-ui/core` as a runtime or build dependency would:

- reintroduce Stencil at runtime and defeat the move to Spar
- force double rendering or shadow DOM constraints that Spar already avoids
- couple release cadence to an unrelated library
- make it unclear whether API changes are owned by this package or by the
  Stencil upstream

At the same time, parity with `takeoff-ui/core` is the user-visible promise this
package makes to its migration audience. So we need the contract, but not the
code.

## Decision

`takeoff-ui/core` is consulted as a parity reference for prop names, event
names, default values, enumerations, and user-observable behavior. It is not a
runtime dependency, not a build dependency, and not imported from any file in
this repo.

The parity reference is sourced from:

- the public `takeoff-ui` documentation
- the published `@takeoff-ui/react` bindings when a name-level check is needed
- the component-port skill's parity review template

## Consequences

- This repo's dependency graph stays free of Stencil runtime coupling.
- Parity decisions are checked manually through the component-port skill, not
  enforced by type sharing.
- When `takeoff-ui/core` changes a shape, we must decide whether to mirror,
  adapt, or decline. Each decision is classified per the contract model.
- `@takeoff-ui/react` is never bundled or re-exported by this package.

## References

- [`../contract-model.md`](../contract-model.md) — parity and divergence
  classification
- [`.agents/skills/takeoff-component-port/`](../../.agents/skills/takeoff-component-port/)
  — parity review skill
