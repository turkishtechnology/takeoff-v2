# ADR-0002: Compound export policy

- Status: accepted
- Date: 2026-04-28
- Supersedes: none
- Superseded by: none

## Context

`@takeoff-ui/react-spar` ships every component as a compound surface — a root
with named subcomponents attached via `Object.assign` (`Button.Label`,
`Dialog.Header`, `Accordion.Item`).

Two reasonable export shapes exist for the subcomponents:

1. **Compound only.** Subcomponents are reachable only through the root:
   `import { Button } from '@takeoff-ui/react-spar'; <Button.Label />`.
2. **Compound and direct named export.** Both `<Button.Label />` and a direct
   `import { ButtonLabel } from '@takeoff-ui/react-spar'` work.

The plan (P05, "One canonical API per component") and the existing
[CODING_STANDARDS](../../packages/react-spar/docs/CODING_STANDARDS.md#folder-structure)
both lean toward compound only, but the policy was not previously written down
at the package level.

This ADR pins it.

## Decision

**Compound only.** Subcomponents are reachable exclusively through the root.
Direct named subcomponent exports do not exist on `@takeoff-ui/react-spar`.

Concretely:

- `packages/react-spar/src/components/<name>/index.ts` exports the root function
  only, plus the public type names. It does not export subcomponents.
- `packages/react-spar/src/components/index.ts` re-exports the local barrel
  as-is.
- `packages/react-spar/src/index.ts` re-exports `./components`. Subcomponents
  are not surfaced.
- `displayName` on subcomponents follows the dotted form (`'Dialog.Header'`).
- TypeScript types for subcomponents (`DialogHeaderProps`, `AccordionItemProps`)
  **are** exported, because consumers need them to type wrappers around
  subcomponents. Types do not constitute a runtime API surface.

## Consequences

- ✅ One way to use a component. No tree-shaking trap where consumers split
  imports between `Dialog` and `DialogHeader` and end up with two bundles.
- ✅ Subcomponents stay tied to their root in IDE autocomplete and in docs.
- ✅ Renaming a subcomponent only requires a code change at the `Object.assign`
  site.
- ❌ Consumers cannot type-pass-through subcomponents as standalone imports.
  They can `typeof Dialog.Header` instead.
- ❌ Tooling that statically analyzes component imports (e.g. some Code Connect
  setups) needs to traverse `Object.assign` to find subcomponents. The repo's
  existing Code Connect integration handles this.

## Alternatives considered

- **Both compound and direct named exports.** Rejected: the plan's P05 calls for
  one canonical API per component. Two parallel surfaces invite divergence and
  double the ecosystem's documentation burden.
- **Direct named exports only, no `Object.assign`.** Rejected: breaks the
  Spar-shaped philosophy of explicit anatomy. `<Button>` should always read as
  `Button.Label`, not `ButtonLabel` floating loose.
- **Direct named exports under a sub-path (`@takeoff-ui/react-spar/parts`).**
  Rejected: same divergence cost as option 1, plus consumers now have to learn
  an additional package surface.

## References

- Plan principle P05 ("One canonical API per component").
- Plan task TS-009 (Accordion refactor → "Direct named subcomponent export
  policy uygulanmalı"). This ADR is the policy that TS-009 enforces.
- `packages/react-spar/docs/CODING_STANDARDS.md` §"Folder Structure" line on
  "Subcomponents are reached exclusively via the root".
