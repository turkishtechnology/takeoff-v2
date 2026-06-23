import type { CSSProperties, ReactNode } from 'react';
import type { ColumnDef, FilterFn, Table as TanStackTable } from '@tanstack/react-table';

import { DEFAULT_COLUMN_WIDTH, UTILITY_COLUMN_WIDTH } from './defaults';
import type { TableColumnDef, TableStickySide } from './types';

/** Synthetic keys for the manually-rendered leading utility cells. */
export const SELECTION_COLUMN_KEY = '__tk_selection__';
export const EXPAND_COLUMN_KEY = '__tk_expand__';

/**
 * `checkbox` faceted filter: keep a row when its (stringified) cell value is in
 * the selected set. An empty/absent selection matches everything.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkboxFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return filterValue.map(String).includes(String(row.getValue(columnId)));
};
checkboxFilterFn.autoRemove = value => !Array.isArray(value) || value.length === 0;

/** `radio` single-choice filter: exact (stringified) equality. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const radioFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (filterValue == null || filterValue === '') return true;
  return String(row.getValue(columnId)) === String(filterValue);
};
radioFilterFn.autoRemove = value => value == null || value === '';

/**
 * Adapt v2-owned {@link TableColumnDef}s into TanStack `ColumnDef`s: thread the
 * accessor (key / dot-path / fn), wire opt-in sorting + filtering, and stash the
 * v2 cell-container knobs (`align`/`sticky`/`width`/`className`) onto
 * `columnDef.meta` for the renderer (RFC §3.2).
 */
export const toTanStackColumns = <TData>(columns: TableColumnDef<TData>[]): ColumnDef<TData>[] =>
  columns.map(col => {
    const { id, header, accessor, cell, sortable, filter, sticky, width, align, meta } = col;

    // Build loosely then cast once: TanStack's `ColumnDef` is a 4-way union
    // (accessorKey vs accessorFn vs display vs group) that resists conditional
    // field assignment. The shape is correct by construction.
    const def: Record<string, unknown> = {
      id,
      header,
      enableSorting: sortable ?? false,
      enableColumnFilter: filter != null,
      meta: {
        align,
        sticky,
        width,
        className: meta?.className,
        headerClassName: meta?.headerClassName,
        headerAlign: meta?.headerAlign,
        filter,
      },
    };

    if (cell) def.cell = cell;
    if (width != null) def.size = width;

    if (typeof accessor === 'function') {
      def.accessorFn = accessor;
    } else if (accessor != null) {
      def.accessorKey = accessor;
    }

    if (filter) {
      def.filterFn = filter.type === 'text' ? 'includesString' : filter.type === 'checkbox' ? checkboxFilterFn : radioFilterFn;
    }

    return def as unknown as ColumnDef<TData>;
  });

export interface OrderedColumn {
  key: string;
  side?: TableStickySide;
  width: number;
}

export interface StickyColumnPlacement {
  side: TableStickySide;
  /** Distance in px from the pinned edge. */
  offset: number;
}

/** Resolved sticky placement per column key (only sticky columns are present). */
export type StickyLayout = Map<string, StickyColumnPlacement>;

/**
 * Compute each sticky column's edge offset. Left-pinned columns accumulate the
 * widths of preceding left-pinned columns; right-pinned columns accumulate the
 * widths of following right-pinned columns. The offset/z-index math owner is
 * the scroll-container part, per RFC §6.5 ("Zorunlu styling-contract uyarısı").
 */
export const computeStickyLayout = (ordered: OrderedColumn[]): StickyLayout => {
  const layout: StickyLayout = new Map();

  let leftOffset = 0;
  for (const column of ordered) {
    if (column.side === 'left') {
      layout.set(column.key, { side: 'left', offset: leftOffset });
      leftOffset += column.width;
    }
  }

  let rightOffset = 0;
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    const column = ordered[i];
    if (column?.side === 'right') {
      layout.set(column.key, { side: 'right', offset: rightOffset });
      rightOffset += column.width;
    }
  }

  return layout;
};

