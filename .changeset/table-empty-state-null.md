---
'@takeoff-ui/react-spar': minor
---

`Table`: `emptyState={null}` (or `false`) now leaves the empty-table cell blank
instead of showing the default "No data" text. Leaving `emptyState` unset still
shows `labels.noData`.
