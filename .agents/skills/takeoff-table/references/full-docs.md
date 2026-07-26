Table is the catalog's first **TanStack-backed** component: its state engine is
[`@tanstack/react-table`](https://tanstack.com/table), not a Spar primitive
(Spar intentionally has no table). The public API is **props-first** — a common
table is a single `<Table data columns getRowId />` call — with a **column-def +
slot escape hatch** for customization. `getRowId` is mandatory: it is the single
identity source row selection keys on.

## Playground

A single `<Table>` call with sortable headers, a `Badge` cell, a checkbox column
filter, multi-row selection, striping, and client pagination.

```tsx
function PlaygroundDemo() {
  const data = [
    { id: '1', name: 'Ada Lovelace', role: 'admin', city: 'London', age: 36 },
    {
      id: '2',
      name: 'Linus Torvalds',
      role: 'user',
      city: 'Helsinki',
      age: 35,
    },
    { id: '3', name: 'Grace Hopper', role: 'admin', city: 'New York', age: 45 },
    { id: '4', name: 'Alan Turing', role: 'user', city: 'London', age: 41 },
    {
      id: '5',
      name: 'Margaret Hamilton',
      role: 'admin',
      city: 'Boston',
      age: 33,
    },
    {
      id: '6',
      name: 'Dennis Ritchie',
      role: 'user',
      city: 'Bronxville',
      age: 48,
    },
  ];

  const columns = [
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    {
      id: 'role',
      header: 'Role',
      accessor: 'role',
      // Declarative preset — one line for the common case.
      filter: {
        type: 'checkbox',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ],
      },
      cell: ({ row }) => (
        <Badge variant={row.original.role === 'admin' ? 'info' : 'neutral'}>
          {row.original.role}
        </Badge>
      ),
    },
    { id: 'city', header: 'City', accessor: 'city' },
    { id: 'age', header: 'Age', accessor: 'age', align: 'end', sortable: true },
  ];

  return (
    <Table
      data={data}
      columns={columns}
      getRowId={row => row.id}
      sorting={{ multi: true }}
      selection={{ mode: 'multiple' }}
      pagination={{ pageSize: 4 }}
      striped
    />
  );
}

render(<PlaygroundDemo />);
```

## Basic

The minimum is `data`, `columns`, and `getRowId`. `accessor` is a property key,
a dot-path (`'user.city'`), or a `(row) => value` function.

```tsx
function BasicDemo() {
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
  return <Table data={data} columns={columns} getRowId={r => r.id} bordered />;
}

render(<BasicDemo />);
```

## Custom cells & actions

A column's `cell` is a **React render-prop** (never an HTML string) — put a
`Badge`, `Button`, icon, or anything else inside. Table still owns the `<td>`
container (padding, alignment, sticky, a11y); `cell` only supplies the content.

```tsx
function CustomCellDemo() {
  const data = [
    { id: '1', name: 'Ada Lovelace', role: 'admin' },
    { id: '2', name: 'Linus Torvalds', role: 'user' },
  ];
  const columns = [
    { id: 'name', header: 'Name', accessor: 'name' },
    {
      id: 'role',
      header: 'Role',
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
          onClick={() => alert('Edit ' + row.original.name)}
        >
          Edit
        </Button>
      ),
    },
  ];
  return <Table data={data} columns={columns} getRowId={r => r.id} />;
}

render(<CustomCellDemo />);
```

## Column filtering

A column's `filter` is **two-tier**: declarative presets for the common cases,
and a render escape hatch for everything else. Either way Table owns the
plumbing — the header trigger, the `Popover` (a real portal), the active-state
dot, and the value wiring to TanStack.

### Presets

For the common controls, pass a preset — a bare string for `text`, or an object
with `type` (+ `options` for the choice controls):

| `type`         | Control           | Filter value | Match      |
| -------------- | ----------------- | ------------ | ---------- |
| `text`         | `Input`           | `string`     | substring  |
| `select`       | `Select` (single) | `string`     | equality   |
| `radio`        | `Radio` list      | `string`     | equality   |
| `checkbox`     | `Checkbox` list   | `string[]`   | membership |
| `multi-select` | `Checkbox` list¹  | `string[]`   | membership |

```tsx
{ id: 'name', header: 'Name', accessor: 'name', filter: 'text' }

{ id: 'role', header: 'Role', accessor: 'role',
  filter: { type: 'checkbox', options: [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ] } }
```

<small>
  ¹ Spar's `Select` has no multi mode yet, so `multi-select` currently renders
  the same `Checkbox` list as `checkbox`.
</small>

```tsx
function FilterPresetDemo() {
  const data = [
    { id: '1', name: 'Ada Lovelace', role: 'admin' },
    { id: '2', name: 'Linus Torvalds', role: 'user' },
    { id: '3', name: 'Grace Hopper', role: 'admin' },
    { id: '4', name: 'Alan Turing', role: 'user' },
  ];
  const columns = [
    // Bare string preset — the shortest form.
    { id: 'name', header: 'Name', accessor: 'name', filter: 'text' },
    // Object preset — a choice control needs its options.
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
  return <Table data={data} columns={columns} getRowId={r => r.id} />;
}

render(<FilterPresetDemo />);
```

### Custom filters (escape hatch)

When no preset fits — a number range, a date range, a combobox, async-loaded
options — pass `render` instead. It receives
`{ value, setValue, clear, column, close }` and returns any control; Table still
owns the surrounding popover. `value` is whatever shape your control writes, so
pair it with a `filterFn` (client mode) and, if the default non-empty heuristic
is wrong, an `isActive` predicate for the active dot.

<Alert variant="info" appearance="outlined" className="my-8 w-full">
  <Alert.Content>
    <Alert.Title>Why both tiers?</Alert.Title>
    <Alert.Description>
      The legacy takeoff-ui filter was a closed `type` enum, which could never
      cover every column's needs, so customization ended up blocked on a library
      change. Every mature table (Mantine/Material React Table, AG Grid, MUI X)
      instead layers a short preset under a render escape hatch. Presets keep
      the 90% case one-line; `render` (the same inversion as `cell` /
      `expansion.render`) leaves the rest fully open.
    </Alert.Description>
  </Alert.Content>
</Alert>

```tsx
function FilterCustomDemo() {
  const data = [
    { id: '1', name: 'Ada Lovelace', score: 91 },
    { id: '2', name: 'Linus Torvalds', score: 64 },
    { id: '3', name: 'Grace Hopper', score: 88 },
    { id: '4', name: 'Alan Turing', score: 73 },
  ];
  const columns = [
    { id: 'name', header: 'Name', accessor: 'name', filter: 'text' },
    {
      id: 'score',
      header: 'Score',
      accessor: 'score',
      align: 'end',
      // Escape hatch: a "minimum score" filter no preset covers. You render
      // the control + supply the matching predicate; Table owns the popover.
      filter: {
        isActive: value => value != null && value !== '',
        filterFn: (row, columnId, value) =>
          value == null || value === ''
            ? true
            : row.getValue(columnId) >= Number(value),
        render: ({ value, setValue }) => (
          <Input>
            <Input.Field
              type="number"
              placeholder="Min score"
              value={value ?? ''}
              onChange={e => setValue(e.target.value || undefined)}
            />
          </Input>
        ),
      },
    },
  ];
  return <Table data={data} columns={columns} getRowId={r => r.id} />;
}

render(<FilterCustomDemo />);
```

## Expandable rows

Expansion has **two mutually exclusive shapes**. The first is a **detail
panel**: pass `expansion.render` to render a disclosure row beneath each row.
The second is **tree data** (`getSubRows`), covered below — supplying both keeps
tree mode and suppresses the detail panel.

```tsx
function ExpansionDemo() {
  const data = [
    {
      id: '1',
      name: 'Ada Lovelace',
      note: 'First programmer; worked on the Analytical Engine.',
    },
    {
      id: '2',
      name: 'Grace Hopper',
      note: 'Invented the first compiler; coined "debugging".',
    },
  ];
  const columns = [{ id: 'name', header: 'Name', accessor: 'name' }];
  return (
    <Table
      data={data}
      columns={columns}
      getRowId={r => r.id}
      expansion={{
        render: row => <div style={{ padding: 8 }}>{row.note}</div>,
      }}
    />
  );
}

render(<ExpansionDemo />);
```

## Tree data (sub-rows)

For hierarchical data, pass `getSubRows` to read each row's children and an
`expansion` config (without `render`) to make the expand toggle reveal those
flattened sub-rows instead of a detail panel. The toggle appears only on rows
that actually have children; `row.depth` is available inside a `cell` to indent
nested rows. Here `expansion={{ defaultValue: true }}` expands everything on
mount.

```tsx
function TreeDemo() {
  const data = [
    {
      id: 'eng',
      name: 'Engineering',
      headcount: 42,
      children: [
        { id: 'eng-fe', name: 'Frontend', headcount: 18 },
        { id: 'eng-be', name: 'Backend', headcount: 24 },
      ],
    },
    {
      id: 'res',
      name: 'Research',
      headcount: 15,
      children: [
        { id: 'res-ml', name: 'Machine Learning', headcount: 9 },
        { id: 'res-hci', name: 'Human–Computer Interaction', headcount: 6 },
      ],
    },
  ];
  const columns = [
    {
      id: 'name',
      header: 'Team',
      accessor: 'name',
      // Indent by depth so the tree reads as a hierarchy.
      cell: ({ row }) => (
        <span style={{ paddingLeft: row.depth * 16 }}>{row.original.name}</span>
      ),
    },
    {
      id: 'headcount',
      header: 'Headcount',
      accessor: 'headcount',
      align: 'end',
    },
  ];
  return (
    <Table
      data={data}
      columns={columns}
      getRowId={r => r.id}
      getSubRows={row => row.children}
      expansion={{ defaultValue: true }}
      bordered
    />
  );
}

render(<TreeDemo />);
```

## Sticky columns & header

Pin columns to the left or right edge with `sticky: 'left' | 'right'` on a
column def. Add `stickyHeader` to also pin the header row during vertical
scroll. Pass `maxHeight` to the viewport via `slotProps.tableViewport` to enable
vertical scroll — sticky header only activates when the viewport itself scrolls,
not a parent container. The example below constrains the wrapper to `720px` wide
and the viewport to `280px` tall so both axes scroll.

```tsx
function StickyDemo() {
  const data = [
    {
      id: '1',
      name: 'Ada Lovelace',
      dept: 'Engineering',
      role: 'admin',
      city: 'London',
      country: 'UK',
      age: 36,
      salary: 92000,
      status: 'active',
    },
    {
      id: '2',
      name: 'Linus Torvalds',
      dept: 'Engineering',
      role: 'user',
      city: 'Helsinki',
      country: 'FI',
      age: 35,
      salary: 88000,
      status: 'active',
    },
    {
      id: '3',
      name: 'Grace Hopper',
      dept: 'Research',
      role: 'admin',
      city: 'New York',
      country: 'US',
      age: 45,
      salary: 97000,
      status: 'active',
    },
    {
      id: '4',
      name: 'Alan Turing',
      dept: 'Research',
      role: 'user',
      city: 'London',
      country: 'UK',
      age: 41,
      salary: 85000,
      status: 'inactive',
    },
    {
      id: '5',
      name: 'Margaret Hamilton',
      dept: 'Engineering',
      role: 'admin',
      city: 'Boston',
      country: 'US',
      age: 33,
      salary: 99000,
      status: 'active',
    },
    {
      id: '6',
      name: 'Dennis Ritchie',
      dept: 'Engineering',
      role: 'user',
      city: 'Bronxville',
      country: 'US',
      age: 48,
      salary: 91000,
      status: 'active',
    },
    {
      id: '7',
      name: 'Barbara Liskov',
      dept: 'Research',
      role: 'admin',
      city: 'Cambridge',
      country: 'US',
      age: 52,
      salary: 103000,
      status: 'active',
    },
    {
      id: '8',
      name: 'Ken Thompson',
      dept: 'Engineering',
      role: 'user',
      city: 'San Jose',
      country: 'US',
      age: 50,
      salary: 89000,
      status: 'inactive',
    },
    {
      id: '9',
      name: 'Bjarne Stroustrup',
      dept: 'Engineering',
      role: 'user',
      city: 'Aarhus',
      country: 'DK',
      age: 47,
      salary: 87000,
      status: 'active',
    },
    {
      id: '10',
      name: 'Guido van Rossum',
      dept: 'Research',
      role: 'admin',
      city: 'Amsterdam',
      country: 'NL',
      age: 44,
      salary: 95000,
      status: 'active',
    },
    {
      id: '11',
      name: 'James Gosling',
      dept: 'Engineering',
      role: 'user',
      city: 'Calgary',
      country: 'CA',
      age: 49,
      salary: 86000,
      status: 'inactive',
    },
    {
      id: '12',
      name: 'Tim Berners-Lee',
      dept: 'Research',
      role: 'admin',
      city: 'London',
      country: 'UK',
      age: 43,
      salary: 101000,
      status: 'active',
    },
  ];

  const columns = [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      sticky: 'left',
      sortable: true,
      width: 180,
    },
    {
      id: 'dept',
      header: 'Department',
      accessor: 'dept',
      sortable: true,
      width: 140,
      filter: {
        type: 'checkbox',
        options: [
          { label: 'Engineering', value: 'Engineering' },
          { label: 'Research', value: 'Research' },
        ],
      },
    },
    {
      id: 'role',
      header: 'Role',
      accessor: 'role',
      width: 100,
      filter: {
        type: 'radio',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ],
      },
      cell: ({ row }) => (
        <Badge variant={row.original.role === 'admin' ? 'info' : 'neutral'}>
          {row.original.role}
        </Badge>
      ),
    },
    { id: 'city', header: 'City', accessor: 'city', width: 130 },
    {
      id: 'country',
      header: 'Country',
      accessor: 'country',
      width: 100,
      align: 'center',
    },
    {
      id: 'age',
      header: 'Age',
      accessor: 'age',
      width: 80,
      align: 'end',
      sortable: true,
    },
    {
      id: 'salary',
      header: 'Salary',
      accessor: 'salary',
      width: 110,
      align: 'end',
      sortable: true,
      cell: ({ row }) => '$' + row.original.salary.toLocaleString(),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      width: 110,
      filter: {
        type: 'checkbox',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === 'active' ? 'success' : 'neutral'}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      align: 'end',
      sticky: 'right',
      width: 80,
      cell: ({ row }) => (
        <Button
          size="small"
          appearance="text"
          onClick={() => alert('Edit ' + row.original.name)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 720 }}>
      <Table
        data={data}
        columns={columns}
        getRowId={r => r.id}
        sorting={{ multi: true }}
        selection={{ mode: 'multiple' }}
        pagination={{ pageSize: 6, pageSizeOptions: [6, 12] }}
        slotProps={{ tableViewport: { style: { maxHeight: 280 } } }}
        stickyHeader
        striped
        bordered
      />
    </div>
  );
}

render(<StickyDemo />);
```

## Density

`size` scales the cell padding — `'xsmall'`, `'small'`, or `'base'` (the
default) — and surfaces as `data-size` for recipes to scope against.

```tsx
function DensityDemo() {
  const [size, setSize] = React.useState('base');
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
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['xsmall', 'small', 'base'].map(value => (
          <Button
            key={value}
            size="small"
            appearance={size === value ? 'filled' : 'outlined'}
            onClick={() => setSize(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      <Table
        data={data}
        columns={columns}
        getRowId={r => r.id}
        size={size}
        bordered
      />
    </div>
  );
}

render(<DensityDemo />);
```

## Empty state

When `data` is empty, Table renders a single full-width cell. The default copy
is `No data`; pass `emptyState` to supply your own node. While `loading` is true
the empty copy is suppressed so it does not flash mid-fetch.

```tsx
function EmptyDemo() {
  const columns = [
    { id: 'flight', header: 'Flight', accessor: 'flight' },
    { id: 'from', header: 'From', accessor: 'from' },
    { id: 'to', header: 'To', accessor: 'to' },
  ];
  return (
    <Table
      data={[]}
      columns={columns}
      getRowId={r => r.id}
      bordered
      emptyState={
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            color: 'var(--tk-color-text-subtle, #888)',
          }}
        >
          No flights match your filters.
        </div>
      }
    />
  );
}

render(<EmptyDemo />);
```

## Loading

`loading` overlays a Spar `Spinner` (`role="status"`), marks the table
`aria-busy`, and sets `data-loading` for theming. Existing rows stay visible
beneath the overlay so the table does not collapse during a refetch.

```tsx
function LoadingDemo() {
  const [loading, setLoading] = React.useState(true);
  const data = [
    { id: '1', flight: 'TK1980', from: 'IST', to: 'LHR' },
    { id: '2', flight: 'TK1', from: 'IST', to: 'JFK' },
    { id: '3', flight: 'TK162', from: 'ESB', to: 'IST' },
  ];
  const columns = [
    { id: 'flight', header: 'Flight', accessor: 'flight' },
    { id: 'from', header: 'From', accessor: 'from' },
    { id: 'to', header: 'To', accessor: 'to' },
  ];
  return (
    <div>
      <Button
        size="small"
        appearance="outlined"
        style={{ marginBottom: 12 }}
        onClick={() => setLoading(v => !v)}
      >
        {loading ? 'Stop loading' : 'Start loading'}
      </Button>
      <Table
        data={data}
        columns={columns}
        getRowId={r => r.id}
        loading={loading}
        bordered
      />
    </div>
  );
}

render(<LoadingDemo />);
```

## Server (manual) data

In `manual` mode Table processes nothing in-memory. It maps to TanStack's
`manualSorting` / `manualFiltering` / `manualPagination` and emits **one bundled
`onDataRequest`** derived from the current sorting, filters, and pagination —
fetch the page yourself and feed the result back through `data`. `pagination`
must carry `rowCount` so the page count and Next/Last controls can be computed.

```tsx
<Table
  data={page.rows}
  columns={columns}
  getRowId={row => row.id}
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
/>
```

## Exporting data

Table ships **no export engine** — it exposes the current filtered + sorted rows
as a plain value projection via `getExportRows(tableRef.current)`. Formatting
and file download (CSV / Excel / PDF) stay on your side, keeping those heavy
dependencies out of the bundle.

```tsx
import { Table, getExportRows } from '@takeoff-ui/react-spar';

const tableRef = useRef(null);

<Table
  data={rows}
  columns={columns}
  getRowId={r => r.id}
  tableRef={tableRef}
/>;

// later — e.g. a "Download CSV" button:
const rowsToExport = getExportRows(tableRef.current); // Array<Record<columnId, value>>
```

## Accessibility

- Renders a native `<table>` / `<thead>` / `<tbody>` / `<th scope="col">` /
  `<td>`, so screen-reader table navigation, header association, and row/column
  counts come for free.
- Sortable headers are real `<button>`s (Enter / Space toggle sorting) and the
  `<th>` carries `aria-sort` (`ascending` | `descending` | `none`).
- Row selection composes Spar `Checkbox` (multiple) or `Radio` (single) with
  accessible names; the select-all header checkbox is multiple-mode only.
- Pagination is a labelled `navigation` region; the page-size control is a Spar
  `Select` with an accessible name, and the nav buttons carry `aria-label`s.
- The loading overlay surfaces the Spar `Spinner` (`role="status"`) and the
  table is marked `aria-busy` while `loading`.

| Key           | Behavior                                        |
| ------------- | ----------------------------------------------- |
| Tab           | Move between interactive controls in the table. |
| Enter / Space | Toggle sorting on a focused sortable header.    |

## API Reference

### Table {#table}

See [TanStack Table docs](https://tanstack.com/table/latest/docs/introduction)
for primitive behavior.

#### Props {#table-props}

| Name         | Type                                                            | Default | Description                                                                                                                                                                                                                                                                                                                           |
| ------------ | --------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data         | `TData[]`                                                       | -       | Row data. In `manual` mode this is the current server page.                                                                                                                                                                                                                                                                           |
| columns      | `TableColumnDef<TData>[]`                                       | -       | Column definitions. See `TableColumnDef`.                                                                                                                                                                                                                                                                                             |
| getRowId     | `(row: TData, index: number) => string`                         | -       | Stable row identity (single source of truth).                                                                                                                                                                                                                                                                                         |
| size         | `TableSize`                                                     | 'base'  | Density scale.                                                                                                                                                                                                                                                                                                                        |
| striped      | `boolean`                                                       | false   | Zebra-stripe rows → `data-striped`.                                                                                                                                                                                                                                                                                                   |
| bordered     | `boolean`                                                       | false   | Cell borders → `data-bordered`.                                                                                                                                                                                                                                                                                                       |
| stickyHeader | `boolean`                                                       | false   | Pin the header row during vertical scroll → `data-sticky-header`.                                                                                                                                                                                                                                                                     |
| manual       | `boolean`                                                       | false   | Server mode. When `true`, Table processes nothing in-memory — it maps to TanStack's `manualSorting`/`manualFiltering`/`manualPagination` and emits a single bundled `onDataRequest` (RFC §3.3).                                                                                                                                       |
| selection    | `TableSelectionConfig`                                          | -       | Row selection (single/multiple + select-all). Composes Spar Checkbox/Radio.                                                                                                                                                                                                                                                           |
| sorting      | `TableSortingConfig`                                            | -       | Sorting (multi-sort opt-in).                                                                                                                                                                                                                                                                                                          |
| filtering    | `TableFilteringConfig`                                          | -       | Column filtering. Filter UIs render in a Spar `Popover`.                                                                                                                                                                                                                                                                              |
| expansion    | `TableExpansionConfig<TData>`                                   | -       | Expandable rows with a render-prop body.                                                                                                                                                                                                                                                                                              |
| pagination   | `boolean \| TablePaginationConfig`                              | -       | Pagination. `true` enables it with defaults; an object configures it.                                                                                                                                                                                                                                                                 |
| loading      | `boolean`                                                       | false   | Loading state → `data-loading` + a loading overlay.                                                                                                                                                                                                                                                                                   |
| emptyState   | `React.ReactNode`                                               | -       | Content rendered when there are no rows.                                                                                                                                                                                                                                                                                              |
| getSubRows   | `(row: TData) => TData[]`                                       | -       | Sub-row reader for **tree data** (feeds TanStack `getSubRows`). Pair it with `expansion` (sans `render`) so expanding a row reveals its flattened sub-rows. When `getSubRows` is omitted, expansion falls back to the detail-panel mode driven by `expansion.render`. Supplying both keeps tree mode and suppresses the detail panel. |
| tableRef     | `Ref<TanStackTable<TData> \| null>`                             | -       | Escape hatch for the rare imperative need — receives the TanStack table instance (RFC §2.3: controlled props + an optional instance ref, never an imperative `@Method` surface). Also the access point for `getExportRows()`.                                                                                                         |
| classNames   | `Partial<Record<TableSlot, string>>`                            | -       | Per-slot class name overrides.                                                                                                                                                                                                                                                                                                        |
| slotProps    | `Partial<Record<TableSlot, React.HTMLAttributes<HTMLElement>>>` | -       | Per-slot HTML attribute overrides.                                                                                                                                                                                                                                                                                                    |
| className    | `string`                                                        | -       | Appends custom classes to the root container.                                                                                                                                                                                                                                                                                         |

#### Events {#table-events}

| Name          | Type                                  | Default | Description                                                                   |
| ------------- | ------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| onDataRequest | `(request: TableDataRequest) => void` | -       | Bundled server data-request callback (`manual` mode). See `TableDataRequest`. |

#### Data attributes {#table-data-attributes}

| Attribute                  | Applied when                                                              | Purpose                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| data-slot="root"           | Always                                                                    | Stable selector for the root container.                                                                    |
| data-slot="table-viewport" | Always                                                                    | The table-only horizontal/vertical scroll container; pagination remains outside it.                        |
| data-size                  | Always                                                                    | Reflects the resolved `size` (density) so recipes can scope cell padding.                                  |
| data-striped               | When `striped` is true.                                                   | Enables zebra striping on body rows.                                                                       |
| data-bordered              | When `bordered` is true.                                                  | Adds vertical separators between columns.                                                                  |
| data-sticky-header         | When `stickyHeader` is true.                                              | Pins the header row during vertical scroll.                                                                |
| data-scrolled              | On the table viewport while `scrollTop > 0`.                              | Adds sticky-header elevation only after vertical scrolling begins.                                         |
| data-loading               | When `loading` is true.                                                   | Shows the loading overlay; the table is also marked `aria-busy`.                                           |
| data-align                 | On every header/body cell with an `align` (or column `meta.headerAlign`). | Drives cell `text-align` (`start` \| `center` \| `end`).                                                   |
| data-sticky                | On cells of a column with `sticky: "left" \| "right"`.                    | Pins the column; per-edge offset + z-index are applied inline.                                             |
| aria-sort                  | On sortable header cells.                                                 | A11y sort state (`ascending` \| `descending` \| `none`); the sort chevron mirrors it via `data-direction`. |
| data-selected              | On a selected body row.                                                   | Theme hook for the selected-row background.                                                                |

### Type Definitions {#table-type-definitions}

| Name                  | Definition                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TableSize             | `'xsmall' \| 'small' \| 'base'`                                                                                                                                                                                                                                                                                                                                                                                                |
| TableSelectionConfig  | `{ mode: 'single' \| 'multiple' }`                                                                                                                                                                                                                                                                                                                                                                                             |
| TableSortingConfig    | `{ multi?: boolean }`                                                                                                                                                                                                                                                                                                                                                                                                          |
| TableFilteringConfig  | `{ value?: T; defaultValue?: T; onChange?: (value: T) => void }`                                                                                                                                                                                                                                                                                                                                                               |
| TablePaginationConfig | `{ pageSize?: number; pageIndex?: number; pageSizeOptions?: number[]; rowCount?: number; onChange?: (pagination: PaginationState) => void }`                                                                                                                                                                                                                                                                                   |
| TableSlot             | `\| 'root' \| 'tableViewport' \| 'table' \| 'header' \| 'headerRow' \| 'headerCell' \| 'headerContent' \| 'sortTrigger' \| 'sortIcon' \| 'body' \| 'row' \| 'cell' \| 'selectionCell' \| 'expandCell' \| 'expandButton' \| 'expandedRow' \| 'filterButton' \| 'filterPanel' \| 'pagination' \| 'paginationInfo' \| 'paginationNav' \| 'paginationActions' \| 'paginationSize' \| 'paginationGoToPage' \| 'empty' \| 'loading'` |
| TableDataRequest      | `{ pagination: PaginationState; sorting: SortingState; filters: ColumnFiltersState }`                                                                                                                                                                                                                                                                                                                                          |
