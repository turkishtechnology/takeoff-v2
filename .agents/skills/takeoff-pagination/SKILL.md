---
name: takeoff-pagination
description:
  'Builds page navigation for lists and search results — the Pagination from
  @takeoff-ui/react-spar (Takeoff UI / Spar React): page reports, a page range
  with ellipses, first/previous/next/last buttons, a page-size select and a
  page-jump input. Trigger contexts a developer would type: pagination, pager,
  paginate, page numbers, next/previous page, rows per page, page size, go to
  page, results paging, TkPagination. Use this skill WHENEVER building, adding,
  importing, styling, or fixing a Pagination (or paging controls outside a
  Table) in a React app that uses @takeoff-ui/react-spar / Takeoff / Spar.'
---

# Pagination — @takeoff-ui/react-spar

`Pagination` moves through pages of results: it reports the current page and
item range, shows a fixed-width page range with ellipses, offers
first/previous/next/last buttons, and lets the user change the page size or jump
to a page by number.

**When to use:** Paging a list, card grid or search results whose data lives
outside a `Table`. For a `Table`, use its built-in `pagination` prop instead
(both share the same Spar primitive). Not for step-by-step flows (use `Stepper`)
or tab switching (use `Tabs`).

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Pagination } from '@takeoff-ui/react-spar';
```

## Compound parts

Without children the root renders the full default anatomy for its `mode`, so
`<Pagination totalItems={240} />` is a complete control. Compose parts to drop
or reorder pieces; `Info`, `Controls` and `Actions` render their defaults when
left empty.

- `Pagination` — the `<nav>` landmark root; owns `page` / `pageSize` state.
- `Pagination.Info` — start column; defaults to `PageReport` + `ItemsReport`.
- `Pagination.PageReport` — "Page 3 of 24" (`aria-live="polite"`).
- `Pagination.ItemsReport` — "Items 21-30 of 240" (`aria-live="polite"`).
- `Pagination.Controls` — the button row; defaults follow `mode`.
- `Pagination.First` / `Pagination.Previous` / `Pagination.Next` /
  `Pagination.Last` — icon buttons, disabled when there is nowhere to go;
  children replace the glyph.
- `Pagination.Pages` — the page range: page buttons and `aria-hidden` ellipses.
- `Pagination.Actions` — end column; defaults to `PageSize` (+ `PageJump` in
  `default` mode).
- `Pagination.PageSize` — a Takeoff `Select` of `options` (default
  `[5, 10, 20, 50]`).
- `Pagination.PageJump` — a digits-only Takeoff `Input` with a submit button (no
  submit in `compact`); `applyOnBlur` (default `true`).

## Basic usage

```tsx
<Pagination totalItems={240} />
```

## Examples

### Controlled page and page size

```tsx
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(20);

<Pagination
  totalItems={total}
  page={page}
  onPageChange={setPage}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
/>;
```

Pages are 1-based. Changing the page size keeps the first visible item on
screen, so `onPageChange` may fire first, then `onPageSizeChange`.

### Type, rounded and compact

```tsx
// type: 'outlined' (default) | 'text' | 'grouped'
<Pagination totalItems={240} type="grouped" rounded />

// compact: Previous, page input, "Page x of y", Next — then the page size
<Pagination totalItems={240} mode="compact" />
```

### Composition

```tsx
<Pagination totalItems={240} type="text">
  <Pagination.Info>
    <Pagination.ItemsReport />
  </Pagination.Info>
  <Pagination.Controls>
    <Pagination.Previous />
    <Pagination.Pages />
    <Pagination.Next />
  </Pagination.Controls>
  <Pagination.Actions>
    <Pagination.PageSize options={[10, 25, 50]} />
    <Pagination.PageJump applyOnBlur={false} />
  </Pagination.Actions>
</Pagination>
```

### Wider range and translated labels

```tsx
<Pagination
  totalItems={500}
  siblingCount={2}
  boundaryCount={1}
  labels={{
    pageStatus: 'Sayfa {page} / {pageCount}',
    itemsRange: '{start}-{end} / {total} kayıt',
    nextPage: 'Sonraki sayfa',
  }}
/>
```

## Key props

| Prop               | Type                                | Default        | Notes                                                                  |
| ------------------ | ----------------------------------- | -------------- | ---------------------------------------------------------------------- |
| `totalItems`       | `number`                            | -              | Required. Page count is `ceil(totalItems / pageSize)`.                 |
| `page`             | `number`                            | -              | Controlled 1-based page; clamped into `1…pageCount` when rendered.     |
| `defaultPage`      | `number`                            | `1`            | Initial page when uncontrolled.                                        |
| `onPageChange`     | `(page: number) => void`            | -              | Fires once per page change.                                            |
| `pageSize`         | `number`                            | -              | Controlled page size.                                                  |
| `defaultPageSize`  | `number`                            | `10`           | Initial page size when uncontrolled.                                   |
| `onPageSizeChange` | `(pageSize: number) => void`        | -              | Fires once per size change (after `onPageChange` when the page moves). |
| `type`             | `'outlined' \| 'text' \| 'grouped'` | `'outlined'`   | Visual style; `data-type` on the root.                                 |
| `mode`             | `'default' \| 'compact'`            | `'default'`    | Default anatomy; `data-mode` on the root.                              |
| `rounded`          | `boolean`                           | `false`        | Fully rounded page cells; `data-rounded`.                              |
| `siblingCount`     | `number`                            | `1`            | Pages on each side of the current one.                                 |
| `boundaryCount`    | `number`                            | `1`            | Pages always shown at each end.                                        |
| `disabled`         | `boolean`                           | `false`        | Disables every control.                                                |
| `labels`           | `Partial<PaginationLabels>`         | -              | Per-key strings merged over provider `defaultProps.labels`.            |
| `options`          | `number[]`                          | `[5,10,20,50]` | On `Pagination.PageSize`; the active size is added when missing.       |
| `applyOnBlur`      | `boolean`                           | `true`         | On `Pagination.PageJump`; `false` applies only on Enter or the submit. |

Label keys: `landmark`, `pageStatus` (`{page}`, `{pageCount}`), `itemsRange`
(`{start}`, `{end}`, `{total}`), `noItems`, `firstPage`, `previousPage`,
`nextPage`, `lastPage`, `pageButton` / `currentPageButton` (`{page}`),
`rowsPerPage`, `pageJumpInput`, `pageJumpSubmit`. Blank values fall back to the
English default.

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Accessibility

- The root is a `<nav>` landmark named `"Pagination"` (`labels.landmark`); an
  explicit `aria-label` wins.
- Page buttons are named `"Go to page {page}"`; the current one is
  `"Page {page}, current page"` with `aria-current="page"`.
- Edge buttons are natively disabled at the ends; ellipses are `aria-hidden`.
- Reports are `aria-live="polite"`, so a page change is announced.
- The page input keeps digits only; Enter, the submit button or (by default)
  blur applies it, and an out-of-range page restores the current one.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://v2.takeoffui.com/docs/components/pagination
- Source: `packages/react-spar/src/components/pagination/`
- Spar primitive: `packages/spar/src/components/Pagination/`