/**
 * Build the ordered visual-column descriptor list (leading utility cells, then
 * data columns) that feeds {@link computeStickyLayout}. Utility cells inherit
 * left-pinning only when at least one data column is left-pinned, so the pinned
 * group stays contiguous against the left edge.
 */
export const buildOrderedColumns = <TData>(table: TanStackTable<TData>, options: { hasSelection: boolean; hasExpansion: boolean }): OrderedColumn[] => {
  const leaf = table.getVisibleLeafColumns();
  const hasLeftPinned = leaf.some(column => column.columnDef.meta?.sticky === 'left');
  const utilitySide: TableStickySide | undefined = hasLeftPinned ? 'left' : undefined;

  // Visual order is selection → expand → data; the layout and every render
  // part follow this ordering.
  const ordered: OrderedColumn[] = [];
  if (options.hasSelection) ordered.push({ key: SELECTION_COLUMN_KEY, side: utilitySide, width: UTILITY_COLUMN_WIDTH });
  if (options.hasExpansion) ordered.push({ key: EXPAND_COLUMN_KEY, side: utilitySide, width: UTILITY_COLUMN_WIDTH });

  for (const column of leaf) {
    ordered.push({
      key: column.id,
      side: column.columnDef.meta?.sticky,
      width: column.getSize() || DEFAULT_COLUMN_WIDTH,
    });
  }

  return ordered;
};

/**
 * Project the **current filtered + sorted** rows (pre-pagination) to plain
 * value records keyed by column id — the data-only export surface (RFC §5).
 * Formatting and file generation are the consumer's job; Table ships no export
 * engine. Reach it via the `tableRef` instance:
 * `getExportRows(tableRef.current)`.
 */
export const getExportRows = <TData>(table: TanStackTable<TData> | null | undefined): Record<string, unknown>[] => {
  if (!table) return [];
  const columns = table.getAllLeafColumns();
  return table.getSortedRowModel().rows.map(row => {
    const record: Record<string, unknown> = {};
    for (const column of columns) {
      if (column.accessorFn || (column.columnDef as { accessorKey?: unknown }).accessorKey != null) {
        record[column.id] = row.getValue(column.id);
      }
    }
    return record;
  });
};

/** Resolve a header cell's content for rendering when it is a plain node. */
export const isRenderFn = (value: unknown): value is (...args: unknown[]) => ReactNode => typeof value === 'function';

export interface StickyCellResult {
  style?: CSSProperties;
  dataSticky?: TableStickySide;
}

/**
 * Resolve the inline positioning for one cell. The 3-layer z-index order (body
 * sticky-column < sticky header < top-left corner) and the per-edge offset are
 * owned here, per the styling-contract requirement in RFC §6.5. Opaque
 * backgrounds + the `border-collapse: separate` border workaround are recipe
 * concerns downstream (this package ships no CSS), keyed off `data-sticky` /
 * `data-sticky-header`.
 */
export const resolveStickyCell = (layout: StickyLayout, key: string, options: { isHeader: boolean; stickyHeader: boolean }): StickyCellResult => {
  const placement = layout.get(key);
  const isStickyColumn = !!placement;
  const stickyHeaderActive = options.isHeader && options.stickyHeader;

  if (!isStickyColumn && !stickyHeaderActive) return {};

  // Built as a plain record then cast: assigning to `CSSProperties` keys
  // directly trips the dts-rollup type worker on some `csstype` resolutions.
  const style: Record<string, string | number> = { position: 'sticky' };
  if (placement) {
    if (placement.side === 'left') style.left = placement.offset;
    else style.right = placement.offset;
  }
  if (stickyHeaderActive) style.top = 0;
  style.zIndex = isStickyColumn && stickyHeaderActive ? 3 : stickyHeaderActive ? 2 : 1;

  return { style: style as CSSProperties, dataSticky: placement?.side };
};
