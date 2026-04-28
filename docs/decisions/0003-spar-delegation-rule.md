# ADR-0003: Spar delegation rule

- Status: accepted
- Date: 2026-04-28
- Supersedes: none
- Superseded by: none

## Context

`@takeoff-ui/react-spar` is built on top of `@turkish-technology/spar`. Spar is
a headless React primitive package that already owns:

- Keyboard navigation (arrow keys, tab order, Enter/Space activation, Escape
  dismiss).
- Focus management (focus trap, return focus on close, roving focus).
- ARIA wiring (`aria-expanded`, `aria-controls`, `aria-labelledby`,
  `aria-describedby`, role assignment).
- Controlled / uncontrolled state reconciliation
  (`value`/`defaultValue`/`onValueChange`).
- DOM portal management for floating elements.

Without an explicit rule, individual component ports drift toward
re-implementing pieces of this in the wrapper — usually because the upstream
behavior is awkward to translate, or because the implementer did not realize the
primitive already covers the case.

The cost of drift is real: duplicated keyboard handlers diverge over time, ARIA
assertions silently regress, focus traps end up running twice or not at all.

## Decision

**Spar owns behavior. The wrapper owns API translation and emitted DOM. The
wrapper never re-implements a behavior Spar already provides.**

Concretely:

- Every interactive component renders the corresponding Spar primitive at its
  root. The wrapper is a translation layer, not a re-implementation.
- When a Spar primitive exposes a compound part (`SparAccordion.Header`,
  `SparInput.Label`), the wrapper's matching subcomponent renders that part, not
  a plain `<div>`.
- When the wrapper bypasses an upstream Spar part (renders a plain tag instead),
  the bypass requires:
  - An inline `// exemption: <reason>` comment at the render site.
  - A `@bypass <reason>` JSDoc line in `<ComponentName>Base.ts`.
  - Proof in the port note that no Spar behavior is silently re-implemented in
    React. "I forgot" or "Felt easier" are not reasons.

The classification of every compound part as **inherited**,
**react-enhancement**, or **bypass** is recorded in the component's base file.
Reviewers should be able to read the base file and see at a glance which parts
delegate, which are pure React, and which intentionally bypass upstream.

## Consequences

- ✅ Accessibility regressions are caught at the Spar level, not duplicated in
  12 wrappers.
- ✅ Spar improvements automatically propagate to the wrapper.
- ✅ Wrapper code stays small. Less behavior, less to test, less to break.
- ❌ The wrapper inherits Spar's bugs and Spar's pace. When Spar lacks a
  feature, the wrapper waits or files an upstream issue rather than papering
  over it locally.
- ❌ "Bypass" classifications create coupling between wrapper and Spar release
  calendars: when Spar grows the missing part, the wrapper must re-classify in
  the same release.

## Operational rules

- **Do not** add keyboard handlers to a wrapper subcomponent if the upstream
  Spar part already handles the same keys.
- **Do not** add focus management to a wrapper if Spar already provides a focus
  trap or focus return.
- **Do not** copy ARIA attributes onto the wrapper that Spar already emits. The
  wrapper adds `data-*` and `tk-*` hooks; ARIA stays at the Spar level.
- **Do** call upstream Spar parts under their compound subcomponents when
  available. Inherit the part, do not parallel-render a clone.
- **Do** record any deliberate divergence in the port note.

## Examples

| Component   | Part              | Archetype         | Notes                                                                                                                                      |
| ----------- | ----------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Accordion` | `Accordion.Item`  | inherited         | Renders `SparAccordion.Item`. Keyboard, focus, ARIA owned by Spar.                                                                         |
| `Accordion` | `Accordion.Arrow` | react-enhancement | No upstream Spar arrow part. Pure decorative chrome.                                                                                       |
| `Button`    | (root, link mode) | bypass            | Renders bare `<a>`. Reason: SparButton's keyboard handler preventDefaults Enter on non-native elements, blocking native anchor navigation. |
| `Dialog`    | `Dialog.Title`    | inherited         | Renders `SparDialog.Title`. Provides the `aria-labelledby` linkage.                                                                        |
| `Dialog`    | `Dialog.Mask`     | bypass-prone      | Tempting to bypass for styling; render the upstream overlay where it exists. ADR enforces.                                                 |

## Alternatives considered

- **Wrap Spar opaquely; expose only the wrapper API.** Effectively the same
  rule, but without the explicit archetype taxonomy. Rejected because the
  taxonomy makes review tractable.
- **Allow wrappers to opt out of Spar primitives when convenient.** Rejected:
  this is exactly the drift the ADR exists to prevent.
- **Treat Spar as a soft suggestion.** Rejected: collapses the behavioral
  contract.

## References

- Plan principle P02 ("Implementation delegates to Spar").
- `packages/react-spar/docs/CODING_STANDARDS.md` §"Composition Archetypes".
- [`contract-model.md`](../contract-model.md#what-delegation-means).
