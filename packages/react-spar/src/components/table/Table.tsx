import { useCallback, useEffect, useMemo, useRef, useState, type UIEventHandler } from 'react';
import {
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import { TableProvider, type SlotAttrs, type TableColumnResizingContext, type TableContextValue, type TableResizeDraft } from './context';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_SIZE, UTILITY_COLUMN_WIDTH } from './defaults';
import { buildOrderedColumns, clampColumnWidth, computeStickyLayout, getAbsorberColumnId, getColumnResizeBounds, measureColumnContentWidth, toTanStackColumns } from './helpers';
import { TableBody } from './TableBody';
import { TableHeader } from './TableHeader';
import { TablePagination } from './TablePagination';
import type { TableProps } from './types';

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
  const columnSizing = useMemo<ColumnSizingState>(
    () => (resizeDraft ? { ...resizeDraft.base, [resizeDraft.columnId]: resizeDraft.width } : committedSizing),
    [resizeDraft, committedSizing],
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
  const absorberColumnId = resizingEnabled ? getAbsorberColumnId(visibleColumns) : undefined;
  // Until a user sizes a column the table keeps its natural auto layout; from
  // the first resize on, widths are explicit and `table-layout: fixed` honors
  // them (a column can shrink below its content and the absorber column takes
  // the slack). Only a width that takes effect counts: one stored for the
  // absorber or for a hidden column leaves the natural layout alone.
  const fixedLayout = resizingEnabled && visibleColumns.some(column => column.id !== absorberColumnId && columnSizing[column.id] != null);
  const absorberColumnIdRef = useRef(absorberColumnId);
  absorberColumnIdRef.current = absorberColumnId;
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
  committedSizingRef.current = committedSizing;
  const fixedLayoutRef = useRef(fixedLayout);
  fixedLayoutRef.current = fixedLayout;
  const stickyLayoutRef = useRef(stickyLayout);
  stickyLayoutRef.current = stickyLayout;
  const tableMinWidthRef = useRef(tableMinWidth);
  tableMinWidthRef.current = tableMinWidth;
  // The draft React last rendered, and the newer one written straight to the
  // DOM on top of it (see `setDraft`).
  const renderedDraftRef = useRef<TableResizeDraft | null>(null);
  const liveDraftRef = useRef<TableResizeDraft | null>(null);

  const columnResizingContext = useMemo<TableColumnResizingContext | undefined>(() => {
    if (!resizingEnabled) return undefined;
    return {
      getBaseSizing: () => {
        const committed = committedSizingRef.current;
        // Start from every stored width so a resize never drops one the table
        // is not using right now (a hidden column, or the absorber's).
        const base: ColumnSizingState = { ...committed };
        for (const column of table.getVisibleLeafColumns()) {
          // The absorber is never sized: it keeps taking up the slack.
          if (column.id === absorberColumnIdRef.current || committed[column.id] != null) continue;
          // Already fixed: an unsized column renders at its `getSize()`.
          // Still auto: freeze it at the width the browser gave it.
          const measured = fixedLayoutRef.current ? 0 : Math.ceil(headerCellsRef.current.get(column.id)?.getBoundingClientRect().width ?? 0);
          base[column.id] = measured > 0 ? measured : column.getSize();
        }
        return base;
      },
      setDraft: draft => {
        const rendered = renderedDraftRef.current;
        const cell = rendered ? headerCellsRef.current.get(rendered.columnId) : undefined;
        const tableElement = cell?.closest('table');
        // Fast path: a later move of the same drag. Only the dragged header
        // cell (`table-layout: fixed` sizes columns from the first row) and the
        // min-width floor change; an unpinned column moves no sticky offset.
        if (draft && rendered && cell && tableElement && draft.base === rendered.base && draft.columnId === rendered.columnId && !stickyLayoutRef.current.has(draft.columnId)) {
          cell.style.width = `${draft.width}px`;
          tableElement.style.minWidth = `${(tableMinWidthRef.current ?? 0) + draft.width - rendered.width}px`;
          liveDraftRef.current = draft;
          return;
        }
        // Hand the styles back to React as it last rendered them, so its next
        // render (which may not touch them) starts from what it believes is there.
        if (liveDraftRef.current && rendered && cell && tableElement) {
          cell.style.width = `${rendered.width}px`;
          tableElement.style.minWidth = `${tableMinWidthRef.current ?? 0}px`;
        }
        liveDraftRef.current = null;
        renderedDraftRef.current = draft;
        setResizeDraft(draft);
      },
      commit: sizing => setSizing(sizing),
      reset: columnId => {
        const committed = committedSizingRef.current;
        if (committed[columnId] == null) return;
        const { [columnId]: _dropped, ...rest } = committed;
        const column = table.getVisibleLeafColumns().find(candidate => candidate.id === columnId);
        // Dropping the width returns the column to its declared `width`, or —
        // when nothing else stays sized — the whole table to its natural auto
        // layout. Otherwise an undeclared column would fall to the 150px
        // default, so fit it to its content instead.
        const staysFixed = table.getVisibleLeafColumns().some(candidate => candidate.id !== absorberColumnIdRef.current && rest[candidate.id] != null);
        const fitted = column && staysFixed && column.columnDef.meta?.width == null ? measureColumnContentWidth(headerCellsRef.current.get(columnId)) : 0;
        setSizing(column && fitted > 0 ? { ...rest, [columnId]: clampColumnWidth(column, fitted) } : rest);
      },
      registerHeaderCell: (columnId, element) => {
        if (element) headerCellsRef.current.set(columnId, element);
        else headerCellsRef.current.delete(columnId);
      },
    };
  }, [resizingEnabled, table, setSizing]);

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

  return (
    <TableProvider value={contextValue}>
      <div {...rootAttrs} ref={ref} data-fixed-layout={fixedLayout ? '' : undefined}>
        <div {...tableViewportAttrs} data-scrolled={tableViewportScrolled ? '' : undefined} onScroll={handleTableViewportScroll}>
          <table {...tableAttrs} style={tableMinWidth != null ? { ...tableAttrs.style, minWidth: tableMinWidth } : tableAttrs.style} aria-busy={loading || undefined}>
            <TableHeader />
            <TableBody />
          </table>
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
