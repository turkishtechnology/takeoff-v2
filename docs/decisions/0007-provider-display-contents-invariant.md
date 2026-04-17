---
number: 0007
title: `SparReactProvider` locks `display: contents` on its wrapper
status: accepted
date: 2026-04-17
tags: [provider, layout, contract]
---

## Context

`SparReactProvider` renders a single `<div>` wrapper so it can attach
`data-theme`, `lang`, and any forwarded HTML attributes. The wrapper is intended
to be layout-transparent: it must not introduce a new box that changes DOM flow,
grid/flex participation, or stacking contexts. That is why the default wrapper
style is `display: contents`.

Because the provider's props extend `HTMLAttributes<HTMLDivElement>`, consumers
can pass `style`. The previous implementation merged consumer style **over** the
default:

```tsx
style={style ? { ...providerStyle, ...style } : providerStyle}
```

That let a consumer passing `style={{ display: 'block' }}` (or any competing
`display` value) silently demote the wrapper back to a real box, breaking the
transparency invariant without any warning.

## Decision

The provider's `display: contents` is part of its contract. Consumer `style` is
merged **under** the default so the invariant wins:

```tsx
style={style ? { ...style, ...providerStyle } : providerStyle}
```

Consumer-supplied style keys other than `display` continue to pass through.
Consumers that need a real layout box should render one themselves around the
provider's children, not through the provider's own wrapper.

## Consequences

- The provider wrapper is guaranteed layout-transparent regardless of consumer
  styling. Downstream layouts (e.g. a grid that expects its direct children to
  be the provider's children, not the provider `<div>`) stay correct.
- A consumer trying to override `display` silently has their override ignored.
  The React type `HTMLAttributes<HTMLDivElement>` cannot express that
  restriction statically, so the enforcement is runtime (merge order) rather
  than compile-time.
- If a future design calls for a provider that is a real layout box, that is a
  new surface (e.g. `SparReactLayoutProvider`), not an override of this one.
  Reopening this decision requires a superseding ADR.

## References

- [`packages/react-spar/src/provider.tsx`](../../packages/react-spar/src/provider.tsx)
  — the merge-order enforcement.
- [`docs/proposals/milestone-audit-alignments.md`](../proposals/milestone-audit-alignments.md)
  — audit that surfaced the silent override.
