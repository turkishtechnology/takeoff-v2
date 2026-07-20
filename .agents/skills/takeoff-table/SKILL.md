---
name: takeoff-table
description:
  "Build a data Table (TanStack-backed grid) from @takeoff-ui/react-spar
  (Takeoff UI / Spar React). Use WHENEVER building, adding, importing, styling,
  or fixing a table, data grid, data table, rows/columns view,
  sortable/filterable/paginated list, selectable rows, expandable/tree rows,
  sticky columns, or server-paged table in a React app that uses
  @takeoff-ui/react-spar / Takeoff / Spar. Triggers: 'data table', 'add a grid',
  'sortable columns', 'row selection', 'pagination', 'column filters', 'export
  rows to CSV'."
---

# Table — @takeoff-ui/react-spar

A props-first, TanStack-backed data grid: a common table is a single
`<Table data columns getRowId />` call, with a column-def + slot escape hatch
for customization.

**When to use:** Rendering tabular data with any of sorting, filtering,
pagination, row selection, expandable/tree rows, sticky columns, loading/empty
states, or server-side paging. `getRowId` is mandatory — it is the identity
source row selection keys on.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Table, getExportRows } from '@takeoff-ui/react-spar';
// cells in examples below also use Badge, Button, Input from the same package:
// import { Table, Badge, Button, Input } from '@takeoff-ui/react-spar';
```

## Basic usage

The minimum is `data`, `columns`, and `getRowId`. `accessor` is a property key,
a dot-path (`'user.city'`), or a `(row) => value` function.

```tsx
import { Table } from '@takeoff-ui/react-spar';

const data = [
  { id: '1', flight: 'TK1980', from: 'IST', to: 'LHR', status: 'On time' },
  { id: '2', flight: 'TK1', from: 'IST', to: 'JFK', status: 'Delayed' },
  { id: '3', flight: 'TK162', from: 'ESB', to: 'IST', status: 'Boarding' },
];
const columns = [
  { id: 'flight', header: 'Flight', accessor: 'flight' },
  { id: 'from', header: 'From', accessor: 'from' },
  { id: 'to', header: 'To', accessor: 'to' },
  { id: 'status', header: 'Status', accessor: 'status' },
];

<Table data={data} columns={columns} getRowId={r => r.id} bordered />;
```

## Examples

### Sorting, selection, pagination, striping

```tsx
<Table
  data={data}
  columns={columns}
  getRowId={r => r.id}
  sorting={{ multi: true }}
  selection={{ mode: 'multiple' }}
  pagination={{ pageSize: 4, pageSizeOptions: [4, 8] }}
  striped
/>
```

Mark a column `sortable: true` to expose its header sort button; `align: 'end'`
right-aligns the cell.

### Custom cells & actions

A column's `cell` is a React render-prop (never an HTML string) — Table owns the
`<td>`, `cell` supplies the content.

```tsx
import { Table, Badge, Button } from '@takeoff-ui/react-spar';

const columns = [
  { id: 'name', header: 'Name', accessor: 'name' },
  {
    id: 'role',
    header: 'Role',
    accessor: 'role',
    cell: ({ row }) => (
      <Badge variant={row.original.role === 'admin' ? 'info' : 'neutral'}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: '',
    align: 'end',
    cell: ({ row }) => (
      <Button
        size="small"
        appearance="text"
        onClick={() => editUser(row.original)}
      >
        Edit
      </Button>
    ),
  },
];
```

### Column filtering

Two-tier: declarative presets for the common cases, a `render` escape hatch for
the rest. Table owns the header trigger, the `Popover`, the active dot, and the
value wiring.

```tsx
const columns = [
  // Bare-string preset — substring text filter.
  { id: 'name', header: 'Name', accessor: 'name', filter: 'text' },
  // Object preset — choice controls need their options.
  {
    id: 'role',
    header: 'Role',
    accessor: 'role',
    filter: {
      type: 'checkbox',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
  },
];
```

Preset `type` values: `text` (Input/substring), `select` and `radio` (equality),
`checkbox` and `multi-select` (membership). For anything else (number/date
range, combobox, async), pass a `filter.render` receiving
`{ value, setValue, clear, column, close }`, plus a `filterFn` (client mode) and
optional `isActive`:

```tsx
import { Table, Input } from '@takeoff-ui/react-spar';

{
  id: 'score',
  header: 'Score',
  accessor: 'score',
  align: 'end',
  filter: {
    isActive: (value) => value != null && value !== '',
    filterFn: (row, columnId, value) =>
      value == null || value === '' ? true : row.getValue(columnId) >= Number(value),
    render: ({ value, setValue }) => (
      <Input>
        <Input.Field
          type="number"
          placeholder="Min score"
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value || undefined)}
        />
      </Input>
    ),
  },
}
```

### Expandable rows & tree data

Two mutually exclusive shapes. Detail panel — pass `expansion.render`:

```tsx
<Table
  data={data}
  columns={columns}
  getRowId={r => r.id}
  expansion={{ render: row => <div style={{ padding: 8 }}>{row.note}</div> }}
/>
```

Tree data — pass `getSubRows` plus an `expansion` config without `render`. The
toggle appears only on rows with children; use `row.depth` inside a `cell` to
indent. Supplying both `getSubRows` and `expansion.render` keeps tree mode.

```tsx
<Table
  data={data}
  columns={columns}
  getRowId={r => r.id}
  getSubRows={row => row.children}
  expansion={{ defaultValue: true }}
  bordered
