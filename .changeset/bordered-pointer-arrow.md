---
'@takeoff-design/tokens': minor
'@takeoff-ui/react-spar': minor
---

Give the `Tooltip` and `Popover` pointer arrows a border that continues the
bubble's outline.

The arrow now draws a border on its two outer edges in the variant's border
color, while the neck where it joins the content stays open (no seam line). This
holds across every variant and on all four placements.

`Tooltip.Arrow` / `Popover.Arrow` render this by default; passing your own
`children` still overrides it.
