---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Table: user-controlled column resizing.

- New `columnResizing` prop (`true`, or `{ value, defaultValue, onChange }` over
  `{ [columnId]: px }`) puts a drag handle on each header edge. It works with a
  mouse, pen or touch, and with Left/Right arrows (Shift for 50px steps). A
  double-click returns the column to its declared `width`. `onChange` fires once
  per resize, not on every pointer move, so it can be persisted directly.
- New column options: `resizable` (default `true`), `minWidth` (default `50`)
  and `maxWidth`.
- The table keeps its auto layout until the first resize, then switches to
  `table-layout: fixed` (`data-fixed-layout` on the root), so a column can
  shrink below its content. The last unpinned column has no handle and absorbs
  the leftover width, so the table's own width never changes; the last column
  never gets a handle.
- New `resizeHandle` slot, `TableColumnSizing` and `TableColumnResizingConfig`
  types, and the matching `.tk-table-resize-handle` recipe styles in
  `@takeoff-design/tokens`.
