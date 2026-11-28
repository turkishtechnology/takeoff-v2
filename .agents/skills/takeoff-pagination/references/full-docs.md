<!-- prettier-ignore-start -->

<!-- prettier-ignore-end -->

# Pagination

`Pagination` moves through pages of results. It reports the current page and
item range, shows a page range that keeps the same width while paging (an
ellipsis stands for the hidden pages), offers first/previous/next/last buttons,
and lets the user change the page size or jump to a page by number. For a
`Table`, use its built-in `pagination` prop instead; both share the same Spar
primitive.

## Usage

```tsx
import { Pagination } from '@takeoff-ui/react-spar';
```

```tsx
<Pagination>
  <Pagination.Info>
    <Pagination.PageReport />
    <Pagination.ItemsReport />
  </Pagination.Info>
  <Pagination.Controls>
    <Pagination.First />
    <Pagination.Previous />
    <Pagination.Pages />
    <Pagination.Next />
    <Pagination.Last />
  </Pagination.Controls>
  <Pagination.Actions>
    <Pagination.PageSize />
    <Pagination.PageJump />
  </Pagination.Actions>
</Pagination>
```

Without children, `Pagination` renders exactly this anatomy (or the compact one,
see below), so `<Pagination totalItems={240} />` is a complete control.

## Playground

```tsx
<Pagination totalItems={240} />
```

## Type

`type="outlined"` (the default) borders every page cell, `type="text"` leaves
them bare, and `type="grouped"` draws one box around the control row with a
divider between each pair of edge buttons.

```tsx
<div className="grid w-full gap-6">
  <Pagination totalItems={240} defaultPage={6} type="outlined" />
  <Pagination totalItems={240} defaultPage={6} type="text" />
  <Pagination totalItems={240} defaultPage={6} type="grouped" />
</div>
```

## Rounded

```tsx
<Pagination totalItems={240} defaultPage={6} rounded />
```

## Compact

`mode="compact"` swaps the page range for a page input between the previous and
next buttons. The input applies the typed page on Enter or when it loses focus;
the page size stays at the end.

```tsx
<div className="grid w-full gap-6">
  <Pagination totalItems={240} mode="compact" />
  <Pagination totalItems={240} mode="compact" rounded />
</div>
```

## Composition

Compose the parts to drop or reorder pieces: here only the item report, the
previous/next buttons and the page range. `Pagination.Info`,
`Pagination.Controls` and `Pagination.Actions` render their default children
when left empty.

```tsx
<Pagination totalItems={240} defaultPage={6} type="text">
  <Pagination.Info>
    <Pagination.ItemsReport />
  </Pagination.Info>
  <Pagination.Controls>
    <Pagination.Previous />
    <Pagination.Pages />
    <Pagination.Next />
  </Pagination.Controls>
</Pagination>
```

## Controlled

`page` / `onPageChange` and `pageSize` / `onPageSizeChange` are controlled
pairs; `defaultPage` / `defaultPageSize` start an uncontrolled one. Pages are
1-based. Changing the page size keeps the first visible item on screen, so it
can move the page as well: `onPageChange` fires first, then `onPageSizeChange`.

```tsx
function ControlledPaginationDemo() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  return (
    <div className="grid w-full gap-6">
      <Pagination
        totalItems={1000}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      >
        <Pagination.Info />
        <Pagination.Controls />
        <Pagination.Actions>
          <Pagination.PageSize options={[10, 20, 50, 100]} />
          <Pagination.PageJump />
        </Pagination.Actions>
      </Pagination>
      <span>
        page {page}, {pageSize} per page
      </span>
    </div>
  );
}

render(<ControlledPaginationDemo />);
```

## Page range

The range always shows the first and last page (`boundaryCount`, default `1`)
and the current page with `siblingCount` neighbours on each side (default `1`).
The number of items stays the same while paging, so the row never changes width.

```tsx
<div className="grid w-full gap-6">
  <Pagination totalItems={500} defaultPage={25}>
    <Pagination.Controls />
  </Pagination>
  <Pagination totalItems={500} defaultPage={25} siblingCount={2}>
    <Pagination.Controls />
  </Pagination>
  <Pagination totalItems={500} defaultPage={25} boundaryCount={2}>
    <Pagination.Controls />
  </Pagination>
</div>
```

## Labels

Every visible string and accessible name comes from `labels`, merged per key
over provider `defaultProps.labels`. Templates use `{page}`, `{pageCount}`,
`{start}`, `{end}` and `{total}`; an empty value falls back to the English
default.

