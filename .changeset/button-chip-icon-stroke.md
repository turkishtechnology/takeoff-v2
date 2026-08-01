---
'@takeoff-design/tokens': patch
---

Stop Button and Chip from thickening the icons they hold.

Both recipes coloured the SVGs in their icon slots with `fill: currentColor`
**and** `stroke: currentColor` — a defensive pair carried since the first Button
commit, so that a glyph would take the control's colour whether it was drawn as
a fill or as a stroke. On the Takeoff icon set, which draws every glyph as a
filled path, the second declaration is not a no-op: it paints SVG's default
1-unit-wide outline centred on each path edge, adding a full unit to a 24-unit
glyph. A close mark's arms went from ~1.5 units to ~2.5 — roughly 1.6x the
intended weight, and visibly heavier than the same icon rendered outside a
button (an Upload row's status marks next to its action buttons made the
difference obvious).

The `stroke` is dropped from `.tk-button-content svg` / `.tk-button-spinner svg`
and `.tk-chip-remove svg`. The eight icons that genuinely are stroke-drawn
(`funnel`, `filter-horizontal`) carry their own `stroke="currentColor"` and
`stroke-width` attributes, so they keep colouring correctly — which is also why
the fix is a removal rather than a `stroke: none`, since that would override
those attributes and erase the glyphs entirely.
