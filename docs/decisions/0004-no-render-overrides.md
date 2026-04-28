# ADR-0004: No render-override props

- Status: accepted
- Date: 2026-04-28
- Supersedes: none
- Superseded by: none

## Context

Several Stencil components in `takeoff-ui` accept render overrides indirectly
via slot mechanics. Earlier shipped wrappers in `@takeoff-ui/react-spar` exposed
React equivalents as flat props:

- `Checkbox` — `renderIcon({ checked, indeterminate })`.
- `Input` — `renderLeadingIcon`, `renderTrailingIcon`, `renderSpinner`,
  `renderClearIcon`.

Render-override props are seductive when the component has clear "swap this
visual" surfaces. They are also a long-term tax:

- Two ways to do the same thing (the prop **and** the compound part) split
  documentation, examples, and consumer mental models.
- Render overrides invite version drift: each upgrade can break consumers'
  custom render functions in subtle ways the type system does not catch.
- They contradict the spar-shaped, additive customization philosophy already
  documented in
  [`apps/docs/docs/philosophy/spar-shaped.mdx`](../../apps/docs/docs/philosophy/spar-shaped.mdx)
  and
  [`apps/docs/docs/philosophy/additive-customization.mdx`](../../apps/docs/docs/philosophy/additive-customization.mdx),
  which already say "no `renderIcon` or `renderSpinner` props".

The contradiction between the philosophy docs and the shipped Checkbox / Input
means the policy was not actually enforced. This ADR closes that gap.

## Decision

**Render-override props are forbidden on new component ports. Existing
render-override props on shipped components are deprecated and removed in the
next major release.**

The replacement for every render override is a compound subcomponent:

| Existing render prop       | Replacement                                                               |
| -------------------------- | ------------------------------------------------------------------------- |
| `Checkbox.renderIcon`      | `Checkbox.Icon` with function-as-children.                                |
| `Input.renderLeadingIcon`  | `Input.LeadingIcon` with `children`.                                      |
| `Input.renderTrailingIcon` | `Input.TrailingIcon` with `children`.                                     |
| `Input.renderSpinner`      | `Input.Spinner` with `children`.                                          |
| `Input.renderClearIcon`    | `Input.ClearButton` (canonical owner) with `children` for the icon glyph. |

Function-as-children is the supported pattern when a subcomponent needs to
expose render-time state to the consumer, e.g.:

```tsx
<Checkbox.Icon>
  {({ checked, indeterminate }) =>
    indeterminate ? <Dash /> : checked ? <Check /> : null
  }
</Checkbox.Icon>
```

The canonical owner node (the `<span class="tk-checkbox-icon">` for the example
above) stays under wrapper ownership. Consumers swap **content**, not the slot
owner.

## Deprecation timeline

For each existing render prop:

1. **Now (this release).** The compound replacement ships in the same release
   that introduces the deprecation.
2. **Now (this release).** The render prop is marked `@deprecated` in JSDoc with
   a one-line replacement pointer.
3. **Now (this release).** Using the prop logs a single warning per component
   instance in `process.env.NODE_ENV !== 'production'` builds.
4. **Now (this release).** The migration page documents the before/after.
5. **Next major release.** The render prop is removed from types and runtime.
6. **Tests in the deprecation window** must cover both surfaces — the deprecated
   path's warning, and the compound replacement's behavior.

## Consequences

- ✅ One canonical way to swap visuals: the compound part.
- ✅ Consumer override code is forward-compatible because it targets a slot, not
  a function signature.
- ✅ Internal wrapper code drops eight render-prop branches over time.
- ❌ Consumers using current `renderX` props must migrate within one major
  cycle.
- ❌ The deprecation period requires both surfaces to coexist; the short-term
  cost is duplicated documentation.

## Out of scope

This ADR does **not** ban the function-as-children pattern on compound parts.
That pattern is the supported way to expose render-time state, and remains
canonical for `Checkbox.Icon`, `Accordion.Arrow`, etc.

This ADR does not ban polymorphism via `as` on the few components where it
already exists (`Button` in `link` mode renders `<a>`). Polymorphism is a
different question; see
[`apps/docs/docs/philosophy/additive-customization.mdx`](../../apps/docs/docs/philosophy/additive-customization.mdx).

## Alternatives considered

- **Keep the render props.** Rejected: contradicts shipped philosophy docs and
  creates two ways to do one thing.
- **Remove render props in this release with no deprecation period.** Rejected:
  breaks consumers without warning.
- **Extend render props as the canonical pattern.** Rejected: the spar-shaped
  philosophy is intentional; render props collapse anatomy back into a prop-bag.

## References

- Plan principle P04 ("Compound-first anatomy").
- `apps/docs/docs/philosophy/spar-shaped.mdx`.
- `apps/docs/docs/philosophy/additive-customization.mdx`.
- `packages/react-spar/docs/CODING_STANDARDS.md` §"Compound-Only Baseline".
- Shipped deprecation surfaces: `.changeset/checkbox-component.md`,
  `.changeset/input-component.md`.