```tsx
<Pagination
  totalItems={240}
  labels={{
    landmark: 'Sayfalama',
    pageStatus: 'Sayfa {page} / {pageCount}',
    itemsRange: '{start}-{end} / {total} kayıt',
    noItems: 'Kayıt yok',
    firstPage: 'İlk sayfa',
    previousPage: 'Önceki sayfa',
    nextPage: 'Sonraki sayfa',
    lastPage: 'Son sayfa',
    pageButton: '{page}. sayfaya git',
    currentPageButton: '{page}. sayfa, geçerli sayfa',
    rowsPerPage: 'Sayfa başına satır',
    pageJumpInput: 'Sayfaya git',
    pageJumpSubmit: 'Git',
  }}
/>
```

## Disabled

```tsx
<Pagination totalItems={240} defaultPage={3} disabled />
```

## Accessibility & Keyboard

- The root is a `<nav>` landmark named by `labels.landmark` (`"Pagination"`); an
  explicit `aria-label` wins.
- Page buttons are named `"Go to page {page}"`, and the current one
  `"Page {page}, current page"` with `aria-current="page"`.
- First/previous/next/last are icon buttons named by `labels`; they are natively
  disabled when there is nowhere to go.
- Ellipses are `aria-hidden`: the page buttons on either side already say where
  the range jumps.
- The page and item reports are `aria-live="polite"`, so a page change is
  announced.
- The page-jump input keeps digits only. Enter, the submit button or, unless
  `applyOnBlur={false}`, leaving the field applies the page; a page outside the
  range is rejected and the field shows the current page again.
- Below a 600px container the report column hides and the controls centre.

## API Reference

### Pagination {#pagination}

#### Props {#pagination-props}

| Name            | Type                                                         | Default    | Description                                                                               |
| --------------- | ------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------- |
| children        | `React.ReactNode`                                            | -          | Parts to render. Without children the root renders the default anatomy for its `mode`.    |
| totalItems      | `number`                                                     | -          | Total number of items across all pages. The page count is `ceil(totalItems / pageSize)`.  |
| pageSize        | `number`                                                     | -          | Controlled page size.                                                                     |
| defaultPageSize | `number`                                                     | 10         | Initial page size when uncontrolled.                                                      |
| type            | `PaginationType`                                             | 'outlined' | Visual style. Emitted as `data-type` on the root.                                         |
| mode            | `PaginationMode`                                             | 'default'  | Layout mode. Picks the default anatomy and is emitted as `data-mode`.                     |
| rounded         | `boolean`                                                    | false      | Fully rounded page cells. Emitted as `data-rounded`.                                      |
| labels          | `Partial<PaginationLabels>`                                  | -          | Per-key overrides of the user-facing strings, merged over provider `defaultProps.labels`. |
| classNames      | `Partial<Record<"root", string>>`                            | -          | Per-slot class name overrides.                                                            |
| slotProps       | `Partial<Record<"root", React.HTMLAttributes<HTMLElement>>>` | -          | Per-slot HTML attribute overrides.                                                        |
| className       | `string`                                                     | -          | Appends custom classes to the root slot of this part.                                     |

#### Events {#pagination-events}

| Name             | Type                         | Default | Description                                                                                                                           |
| ---------------- | ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| onPageSizeChange | `(pageSize: number) => void` | -       | Fires once per page-size change. When the change moves the page (the first visible item stays on screen), `onPageChange` fires first. |

#### Data attributes {#pagination-data-attributes}

| Attribute        | Applied when             | Purpose                                                                                   |
| ---------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| data-slot="root" | Always                   | Stable selector for wrapper styling on the root slot.                                     |
| data-type        | Always                   | Reflects the resolved `type` (`outlined` \| `text` \| `grouped`). Emitted by the wrapper. |
| data-mode        | Always                   | Reflects the resolved `mode` (`default` \| `compact`). Emitted by the wrapper.            |
| data-rounded     | When `rounded` is true.  | Fully rounded page cells. Emitted by the wrapper.                                         |
| data-disabled    | When `disabled` is true. | Theme hook for the disabled control. Emitted by Spar, alongside `aria-disabled`.          |

### Pagination.Info {#pagination-info}

#### Data attributes {#pagination-info-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Pagination.PageReport {#pagination-page-report}

#### Data attributes {#pagination-page-report-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Pagination.ItemsReport {#pagination-items-report}

