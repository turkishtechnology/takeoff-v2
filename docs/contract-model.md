---
title: takeoff-spar Contract Model
status: canonical
owner: takeoff-spar
updated: 2026-04-17
---

# takeoff-spar Contract Model

This document states what `@takeoff-ui/react-spar` promises to its consumers and
how those promises are enforced inside the repo.

It is the canonical reference for questions about parity, divergence, breaking
changes, and migration safety. It takes precedence over every ad-hoc file under
`docs/proposals/`.

Scope sibling documents:

- [`api-decision-framework.md`](./api-decision-framework.md) — how per-component
  API shapes are decided
- [`decisions/`](./decisions/README.md) — durable architectural decision records
- [`packages/react-spar/docs/CODING_STANDARDS.md`](../packages/react-spar/docs/CODING_STANDARDS.md)
  — how components are implemented in code

## Library Identity

`@takeoff-ui/react-spar` is a React 19 adapter layer that wraps
`@turkish-technology/spar` primitives with the Takeoff visual contract.

It is not:

- a second component framework
- a fork of `takeoff-ui/core`
- a generic headless library

The package is designed to replace the React bindings currently generated from
`takeoff-ui/core` (`@takeoff-ui/react`) for consumers moving to the Spar
runtime.

## Migration Target

Existing consumers of `@takeoff-ui/react` must be able to adopt
`@takeoff-ui/react-spar` with:

- the same mental model
- the same prop and event vocabulary where technically feasible
- documented precedence when legacy aliases survive
- a clearly labelled list of intentional divergences

Migration safety is why most shape decisions default to parity.

## Parity Definition

Parity in this repo means **consumer-visible API alignment**, not implementation
symmetry. The React wrapper is free to pick its own primitives, rendering
strategy, DOM shape, and test stack as long as:

- prop names and semantics match `takeoff-ui/core` when they exist
- event payloads describe the same user-observable facts
- default values produce the same initial user experience
- documented styling hooks (`tk-*` slot classes, `data-slot`, state and variant
  `data-*` attributes) stay stable across minor releases

Parity is therefore a contract on the public surface. Internal refactors that
preserve the surface are not parity changes.

## Divergence Classification

Every non-parity choice must be classified before it ships.

| Class                  | Meaning                                                                                              | Examples                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `strict-parity`        | Prop, event, default, or behavior must match `takeoff-ui/core` exactly. No additive extension.       | `Button.variant` enum, `AccordionItem.header`                                                   |
| `technical-adaptation` | The shape must diverge because React or Spar require it. The divergence is not a feature choice.     | `ref` as a regular prop instead of `forwardRef`, replacing `CustomEvent` with `onX` callbacks   |
| `react-enhancement`    | A React-only API that does not exist in `takeoff-ui/core`. Must be additive, documented, and an ADR. | `classNames`, `slotProps`, `renderSpinner`, compound parts                                      |
| `forbidden-divergence` | A shape change that is not allowed, even if convenient.                                              | Silently renaming a parity prop, removing a documented slot, shipping a new event naming scheme |

Every PR that introduces a `react-enhancement` must reference an ADR under
`docs/decisions/`. A PR that introduces a `forbidden-divergence` must not be
merged.

## Breaking Change Definition

A change is breaking if any of the following is true:

- a public prop is removed or renamed without alias
- a public prop's type narrows or its default flips
- a documented event callback is removed, renamed, or its payload changes
- a documented `data-slot` anchor moves, disappears, or changes case
- a documented `tk-*` slot class is renamed
- a documented state or variant `data-*` hook changes its value space
- the rendered DOM ownership (structural slot owner) changes for an exported
  component
- peer dependency ranges tighten (React, Spar, tokens)

A change is not breaking if it only:

- adds a new optional prop
- adds a new optional slot
- adds a new `data-*` hook that does not overlap existing selectors
- changes unobservable internal implementation

Breaking changes require a major version bump and a migration note in the
release changeset.

## Migration Safety Commitments

While the migration from `@takeoff-ui/react` is active, the repo commits to:

- keep parity aliases alive for at least one major version cycle after any
  rename
- document precedence between overlapping props in both types and live reference
  docs
- ship enhancements as additive surfaces, never by retiring parity paths
- gate every new wrapper through the component-port readiness checklist before
  publication (see Milestone 6 of the execution plan)

## How This Document Is Maintained

- This file is the canonical parity and migration contract. Update it when a
  decision changes what the library promises.
- Operational how-to lives in the coding standards, not here.
- Ephemeral exploration belongs under `docs/proposals/` and must be archived or
  deleted once its output lands in canonical docs.
