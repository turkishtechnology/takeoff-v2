# Contract Model

Authoritative reference for what `@takeoff-ui/react-spar` promises to consumers,
and how that promise relates to the upstream sources it consumes.

> Companion docs:
>
> - [`api-decision-framework.md`](./api-decision-framework.md) — per-component
>   decision template applied during port.
> - [`component-architecture.md`](./component-architecture.md) — folder and file
>   responsibilities every component implements.
> - [`component-port-readiness.md`](./component-port-readiness.md) — the merge
>   gate enforced before shipping a component.
> - [`decisions/README.md`](./decisions/README.md) — repo-wide ADRs that
>   override anything in this doc when more recent.

## Three layers, one wrapper

Three independent codebases meet inside `@takeoff-ui/react-spar`:

| Layer           | Repo / package                        | Owns                                                            |
| --------------- | ------------------------------------- | --------------------------------------------------------------- |
| Takeoff UI Core | `takeoff-ui/packages/core` (Stencil)  | Product vocabulary: prop names, variants, sizes, modes, slots.  |
| Spar            | `spar/packages/spar` (React headless) | Behavior, keyboard, focus, ARIA, controlled/uncontrolled state. |
| `react-spar`    | `takeoff-spar/packages/react-spar`    | The consumer-facing API. Translates Core vocabulary onto Spar.  |

`react-spar` is **not** a second design system. It is a single-purpose adapter:
it speaks Takeoff to consumers and Spar to runtime.

## What "parity" means

We commit to parity with **Core's product vocabulary** and **Core's emitted
styling contract**. We do **not** commit to parity with Stencil's runtime shape.

| Surface                        | Parity with Core | Notes                                                                                                     |
| ------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------- |
| Prop names                     | Yes              | `variant`, `type`, `size`, `mode`, `visible`, `activeIndex`, `clearable`, etc.                            |
| Prop value enums               | Yes              | `filled`/`outlined`/`text`, `large`/`base`/`small`, `grouped`/`divided`.                                  |
| Default values                 | Yes              | When Core's default is sensible for React; deliberate divergence is recorded.                             |
| Emitted `tk-*` class names     | Yes              | Anchors token recipes from `@takeoff-design/tokens`.                                                      |
| Emitted `data-slot` anchors    | Yes              | Documented in [`DATA_ATTRIBUTE_VOCABULARY.md`](../packages/react-spar/docs/DATA_ATTRIBUTE_VOCABULARY.md). |
| Emitted state `data-*` hooks   | Yes              | `data-open`, `data-loading`, `data-disabled`, `data-invalid`, `data-variant`.                             |
| Slots → compound subcomponents | Semantic only    | Stencil `<slot name="header">` becomes `Component.Header`, not a flat prop.                               |
| Custom event names             | **No**           | `tk-change`, `tk-visible-change`, `tk-active-index-change` are dropped.                                   |
| Stencil method API             | **No**           | Imperative methods (`focus()`, `open()`) become refs or callbacks.                                        |
| Stencil-only modes             | Case-by-case     | `password`, `counter`, `chips`, `mask` modes are split into separate wrappers.                            |

## What "delegation" means

Spar owns **behavior**. The wrapper owns **API translation and emitted DOM**.
Concretely:

- Keyboard navigation (arrow keys, tab order, Enter/Space activation, Escape
  dismiss) is Spar's. The wrapper does not re-implement it.
- Focus management (focus trap, return focus on close, roving focus) is Spar's.
- ARIA wiring (`aria-expanded`, `aria-controls`, `aria-labelledby`,
  `aria-describedby`, `role`) is Spar's whenever Spar already provides it.
- Controlled/uncontrolled state reconciliation is Spar's whenever Spar already
  provides it. The wrapper's adapter hook only **maps** Takeoff prop names onto
  Spar callback names.

Re-implementing Spar-owned behavior in the wrapper is a defect. See
[`decisions/0003-spar-delegation-rule.md`](./decisions/0003-spar-delegation-rule.md).

