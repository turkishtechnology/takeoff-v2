import { isValidElement, type CSSProperties, type ReactNode } from 'react';
import type { CellContext, ColumnDef, FilterFn, Table as TanStackTable } from '@tanstack/react-table';

import { isDevelopment } from '../../utils';

import { DEFAULT_COLUMN_WIDTH, UTILITY_COLUMN_WIDTH } from './defaults';
import type { TableColumnDef, TableColumnFilter, TableColumnFilterType, TableStickySide } from './types';

/** Synthetic keys for the manually-rendered leading utility cells. */
export const SELECTION_COLUMN_KEY = '__tk_selection__';
export const EXPAND_COLUMN_KEY = '__tk_expand__';

/**
 * Coerce a bare accessor value into something React can render. Primitives and
 * elements pass through; a plain object/array (e.g. an accessor that returns
 * `{ first, last }` with no `cell` render-prop) would otherwise reach the DOM as
 * the useless `[object Object]` (TanStack's default cell `.toString()`s it). We
 * stringify it as a last-resort fallback and warn in dev so the missing `cell`
 * is obvious.
 */
const toRenderableValue = (value: unknown, columnId: string): ReactNode => {
  if (value == null || typeof value !== 'object' || isValidElement(value)) return value as ReactNode;

  if (isDevelopment()) {
    // eslint-disable-next-line no-console
    console.error(
      `[Table] Column "${columnId}" resolved to a non-renderable object value. ` +
        'Provide a `cell` render-prop (or an accessor that returns a primitive/element) — ' +
        'falling back to JSON.stringify.',
    );
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * Default cell renderer for a column without a consumer `cell`. Overrides
 * TanStack's built-in default (which blindly `.toString()`s the value) so an
 * object/array accessor value degrades to JSON instead of `[object Object]`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultCell = (ctx: CellContext<any, unknown>): ReactNode => toRenderableValue(ctx.getValue(), ctx.column.id);

/** A filter value that should not narrow anything (clears the filter). */
const isEmptyFilterValue = (value: unknown): boolean => value == null || value === '' || (Array.isArray(value) && value.length === 0);

// ── Filter matching predicates ───────────────────────────────────────────────

/** Case-insensitive substring (the `text` preset, and the string-shape default). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const substringFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (isEmptyFilterValue(filterValue)) return true;
  return String(row.getValue(columnId)).toLowerCase().includes(String(filterValue).toLowerCase());
};
substringFilterFn.autoRemove = isEmptyFilterValue;

/** Strict (stringified) equality (the single-choice `select`/`radio` presets). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const equalsFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (isEmptyFilterValue(filterValue)) return true;
  return String(row.getValue(columnId)) === String(filterValue);
};
equalsFilterFn.autoRemove = isEmptyFilterValue;

/** Membership of the selected set (the multi-choice `multi-select`/`checkbox` presets). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const membershipFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  return filterValue.map(String).includes(String(row.getValue(columnId)));
};
membershipFilterFn.autoRemove = value => !Array.isArray(value) || value.length === 0;

/** The matching fn each preset uses (consumers can still override via `filter.filterFn`). */
const PRESET_FILTER_FN: Record<TableColumnFilterType, FilterFn<unknown>> = {
  'text': substringFilterFn,
  'select': equalsFilterFn,
  'radio': equalsFilterFn,
  'multi-select': membershipFilterFn,
  'checkbox': membershipFilterFn,
};

/**
 * Shape-detecting default `filterFn` for a **custom `render`** filter that did
 * not supply its own. Matches on the *value shape* the control writes:
 * `string` → substring, `array` → membership, else strict equality.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (isEmptyFilterValue(filterValue)) return true;
  const cell = row.getValue(columnId);

  if (typeof filterValue === 'string') return String(cell).toLowerCase().includes(filterValue.toLowerCase());
  if (Array.isArray(filterValue)) return filterValue.map(String).includes(String(cell));
  return String(cell) === String(filterValue);
};
defaultFilterFn.autoRemove = isEmptyFilterValue;

/**
 * Normalize the two-tier `filter` config to a single object shape the renderer
 * can consume uniformly: a bare preset string (`'text'`) becomes `{ type }`.
 * An object passes through. Returns `undefined` when no filter is configured.
 */
export const normalizeColumnFilter = <TData>(filter: TableColumnFilterType | TableColumnFilter<TData> | undefined): TableColumnFilter<TData> | undefined => {
  if (filter == null) return undefined;
  return typeof filter === 'string' ? { type: filter } : filter;
};

/** Resolve the matching fn for a normalized filter: explicit > preset > shape-default. */
const resolveFilterFn = <TData>(filter: TableColumnFilter<TData>): FilterFn<unknown> => {
  if (filter.filterFn) return filter.filterFn as FilterFn<unknown>;
  if (filter.render == null && filter.type) return PRESET_FILTER_FN[filter.type];
  return defaultFilterFn;
};

/**
 * Adapt v2-owned {@link TableColumnDef}s into TanStack `ColumnDef`s: thread the
 * accessor (key / dot-path / fn), wire opt-in sorting + filtering, and stash the
 * v2 cell-container knobs (`align`/`sticky`/`width`/`className`) onto
 * `columnDef.meta` for the renderer (RFC §3.2).
 */
export const toTanStackColumns = <TData>(columns: TableColumnDef<TData>[]): ColumnDef<TData>[] =>
  columns.map(col => {
    const { id, header, accessor, cell, sortable, filter, sticky, width, align, meta } = col;

    // Collapse the two-tier filter (string preset | object) to one object shape
    // so the renderer + filterFn resolution never branch on the input form.
    const normalizedFilter = normalizeColumnFilter(filter);

    // Build loosely then cast once: TanStack's `ColumnDef` is a 4-way union
    // (accessorKey vs accessorFn vs display vs group) that resists conditional
    // field assignment. The shape is correct by construction.
    const def: Record<string, unknown> = {
      id,
      header,
      enableSorting: sortable ?? false,
      enableColumnFilter: normalizedFilter != null,
      meta: {
        align,
        sticky,
        width,
        className: meta?.className,
        headerClassName: meta?.headerClassName,
        headerAlign: meta?.headerAlign,
        filter: normalizedFilter,
      },
    };

    // Always set an explicit cell: the consumer's, or our object-safe default.
    // Otherwise TanStack merges its own default cell (a bare `.toString()`),
    // which renders object values as `[object Object]`.
    def.cell = cell ?? defaultCell;
    if (width != null) def.size = width;

    if (typeof accessor === 'function') {
      def.accessorFn = accessor;
    } else if (accessor != null) {
      def.accessorKey = accessor;
    }

    if (normalizedFilter) {
      def.filterFn = resolveFilterFn(normalizedFilter);
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
 * Project the table's current rows to plain value records keyed by column id —
 * the data-only export surface (RFC §5). Formatting and file generation are the
 * consumer's job; Table ships no export engine. Reach it via the `tableRef`
 * instance: `getExportRows(tableRef.current)`.
 *
 * **Scope depends on mode.** In **client** mode this is every filtered + sorted
 * row *across all pages* (pre-pagination), since Table holds the full dataset.
 * In **server (`manual`)** mode Table only ever holds the current page, so the
 * export is limited to the rows currently loaded — fetch the full result set
 * yourself if you need to export beyond the visible page.
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
