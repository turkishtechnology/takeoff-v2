---
'@takeoff-ui/react-spar': patch
'@takeoff-design/tokens': patch
---

Give the table's sort and pagination controls glyphs that read unambiguously.
Sorting now uses up/down arrows instead of chevrons, which already mean
disclosure both in the table's own row-expand toggle and across the library, and
first/last page use double chevrons instead of plain arrows that were easy to
mistake for previous/next.
