---
'@takeoff-ui/react-spar': minor
---

`Table` column filters can now be localized. Set `filterClearLabel` on the Table
(e.g. `"Temizle"`) to change the filter panel's Clear button for every column,
and `filterButtonLabel` to change the filter trigger's accessible name (default
"Filter column"). A column's `filter.clearLabel` overrides the table-level text.
Empty strings fall back to the defaults.
