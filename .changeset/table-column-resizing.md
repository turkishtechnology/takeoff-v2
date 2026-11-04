---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Table: user-controlled column resizing.

- New `columnResizing` prop (`true`, or `{ value, defaultValue, onChange }` over
  `{ [columnId]: px }`) puts a drag handle on each header edge. It works with a
  mouse, pen or touch, and with Left/Right arrows (Shift for 50px steps). A
  double-click returns the column to its declared `width`, or fits it to its
  content when it declares none. `onChange` fires once per resize, not on every
  pointer move, so it can be persisted directly.
- `columnResizing.mode`: `'fit'` (default) keeps the table at its container's
  width as described below; `'expand'` keeps every column's width, so a growing
  column widens the table and its container scrolls, and a shrinking one narrows
  the table and its border (new `TableColumnResizingMode` type; the root carries
  `data-resize-mode`).
- New column options: `resizable` (default `true`), `minWidth` (default `50`)
  and `maxWidth`.
- The table keeps its auto layout until the first resize, then switches to
  `table-layout: fixed` (`data-fixed-layout` on the root), so a column can
  shrink below its content. The last unpinned column without a declared `width`
  has no handle and absorbs the leftover width (a fixed-width trailing column
  keeps its width), so the table's own width never changes; a growing column
  takes room from that column first, then from the columns between it and that
  column, each down to the width its content needs and never below its min width
  (fit-to-content too); each handle sits on the edge facing that column (the
  start edge for a column after it, e.g. a right pin), Alt/Ctrl/Meta + arrows
  are left to the browser, and a press that moves less than 3px is a click. Once
  a table is resized (or opens with stored widths), every body cell stays on one
  line: plain text ends in an ellipsis, richer cell content is clipped.
- Header text is now wrapped in a new `headerLabel` slot
  (`.tk-table-header-label`) on every table, so a narrowed header of a resized
  table ends in an ellipsis.
- New `resizeHandle` slot, `TableColumnSizing` and `TableColumnResizingConfig`
  types, and the matching `.tk-table-resize-handle` recipe styles in
  `@takeoff-design/tokens`.
