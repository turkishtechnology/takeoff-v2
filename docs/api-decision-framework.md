---
title: Public API Decision Framework
status: canonical
owner: takeoff-spar
updated: 2026-04-18
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

## 0. Compound-only baseline

Every component in `@takeoff-ui/react-spar` ships as a compound surface. The
root component owns state; subcomponents own structure. This framework assumes
that baseline everywhere. Specifically:

- There is no flat alternative. `<Button label="X">`,
  `<Input label="X" description="Y">`, `<AccordionItem header="X" icon={...}>`,
  `<Dialog header="X" subheader="Y" footerActions={...}>` and similar shapes
  **do not exist** and must not be proposed.
- Content, icons, descriptions, error text, footer actions, spinners, and the
  like are authored as named subcomponents (`Button.Label`, `Button.Spinner`,
  `Input.LeadingIcon`, `Dialog.Header`, `Dialog.CloseButton`, and so on).
- The root's only responsibility is state: `variant`, `size`, `type`,
  `disabled`, `loading`, `invalid`, `clearable`, `visible`, `allowMultiple`,
  etc. No content-bearing props live on the root.
- Subcomponents read shared state from the root via context, so consumers never
  thread per-part props through the tree. Customization targets slot keys via
  `classNames` and `slotProps` on the root.

Section 7 below refines how to add new parts when a component grows. If the
answer to "should this be a prop or a part?" is not obvious, it is a part.

## 1. Prop parity

Question: does an equivalent prop exist on `takeoff-ui/core`?

- If the core prop is stateful (variant, size, type, visibility, value, active
  index, etc.) and belongs on the root, match the name and semantics exactly.
  Classify as `strict-parity`.
- If the core prop is content-bearing (`header`, `label`, `icon`, `subheader`,
  `footerActions`, `description`, etc.), translate it into a compound
  subcomponent that owns that piece of content. Record the translation
  explicitly in the component port decision note as a `technical-adaptation`
  driven by the compound-only baseline.
- If no core prop exists, new surface is a `react-enhancement` and must be
  additive and must not overlap a parity prop.

Default stance: parity wins on state; structure always compounds.

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

- Content lives in compound children, not in props. If a consumer and a
  subcomponent both try to supply the same piece of content, the subcomponent
  wins because that is the only entry point.
- Controlled wins over uncontrolled.
- Instance `slotProps` wins over theme-level `slotProps` of the same slot.
- Instance `classNames` wins over theme-level `classNames` of the same slot.
- Internal canonical classes are always concatenated, never replaced.
- Document precedence in types and in the live reference docs.

## 5. Slot ownership

Question: who owns the structural node of each slot?

Classify every slot before exposing customization:

- **Structural**: semantics, interaction, layout, or selector anchoring live
  here. Always owned by a dedicated compound subcomponent. Consumers may target
  them via `slotProps` or via their children; they may not replace the owner
  node itself.
- **Content-bearing**: the compound subcomponent renders a canonical container
  whose _inner content_ is consumer-facing. Consumers override by passing
  children to the subcomponent.
- **Decorative**: optional ornaments such as icons or spinners. Consumers either
  omit the subcomponent entirely or pass custom children to it.

Typical structural subcomponents include `Root`, `Mask`/`Overlay`, `Trigger`,
`Content`/`Panel`/`Body`, `Header`, `CloseButton`, `Item`. A slot is never
"flat-prop-only".

## 6. Content override scope

Question: where can a consumer reach to customize content?

- Content overrides flow through compound children. Pass children to the
  relevant subcomponent (`Button.Spinner`, `Dialog.SignIcon`, `Checkbox.Icon`)
  to replace what is rendered inside the canonical owner node.
- The owner node itself (its tag, class, `data-slot`, and any dismiss / ARIA
  wiring) is always controlled by the subcomponent; consumer children never
  replace it.
- `renderIcon` / `renderSpinner` / `renderCloseIcon` / `renderSignIcon` /
  `renderX` props **do not exist** on the public surface and must not be added.
  They were superseded by the compound-only baseline.
- When a subcomponent needs to expose render-time state (e.g. open/closed for
  `Accordion.Arrow`, checked/indeterminate for `Checkbox.Icon`), use
  function-as-children: `({ isOpen }) => ReactNode`.

## 7. Compound part thresholds

Question: how many compound parts should a component expose?

Every component starts with a root plus the minimum set of parts required to
render its default anatomy. Add a new part when **any** of these hold:

- a structural slot already exists in the Takeoff UI core anatomy and cannot be
  represented as a prop on an existing part (disclosure header vs content,
  dialog mask vs panel, etc.);
- consumers need to reorder, omit, or restyle that slot independently of its
  siblings;
- the sub-tree needs its own state from context (for example, `Input.Asterisk`
  listens to `required` from the root, `Input.ErrorMessage` listens to
  `invalid`);
- the sub-tree is semantically independent and deserves its own
  `data-slot`/`tk-*` selector for token recipes.

Compound parts must:

- emit a stable `data-slot` anchor and a `tk-*` class;
- preserve ARIA wiring required by the parity contract (Dialog.Title/
  Description remain the ARIA labelling nodes);
- be covered by compound-path tests and smoke scenarios that exercise both the
  default anatomy and at least one customization path;
- be exported under the root's namespace via
  `Object.assign(Root, { Part, ... })` so that the single import resolves the
  whole surface.

## Decision recording

For each component port or API change, record:

- the divergence classification (`strict-parity`, `technical-adaptation`,
  `react-enhancement`, `forbidden-divergence`);
- the part list (root + subcomponents) and what context each consumes;
- the precedence rules observed (controlled vs uncontrolled, theme vs instance,
  instance props vs compound children);
- any deviation from the defaults in this framework, with a link to the relevant
  ADR.

The component-port skill (`$takeoff-component-port`) carries the working
template. The canonical repo-wide record of cross-component decisions lives in
[`decisions/`](./decisions/README.md).
