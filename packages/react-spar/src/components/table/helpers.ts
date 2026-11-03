import { isValidElement, type CSSProperties, type ReactNode } from 'react';
import type { CellContext, Column, ColumnDef, ColumnSizingState, FilterFn, Table as TanStackTable } from '@tanstack/react-table';

import { isDevelopment } from '../../utils';

import type { TableGrowPlan } from './context';
import { DEFAULT_COLUMN_WIDTH, DEFAULT_MIN_COLUMN_WIDTH, UTILITY_COLUMN_WIDTH } from './defaults';
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
export const isEmptyFilterValue = (value: unknown): boolean => value == null || value === '' || (Array.isArray(value) && value.length === 0);

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
    const { id, header, accessor, cell, sortable, filter, sticky, width, resizable, minWidth, maxWidth, align, meta } = col;

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
      // Per-column gate; TanStack ANDs it with the table-level `enableColumnResizing`.
      enableResizing: resizable ?? true,
      meta: {
        align,
        sticky,
        width,
        resizable,
        minWidth,
        maxWidth,
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
    // Only forward explicit bounds: TanStack clamps `getSize()` by them, and
    // defaulting `minSize` here would widen a narrow declared `width` on tables
    // that never resize.
    if (minWidth != null) def.minSize = minWidth;
    // TanStack applies `maxSize` last; keep it from undercutting `minWidth` so
    // the rendered width matches the min-wins range a resize is clamped to.
    if (maxWidth != null) def.maxSize = minWidth != null ? Math.max(minWidth, maxWidth) : maxWidth;

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
 *
 * **Constraint: pinned columns must be contiguous against their edge.** The
 * offset of a left-pinned column is the sum of *all* preceding left-pinned
 * widths — it assumes no unpinned column sits between them. Pinning a
 * non-contiguous set (e.g. columns 1 and 3 left, 2 unpinned) makes the later
 * pinned column overlap the unpinned one it scrolls over. Dev builds warn when
 * this is detected (see {@link warnNonContiguousPinning}); the layout is still
 * computed best-effort.
 */
export const computeStickyLayout = (ordered: OrderedColumn[]): StickyLayout => {
  const layout: StickyLayout = new Map();

  if (isDevelopment()) warnNonContiguousPinning(ordered);

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
 * Dev-only guard: warn when pinned columns are not contiguous against their
 * edge. Left pins must form a prefix of the visual order and right pins a
 * suffix; an unpinned column between two same-edge pins breaks the offset math.
 */
const warnNonContiguousPinning = (ordered: OrderedColumn[]): void => {
  // Left pins must be a contiguous prefix: once a non-left column appears, no
  // later column may be left-pinned.
  let seenNonLeft = false;
  for (const column of ordered) {
    if (column.side === 'left') {
      if (seenNonLeft) return warnPinning('left');
    } else {
      seenNonLeft = true;
    }
  }

  // Right pins must be a contiguous suffix: scanning from the end, once a
  // non-right column appears, no earlier column may be right-pinned.
  let seenNonRight = false;
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    const column = ordered[i];
    if (column?.side === 'right') {
      if (seenNonRight) return warnPinning('right');
    } else {
      seenNonRight = true;
    }
  }
};

const warnPinning = (side: TableStickySide): void => {
  // eslint-disable-next-line no-console
  console.error(
    `[Table] Non-contiguous ${side} column pinning detected. Pinned columns must ` +
      `be contiguous against the ${side} edge (no unpinned column between them); ` +
      'otherwise the sticky offset math overlaps the unpinned column. Move the pinned ' +
      'columns together or unpin the gap.',
  );
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

/**
 * Resolve a cell's explicit width style. A column gets a fixed `width` only when
 * it declares one (`meta.width`), is sticky (pinned columns must be measured
 * for the offset math), or the table is in its user-sized `fixedLayout` (every
 * column then carries its width so `table-layout: fixed` honors it — except the
 * `absorberColumnId` column, which stays auto and takes up the leftover space).
 * Shared by the body and header cell renderers so the two stay in lockstep.
 * Returns `undefined` when the column is auto-width.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const resolveCellWidth = (column: Column<any, unknown>, stickyLayout: StickyLayout, fixedLayout = false, absorberColumnId?: string): CSSProperties | undefined => {
  if (fixedLayout && column.id === absorberColumnId) return undefined;
  const hasWidth = fixedLayout || column.columnDef.meta?.width != null || stickyLayout.has(column.id);
  return hasWidth ? { width: column.getSize() } : undefined;
};

/**
 * The column that absorbs the leftover width of a user-sized table: the last
 * visible column that is not pinned (pinned columns need their width for the
 * offset math). It is never user-resized, so the table's overall width never
 * changes when another column is — the absorber widens or narrows instead.
 * `undefined` when every column is pinned.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAbsorberColumnId = (columns: Column<any, unknown>[]): string | undefined => {
  for (let index = columns.length - 1; index >= 0; index--) {
    const column = columns[index];
    if (column && column.columnDef.meta?.sticky == null) return column.id;
  }
  return undefined;
};

/** The `[min, max]` px range a user resize of this column is clamped to. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getColumnResizeBounds = (column: Column<any, unknown>): [number, number] => {
  const meta = column.columnDef.meta;
  // Without an explicit `minWidth`, a column declared narrower than the default
  // min keeps its own width as the floor, so shrinking it never widens it.
  const min = meta?.minWidth ?? Math.min(DEFAULT_MIN_COLUMN_WIDTH, meta?.width ?? DEFAULT_MIN_COLUMN_WIDTH, meta?.maxWidth ?? DEFAULT_MIN_COLUMN_WIDTH);
  // A `maxWidth` below the effective min would invert the range; the min wins.
  const max = Math.max(min, meta?.maxWidth ?? Number.POSITIVE_INFINITY);
  return [min, max];
};

/** Elements a measuring clone must not load; replaced by same-width stand-ins. */
const PROBE_REPLACED = 'iframe, video, audio, object, embed';

/**
 * The width a column's content wants on one line: the widest `max-content` of
 * its header cell and its rendered body cells, measured on hidden clones next
 * to the table so the size / density styles still apply. `0` when nothing can
 * be measured (no header cell, or a non-layout environment).
 */
export const measureColumnContentWidth = (headerCell: HTMLElement | undefined): number => {
  const headerRow = headerCell?.parentElement as HTMLTableRowElement | null | undefined;
  const tableElement = headerCell?.closest('table');
  const host = tableElement?.parentElement;
  if (!headerCell || !headerRow || !tableElement || !host) return 0;
  const index = (headerCell as HTMLTableCellElement).cellIndex;
  const cells: HTMLElement[] = [headerCell];
  for (const body of Array.from(tableElement.tBodies)) {
    for (const row of Array.from(body.rows)) {
      // Skip rows that don't line up with the header (detail panels, empty / loading rows).
      const cell = row.cells.length === headerRow.cells.length ? row.cells[index] : undefined;
      if (cell) cells.push(cell);
    }
  }
  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;top:0;left:0;visibility:hidden;pointer-events:none;';
  for (const cell of cells) {
    const clone = cell.cloneNode(true) as HTMLElement;
    clone.style.position = 'static';
    clone.style.display = 'block';
    clone.style.width = 'max-content';
    // Connecting a copy must not touch the real content: a named radio would
    // join (and uncheck) the live group, and embedded documents / media would
    // load. Stand-ins of the same width keep the measurement.
    for (const input of Array.from(clone.querySelectorAll('input, select, textarea'))) input.removeAttribute('name');
    const originals = cell.querySelectorAll(PROBE_REPLACED);
    clone.querySelectorAll(PROBE_REPLACED).forEach((element, index) => {
      const standIn = document.createElement('span');
      standIn.style.cssText = `display:inline-block;width:${originals[index]?.getBoundingClientRect().width ?? 0}px;`;
      element.replaceWith(standIn);
    });
    probe.appendChild(clone);
  }
  host.appendChild(probe);
  let width = 0;
  for (const clone of Array.from(probe.children)) width = Math.max(width, clone.getBoundingClientRect().width);
  probe.remove();
  return Math.ceil(width);
};

/** Clamp a resized width into the column's bounds and round it to whole px. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clampColumnWidth = (column: Column<any, unknown>, width: number): number => {
  const [min, max] = getColumnResizeBounds(column);
  return Math.round(Math.min(max, Math.max(min, width)));
};

export interface ResolvedGrowth {
  width: number;
  donors?: ColumnSizingState;
}

/**
 * Grow `startWidth` toward `desired` within `plan`: the absorber's spare width
 * goes first, then each donor's, nearest first. Shrinking is never limited.
 */
export const resolveGrowth = (startWidth: number, desired: number, plan: TableGrowPlan): ResolvedGrowth => {
  if (desired <= startWidth) return { width: desired };
  const budget = plan.donors.reduce((sum, donor) => sum + donor.spare, plan.absorberSpare);
  const width = Math.min(desired, startWidth + budget);
  let remaining = width - startWidth - plan.absorberSpare;
  if (remaining <= 0) return { width };
  const donors: ColumnSizingState = {};
  for (const donor of plan.donors) {
    const take = Math.min(donor.spare, remaining);
    donors[donor.id] = donor.width - take;
    remaining -= take;
    if (remaining <= 0) break;
  }
  return { width, donors };
};
