---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': patch
---

Add a customizable disclosure indicator to `Select`, mirroring
`Accordion.Indicator`. `Select.Trigger` now renders a chevron at its trailing
edge by default — it flips direction and turns the primary color when open. The
new `indicator` prop on `Select.Trigger` overrides it: pass a node for a custom
static icon, a render function `({ isOpen }) => …` to swap icons by open state,
or `false` to hide it. A standalone `Select.Indicator` compound part (default
chevron + render-prop children) is also available for full layout control inside
the trigger's render-prop children.

A render-function `children` on `Select.Trigger` opts out of the built-in
indicator and value wrapper entirely, so full-layout-control usages own every
node without a doubled chevron. The trigger's value region and indicator are now
addressable slots (`value` / `indicator`) via `classNames` / `slotProps`.

Chevrons come from the official `@takeoff-icons/react` set (outlined/rounded);
`Accordion.Indicator` is switched to the same icons so both stay consistent.

> **Heads-up (visual breaking) — released as `minor` on purpose.** Because the
> trigger now shows a chevron by default, existing `Select` usages gain a
> disclosure indicator without any code change. Per the 0.x release policy we
> ship this as `minor` (not `major`) while the library has a single consumer, to
> avoid churning the major version during this phase. Pass `indicator={false}`
> to opt out.
