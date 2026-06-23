import type { ReactNode, Ref } from 'react';
import type {
  CellContext,
  ColumnFiltersState,
  ExpandedState,
  HeaderContext,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table as TanStackTable,
} from '@tanstack/react-table';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/**
 * Table is the catalog's first **TanStack-backed** component — its state core
 * is `@tanstack/react-table`, not a Spar primitive. Consequently these public
 * types are **v2-owned** (built on TanStack's generics) and carry no
 * `Pick<SparTableProps, …>` boundary: there is no `SparTable` to pick from, so
 * the `check-spar-pick.mjs` guard does not apply. See
 * `docs/rfc-table-component.md` §3.2 and §9.
 */

/** Density scale → `data-size`. */
export type TableSize = 'xsmall' | 'small' | 'base';

/** Horizontal cell content alignment → `data-align`. */
export type TableAlign = 'start' | 'center' | 'end';

/** Pins a column to a table edge → `data-sticky`. */
export type TableStickySide = 'left' | 'right';

/**
 * Slot vocabulary for `classNames` / `slotProps`. Table is props-first with a
 * single public component, so every anatomy node is reached through these
 * slot keys rather than a public compound part (RFC §3.1, Tier 1.5).
 */
export type TableSlot =
  | 'root'
  | 'table'
  | 'header'
  | 'headerRow'
  | 'headerCell'
  | 'sortTrigger'
  | 'sortIcon'
  | 'body'
  | 'row'
  | 'cell'
  | 'selectionCell'
  | 'expandCell'
  | 'expandButton'
  | 'expandedRow'
  | 'filterInput'
  | 'filterOption'
  | 'pagination'
  | 'empty'
  | 'loading';

/**
 * How a column reads its value out of a row:
 *
 * - `keyof TData` — a top-level property key.
 * - `string` — a dot-path into nested data (`'user.role'`), resolved by
 *   TanStack's `accessorKey`.
 * - `(row) => unknown` — an arbitrary projection.
 */
export type TableColumnAccessor<TData> = keyof TData | (string & {}) | ((row: TData) => unknown);

/** Per-column filter UI (Phase 1: text / checkbox / radio — RFC §7 Q3). */
export type TableColumnFilterType = 'text' | 'checkbox' | 'radio';

export interface TableColumnFilterOption {
  /** Visible label for the option. */
  label: ReactNode;
  /** Value matched against the (stringified) cell value. */
  value: string;
}

export interface TableColumnFilter {
  /** Filter control rendered inside the header filter `Popover`. */
  type: TableColumnFilterType;
  /** Options for `checkbox` / `radio` filters. Ignored for `text`. */
  options?: TableColumnFilterOption[];
  /** Placeholder for the `text` filter input. */
  placeholder?: string;
}

/**
 * Open-ended, low-frequency per-column config. Frequently-used closed-set
 * knobs (`align`, `sticky`, `width`) live top-level on {@link TableColumnDef};
 * everything else flows through here so the public column def stays lean
 * (RFC §3.2). Bound to TanStack's `columnDef.meta` via declaration merging
 * below.
 */
export interface TableColumnMeta {
  /** Extra class on the body cell (`<td>`) owner node. */
  className?: string;
  /** Extra class on the header cell (`<th>`) owner node. */
  headerClassName?: string;
  /** Alignment override scoped to the header cell only. */
  headerAlign?: TableAlign;
}

/**
 * A v2-owned column definition. Internally adapted to TanStack's `ColumnDef`
 * (RFC §3.2): `cell`/`header` are React render-props (never HTML strings),
 * `accessor` covers key / dot-path / function, and `meta` is the escape hatch
 * for the cell **container**.
 */
export interface TableColumnDef<TData> {
  /** Stable column identity. Required — also keys sort/filter state. */
  id: string;
  /** Header content: a node, or a render-prop receiving TanStack's context. */
  header: ReactNode | ((ctx: HeaderContext<TData, unknown>) => ReactNode);
  /** How the cell value is read. See {@link TableColumnAccessor}. */
  accessor?: TableColumnAccessor<TData>;
  /**
   * Cell **content** render-prop. Returns a `ReactNode` — React reconciles it,
   * so there is no `innerHTML`, no cache to invalidate (RFC §3.4). The cell
   * **container** (`<td>`, padding, align, sticky, a11y) is owned by Table.
   */
  cell?: (ctx: CellContext<TData, unknown>) => ReactNode;
  /** Opt this column into sorting (emits `aria-sort` + header keyboard). */
  sortable?: boolean;
  /** Attach a header filter control. See {@link TableColumnFilter}. */
  filter?: TableColumnFilter;
  /** Pin the column to an edge. */
  sticky?: TableStickySide;
  /** Fixed column width (px). Feeds sticky-offset math and `col` sizing. */
  width?: number;
  /** Cell content alignment. */
  align?: TableAlign;
  /** Cell-container escape hatch → TanStack `columnDef.meta`. */
  meta?: TableColumnMeta;
}

/** Controlled/uncontrolled triple shared by the stateful feature configs. */
export interface ControlledState<T> {
  /** Controlled value. Pair with `onChange`. */
  value?: T;
  /** Uncontrolled initial value. */
  defaultValue?: T;
  /** Fires on every committed change to this slice. */
  onChange?: (value: T) => void;
}