#### Data attributes {#pagination-items-report-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Pagination.Controls {#pagination-controls}

#### Data attributes {#pagination-controls-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Pagination.First {#pagination-first}

#### Data attributes {#pagination-first-data-attributes}

| Attribute        | Applied when                                               | Purpose                                               |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| data-slot="root" | Always                                                     | Stable selector for wrapper styling on the root slot. |
| data-disabled    | When there is no page to move to, or the root is disabled. | Mirrors the native `disabled` state. Emitted by Spar. |

### Pagination.Previous {#pagination-previous}

#### Data attributes {#pagination-previous-data-attributes}

| Attribute        | Applied when                                               | Purpose                                               |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| data-slot="root" | Always                                                     | Stable selector for wrapper styling on the root slot. |
| data-disabled    | When there is no page to move to, or the root is disabled. | Mirrors the native `disabled` state. Emitted by Spar. |

### Pagination.Pages {#pagination-pages}

#### Data attributes {#pagination-pages-data-attributes}

| Attribute            | Applied when          | Purpose                                                                                                          |
| -------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| data-slot="root"     | Always                | Stable selector for wrapper styling on the root slot.                                                            |
| data-slot="page"     | On every page button. | Stable selector for a page button. The current one carries `aria-current="page"` (and `data-current`) from Spar. |
| data-slot="ellipsis" | On every gap marker.  | Stable selector for the `aria-hidden` ellipsis.                                                                  |

### Pagination.Next {#pagination-next}

#### Data attributes {#pagination-next-data-attributes}

| Attribute        | Applied when                                               | Purpose                                               |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| data-slot="root" | Always                                                     | Stable selector for wrapper styling on the root slot. |
| data-disabled    | When there is no page to move to, or the root is disabled. | Mirrors the native `disabled` state. Emitted by Spar. |

### Pagination.Last {#pagination-last}

#### Data attributes {#pagination-last-data-attributes}

| Attribute        | Applied when                                               | Purpose                                               |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| data-slot="root" | Always                                                     | Stable selector for wrapper styling on the root slot. |
| data-disabled    | When there is no page to move to, or the root is disabled. | Mirrors the native `disabled` state. Emitted by Spar. |

### Pagination.Actions {#pagination-actions}

#### Data attributes {#pagination-actions-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Pagination.PageSize {#pagination-page-size}

#### Props {#pagination-page-size-props}

| Name      | Type       | Default         | Description                                                       |
| --------- | ---------- | --------------- | ----------------------------------------------------------------- |
| options   | `number[]` | [5, 10, 20, 50] | Page sizes to offer. The active size is added when it is missing. |
| className | `string`   | -               | Appends custom classes to the root slot of this part.             |

#### Data attributes {#pagination-page-size-data-attributes}

| Attribute        | Applied when | Purpose                                               |
| ---------------- | ------------ | ----------------------------------------------------- |
| data-slot="root" | Always       | Stable selector for wrapper styling on the root slot. |

### Pagination.PageJump {#pagination-page-jump}

#### Props {#pagination-page-jump-props}

| Name        | Type      | Default | Description                                                                                                                                      |
| ----------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| applyOnBlur | `boolean` | true    | Whether leaving the input applies the typed page. When `false`, only Enter (or the submit button) applies it and blur restores the current page. |
| className   | `string`  | -       | Appends custom classes to the root slot of this part.                                                                                            |

#### Data attributes {#pagination-page-jump-data-attributes}

| Attribute          | Applied when       | Purpose                                                  |
| ------------------ | ------------------ | -------------------------------------------------------- |
| data-slot="root"   | Always             | Stable selector for wrapper styling on the root slot.    |
| data-slot="submit" | In `default` mode. | The submit button beside the field (a Takeoff `Button`). |

### Type Definitions {#pagination-type-definitions}

| Name                | Definition                                                                                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PaginationType      | `'outlined' \| 'text' \| 'grouped'`                                                                                                                                                                                                                                             |
| PaginationMode      | `'default' \| 'compact'`                                                                                                                                                                                                                                                        |
| PaginationLabels    | `{ landmark: string; pageStatus: string; itemsRange: string; noItems: string; firstPage: string; previousPage: string; nextPage: string; lastPage: string; pageButton: string; currentPageButton: string; rowsPerPage: string; pageJumpInput: string; pageJumpSubmit: string }` |
| PaginationPagesSlot | `'root' \| 'page' \| 'ellipsis'`                                                                                                                                                                                                                                                |
