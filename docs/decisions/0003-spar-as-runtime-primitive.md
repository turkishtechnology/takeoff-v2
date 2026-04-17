---
number: 0003
title: Spar is the sole runtime primitive layer
status: accepted
date: 2026-04-17
tags: [architecture, runtime, accessibility]
---

## Context

`@turkish-technology/spar` provides behavior, keyboard handling, and ARIA wiring
for the primitives this package wraps. Reimplementing any of that inside React
would:

- create two sources of truth for a11y and keyboard semantics
- force us to track WAI-ARIA Authoring Practices updates independently
- increase the bundle cost consumers already pay for Spar
- invite silent divergence from other Takeoff bindings that also depend on Spar

## Decision

Spar is the only runtime primitive layer this package consumes. The React
wrapper translates API, owns DOM required for styling, normalizes values, and
emits stable `data-*` hooks. Spar retains ownership of:

- focus management and traps
- keyboard handling
- ARIA roles, states, and relationships
- internal event lifecycle

Wrappers must not re-implement behavior Spar already owns. When Spar is missing
a behavior, the preferred path is to escalate to the Spar team, not to replicate
it in React.

## Consequences

- Components remain thin. Adapter hooks focus on translation, not behavior.
- A11y regressions caused by Spar are triaged upstream; the wrapper adds
  assertions but not substitute behavior.
- Any behavior that must live in the wrapper (for example controlled-state
  reconciliation) needs explicit justification in the component base file.
- The component-port workflow must surface Spar gaps so they can be logged as
  upstream work rather than wrapper hacks.

## References

- [`packages/react-spar/docs/CODING_STANDARDS.md`](../../packages/react-spar/docs/CODING_STANDARDS.md)
  — Component Architecture and Accessibility
- `@turkish-technology/spar` primitives exported under
  `packages/react-spar/src/components/*`
