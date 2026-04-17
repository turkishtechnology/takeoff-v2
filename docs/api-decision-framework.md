---
title: Public API Decision Framework
status: canonical
owner: takeoff-spar
updated: 2026-04-17
---

# Public API Decision Framework

This framework is used every time a new public API enters
`@takeoff-ui/react-spar` or an existing one changes. It answers **how** to
decide an API shape. It is not a build checklist — for implementation rules see
[`packages/react-spar/docs/CODING_STANDARDS.md`](../packages/react-spar/docs/CODING_STANDARDS.md).

Every question below must have a documented answer before a component ships.
Record non-obvious answers in the component base file (JSDoc) and in the
component port decision note produced by `$takeoff-component-port`.

Related:

- [`contract-model.md`](./contract-model.md) — what the library promises
- [`decisions/`](./decisions/README.md) — durable repo-wide decisions

## 1. Prop parity

Question: does an equivalent prop exist on `takeoff-ui/core`?

- If yes, match the name and semantics exactly. Classify as `strict-parity`.
- If yes but a React idiom diverges (`visible` vs `open`, event payload shape),
  keep the parity name. Add an alias only when the React idiom is strongly
  expected. Alias decisions must be recorded as an ADR under
  [`decisions/`](./decisions/README.md).
- If no, the prop is a `react-enhancement` and must be additive and must not
  overlap a parity prop.

Default stance: parity wins.

## 2. Event parity

Question: does the core component emit an event for this user intent?

- Preserve the same user-observable semantics (what is reported, when it fires,
  what it cancels).
- Convert from `CustomEvent`-style to React `onX` callbacks as a
  `technical-adaptation`.
- Never expose raw Spar events on the public surface.
- Fire callbacks exactly once per user-visible state change.

## 3. Controlled vs uncontrolled

Question: does the wrapper own state or delegate to Spar?

- Expose an idiomatic controlled / uncontrolled pair when the user typically
  drives the state (`value` / `defaultValue`, `activeIndex` /
  `defaultActiveIndex`, `visible` / `defaultVisible`).
- Controlled props win over uncontrolled fallbacks.
- Controlled props win over item-level fallbacks.
- Instance props win over theme defaults from `SparReactProvider`.
- Normalize incoming values inside the adapter hook, not inline in JSX.
- Ship a single mode (controlled-only or uncontrolled-only) only when the
  component is genuinely stateless or behavioral.

## 4. Alias precedence

Question: do two props target the same slot or the same data?

- Explicit wins over implicit (`children` beats `label`).
- Controlled wins over uncontrolled.
- Instance `slotProps` wins over theme-level `slotProps` of the same slot.
- Instance `classNames` wins over theme-level `classNames` of the same slot.
- Internal canonical classes are always concatenated, never replaced.
- Document precedence in types and in the live reference docs.

## 5. Slot ownership

Question: who owns the structural node of each slot?

Classify every slot before exposing customization:

- **Structural**: semantics, interaction, layout, or selector anchoring live
  here. Owned by the wrapper. Consumers may target via `slotProps` or, when
  provided, public compound parts. Never replaceable by render overrides.
- **Content-bearing**: the canonical container stays, but its inner content is
  consumer-facing. Accepts render overrides.
- **Decorative**: optional ornaments such as icons or spinners. Accepts render
  overrides and may be absent.

Typical structural slots include `root`, `overlay`, `trigger`, `content`,
`header`, `closeButton`.

## 6. Render override scope

Question: where can a render override reach?

- Render overrides replace the content _inside_ canonical slot owner nodes.
- Render overrides must not replace the structural owner node itself (its tag,
  class, `data-slot`, or dismiss wiring).
- Every render override callback receives the default-rendered node as an
  argument so consumers can compose rather than reinvent.
- Render override prop names (`renderSpinner`, `renderIcon`, `renderCloseIcon`,
  `renderSignIcon`) are part of the public contract. Renaming or removing them
  is breaking.

## 7. Compound part thresholds

Question: should a component expose public compound parts (`Dialog.Header`,
`Dialog.Footer`, etc.)?

Default to parity-wrapper-only. Introduce compound parts only when all of the
following hold:

- the component has multiple structural slots with meaningful layout freedom
  (disclosure, overlay, list families)
- consumers can demonstrate a layout need that `slotProps` plus render overrides
  cannot serve
- the wrapper can internally compose the same compound parts so that only one
  render tree exists

Compound parts must:

- emit the same `data-slot` anchors as the parity wrapper path
- preserve ARIA wiring required by the parity contract
- be covered by at least one wrapper-path and one compound-path test

## Decision recording

For each component port or API change, record:

- the divergence classification (`strict-parity`, `technical-adaptation`,
  `react-enhancement`, `forbidden-divergence`)
- the customization surface choice (wrapper-only, `slotProps`, render overrides,
  compound parts)
- the precedence rules observed
- any deviation from the defaults in this framework, with a link to the relevant
  ADR

The component-port skill (`$takeoff-component-port`) carries the working
template. The canonical repo-wide record of cross-component decisions lives in
[`decisions/`](./decisions/README.md).
