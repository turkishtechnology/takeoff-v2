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

Chevrons come from the official `@takeoff-icons/react` set (outlined/rounded);
`Accordion.Indicator` is switched to the same icons so both stay consistent.

Note: because the trigger now shows a chevron by default, existing `Select`
usages gain a disclosure indicator without code changes. Pass
`indicator={false}` to opt out.