## Divergence taxonomy

Every prop, event, slot, or behavior the wrapper exposes is classified as one of
six dispositions. The classification is recorded once per component in the
component's API decision sheet
([template in `api-decision-framework.md`](./api-decision-framework.md#decision-table)).

| Disposition    | Definition                                                                                            | Example                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **preserve**   | Same name, same type, same default, same semantics as Core.                                           | `variant`, `size`, `disabled`.                                                                       |
| **adapt**      | Same name and intent, but the type or shape changes to fit React idioms.                              | `loading: boolean` (Core) → `loading: boolean` plus `Spinner` subcomponent (no `spinner` slot prop). |
| **rename**     | The Core name is replaced by a React-idiomatic name; the old name does not appear in the public API.  | Core `tk-change` event → React `onChange` callback.                                                  |
| **compound**   | The Core slot is exposed as a compound subcomponent rather than a flat prop.                          | Core `<slot name="header">` → `Dialog.Header`.                                                       |
| **deprecated** | Compatibility shim: the prop exists for migration only, marked `@deprecated`, replaced by a compound. | Checkbox `label` / `description` props (replaced by `Checkbox.Label` / `Checkbox.Description`).      |
| **omitted**    | The Core surface is intentionally not portable; consumers must use a different component or wait.     | Stencil Input `mode="counter"` → ship as `NumberInput` later.                                        |

`deprecated` is the only disposition that lets a non-compound content prop exist
on a public root surface. It comes with strict obligations:

- Marked `@deprecated` in JSDoc with a one-line replacement pointer.
- Logged once at runtime in `process.env.NODE_ENV !== 'production'` builds.
- Removed in the next major release per the breaking-change rules below.
- Documented in the migration page with the compound replacement.

## Event naming policy

| Source                   | Public API            |
| ------------------------ | --------------------- |
| `tk-change`              | `onChange`            |
| `tk-visible-change`      | `onVisibleChange`     |
| `tk-active-index-change` | `onActiveIndexChange` |
| `tk-clear-click`         | `onClearClick`        |
| `tk-open` (lifecycle)    | `onOpen`              |
| `tk-close` (lifecycle)   | `onClose`             |

The wrapper never exposes `tk-*` event names, lowercase event names, or
`addEventListener`-style props. Spar's own callback names (`onValueChange`,
`onOpenChange`) are internal and do not surface on the wrapper unless the Core
vocabulary uses the same name (rare).

## State model policy

For every stateful component the wrapper exposes a Takeoff-named pair of
controlled and uncontrolled props:

| Component | Controlled          | Uncontrolled         | Callback              |
| --------- | ------------------- | -------------------- | --------------------- |
| Accordion | `activeIndex`       | `defaultActiveIndex` | `onActiveIndexChange` |
| Dialog    | `visible`           | `defaultVisible`     | `onVisibleChange`     |
| Checkbox  | `value` (tri-state) | `defaultValue`       | `onChange(value)`     |
| Input     | `value`             | `defaultValue`       | `onChange(value)`     |
| Tabs      | `activeIndex`       | `defaultActiveIndex` | `onActiveIndexChange` |

Internally the adapter hook translates these onto Spar's
`value`/`defaultValue`/`onValueChange` (or equivalent) primitives. The Spar
names are not part of the wrapper's public API.

Mapping rules:

- The controlled prop wins over uncontrolled when both are present (warn in
  development).
- The uncontrolled prop sets initial state on mount only; subsequent prop
  changes do not override user state.
- The callback fires exactly once per user-visible state change.
- The callback receives the new Takeoff-shaped value, not the Spar-shaped one.

## Compound anatomy policy

Every component exposes a root plus compound subcomponents. The root accepts
**state props only**: variant/size/type/mode flags, controlled/uncontrolled
pairs, lifecycle callbacks, and native HTML attributes. Content lives in
compound subcomponents.

- Subcomponents are reached **only through the root**: `Button.Label`,
  `Dialog.Header`. No direct named exports of subcomponents from the package
  root barrel. (See ADR
  [`decisions/0002-compound-export-policy.md`](./decisions/0002-compound-export-policy.md).)
- Subcomponents receive their state from the root via React context, not via
  props.
- A subcomponent renders nothing when its precondition is false (e.g.
  `Button.Spinner` only renders when `loading` is true on the root).
- A subcomponent's canonical owner node, class, and `data-slot` are stable.
  Consumers can pass `children` and `slotProps`; they cannot replace the owner.

## Customization surfaces

Every component exposes exactly four customization surfaces. No others.

| Surface           | What it does                                                       | Lives on                              |
| ----------------- | ------------------------------------------------------------------ | ------------------------------------- |
| Compound parts    | Compose anatomy and swap content inside canonical owner nodes.     | Children passed to subcomponents.     |
| `classNames`      | Per-slot extra class names. Canonical `tk-*` class always wins.    | Root prop. Shallow-merged with theme. |
| `slotProps`       | Per-slot HTML attribute overrides. Canonical `data-*` always wins. | Root prop. Shallow-merged with theme. |
| Provider defaults | App-wide `defaultProps`, `classNames`, `slotProps` per component.  | `SparReactProvider`'s `components`.   |

Render-override props (`renderIcon`, `renderSpinner`, `renderClearIcon`,
`renderLeadingIcon`, `renderTrailingIcon`, `renderCloseIcon`, …) are
**forbidden** on new components. Existing render-override props on shipped
components are deprecated and removed in the next major release. See
[`decisions/0004-no-render-overrides.md`](./decisions/0004-no-render-overrides.md).

## Breaking-change rules

A change is **breaking** if any of the following are true for a previously
released public surface:

- A prop is removed.
- A prop's type narrows (existing valid values become invalid).
- A prop's default changes.
- A prop renames without keeping the old name as a `deprecated` alias for one
  major version.
- An event name changes.
- A subcomponent is removed.
- A subcomponent moves out from under its root (consumers must change
  `Dialog.Header` to anything else).
- An emitted `tk-*` class is removed or renamed.
- An emitted `data-slot` value is removed or renamed.
- A documented state `data-*` hook is removed or renamed.

Non-breaking changes (do not require a major):

- Adding a prop with a backwards-compatible default.
- Adding a subcomponent.
- Adding a new value to a string union, when consumers can't have been
  exhaustively switching on it.
- Adding a `data-*` attribute that did not exist before.
- Tightening internal Spar delegation that is not observable from outside.

A breaking change requires:

1. An ADR in [`decisions/`](./decisions/) explaining the rationale.
2. A changeset bumping the package's `major`.
3. A migration entry in `apps/docs/docs/migration/` showing the before/after.
4. The deprecated-but-still-present surface for one full major cycle.

## Versioning

| Semver  | Trigger                                                                |
| ------- | ---------------------------------------------------------------------- |
| `patch` | Bug fix that does not change emitted DOM, classes, or `data-*` hooks.  |
| `minor` | New component, new prop, new subcomponent, new variant value, new ADR. |
| `major` | Anything in the breaking-change rules above.                           |

`@takeoff-ui/react-spar` follows independent semver from `takeoff-ui` Core. A
Core minor version bump may land in our patch if it preserves vocabulary; a Core
major may force ours.

## Source-of-truth precedence

When two of these say different things, follow the lower one:

1. JSDoc and types in `packages/react-spar/src/components/<name>/types.ts`.
2. The component's API decision sheet (under `tools/` or referenced from the
   component's port note).
3. This file (`contract-model.md`).
4. ADRs in `decisions/`.
5. `packages/react-spar/docs/CODING_STANDARDS.md`.
6. The component's docs page in `apps/docs/`.

ADRs override everything above them when more recent. The component's own types
are the runtime truth.
