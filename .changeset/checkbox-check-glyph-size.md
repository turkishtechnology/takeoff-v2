---
'@takeoff-design/tokens': patch
---

Size the Checkbox check mark to its icon box. The `@takeoff-icons` 0.5.0 check
glyph is drawn twice as large, so the old oversized svg (22px / 18px) made the
tick almost fill the box; it now paints at the same size as before.
