import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  functionalUpdate,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
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
import { TableProvider, type SlotAttrs, type TableContextValue } from './context';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS, DEFAULT_SIZE } from './defaults';
import { buildOrderedColumns, computeStickyLayout, toTanStackColumns } from './helpers';
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

export const Table = <TData,>(props: TableProps<TData>) => {
  const theme = useComponentTheme('Table');

  const { rootAttrs, rest } = composeRootAttrs(TableBase, props as TableProps, theme, {
    // Visual vocabulary lives on the root scroll container so recipes cascade
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
  const hasColumnFilters = !!filtering || columns.some(column => !!column.filter);
  const hasSortableColumn = columns.some(column => !!column.sortable);
  const paginationConfig = typeof pagination === 'object' ? pagination : undefined;
  const paginationEnabled = pagination === true || !!paginationConfig;
  const pageSizeOptions = paginationConfig?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;

  // ── Controlled/uncontrolled state slices ─────────────────────────────────
  const [sortingState, setSorting] = useControllableState<SortingState>(sortingConfig?.value, sortingConfig?.defaultValue ?? EMPTY_SORTING, sortingConfig?.onChange);
  const [filtersState, setFilters] = useControllableState<ColumnFiltersState>(filtering?.value, filtering?.defaultValue ?? EMPTY_FILTERS, filtering?.onChange);
  const [selectionState, setSelection] = useControllableState<RowSelectionState>(selection?.value, selection?.defaultValue ?? EMPTY_SELECTION, selection?.onChange);
  const [expandedState, setExpanded] = useControllableState<ExpandedState>(expansion?.value, expansion?.defaultValue ?? EMPTY_EXPANDED, expansion?.onChange);

  // Initial value only (empty deps): subsequent page changes flow through state.
  const initialPagination = useMemo<PaginationState>(() => ({ pageIndex: paginationConfig?.pageIndex ?? 0, pageSize: paginationConfig?.pageSize ?? DEFAULT_PAGE_SIZE }), []);
  // In server (`manual`) mode the consumer owns pagination, so the slice is
  // controlled and read from props every render (defaulting `pageIndex` to 0
  // until supplied). This avoids the first-render controlled/uncontrolled latch
  // that would otherwise drop a `pageIndex` initialized asynchronously after the
  // first fetch resolves. Client mode stays uncontrolled.
  const paginationControlled = manual && !!paginationConfig;
  const controlledPagination = useMemo<PaginationState | undefined>(
    () => (paginationControlled ? { pageIndex: paginationConfig?.pageIndex ?? 0, pageSize: paginationConfig?.pageSize ?? DEFAULT_PAGE_SIZE } : undefined),
    [paginationControlled, paginationConfig?.pageIndex, paginationConfig?.pageSize],
  );
  const [paginationStateRaw, setPagination] = useControllableState<PaginationState>(controlledPagination, initialPagination, paginationConfig?.onChange);

  const sorting = sortingState ?? EMPTY_SORTING;
  const columnFilters = filtersState ?? EMPTY_FILTERS;
  const rowSelection = selectionState ?? EMPTY_SELECTION;
  const expanded = expandedState ?? EMPTY_EXPANDED;
  const paginationValue = paginationStateRaw ?? initialPagination;

  const onSortingChange: OnChangeFn<SortingState> = updater => setSorting(functionalUpdate(updater, sorting));
  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = updater => setFilters(functionalUpdate(updater, columnFilters));
  const onRowSelectionChange: OnChangeFn<RowSelectionState> = updater => setSelection(functionalUpdate(updater, rowSelection));
  const onExpandedChange: OnChangeFn<ExpandedState> = updater => setExpanded(functionalUpdate(updater, expanded));
  const onPaginationChange: OnChangeFn<PaginationState> = updater => setPagination(functionalUpdate(updater, paginationValue));

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
    },
    onSortingChange,
    onColumnFiltersChange,
    onRowSelectionChange,
    onExpandedChange,
    onPaginationChange,
    enableSorting: hasSortableColumn || !!sortingConfig,
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

  // Server mode: emit one bundled data request derived from the granular state
  // slices (RFC §3.3). Debounce is the consumer's call (RFC §7 Q2). Fires once
  // per real pagination/sorting/filter change, regardless of callback identity.
  useEffect(() => {
    if (!manual) return;
    onDataRequestRef.current?.({ pagination: paginationValue, sorting, filters: columnFilters });
  }, [manual, paginationValue, sorting, columnFilters]);

  // Client mode: let a changed `pageSize` prop drive the (uncontrolled) table.
  // The equality guard prevents clobbering a size the user picked via the
  // built-in page-size Select on unrelated re-renders.
  useEffect(() => {
    if (paginationControlled || paginationConfig?.pageSize == null) return;
    if (table.getState().pagination.pageSize === paginationConfig.pageSize) return;
    table.setPageSize(paginationConfig.pageSize);
  }, [paginationControlled, paginationConfig?.pageSize, table]);

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

  const stickyLayout = useMemo(() => computeStickyLayout(buildOrderedColumns(table, { hasSelection, hasExpansion })), [table, tanstackColumns, hasSelection, hasExpansion]);

  const totalColumnCount = tanstackColumns.length + (hasSelection ? 1 : 0) + (hasExpansion ? 1 : 0);

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
    expansionRender: expansion?.render,
    hasColumnFilters,
    stickyLayout,
    totalColumnCount,
    emptyState,
    paginationEnabled,
    pageSizeOptions,
    slotAttrs,
  };

  return (
    <TableProvider value={contextValue}>
      <div {...rootAttrs} ref={ref}>
        <table {...slotAttrs('table')} aria-busy={loading || undefined}>
          <TableHeader />
          <TableBody />
        </table>
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