/>
```

### Sticky columns & header, loading, empty

```tsx
<Table
  data={data}
  columns={[
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      sticky: 'left',
      width: 180,
    },
    /* ...middle columns... */
    {
      id: 'actions',
      header: '',
      align: 'end',
      sticky: 'right',
      width: 80,
      cell: ({ row }) => (
        <Button size="small" appearance="text">
          Edit
        </Button>
      ),
    },
  ]}
  getRowId={r => r.id}
  slotProps={{ tableViewport: { style: { maxHeight: 280 } } }}
  stickyHeader
  loading={isFetching}
  emptyState={
    <div style={{ padding: 24, textAlign: 'center' }}>
      No rows match your filters.
    </div>
  }
  bordered
/>
```

`stickyHeader` only activates when the viewport itself scrolls — give it
`maxHeight` via `slotProps.tableViewport`. `loading` overlays a Spinner and
keeps existing rows visible; `emptyState` shows only when `data` is empty and
not loading.

### Server (manual) data + export

In `manual` mode Table processes nothing in-memory and emits one bundled
`onDataRequest`; feed the fetched page back through `data`. `pagination` must
carry `rowCount`.

```tsx
import { Table, getExportRows } from '@takeoff-ui/react-spar';
import { useRef } from 'react';

const tableRef = useRef(null);

<Table
  data={page.rows}
  columns={columns}
  getRowId={row => row.id}
  tableRef={tableRef}
  manual
  sorting={{ value: sorting, onChange: setSorting }}
  filtering={{ value: filters, onChange: setFilters }}
  pagination={{
    pageSize,
    pageIndex,
    rowCount: page.total,
    onChange: setPagination,
  }}
  onDataRequest={({ pagination, sorting, filters }) =>
    fetchPage({ pagination, sorting, filters })
  }
  loading={isFetching}
/>;

// later — current filtered + sorted rows as Array<Record<columnId, value>>:
const rowsToExport = getExportRows(tableRef.current);
```

## Key props

| Prop                       | Type                                                                      | Default   | Notes                                                                                              |
| -------------------------- | ------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `data`                     | `TData[]`                                                                 | —         | Row data (the current server page in `manual` mode).                                               |
| `columns`                  | `TableColumnDef<TData>[]`                                                 | —         | Column defs: `id`, `header`, `accessor`, `cell`, `filter`, `align`, `sortable`, `sticky`, `width`. |
| `getRowId`                 | `(row, index) => string`                                                  | —         | **Required.** Stable row identity.                                                                 |
| `size`                     | `'xsmall' \| 'small' \| 'base'`                                           | `'base'`  | Density (cell padding).                                                                            |
| `striped` / `bordered`     | `boolean`                                                                 | `false`   | Zebra rows / column separators.                                                                    |
| `selection`                | `{ mode: 'single' \| 'multiple' }`                                        | —         | Row selection (Checkbox/Radio; select-all is multiple-only).                                       |
| `sorting`                  | `{ multi?: boolean }` or controlled `{ value, onChange }`                 | —         | Multi-sort opt-in.                                                                                 |
| `filtering`                | `{ value?, defaultValue?, onChange? }`                                    | —         | Controlled column-filter state.                                                                    |
| `pagination`               | `boolean \| { pageSize, pageIndex, pageSizeOptions, rowCount, onChange }` | —         | `true` enables defaults; `rowCount` required in `manual` mode.                                     |
| `expansion`                | `{ render?, defaultValue?, ... }`                                         | —         | Detail panel (`render`) or tree toggle (with `getSubRows`).                                        |
| `getSubRows`               | `(row) => TData[]`                                                        | —         | Children reader for tree data.                                                                     |
| `manual`                   | `boolean`                                                                 | `false`   | Server mode; pairs with `onDataRequest`.                                                           |
| `loading`                  | `boolean`                                                                 | `false`   | Spinner overlay + `aria-busy`.                                                                     |
| `emptyState`               | `ReactNode`                                                               | `No data` | Shown when `data` is empty (suppressed while loading).                                             |
| `tableRef`                 | `Ref<TanStackTable>`                                                      | —         | Imperative instance; access point for `getExportRows()`.                                           |
| `onDataRequest`            | `(req: TableDataRequest) => void`                                         | —         | Bundled server request (manual mode).                                                              |
| `classNames` / `slotProps` | per-slot overrides                                                        | —         | Keyed by `TableSlot` (e.g. `tableViewport`).                                                       |

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- Renders a native `<table>`/`<thead>`/`<tbody>`/`<th scope="col">`/`<td>`, so
  screen-reader table navigation, header association, and counts come for free.
- Sortable headers are real `<button>`s (Enter/Space toggle) and the `<th>`
  carries `aria-sort` (`ascending` | `descending` | `none`).
- Row selection composes Spar `Checkbox` (multiple) or `Radio` (single) with
  accessible names; select-all is multiple-mode only.
- Pagination is a labelled `navigation` region; the page-size control is a Spar
  `Select` and nav buttons carry `aria-label`s.
- The loading overlay surfaces a Spar `Spinner` (`role="status"`); the table is
  `aria-busy` while `loading`.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/table
- Source: `packages/react-spar/src/components/table/`
- Built on
  [`@tanstack/react-table`](https://tanstack.com/table/latest/docs/introduction)
  (Spar has no table primitive).
