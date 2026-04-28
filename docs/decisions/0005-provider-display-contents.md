# ADR-0005: Provider invariant — `display: contents` wrapper

- Status: accepted
- Date: 2026-04-28
- Supersedes: none
- Superseded by: none

## Context

`SparReactProvider` is the entry point consumers wrap their app with to get
theme, locale, and `components` customization. Two practical needs collide on
the wrapping element:

- The provider **must** render _some_ DOM element so that `data-theme`, `lang`,
  and consumer-supplied `style`/event props have a real attach point.
- The provider **must not** introduce a layout box, because consumers wrap the
  provider around grid/flex children where any extra non-transparent box would
  break their CSS.

Without a stable rule the wrapping element behaves as a `<div>` and silently
becomes a layout participant, producing bug reports we have already seen ("flex
items collapse when I wrap them in `SparReactProvider`").

## Decision

`SparReactProvider` renders a `<div>` whose `style` is forced to
`display: contents`. The consumer's `style` prop is merged **underneath** the
invariant — `style ? { ...style, ...providerStyle } : providerStyle` — so the
invariant always wins on conflict. All other consumer attributes (`className`,
`id`, event handlers, ARIA, `data-*`) flow through unchanged.

`display: contents` causes the element itself to be omitted from layout
generation while keeping its descendants' layout participation intact. The
`<div>`'s attributes (`data-theme`, `lang`, etc.) still apply for theming and
selectors, but the box does not break grid/flex parents.

## Consequences

- ✅ Wrapping with `SparReactProvider` never alters layout. Consumers can drop
  it anywhere without auditing surrounding CSS.
- ✅ `data-theme`/`lang` still attach to a real element so token recipes and
  i18n code can read them.
- ✅ The merge order makes the invariant un-overridable through the public prop
  surface. Removing it requires a deliberate code change.
- ❌ A consumer who genuinely wanted the provider to participate in layout must
  wrap it in their own element. We document this as the trade-off.
- ❌ `display: contents` has accessibility caveats in some legacy browsers: the
  element loses semantic role propagation in Firefox versions before 89 and
  Safari before 15.4. Both are below our supported floor, so we accept it.

## Alternatives considered

- **Render no wrapper element (`<>{children}</>`).** Rejected: there is no
  attach point for `data-theme`, `lang`, `className`, or event handlers, and
  consumers expect the provider prop surface to behave like a real element.
- **Render a `<div>` with default `display: block`.** Rejected: silently breaks
  flex/grid parents and is the bug report this ADR closes.
- **Render an explicit `<span style="display: contents">`.** Rejected: `<span>`
  carries inline-element semantics that some screen readers interpret
  differently from a generic block container.

## References

- `packages/react-spar/src/provider.tsx` — the implementation; the `style` merge
  order at the JSX site is the load-bearing line.
- `docs/contract-model.md` §"Customization surfaces" — provider as one of the
  four sanctioned surfaces.
- ADR-0006 (typing-bridge cast in `useComponentTheme`).
