import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type UIEventHandler } from 'react';
import {
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnFiltersState,
  type ColumnSizingState,
  type ExpandedState,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';
import { Spinner } from '../spinner';

import { TableBase } from './base';
import { TableProvider, type SlotAttrs, type TableColumnResizingContext, type TableContextValue, type TableLiveDraft, type TableResizeDraft } from './context';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_SIZE, UTILITY_COLUMN_WIDTH } from './defaults';
import {
  buildOrderedColumns,
  clampColumnWidth,
  computeStickyLayout,
  createTableStore,
  createWidthObserver,
  getAbsorberColumnId,
  getColumnResizeBounds,
  getColumnRoom,
  getDraftWidth,
  measureColumnContentWidth,
  resolveGrowth,
  toTanStackColumns,
  type TableStore,
} from './helpers';
import { TableBody } from './TableBody';
import { TableHeader } from './TableHeader';
import { TablePagination } from './TablePagination';
import type { TableProps } from './types';

const subscribeNothing = () => () => {};

/**
 * The `<table>` element. Its min-width (and width in `expand` mode) follows
 * the live draft of a drag, so a pointer move re-renders this element and the
 * affected header cells only: `children` keeps its identity, so React skips
 * the header and body.
 */
const TableGrid = ({
  attrs,
  minWidth,
  expandMode,
  liveDraft,
  busy,
  children,
}: {
  attrs: SlotAttrs;
  minWidth: number | undefined;
  expandMode: boolean;
  liveDraft: TableStore<TableLiveDraft | null> | undefined;
  busy: boolean;
  children: ReactNode;
}) => {
  const liveMinWidth = useSyncExternalStore(liveDraft?.subscribe ?? subscribeNothing, () => liveDraft?.get()?.minWidth);
  const width = liveMinWidth ?? minWidth;
  const style: CSSProperties | undefined = width != null ? { ...attrs.style, minWidth: width, ...(expandMode ? { width } : undefined) } : attrs.style;
  return (
    <table {...attrs} style={style} aria-busy={busy || undefined}>
      {children}
    </table>
  );
};

// Stable empty defaults so uncontrolled state values keep a constant identity
// across renders (the `onDataRequest` effect keys on reference equality).
const EMPTY_SORTING: SortingState = [];
const EMPTY_FILTERS: ColumnFiltersState = [];
const EMPTY_SELECTION: RowSelectionState = {};
const EMPTY_EXPANDED: ExpandedState = {};
const EMPTY_SIZING: ColumnSizingState = {};

