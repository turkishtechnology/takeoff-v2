---
'@turkish-technology/spar': minor
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add `ToggleButtonGroup` (Core `tk-toggle-button-group` + `tk-toggle-button`): a
row or column of toggle buttons with single or `multiple` selection. The group
is one tab stop; the arrow keys along `orientation`, Home and End move focus,
wrap and skip disabled items, and Space / Enter press the focused item. Items
are `aria-pressed` buttons in a `role="group"`. In single mode a second press
releases the item (`''`); `deselectable={false}` keeps one pressed. The Takeoff
look comes from the group `type` (`basic` / `divided` / `light`), `rounded`,
`size`, and the pressed item's `variant` and `appearance`.

Spar gains the headless `ToggleGroup` / `ToggleGroupItem` primitive behind it
(also at `@turkish-technology/spar/toggle-group`), and its `Button` accepts
`defaultPressed` for an uncontrolled toggle; react-spar's `Button` exposes it
too.