export interface TableSortingConfig extends ControlledState<SortingState> {
  /** Allow stacking multiple sort columns (shift-click). @defaultValue false */
  multi?: boolean;
}

export type TableFilteringConfig = ControlledState<ColumnFiltersState>;

export interface TableSelectionConfig extends ControlledState<RowSelectionState> {
  /** `single` renders radios + caps selection at one row; `multiple` renders checkboxes + a select-all header. */
  mode: 'single' | 'multiple';
}

export interface TableExpansionConfig<TData> extends ControlledState<ExpandedState> {
  /** Renders the disclosure content for an expanded row. */
  render: (row: TData) => ReactNode;
}

export interface TablePaginationConfig {
  /** Rows per page. @defaultValue 10 */
  pageSize?: number;
  /** Controlled current page (server mode). */
  pageIndex?: number;
  /** Page-size options for the Select. @defaultValue [10, 25, 50, 100] */
  pageSizeOptions?: number[];
  /** Total row count across all pages — required in `manual` (server) mode. */
  rowCount?: number;
  /** Fires when page index or size changes. */
  onChange?: (pagination: PaginationState) => void;
}

/**
 * Bundled server data-request snapshot. Emitted from a single `onDataRequest`
 * callback derived from the granular state slices, never a firehose
 * `onStateChange` (RFC §3.3).
 */
export interface TableDataRequest {
  pagination: PaginationState;
  sorting: SortingState;
  filters: ColumnFiltersState;
}

/**
 * Public props for `Table`. Props-first (RFC §3.1, Tier 1): a common table is
 * a single `<Table data columns getRowId />` call. `getRowId` is **mandatory**
 * — the single identity source TanStack's `RowSelectionState` keys on (RFC §2.3).
 *
 * `TData` defaults to `any` only so the non-generic `TableProps` alias resolves
 * for the base/theme registry; real call sites infer `TData` from `data`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TableProps<TData = any> {
  /** Row data. In `manual` mode this is the current server page. */
  data: TData[];
  /** Column definitions. See {@link TableColumnDef}. */
  columns: TableColumnDef<TData>[];
  /** Stable row identity (single source of truth). */
  getRowId: (row: TData, index: number) => string;
  /**
   * Density scale.
   * @defaultValue 'base'
   */
  size?: TableSize;
  /**
   * Zebra-stripe rows → `data-striped`.
   * @defaultValue false
   */
  striped?: boolean;
  /**
   * Cell borders → `data-bordered`.
   * @defaultValue false
   */
  bordered?: boolean;
  /**
   * Pin the header row during vertical scroll → `data-sticky-header`.
   * @defaultValue false
   */
  stickyHeader?: boolean;
  /**
   * Server mode. When `true`, Table processes nothing in-memory — it maps to
   * TanStack's `manualSorting`/`manualFiltering`/`manualPagination` and emits a
   * single bundled `onDataRequest` (RFC §3.3).
   * @defaultValue false
   */
  manual?: boolean;
  /** Row selection (single/multiple + select-all). Composes Spar Checkbox/Radio. */
  selection?: TableSelectionConfig;
  /** Sorting (multi-sort opt-in). */
  sorting?: TableSortingConfig;
  /** Column filtering. Filter UIs render in a Spar `Popover`. */
  filtering?: TableFilteringConfig;
  /** Expandable rows with a render-prop body. */
  expansion?: TableExpansionConfig<TData>;
  /** Pagination. `true` enables it with defaults; an object configures it. */
  pagination?: TablePaginationConfig | boolean;
  /** Bundled server data-request callback (`manual` mode). See {@link TableDataRequest}. */
  onDataRequest?: (request: TableDataRequest) => void;
  /**
   * Loading state → `data-loading` + a loading overlay.
   * @defaultValue false
   */
  loading?: boolean;
  /** Content rendered when there are no rows. */
  emptyState?: ReactNode;
  /**
   * Optional sub-row reader for tree data (feeds TanStack `getSubRows`). When
   * omitted, expansion is driven purely by `expansion.render`.
   */
  getSubRows?: (row: TData) => TData[] | undefined;
  /**
   * Escape hatch for the rare imperative need — receives the TanStack table
   * instance (RFC §2.3: controlled props + an optional instance ref, never an
   * imperative `@Method` surface). Also the access point for `getExportRows()`.
   */
  tableRef?: Ref<TanStackTable<TData> | null>;
  /** Extra class on the root scroll container. */
  className?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TableSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TableSlot>;
  /** Ref to the root scroll container. */
  ref?: Ref<HTMLDivElement>;
}

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Table: import('../../core').ComponentThemeConfig<TableProps, TableSlot>;
  }
}

// Type the v2-owned column knobs onto TanStack's `columnDef.meta` so
// `column.columnDef.meta?.…` stays type-safe inside the renderer (RFC §3.2,
// the declaration-merging pattern).
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends import('@tanstack/react-table').RowData, TValue> {
    align?: TableAlign;
    sticky?: TableStickySide;
    width?: number;
    className?: string;
    headerClassName?: string;
    headerAlign?: TableAlign;
    filter?: TableColumnFilter;
  }
}
