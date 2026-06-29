import { createComponentBase } from '../../core';

import type { TableProps, TableSlot } from './types';

/**
 * Single multi-slot base for the whole Table. Unlike a compound wrapper, Table
 * exposes no public sub-components in Phase 1 (RFC §3.1, Tier 2 deferred) — the
 * internal render parts read these slot classes off the root through context
 * and compose them with `buildSlotAttrs`. `base.ts` stays the single source of
 * truth for slot names and emitted `tk-*` classes.
 *
 * @archetype react-enhancement — Table has no upstream Spar primitive; the
 * state engine is TanStack and every DOM node + styling hook is v2-owned.
 *
 * Data-attribute vocabulary (data-attribute-vocabulary.md rule 10 — Table is a
 * v2-owned react-enhancement with no upstream primitive, so it introduces its
 * own hooks; recorded under "Component-specific decisions → Table"):
 *   Root:        data-size, data-striped, data-bordered, data-sticky-header,
 *                data-loading
 *   Viewport:    data-scrolled (presence while scrollTop > 0)
 *   Header/cell: data-align (start|center|end), data-sticky (left|right),
 *                data-sortable (presence) + aria-sort (a11y source of truth)
 *   Sort icon:   data-direction (asc|desc|none) — node-local chevron hook, NOT
 *                a duplicate of the <th>'s aria-sort
 *   Row:         data-selected (presence)
 *   Utility:     data-selection-mode (single|multiple) on the selection cell
 *   Filter:      data-active (presence) on the (Popover-owned) filter trigger
 */
export const TableBase = createComponentBase<TableProps, TableSlot>({
  name: 'Table',
  slots: [
    'root',
    'tableViewport',
    'table',
    'header',
    'headerRow',
    'headerCell',
    'headerContent',
    'sortTrigger',
    'sortIcon',
    'body',
    'row',
    'cell',
    'selectionCell',
    'expandCell',
    'expandButton',
    'expandedRow',
    'filterButton',
    'filterPanel',
    'pagination',
    'paginationInfo',
    'paginationNav',
    'paginationActions',
    'paginationSize',
    'paginationGoToPage',
    'empty',
    'loading',
  ] as const,
  classes: {
    root: 'tk-table',
    tableViewport: 'tk-table-viewport',
    table: 'tk-table-table',
    header: 'tk-table-header',
    headerRow: 'tk-table-header-row',
    headerCell: 'tk-table-header-cell',
    headerContent: 'tk-table-header-content',
    sortTrigger: 'tk-table-sort-trigger',
    sortIcon: 'tk-table-sort-icon',
    body: 'tk-table-body',
    row: 'tk-table-row',
    cell: 'tk-table-cell',
    selectionCell: 'tk-table-selection-cell',
    expandCell: 'tk-table-expand-cell',
    expandButton: 'tk-table-expand-button',
    expandedRow: 'tk-table-expanded-row',
    filterButton: 'tk-table-filter-button',
    filterPanel: 'tk-table-filter-panel-body',
    pagination: 'tk-table-pagination',
    paginationInfo: 'tk-table-pagination-info',
    paginationNav: 'tk-table-pagination-nav',
    paginationActions: 'tk-table-pagination-actions',
    paginationSize: 'tk-table-pagination-size',
    paginationGoToPage: 'tk-table-pagination-go-to-page',
    empty: 'tk-table-empty',
    loading: 'tk-table-loading',
  },
});
