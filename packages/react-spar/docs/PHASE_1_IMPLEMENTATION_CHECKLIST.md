# Phase 1 Implementation Checklist

This checklist turns the current direction into a stable authoring pattern for
`packages/react-spar/src/components`.

Phase 1 goal: Make the new base-driven component structure the official internal
pattern without over-abstracting the package.

Phase 1 does not aim to:

- redesign the public API
- migrate every future component up front
- introduce a large runtime abstraction layer
- rewrite primitive behavior that already works

## Expected outcome

At the end of Phase 1:

- each maintained component has one clear internal authoring center
- slot classes and default props are defined in one place
- wrapper files stay thin
- internal structure is repeatable enough to become the team default
- no public API surface expands accidentally

## Scope

Included in Phase 1:

- `createComponentBase`
- `ButtonBase`
- `AccordionBase`
- coding standard alignment
- docs and validation alignment where needed

Not required in Phase 1:

- `slotProps` or `getSlotProps` APIs — deferred to Phase 2 pilot; current
  `cx()` + `data-slot` inline pattern is sufficient for Button and Accordion
- new component scaffolding CLI
- generic adapter hooks for every component
- full state attribute normalization across the whole package

## 1. Freeze the base pattern

- Confirm the official component file shape:
  - `<ComponentName>.tsx`
  - `<ComponentName>Base.ts`
  - `types.ts`
  - `index.ts`
- Confirm that `ComponentBase.ts` is internal-only and not part of the public
- `*Base.ts` calls `createComponentBase` with component-specific metadata
  (slots, classNames, defaultProps) and may add pure helpers or light context
  alongside the returned base object. package API.
- Confirm that `ComponentBase.ts` owns:
  - component name
  - slot list
  - slot class names
  - default props
  - light pure helpers
  - light context setup when needed
- Confirm that `Component.tsx` owns:
  - prop resolution
  - primitive integration
  - DOM ownership
  - render output
- Confirm that `types.ts` owns public types only. Internal types (context
  values, adapter helpers, slot unions) live in `*Base.ts` and are not
  re-exported.

Acceptance criteria:

- no maintained component depends on `style.ts`
- no maintained component depends on `internal.ts` by default
- base files are not exported from package entrypoints

## 2. Stabilize `createComponentBase`

- Keep the API intentionally small.
- Validate that the current base utility supports only what is needed now:
  - `name`
  - `slots`
  - `classNames`
  - `defaultProps`
  - optional static `styles` — merged with slot classNames into a single frozen
    map; intended as a CSS module class-name map, not inline style objects
  - `cx`
  - `resolveProps`
- Ensure `resolveProps` behaves predictably:
  - only fills `undefined` values
  - does not override explicit falsy values
- Ensure base metadata stays plain and easy to inspect (frozen objects, no
  closures in data fields).
- Avoid adding behavior-specific logic into the shared utility.

Acceptance criteria:

- the base utility remains generic but small
- component-specific logic still lives in the component base file, not the
  shared utility
- typecheck passes without unsafe widening or public type regressions

## 3. Harden the Button reference implementation

- Keep `ButtonBase.ts` as the reference for a leaf adapter.
- Confirm `ButtonBase.ts` owns:
  - slot anatomy
  - emitted slot class names
  - default props
- Keep `Button.tsx` responsible for:
  - render mode resolution
  - anchor vs button semantics
  - loading and disabled behavior
  - content precedence
- Confirm no styling or state mapping knowledge is duplicated outside Button
  files unless it is truly shared.

Acceptance criteria:

- `Button.tsx` reads as a thin adapter rather than a metadata store
- `ButtonBase.ts` can be used as the team reference for future leaf components

## 4. Harden the Accordion reference implementation

- Keep `AccordionBase.ts` as the reference for a compound adapter.
- Confirm `AccordionBase.ts` owns:
  - root and item slot anatomy
  - default props
  - value encoding helpers
  - light context needed by item parts
- Keep `Accordion.tsx` responsible for:
  - controlled vs uncontrolled resolution
  - primitive value mapping
  - root render
- Keep `AccordionItem.tsx` responsible for:
  - item-level render
  - slot placement
  - header, icon, arrow, and content structure
- Do not move heavy render logic into the base file.

Acceptance criteria:

- `AccordionBase.ts` is the reference for compound component authoring
- `Accordion.tsx` and `AccordionItem.tsx` remain readable and focused
- the current grouped/divided/compact behavior still works

## 5. Keep the public surface clean

- Verify that no base file is exported from:
  - `src/components/*/index.ts`
  - `src/components/index.ts`
  - `src/index.ts`
- Verify that no internal helper names leak into docs API tables.
- Verify that no internal migration rationale is added to public docs.

Acceptance criteria:

- public imports stay unchanged
- docs describe usage, not authoring internals

## 6. Align theme registration

- Confirm `src/theme/recipes.ts` reads slot anatomy from base files.
- Confirm recipe slot registration still matches rendered DOM.
- Confirm deleted `style.ts` files do not leave stale imports behind.

Acceptance criteria:

- theme slot registry compiles cleanly
- no stale import paths remain
- verifier expectations still match runtime output

## 7. Align coding standards

- Update `CODING_STANDARDS.md` so it reflects the official Phase 1 structure.
- Ensure the document states:
  - `ComponentBase.ts` is preferred
  - wrappers stay thin
  - `clsx` is the standard class composition utility
  - public docs should not include internal migration rationale
- Keep the document short enough to stay usable.

Acceptance criteria:

- the standards document matches the live repo structure
- future contributors can follow it without reading old context

## 8. Validation and regression checks

- Run `pnpm --filter @takeoff-ui/react-spar run check-types`
- Run `pnpm --filter @takeoff-ui/react-spar run lint`
- Run `pnpm --filter @takeoff-ui/react-spar build`
- Run `pnpm --filter docs run build`
- Confirm no CSS is emitted from `packages/react-spar/dist`
- Confirm docs API generation still works
- Confirm slot contract still resolves into the theme registry

Acceptance criteria:

- all commands pass
- docs build succeeds
- no dist CSS regression appears

## 9. Team sign-off questions

Before closing Phase 1, answer these explicitly:

- Is `ComponentBase.ts` now the default authoring pattern for new components?
- Is the shared base utility small enough to stay stable?
- Are Button and Accordion good enough to be used as internal references?
- Is any component still carrying avoidable `style.ts` or `internal.ts`
  structure?
- Is the public API unchanged? Sign-off should be recorded in the PR that closes
  Phase 1.

If any answer is no, Phase 1 is not complete.

## Suggested execution order

1. Freeze the base pattern.
2. Stabilize `createComponentBase`.
3. Clean Button.
4. Clean Accordion.
5. Align theme registration.
6. Align coding standards.
7. Run validation.
8. Review the sign-off questions.

## Exit criteria

Phase 1 is complete when:

- the internal base-driven structure is official
- the package builds cleanly
- Button and Accordion are valid reference implementations
- the standards document reflects the live structure
- no public API drift was introduced
