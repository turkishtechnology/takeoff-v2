---
'@takeoff-ui/react-spar': minor
---

Add the props-first `Table` component (RFC §`docs/rfc-table-component.md`) — the
catalog's first TanStack-backed component (state engine is
`@tanstack/react-table`, not a Spar primitive). Phase 1 ships a single
`<Table data columns getRowId />` surface plus the column-def + slot escape
hatch (Tier 1.5): custom `cell`/`header` render-props, `meta`/`align`/`sticky`/
`width` cell-container knobs, multi-sort with `aria-sort`, column filters in a
Spar `Popover` (text/checkbox/radio), expandable rows, client/server data
(`manual` + bundled `onDataRequest`), row selection (single/multiple +
select-all) via Spar `Checkbox`, pagination via Spar `Select`/`Button`, sticky
header + pinned columns with the documented `border-collapse: separate`
z-index/offset contract, density (`size`)/`striped`, native `<table>` a11y, and
the data-only `getExportRows()` projection (the export engine stays
consumer-side). The full compound surface (Tier 2) and grouping/virtualization/
inline-edit are deferred to post-Phase 1 and do not break the Phase 1 API.
