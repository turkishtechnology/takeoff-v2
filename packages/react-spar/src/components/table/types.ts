import type { ReactNode, Ref } from 'react';
import type {
  CellContext,
  Column,
  ColumnFiltersState,
  ExpandedState,
  FilterFn,
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
  | 'tableViewport'
  | 'table'
  | 'header'
  | 'headerRow'
  | 'headerCell'
  | 'headerContent'
  | 'sortTrigger'
  | 'sortIcon'
  | 'body'
  | 'row'
  | 'cell'
  | 'selectionCell'
  | 'expandCell'
  | 'expandButton'
  | 'expandedRow'
  | 'filterPanel'
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

/**
 * Context handed to a column's {@link TableColumnFilter.render}. Table owns the
 * filter **plumbing** — the header trigger, the `Popover`, the active-state dot,
 * the TanStack wiring — and inverts control of the panel **content** to the
 * consumer (the same inversion as `cell` and `expansion.render`).
 *
 * `value` is whatever shape the consumer's control writes via `setValue`; Table
 * never interprets it beyond feeding TanStack's filter state and the
 * {@link TableColumnFilter.isActive} predicate.
 */
export interface TableColumnFilterContext<TData = unknown> {
  /** Current filter value for this column (the last `setValue`, or `undefined`). */
  value: unknown;
  /** Write the column's filter value. Pass `undefined` to clear the filter. */
  setValue: (value: unknown) => void;
  /** Convenience for `setValue(undefined)`. */
  clear: () => void;
  /** The TanStack column — escape hatch for faceted values, sizing, etc. */
  column: Column<TData, unknown>;
  /** Close the filter popover (e.g. an apply-and-close button). */
  close: () => void;
}

/**
 * Built-in filter presets — the common cases, declarative and one-line. Table
 * renders the control (with v2 components) and wires the matching:
 *
 * - `text`         → `Input`; case-insensitive substring match.
 * - `select`       → single-choice `Select` dropdown; equality match.
 * - `multi-select` → multi-choice `Select` dropdown; membership match.
 * - `radio`        → inline `Radio` group (single choice); equality match.
 * - `checkbox`     → inline `Checkbox` list (multi choice); membership match.
 *
 * For anything outside this set (range, date, combobox, async options, …) use
 * the {@link TableColumnFilter.render} escape hatch instead.
 */
export type TableColumnFilterType = 'text' | 'select' | 'multi-select' | 'radio' | 'checkbox';

/** Option for the `select` / `multi-select` / `radio` / `checkbox` presets. */
export interface TableColumnFilterOption {
  /** Visible label. */
  label: ReactNode;
  /** Value written to filter state (matched against the stringified cell value). */
  value: string;
}

/**
 * Per-column filter config. **Two tiers** (mirroring Mantine/Material React
 * Table, AG Grid, MUI X — every mature table layers a shorthand under an escape
 * hatch):
 *
 * 1. **Preset** — the 90% case in one line. Pass a {@link TableColumnFilterType}
 *    string (`filter: 'text'`) or this object with `type` (+ `options` for the
 *    choice presets). Table renders the control and picks the matching fn.
 * 2. **Escape hatch** — pass `render` to own the panel content entirely (the
 *    inversion of control used by `cell` / `expansion.render`). `type`/`options`
 *    are ignored when `render` is present.
 *
 * Either way Table keeps owning the surrounding trigger + `Popover` (a real
 * React portal — also the fix for the legacy sticky-cell z-index bug).
 */
export interface TableColumnFilter<TData = unknown> {
  /** Preset control to render. Ignored when {@link render} is supplied. */
  type?: TableColumnFilterType;
  /** Options for the `select` / `multi-select` / `radio` / `checkbox` presets. */
  options?: TableColumnFilterOption[];
  /** Placeholder for the `text` preset's input / `select` triggers. */
  placeholder?: string;
  /**
   * Escape hatch: render the filter control yourself. Receives the column's
   * value + setter (see {@link TableColumnFilterContext}). When present, the
   * preset fields above are ignored.
   */
  render?: (ctx: TableColumnFilterContext<TData>) => ReactNode;
  /**
   * Whether a given filter value counts as "active" — drives the trigger's
   * active indicator. Defaults to a sensible heuristic (non-empty string,
   * non-empty array, or any non-nullish value); presets set this for you.
   */
  isActive?: (value: unknown) => boolean;
  /**
   * Row-matching predicate (client mode). Presets supply their own; for a
   * custom `render` you can pass one here, else Table defaults by value shape:
   * `string` → substring, `array` → membership, else strict equality. Ignored
   * in `manual` mode, where the server matches. Signature is TanStack's
   * `FilterFn`, so any built-in name or fn works.
   */
  filterFn?: FilterFn<TData>;
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
  /**
   * Attach a header filter. A preset string (`'text'`), a preset object
   * (`{ type: 'select', options }`), or a custom `{ render }`. See
   * {@link TableColumnFilter}.
   */
  filter?: TableColumnFilterType | TableColumnFilter<TData>;
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
  /**
   * Detail-panel renderer for an expanded row. Optional: when omitted, the
   * Table is in **tree mode** — pair `expansion` with the top-level
   * {@link TableProps.getSubRows} so expanding a row reveals its (flattened)
   * sub-rows instead of a detail panel.
   *
   * `render` and `getSubRows` are mutually exclusive expansion shapes. Supplying
   * both would draw the sub-rows *and* a detail panel for the same row, so when
   * `getSubRows` is present the detail panel is suppressed (tree mode wins).
   */
  render?: (row: TData) => ReactNode;
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
   * Sub-row reader for **tree data** (feeds TanStack `getSubRows`). Pair it with
   * `expansion` (sans `render`) so expanding a row reveals its flattened
   * sub-rows. When `getSubRows` is omitted, expansion falls back to the
   * detail-panel mode driven by `expansion.render`. Supplying both keeps tree
   * mode and suppresses the detail panel.
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
    filter?: TableColumnFilterType | TableColumnFilter<TData>;
  }
}
