---
number: 0005
title: Slot classes and data-* attributes are the public styling contract
status: accepted
date: 2026-04-17
tags: [architecture, styling, contract]
---

## Context

The package does not ship component CSS (ADR 0002), so every consumer-facing
styling hook comes from two sources:

- stable `tk-*` slot classes declared in `*Base.ts` and inventoried in
  `src/styling/slot-registry.ts`
- canonical `data-*` attributes defined in
  `packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md`

Treating these as incidental implementation detail would let them drift, and
consumers (including `@takeoff-design/tokens` SCSS recipes) would break silently
whenever a slot was renamed or moved.

## Decision

`tk-*` slot classes, `data-slot` values, and the canonical state and variant
`data-*` hooks are part of the public styling contract. They must be:

- declared in the component base file via `createComponentBase`
- mirrored into `src/styling/slot-registry.ts` so the package owns one typed
  inventory of every shipped slot class (the generator script does this
  automatically)
- covered by at least one test asserting presence on the canonical owner node
- documented in `DATA_ATTRIBUTE_VOCABULARY.md` when a new `data-*` key is
  introduced

`tk-*` strings — not the JS `slotClassRegistry` export — are the cross-package
interface. Token recipes in `@takeoff-design/tokens` consume them by selector
convention (`.tk-<component> { @include <recipe>.<component>; }`). The registry
stays internal to react-spar.

Renaming, removing, or changing the case of any of these hooks is a breaking
change per the contract model.

## Consequences

- The contract model treats `tk-*` renames and `data-slot` moves as breaking
  changes. Release changesets must mark them as major.
- Slot-class and data-hook inventories live alongside component code rather than
  in release notes.
- The merge checklist must include "slot classes mirrored in
  `src/styling/slot-registry.ts`" and "emitted `data-slot` values match the base
  file".
- Render overrides may replace content inside canonical owner nodes but must
  preserve the slot class and `data-slot` anchor on the owner.
- Public compound parts must emit the same `data-slot` vocabulary as the parity
  wrapper path; they may not invent a parallel taxonomy.

## References

- [`../contract-model.md`](../contract-model.md) — breaking change definition
- [`packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md`](../../packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md)
- [`packages/react-spar/docs/CODING_STANDARDS.md`](../../packages/react-spar/docs/CODING_STANDARDS.md)
  — Styling Contract
