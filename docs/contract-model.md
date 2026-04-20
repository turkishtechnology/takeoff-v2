---
title: takeoff-spar Contract Model
status: canonical
owner: takeoff-spar
updated: 2026-04-18
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
`@turkish-technology/spar` primitives with the Takeoff visual contract. Every
public component is authored as a **compound surface**: the root owns state and
a fixed list of named subcomponents own structure.

It is not:

- a second component framework
- a fork of `takeoff-ui/core`
- a generic headless library

The package is designed to replace the React bindings currently generated from
`takeoff-ui/core` (`@takeoff-ui/react`) for consumers moving to the Spar
runtime.

## Compound-Only Surface

Compound composition is the only authoring model. Consumers always write the
anatomy explicitly:

```tsx
<Button variant="primary" loading={loading}>
  <Button.LeadingIcon>home</Button.LeadingIcon>
  <Button.Label>Submit</Button.Label>
  <Button.Spinner />
</Button>
```

Consequences:

- **No flat content props.** Content-bearing props such as `label`, `header`,
  `subheader`, `icon`, `leadingIcon`, `trailingIcon`, `description`, `error`,
  `footerActions`, `containerSlot`, `headerSlot`, `contentSlot`, `footerSlot`,
  `spinner`, and similar **do not exist** on any root component.
- **No render overrides.** Props such as `renderIcon`, `renderSpinner`,
  `renderLeadingIcon`, `renderTrailingIcon`, `renderClearIcon`,
  `renderCloseIcon`, `renderSignIcon` **do not exist**. Consumers replace
  content by passing children to the relevant compound subcomponent instead
  (`<Button.Spinner><MySpinner /></Button.Spinner>`,
  `<Dialog.CloseButton><MyIcon /></Dialog.CloseButton>`). The canonical owner
  node — its tag, class, `data-slot`, and behavior — is always controlled by the
  subcomponent.
- **Root props are state only.** The root accepts visual/semantic state
  (`variant`, `size`, `type`, `disabled`, `loading`, `invalid`, `clearable`,
  `visible`, `allowMultiple`, `activeIndex`, etc.) and native HTML attributes
  that target the root element. Nothing else.
- **Subcomponents share state via context.** Context is an implementation detail
  that keeps consumers from threading per-part props through the tree; every
  subcomponent must be usable as a direct child of its root (or of a documented
  nested subcomponent like `Accordion.Item`) without prop plumbing.

## Migration Target

Existing consumers of `@takeoff-ui/react` adopt `@takeoff-ui/react-spar` by
rewriting the anatomy of each component into compound form once. The vocabulary
(prop names, event names, default values, `tk-*` classes, `data-slot` anchors,
state `data-*` attributes) stays aligned with `takeoff-ui/core`. The migration
guide for each component enumerates which flat prop maps to which subcomponent.

Migration commitments:

- every `takeoff-ui/core` slot exposes a matching compound subcomponent with a
  predictable name (`Root.Header`, `Root.Body`, `Root.Footer`,
  `Root.LeadingIcon`, etc.)
- stateful props keep their core names and semantics
- intentional divergences are enumerated in the migration note that ships with
  the component

## Parity Definition

Parity in this repo means **consumer-visible API alignment on state and styling
contracts**, not flat-shape symmetry. The React wrapper is free to pick its own
primitives, rendering strategy, DOM shape, and test stack as long as:

- the compound anatomy mirrors `takeoff-ui/core`'s structural slots
- root prop names and semantics for state match `takeoff-ui/core` when they
  exist
- event payloads describe the same user-observable facts
- default values produce the same initial user experience
- documented styling hooks (`tk-*` slot classes, `data-slot`, state and variant
  `data-*` attributes) stay stable across minor releases

Parity is therefore a contract on the public surface. Internal refactors that
preserve the surface are not parity changes.

## Divergence Classification

Every non-parity choice must be classified before it ships.

| Class                  | Meaning                                                                                                 | Examples                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `strict-parity`        | Root prop, event, default, or styling hook must match `takeoff-ui/core` exactly. No additive extension. | `Button.variant` enum, `Accordion.Item.active`                                                   |
| `technical-adaptation` | The shape must diverge because React, Spar, or the compound-only baseline require it.                   | `ref` as a regular prop, `CustomEvent` → `onX`, translating a flat `header` prop into `X.Header` |
| `react-enhancement`    | A React-only API that does not exist in `takeoff-ui/core`. Must be additive, documented, and an ADR.    | `classNames`, `slotProps`, the compound-part exports themselves                                  |
| `forbidden-divergence` | A shape change that is not allowed, even if convenient.                                                 | Adding a flat content prop, adding a `renderX` override, removing a documented compound part     |

Every PR that introduces a `react-enhancement` must reference an ADR under
`docs/decisions/`. A PR that introduces a `forbidden-divergence` must not be
merged.

## Breaking Change Definition

A change is breaking if any of the following is true:

- a public root prop is removed or renamed without alias
- a public root prop's type narrows or its default flips
- a compound subcomponent is removed, renamed, or moved between roots
- a compound subcomponent's `data-slot` anchor moves, disappears, or changes
  case
- a documented event callback is removed, renamed, or its payload changes
- a documented `tk-*` slot class is renamed
- a documented state or variant `data-*` hook changes its value space
- the rendered DOM ownership (structural owner node) of any compound
  subcomponent changes
- peer dependency ranges tighten (React, Spar, tokens)

A change is not breaking if it only:

- adds a new optional root prop
- adds a new optional compound subcomponent
- adds a new `data-*` hook that does not overlap existing selectors
- changes unobservable internal implementation

Breaking changes require a major version bump and a migration note in the
release changeset.

## Migration Safety Commitments

While the migration from `@takeoff-ui/react` is active, the repo commits to:

- publish an explicit mapping from legacy flat props to compound parts with
  every component release
- document precedence between overlapping inputs (controlled vs uncontrolled,
  theme vs instance customization) in both types and live reference docs
- ship enhancements as additive compound parts or additive state props, never by
  reintroducing flat content props or render-override props
- gate every new wrapper through the component-port readiness checklist before
  publication (see Milestone 6 of the execution plan)

## How This Document Is Maintained

- This file is the canonical parity and migration contract. Update it when a
  decision changes what the library promises.
- Operational how-to lives in the coding standards, not here.
- Ephemeral exploration belongs under `docs/proposals/` and must be archived or
  deleted once its output lands in canonical docs.