export const Table = <TData,>(props: TableProps<TData>) => {
  const theme = useComponentTheme('Table');

  const { rootAttrs, rest } = composeRootAttrs(TableBase, props as TableProps, theme, {
    // Visual vocabulary lives on the root so recipes cascade
    // to the portal-free table descendants. `data-loading` mirrors the
    // boolean-presence convention (rule 5).
    stateAttrs: ({ size = DEFAULT_SIZE, striped, bordered, stickyHeader, loading }) => ({
      'data-size': size,
      'data-striped': striped ? '' : undefined,
      'data-bordered': bordered ? '' : undefined,
      'data-sticky-header': stickyHeader ? '' : undefined,
      'data-loading': loading ? '' : undefined,
    }),
  });

  const {
    data,
    columns,
    getRowId,
    manual = false,
    loading = false,
    size = DEFAULT_SIZE,
    striped = false,
    bordered = false,
    stickyHeader = false,
    selection,
    sorting: sortingConfig,
    filtering,
    expansion,
    pagination,
    columnResizing,
    onDataRequest,
    emptyState,
    getSubRows,
    tableRef,
    ref,
  } = rest;

  // `classNames` / `slotProps` are stripped from `rest` by `composeRootAttrs`,
  // so read them off the original props for the slot composer below.
  const { classNames, slotProps } = props;

  const tanstackColumns = useMemo(() => toTanStackColumns(columns), [columns]);

  // ── Feature flags ────────────────────────────────────────────────────────
  const hasSelection = !!selection;
  const selectionMode = selection?.mode;
  const hasExpansion = !!expansion;
  // Tree mode (sub-rows) vs detail-panel mode (`expansion.render`) are exclusive
  // expansion shapes; sub-rows win so a row never renders both at once.
  const treeMode = !!getSubRows;
  const hasColumnFilters = !!filtering || columns.some(column => !!column.filter);
  const hasSortableColumn = columns.some(column => !!column.sortable);
  const paginationConfig = typeof pagination === 'object' ? pagination : undefined;
  const paginationEnabled = pagination === true || !!paginationConfig;
  const pageSizeOptions = paginationConfig?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
  const [tableViewportScrolled, setTableViewportScrolled] = useState(false);
  const resizingConfig = typeof columnResizing === 'object' ? columnResizing : undefined;
  const resizingEnabled = columnResizing === true || !!resizingConfig;
  const resizeMode = resizingConfig?.mode ?? 'fit';
  // `expand`: no column takes up the slack; the table is as wide as its
  // columns and its container scrolls once they need more.
  const expandMode = resizeMode === 'expand';

  // ── Controlled/uncontrolled state slices ─────────────────────────────────
  const [sortingState, setSorting] = useControllableState<SortingState>(sortingConfig?.value, sortingConfig?.defaultValue ?? EMPTY_SORTING, sortingConfig?.onChange);
  const [filtersState, setFilters] = useControllableState<ColumnFiltersState>(filtering?.value, filtering?.defaultValue ?? EMPTY_FILTERS, filtering?.onChange);
  const [selectionState, setSelection] = useControllableState<RowSelectionState>(selection?.value, selection?.defaultValue ?? EMPTY_SELECTION, selection?.onChange);
  const [expandedState, setExpanded] = useControllableState<ExpandedState>(expansion?.value, expansion?.defaultValue ?? EMPTY_EXPANDED, expansion?.onChange);
  const [sizingState, setSizing] = useControllableState<ColumnSizingState>(resizingConfig?.value, resizingConfig?.defaultValue ?? EMPTY_SIZING, resizingConfig?.onChange);
  // A pointer drag renders its live width from this draft and commits once on
  // release, so `onChange` fires per resize rather than per pointer move — and a
  // controlled consumer still sees the column follow the pointer.
  const [resizeDraft, setResizeDraft] = useState<TableResizeDraft | null>(null);
  // Widths held for columns that stopped being the absorber (a column was
  // added after it, or shown again) without a stored width of their own: they
  // keep the width they had instead of jumping to their `getSize()` default.
  // Every commit carries them, so a held id lets go once it is stored; an
  // empty stored sizing (back to the natural layout) lets them all go.
  const [heldSizing, setHeldSizing] = useState<ColumnSizingState>(EMPTY_SIZING);

  // Read the `{ pageIndex, pageSize }` slice off the config with defaults. Same
  // shape for the initial (mount-snapshot) and controlled (per-render) values
  // below; only their memo dependencies differ.
  const readPaginationSlice = (): PaginationState => ({ pageIndex: paginationConfig?.pageIndex ?? 0, pageSize: paginationConfig?.pageSize ?? DEFAULT_PAGE_SIZE });

  // Initial value only (empty deps): subsequent page changes flow through state.
  const initialPagination = useMemo<PaginationState>(readPaginationSlice, []);
  // In server (`manual`) mode the consumer owns pagination, so the slice is
  // controlled and read from props every render (defaulting `pageIndex` to 0
  // until supplied). This avoids the first-render controlled/uncontrolled latch
  // that would otherwise drop a `pageIndex` initialized asynchronously after the
  // first fetch resolves. Client mode stays uncontrolled.
  const paginationControlled = manual && !!paginationConfig;
  const controlledPagination = useMemo<PaginationState | undefined>(
    () => (paginationControlled ? readPaginationSlice() : undefined),
    [paginationControlled, paginationConfig?.pageIndex, paginationConfig?.pageSize],
  );
  const [paginationStateRaw, setPagination] = useControllableState<PaginationState>(controlledPagination, initialPagination, paginationConfig?.onChange);

  const sorting = sortingState ?? EMPTY_SORTING;
  const columnFilters = filtersState ?? EMPTY_FILTERS;
  const rowSelection = selectionState ?? EMPTY_SELECTION;
  const expanded = expandedState ?? EMPTY_EXPANDED;
  const paginationValue = paginationStateRaw ?? initialPagination;
  const committedSizing = (resizingEnabled ? sizingState : undefined) ?? EMPTY_SIZING;
  const heldWidths = useMemo<ColumnSizingState>(() => {
    const ids = Object.keys(heldSizing).filter(id => committedSizing[id] == null);
    if (ids.length === 0 || Object.keys(committedSizing).length === 0) return EMPTY_SIZING;
    return Object.fromEntries(ids.map(id => [id, heldSizing[id] as number]));
  }, [heldSizing, committedSizing]);
  const columnSizing = useMemo<ColumnSizingState>(
    () =>
      resizeDraft
        ? { ...resizeDraft.base, ...resizeDraft.donors, [resizeDraft.columnId]: resizeDraft.width }
        : heldWidths === EMPTY_SIZING
          ? committedSizing
          : { ...heldWidths, ...committedSizing },
    [resizeDraft, committedSizing, heldWidths],
  );

  // Narrowing a sort/filter can shrink the result below the current page. In
  // client mode TanStack's `autoResetPageIndex` snaps back to page 0 for us; in
  // server (`manual`) mode that reset is off (we don't own the row model), so we
  // reset here — otherwise the next `onDataRequest` fetches an out-of-range,
  // empty page (e.g. filtering while on page 5).
  const resetPageOnManual = () => {
    if (manual && paginationValue.pageIndex !== 0) setPagination({ ...paginationValue, pageIndex: 0 });
  };

  const onSortingChange: OnChangeFn<SortingState> = updater => {
    setSorting(functionalUpdate(updater, sorting));
    resetPageOnManual();
  };
  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = updater => {
    setFilters(functionalUpdate(updater, columnFilters));
    resetPageOnManual();
  };
  const onRowSelectionChange: OnChangeFn<RowSelectionState> = updater => setSelection(functionalUpdate(updater, rowSelection));
  const onExpandedChange: OnChangeFn<ExpandedState> = updater => setExpanded(functionalUpdate(updater, expanded));
  const onPaginationChange: OnChangeFn<PaginationState> = updater => setPagination(functionalUpdate(updater, paginationValue));
  // Only reached through the `tableRef` instance (`setColumnSizing` /
  // `resetColumnSizing`); the built-in handles commit via `columnResizing` below.
  const onColumnSizingChange: OnChangeFn<ColumnSizingState> = updater => {
    if (resizingEnabled) setSizing(functionalUpdate(updater, committedSizing));
  };

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    getRowId: (row, index) => getRowId(row, index),
    state: {
      sorting,
      columnFilters,
      rowSelection,
      expanded,
      pagination: paginationValue,
      columnSizing,
    },
    onSortingChange,
    onColumnFiltersChange,
    onRowSelectionChange,
    onExpandedChange,
    onPaginationChange,
    onColumnSizingChange,
    // The resize handles are v2-owned (pointer capture, keyboard, measured
    // start widths), so TanStack's own `getResizeHandler` is never used — this
    // flag only feeds `column.getCanResize()`.
    enableColumnResizing: resizingEnabled,
    // Table-level sort switch. Per-column `sortable` is the real gate
    // (`column.getCanSort()` ANDs both), so a `sorting` config without any
    // `sortable` column makes no header interactive — keying off the columns
    // alone is sufficient and avoids implying otherwise.
    enableSorting: hasSortableColumn,
    enableMultiSort: sortingConfig?.multi ?? false,
    enableRowSelection: hasSelection,
    enableMultiRowSelection: selectionMode === 'multiple',
    enableColumnFilters: hasColumnFilters,
    manualSorting: manual,
    manualFiltering: manual,
    manualPagination: manual,
    autoResetPageIndex: !manual,
    rowCount: manual ? paginationConfig?.rowCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manual ? undefined : getSortedRowModel(),
    getFilteredRowModel: manual ? undefined : getFilteredRowModel(),
    getExpandedRowModel: hasExpansion ? getExpandedRowModel() : undefined,
    getPaginationRowModel: paginationEnabled && !manual ? getPaginationRowModel() : undefined,
    getSubRows,
    getRowCanExpand: hasExpansion && !getSubRows ? () => true : undefined,
  });

  // Optional imperative escape hatch — hand the consumer the live instance for
  // rare needs and `getExportRows()` (RFC §2.3, §5). No `@Method` surface.
  useEffect(() => {
    if (!tableRef) return;
    if (typeof tableRef === 'function') tableRef(table);
    else tableRef.current = table;
    return () => {
      if (typeof tableRef === 'function') tableRef(null);
      else tableRef.current = null;
    };
  }, [tableRef, table]);

  // Hold the latest `onDataRequest` in a ref so the request effect can key only
  // on the actual state slices. The RFC's canonical server example passes an
  // inline arrow (§3.3); keeping the callback in the effect deps would re-fire
  // on every parent render and self-sustain a refetch loop.
  const onDataRequestRef = useRef(onDataRequest);
  onDataRequestRef.current = onDataRequest;

  // Key the request effect on a serialized snapshot of the slices, not their
  // reference identity. `paginationValue` keeps a stable identity, but a
  // *controlled* `sorting`/`filtering` consumer that passes a fresh array each
  // render (the common case) would otherwise hand the effect a new dependency
  // every render and self-sustain an infinite refetch loop. Serializing makes
  // the effect fire once per real *value* change, no stable-reference
  // requirement pushed onto the consumer.
  const dataRequestKey = useMemo(() => JSON.stringify({ pagination: paginationValue, sorting, filters: columnFilters }), [paginationValue, sorting, columnFilters]);

  // Server mode: emit one bundled data request derived from the granular state
  // slices (RFC §3.3). Debounce is the consumer's call (RFC §7 Q2). Fires once
  // per real pagination/sorting/filter change, regardless of callback identity.
  // `dataRequestKey` encodes the slice values; the slices themselves are read
  // fresh inside but intentionally excluded from deps to avoid reference churn.
  useEffect(() => {
    if (!manual) return;
    onDataRequestRef.current?.({ pagination: paginationValue, sorting, filters: columnFilters });
  }, [manual, dataRequestKey]);

  // Client mode: let a changed `pageSize` prop drive the (uncontrolled) table.
  // The equality guard prevents clobbering a size the user picked via the
  // built-in page-size Select on unrelated re-renders.
  useEffect(() => {
    if (paginationControlled || paginationConfig?.pageSize == null) return;
    if (table.getState().pagination.pageSize === paginationConfig.pageSize) return;
    table.setPageSize(paginationConfig.pageSize);
  }, [paginationControlled, paginationConfig?.pageSize, table]);

  // Client mode: same treatment for `pageIndex` — a changed prop jumps the
  // (uncontrolled) table to that page. Symmetric with `pageSize` above; the
  // equality guard keeps the consumer's own page navigation from being reset on
  // unrelated re-renders.
  useEffect(() => {
    if (paginationControlled || paginationConfig?.pageIndex == null) return;
    if (table.getState().pagination.pageIndex === paginationConfig.pageIndex) return;
    table.setPageIndex(paginationConfig.pageIndex);
  }, [paginationControlled, paginationConfig?.pageIndex, table]);

  const slotAttrs = useCallback(
    (slot: Parameters<TableContextValue['slotAttrs']>[0], attrs?: { className?: string }): SlotAttrs =>
      buildSlotAttrs(TableBase.getSlotProps(slot, attrs), slot, {
        themeSlotProps: theme?.slotProps,
        themeClassNames: theme?.classNames,
        themeClassName: theme?.className,
        instanceSlotProps: slotProps,
        instanceClassNames: classNames,
      }) as SlotAttrs,
    [theme, slotProps, classNames],
  );

  // `table` keeps one identity for its lifetime, so the inputs that change a
  // column's size (`columnSizing`) are listed explicitly.
  const stickyLayout = useMemo(
    () => computeStickyLayout(buildOrderedColumns(table, { hasSelection, hasExpansion })),
    [table, tanstackColumns, hasSelection, hasExpansion, columnSizing],
  );

  const totalColumnCount = tanstackColumns.length + (hasSelection ? 1 : 0) + (hasExpansion ? 1 : 0);

  const visibleColumns = table.getVisibleLeafColumns();
  const absorberColumnId = resizingEnabled && !expandMode ? getAbsorberColumnId(visibleColumns) : undefined;
  // Until a user sizes a column the table keeps its natural auto layout; from
  // the first resize on, widths are explicit and `table-layout: fixed` honors
  // them (a column can shrink below its content and the absorber column takes
  // the slack). Only a width that takes effect counts: one stored for the
  // absorber or for a hidden column leaves the natural layout alone.
  const fixedLayout = resizingEnabled && visibleColumns.some(column => column.id !== absorberColumnId && columnSizing[column.id] != null);
  const absorberColumnIdRef = useRef(absorberColumnId);
  // Under `table-layout: fixed` the table fills its container and the absorber
  // gets whatever the sized columns leave. Once they need more than that, this
  // floor keeps the absorber at its min width and the viewport scrolls instead.
  const tableMinWidth = fixedLayout
    ? visibleColumns.reduce((sum, column) => sum + (column.id === absorberColumnId ? getColumnResizeBounds(column)[0] : column.getSize()), 0) +
      ((hasSelection ? 1 : 0) + (hasExpansion ? 1 : 0)) * UTILITY_COLUMN_WIDTH
    : undefined;

  // Header `<th>`s by column id, so the first resize can read the auto layout.
  const headerCellsRef = useRef(new Map<string, HTMLElement>());
  const committedSizingRef = useRef(committedSizing);
  const heldWidthsRef = useRef(heldWidths);
  const fixedLayoutRef = useRef(fixedLayout);
  const stickyLayoutRef = useRef(stickyLayout);
  const tableMinWidthRef = useRef(tableMinWidth);
  const hasSelectionRef = useRef(hasSelection);
  const hasExpansionRef = useRef(hasExpansion);
  // Its identity follows an inline `onChange`; read through a ref so the resize
  // context (and every header cell's ref callback) keeps one identity.
  const setSizingRef = useRef(setSizing);
  // The resize context reads the layout React last committed (from pointer and
  // key events), so these follow each commit rather than each render.
  useLayoutEffect(() => {
    absorberColumnIdRef.current = absorberColumnId;
    committedSizingRef.current = committedSizing;
    heldWidthsRef.current = heldWidths;
    fixedLayoutRef.current = fixedLayout;
    stickyLayoutRef.current = stickyLayout;
    tableMinWidthRef.current = tableMinWidth;
    hasSelectionRef.current = hasSelection;
    hasExpansionRef.current = hasExpansion;
    setSizingRef.current = setSizing;
  });
  // The draft React last rendered, and the newer one drawn on top of it
  // through the live-draft store (see `setDraft`).
  const renderedDraftRef = useRef<TableResizeDraft | null>(null);
  const liveDraft = useMemo(() => createTableStore<TableLiveDraft | null>(null), []);
  // One `ResizeObserver` for every handle of this table.
  const widthObserver = useMemo(() => createWidthObserver(), []);
  useEffect(() => () => widthObserver.disconnect(), [widthObserver]);
  // Set once React has committed the draft: until then the header cells still
  // show the previous one, so a live draft only builds on a rendered one. The
  // live draft it replaces is dropped here, before paint.
  useLayoutEffect(() => {
    renderedDraftRef.current = resizeDraft;
    liveDraft.set(null);
  }, [resizeDraft, liveDraft]);

  // The fixed layout as last committed: the absorber and every other visible
  // column's size. When another column becomes the absorber and the old one
  // stays visible without a stored width, hold it at the width it had (see
  // `heldSizing`), worked out from the container rather than measured on
  // every render.
  const previousLayoutRef = useRef<{ absorberId: string; sizes: Map<string, number> } | undefined>(undefined);
  useLayoutEffect(() => {
    // Let go of held widths once they are stored (or nothing is stored any
    // more), so a later stored sizing without them cannot bring them back.
    const heldIds = Object.keys(heldSizing);
    if (heldIds.length > 0 && heldIds.some(id => committedSizing[id] != null || Object.keys(committedSizing).length === 0)) {
      setHeldSizing(heldWidths);
      return;
    }
    const previous = previousLayoutRef.current;
    const visible = table.getVisibleLeafColumns();
    previousLayoutRef.current =
      fixedLayout && absorberColumnId ? { absorberId: absorberColumnId, sizes: new Map(visible.map(column => [column.id, column.getSize()])) } : undefined;
    if (!fixedLayout || !previous || previous.absorberId === absorberColumnId) return;
    if (committedSizing[previous.absorberId] != null || heldWidths[previous.absorberId] != null) return;
    const column = visible.find(candidate => candidate.id === previous.absorberId);
    const room = column ? getColumnRoom(headerCellsRef.current.get(column.id), (hasSelection ? 1 : 0) + (hasExpansion ? 1 : 0)) : 0;
    if (!column || room <= 0) return;
    // The old absorber had what the other columns left of the container (the
    // fixed layout fills it exactly, or the absorber sat at its floor). The
    // container is read now, in the commit that changed the absorber: should
    // it change width in that same commit (a parent resize, a vertical
    // scrollbar appearing), the held width is off by that difference.
    let previousWidth = room;
    for (const [id, size] of previous.sizes) if (id !== previous.absorberId) previousWidth -= size;
    // Columns added (or shown) since: hand each its own size out of the old
    // absorber's slack instead of squeezing the new absorber to its min, as far
    // as the old absorber's own floor allows.
    const handOver = visible.reduce((sum, candidate) => sum + (previous.sizes.has(candidate.id) ? 0 : candidate.getSize()), 0);
    const width = Math.max(getColumnResizeBounds(column)[0], Math.round(previousWidth) - handOver);
    setHeldSizing({ ...heldWidths, [previous.absorberId]: clampColumnWidth(column, width) });
  }, [table, fixedLayout, absorberColumnId, visibleColumns, columnSizing, committedSizing, heldSizing, heldWidths, hasSelection, hasExpansion]);

  const columnResizingContext = useMemo<TableColumnResizingContext | undefined>(() => {
    if (!resizingEnabled) return undefined;
    // A header cell's laid-out width; 0 when it is not mounted or not laid out.
    const measureHeader = (columnId: string | undefined) => (columnId == null ? undefined : headerCellsRef.current.get(columnId))?.getBoundingClientRect().width ?? 0;
    // Still in the auto layout (the first resize), the absorber's width there
    // says nothing about the fixed layout about to replace it, where it gets
    // what the other columns leave of the container. That budget (negative
    // when they overflow it), or undefined once fixed or when the container
    // cannot be measured.
    const getContainerBudget = (widthOf: (column: Column<TData, unknown>) => number): number | undefined => {
      if (fixedLayoutRef.current) return undefined;
      const visible = table.getVisibleLeafColumns();
      const absorber = visible.find(column => column.id === absorberColumnIdRef.current);
      const room = absorber ? getColumnRoom(headerCellsRef.current.get(absorber.id), (hasSelectionRef.current ? 1 : 0) + (hasExpansionRef.current ? 1 : 0)) : 0;
      if (!absorber || room <= 0) return undefined;
      return room - visible.reduce((sum, column) => sum + (column.id === absorber.id ? 0 : widthOf(column)), 0);
    };
    const getBaseSizing = (): ColumnSizingState => {
      const committed = committedSizingRef.current;
      // Start from every stored width so a resize never drops one the table
      // is not using right now (a hidden column, or the absorber's), but not
      // one for a column the table no longer has.
      const known = new Set(table.getAllLeafColumns().map(column => column.id));
      const base: ColumnSizingState = Object.fromEntries(Object.entries(committed).filter(([id]) => known.has(id)));
      // Still auto: freeze each unsized column at the width the browser gave
      // it, rounded up so its text does not get an ellipsis on the first touch,
      // unless the rounding would take more than the absorber can give. (Only
      // the rounding is weighed; a column the browser drew outside its own
      // min/max bounds, which is rare, still shifts the absorber by the clamp.)
      const frozen = fixedLayoutRef.current
        ? []
        : table
            .getVisibleLeafColumns()
            .filter(column => column.id !== absorberColumnIdRef.current && committed[column.id] == null)
            .map(column => ({ column, width: measureHeader(column.id) }));
      // Within the bounds `getSize()` applies, so a frozen column never jumps
      // (and no out-of-range width is stored), without the resize floor that
      // would widen a column the browser drew narrower than it.
      const freeze = (column: Column<TData, unknown>, width: number) => {
        const { minSize = 0, maxSize = Number.POSITIVE_INFINITY } = column.columnDef;
        return Math.min(maxSize, Math.max(minSize, width));
      };
      const absorber = table.getVisibleLeafColumns().find(column => column.id === absorberColumnIdRef.current);
      // Weighed against the same budget the grow plan uses: the container's
      // leftover when it can be measured, else the absorber's auto width.
      const ceiled = new Map(frozen.filter(({ width }) => width > 0).map(({ column, width }) => [column.id, freeze(column, Math.ceil(width))]));
      const budget = getContainerBudget(column => committed[column.id] ?? ceiled.get(column.id) ?? column.getSize());
      const roundingUp = frozen.reduce((sum, { width }) => sum + (Math.ceil(width) - width), 0);
      const absorberRoom = budget ?? measureHeader(absorber?.id) - roundingUp;
      const round = !absorber || absorberRoom >= getColumnResizeBounds(absorber)[0] ? Math.ceil : Math.floor;
      for (const { column, width } of frozen) {
        if (width > 0) base[column.id] = freeze(column, round(width));
      }
      // Already fixed: an unsized column renders at its `getSize()`.
      for (const column of table.getVisibleLeafColumns()) {
        if (column.id !== absorberColumnIdRef.current && base[column.id] == null) base[column.id] = column.getSize();
      }
      return base;
    };
    const getGrowPlan: TableColumnResizingContext['getGrowPlan'] = (columnId, base, shrunkBy = 0, contentWidths = new Map()) => {
      const visible = table.getVisibleLeafColumns();
      const absorberId = absorberColumnIdRef.current;
      const absorber = visible.find(candidate => candidate.id === absorberId);
      // On the first resize, what the frozen columns leave of the container
      // (nothing when they already overflow it, so only the donors give way).
      const budget = getContainerBudget(candidate => base[candidate.id] ?? candidate.getSize());
      const absorberWidth = budget ?? measureHeader(absorber?.id);
      // Nothing laid out to measure: leave growing unbounded.
      if (!absorber || (budget == null && absorberWidth <= 0) || absorber.id === columnId) return { absorberSpare: Number.POSITIVE_INFINITY, absorberExtra: 0, donors: [] };
      // May go below the floor (an earlier shrink in this drag already freed
      // more than the absorber has): then the absorber has nothing to spare.
      const available = absorberWidth - Math.max(0, shrunkBy);
      // The width a column's content needs (its header and rendered cells at
      // `max-content`, so its text stays whole). Measured only for the columns
      // that may give way: once per drag (the plan is kept for the drag), and
      // once per run of key presses (the handle passes the same cache).
      const contentWidthOf = (columnId: string) => {
        const cached = contentWidths.get(columnId);
        if (cached != null) return cached;
        const measured = measureColumnContentWidth(headerCellsRef.current.get(columnId));
        contentWidths.set(columnId, measured);
        return measured;
      };
      // What a column of this width gives up: `spare` down to its content
      // width, then `extra` on down to its min width, so the first pass keeps
      // text whole and the second keeps the handle moving once none is left.
      const giveOf = (column: (typeof visible)[number], width: number) => {
        const min = getColumnResizeBounds(column)[0];
        const spare = Math.max(0, Math.floor(width - Math.max(min, contentWidthOf(column.id))));
        return { spare, extra: Math.max(0, Math.floor(width - min)) - spare };
      };
      // Only columns between this one and the absorber give way, nearest
      // first: each of them has a handle on that same side to win its width
      // back, and a column beyond the absorber is never touched.
      const index = visible.findIndex(candidate => candidate.id === columnId);
      const absorberIndex = visible.indexOf(absorber);
      const between = index < absorberIndex ? visible.slice(index + 1, absorberIndex) : visible.slice(absorberIndex + 1, index).reverse();
      const donors = between
        .filter(candidate => candidate.id !== absorber.id && candidate.getCanResize() && !stickyLayoutRef.current.has(candidate.id) && base[candidate.id] != null)
        .map(candidate => {
          const width = base[candidate.id] as number;
          return { id: candidate.id, width, ...giveOf(candidate, width) };
        })
        .filter(donor => donor.spare + donor.extra > 0);
      const { spare: absorberSpare, extra: absorberExtra } = giveOf(absorber, available);
      return { absorberSpare, absorberExtra, donors };
    };
    return {
      getBaseSizing,
      getGrowPlan,
      setDraft: draft => {
        const rendered = renderedDraftRef.current;
        // Fast path: a later move of the same drag. Only the affected header
        // cells (`table-layout: fixed` sizes columns from the first row) and the
        // table's min-width change; unpinned columns move no sticky offset.
        if (draft && rendered && draft.base === rendered.base && draft.columnId === rendered.columnId && !stickyLayoutRef.current.has(draft.columnId)) {
          const ids = new Set([rendered.columnId, ...Object.keys(rendered.donors ?? {}), ...Object.keys(draft.donors ?? {})]);
          let delta = 0;
          for (const id of ids) delta += (getDraftWidth(draft, id) ?? 0) - (getDraftWidth(rendered, id) ?? 0);
          liveDraft.set({ draft, minWidth: (tableMinWidthRef.current ?? 0) + delta });
          return;
        }
        // Rendered in full; the live draft goes once React commits it.
        if (draft === rendered) liveDraft.set(null);
        else setResizeDraft(draft);
      },
      liveDraft,
      observeWidth: widthObserver.observe,
      commit: sizing => setSizingRef.current(sizing),
      reset: columnId => {
        const committed = committedSizingRef.current;
        // Held widths travel with the commit, like a drag's base carries them.
        const { [columnId]: stored, ...rest } = { ...heldWidthsRef.current, ...committed };
        const column = table.getVisibleLeafColumns().find(candidate => candidate.id === columnId);
        // Dropping the width returns the column to its declared `width`, or —
        // when nothing else stays sized — the whole table to its natural auto
        // layout. Otherwise an undeclared column would sit at the 150px
        // default (stored or not), so fit it to its content instead.
        const staysFixed = table.getVisibleLeafColumns().some(candidate => candidate.id !== absorberColumnIdRef.current && rest[candidate.id] != null);
        const fitted = column && staysFixed && column.columnDef.meta?.width == null ? measureColumnContentWidth(headerCellsRef.current.get(columnId)) : 0;
        if (column && fitted > 0) {
          // Growing to fit takes room like a drag does (absorber first, then
          // the columns between this one and the absorber), so it never pushes
          // the table past its container; the content is cut short instead.
          const current = Math.round(column.getSize());
          const desired = clampColumnWidth(column, fitted);
          const { width, donors } = desired > current ? resolveGrowth(current, desired, getGrowPlan(columnId, getBaseSizing())) : { width: desired, donors: undefined };
          if (width !== stored || donors) setSizingRef.current({ ...rest, ...donors, [columnId]: width });
          return;
        }
        if (stored != null) setSizingRef.current(rest);
      },
      registerHeaderCell: (columnId, element) => {
        if (element) headerCellsRef.current.set(columnId, element);
        else headerCellsRef.current.delete(columnId);
      },
    };
  }, [resizingEnabled, table, liveDraft, widthObserver]);

  // Each resizable column's handle edge, worked out once per layout rather
  // than by every header cell scanning the visible columns. The handle sits on
  // the edge that faces the absorber, the column that takes up the slack: a
  // column before it grows toward the inline end (handle on its end edge), one
  // after it toward the inline start (handle on its start edge), so the edge
  // under the pointer is always the one that moves. The absorber itself has
  // none. Without an absorber the last column has none either in `fit` mode
  // (every column pinned: its end edge is the table's), but does in `expand`
  // mode, where dragging it widens the table.
  const resizeEdges = useMemo(() => {
    if (!resizingEnabled) return undefined;
    const edges = new Map<string, 'start' | 'end'>();
    const absorberIndex = absorberColumnId == null ? -1 : visibleColumns.findIndex(column => column.id === absorberColumnId);
    visibleColumns.forEach((column, index) => {
      if (!column.getCanResize() || index === absorberIndex) return;
      const edge = absorberIndex >= 0 && index > absorberIndex ? 'start' : 'end';
      if (edge === 'end' && !expandMode && index === visibleColumns.length - 1) return;
      edges.set(column.id, edge);
    });
    return edges;
  }, [resizingEnabled, visibleColumns, absorberColumnId, expandMode]);

  const contextValue: TableContextValue = {
    table,
    size,
    striped,
    bordered,
    stickyHeader,
    loading,
    hasSelection,
    selectionMode,
    hasExpansion,
    treeMode,
    expansionRender: expansion?.render,
    hasColumnFilters,
    stickyLayout,
    fixedLayout,
    absorberColumnId,
    resizeMode,
    resizeEdges,
    columnResizing: columnResizingContext,
    totalColumnCount,
    emptyState,
    paginationEnabled,
    pageSizeOptions,
    slotAttrs,
  };

  const tableViewportAttrs = slotAttrs('tableViewport');
  const handleTableViewportScroll: UIEventHandler<HTMLDivElement> = event => {
    tableViewportAttrs.onScroll?.(event);
    const nextScrolled = event.currentTarget.scrollTop > 0;
    setTableViewportScrolled(current => (current === nextScrolled ? current : nextScrolled));
  };

  const tableAttrs = slotAttrs('table');
  // One element identity per render of Table, so a live-draft render of the
  // grid alone leaves the header and body untouched.
  const tableChildren = (
    <>
      <TableHeader />
      <TableBody />
    </>
  );

  return (
    <TableProvider value={contextValue}>
      <div {...rootAttrs} ref={ref} data-fixed-layout={fixedLayout ? '' : undefined} data-resize-mode={resizingEnabled ? resizeMode : undefined}>
        <div {...tableViewportAttrs} data-scrolled={tableViewportScrolled ? '' : undefined} onScroll={handleTableViewportScroll}>
          <TableGrid attrs={tableAttrs} minWidth={tableMinWidth} expandMode={expandMode} liveDraft={columnResizingContext?.liveDraft} busy={!!loading}>
            {tableChildren}
          </TableGrid>
        </div>
        {paginationEnabled && <TablePagination />}
        {loading && (
          // No `aria-hidden`: the Spar Spinner ships `role="status"` +
          // `aria-label="Loading"`, so the overlay politely announces the
          // loading transition (the table also carries `aria-busy`).
          <div {...slotAttrs('loading')}>
            <Spinner />
          </div>
        )}
      </div>
    </TableProvider>
  );
};

Table.displayName = 'Table';
