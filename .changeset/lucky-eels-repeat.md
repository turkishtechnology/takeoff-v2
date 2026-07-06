---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add Divider component: horizontal/vertical separator with `appearance`
(solid/dashed/dotted), `align` label placement, and `decorative` a11y opt-out.
The line follows `currentColor`, dashed/dotted render via CSS gradients (legible
at 1px, with forced-colors/print border fallback), and children render in a
wrapper-owned `label` slot.
