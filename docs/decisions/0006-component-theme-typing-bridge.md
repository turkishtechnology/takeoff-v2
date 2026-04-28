# ADR-0006: Typing bridge for `ComponentsThemeMap` indexed access

- Status: accepted
- Date: 2026-04-28
- Supersedes: none
- Superseded by: none

## Context

`useComponentTheme<K extends ComponentName>(name: K)` returns
`ComponentCustomizationRegistry[K] | undefined`. Internally the runtime value is
read off `context.components`, whose type is
`ComponentsThemeMap = { [K in ComponentName]?: ComponentCustomizationRegistry[K] }`.

Two independent type-system constraints collide here:

- `ComponentsThemeMap[K]` is a _mapped-type_ indexed access whose optional
  modifier on `K` widens the resolved type from
  `ComponentCustomizationRegistry[K]` to
  `ComponentCustomizationRegistry[K] | undefined`. TypeScript correctly models
  this for any concrete `K`.
- TypeScript variance rules treat `ComponentCustomizationRegistry[K]` (a generic
  indexed access) and `ComponentsThemeMap[K]` (a mapped-type indexed access
  through `Partial`) as related but not assignable in either direction without a
  cast. The relationship is exact at runtime but the compiler cannot prove it
  under non-strict configurations.

The `apps/docs` workspace extends `@docusaurus/tsconfig`, which does not enable
`strict`. Without intervention, every reference to `useComponentTheme` from a
Docusaurus-built consumer site would surface a spurious assignability error even
though the API is sound.

## Decision

`useComponentTheme` casts the indexed-access result through
`as ComponentCustomizationRegistry[K] | undefined`. The cast is a typing bridge,
not a behavioral change: the runtime value is provably exactly that type by
construction of `ComponentsThemeMap`.

The cast is documented inline at
`packages/react-spar/src/provider.tsx:useComponentTheme` with a one-paragraph
explanation pointing back to this ADR. Removing the cast (e.g. as part of a
TypeScript upgrade that closes the variance hole) is a small, deliberate change
that should land with this ADR's status flipped to `superseded`.

## Consequences

- ✅ Consumers in non-strict tsconfigs (Docusaurus, older CRA-style apps,
  generated SDKs) receive the same precise return type as strict consumers, with
  no spurious errors at the call site.
- ✅ The cast lives in exactly one place, so an upgrade path is mechanical.
- ❌ The cast hides an assignment that a future refactor could break without
  noticing. Mitigation: the test-d file
  (`packages/react-spar/src/customization/contracts.test-d.ts`) asserts the
  exact return type narrowing for `useComponentTheme`, so any drift trips a
  type-level test, not a runtime bug.
- ❌ Reading the provider code requires knowing why the cast exists. The inline
  comment that points to this ADR is the mitigation.

## Alternatives considered

- **Drop the cast.** Rejected: surfaces type errors in every non-strict consumer
  of `useComponentTheme`.
- **Tighten `ComponentsThemeMap`'s definition.** Rejected: making it a
  required-key map would force consumers to pass an exhaustive component list,
  contradicting the "customize what you want" surface.
- **Inline a different bridge (e.g. `as unknown as` or generic helper).**
  Rejected: `as unknown as` is louder than the constraint warrants;
  encapsulating in a helper would require its own typing trickery for the same
  effect.

## References

- `packages/react-spar/src/provider.tsx` — the cast site.
- `packages/react-spar/src/customization/contracts.test-d.ts` — the type-level
  test that pins narrowing.
- TypeScript handbook §"Mapped types" and §"Indexed access types" — the
  language-level rules this ADR works around.
- ADR-0005 (the other provider invariant documented at the same site).
