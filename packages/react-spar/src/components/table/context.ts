import type { HTMLAttributes, ReactNode } from 'react';
import type { ColumnSizingState, Table as TanStackTable } from '@tanstack/react-table';

import { createSafeContext } from '../../hooks';

import type { StickyLayout } from './helpers';
import type { TableSize, TableSlot } from './types';

/** Attrs returned by {@link TableContextValue.slotAttrs} — spreadable onto any rendered slot node. */
export type SlotAttrs = HTMLAttributes<HTMLElement> & Record<`data-${string}`, string | undefined>;

/** An in-flight pointer resize: the frozen layout it started from plus the live width of the dragged column. */
export interface TableResizeDraft {
  base: ColumnSizingState;
  columnId: string;
  width: number;
}

/**
 * Resize plumbing threaded to the header cells' resize handles. Present only
 * when the table opts in with `columnResizing`.
 */
export interface TableColumnResizingContext {
  /**
   * The full layout a resize starts from: the committed widths, with every
   * other visible column filled in — measured from the DOM while the table is
   * still auto-laid-out, so the first resize freezes the layout without a jump.
   */
  getBaseSizing: () => ColumnSizingState;
  /** Show (or clear, with `null`) a live drag width without committing it. */
  setDraft: (draft: TableResizeDraft | null) => void;
  /** Commit a new layout → `columnResizing.onChange`. */
  commit: (sizing: ColumnSizingState) => void;
  /** Drop one column's user width so it falls back to its declared `width`. */
  reset: (columnId: string) => void;
  /** Header cells register their `<th>` so a first resize can measure the auto layout. */
  registerHeaderCell: (columnId: string, element: HTMLElement | null) => void;
}

/**
 * Shared state for Table's internal render parts. In Phase 1 the parts are
 * **internal** (no public compound surface — RFC §3.1), so the root threads the
 * TanStack instance, the v2 visual config, and a pre-bound slot-attrs composer
 * through context rather than each part reading the theme itself.
 */
export interface TableContextValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: TanStackTable<any>;
  size: TableSize;
  striped: boolean;
  bordered: boolean;
  stickyHeader: boolean;
  loading: boolean;
  hasSelection: boolean;
  selectionMode?: 'single' | 'multiple';
  hasExpansion: boolean;
  /**
   * `getSubRows` is in play → expansion reveals flattened sub-rows (tree mode),
   * not a detail panel. The detail panel is suppressed even if `expansion.render`
   * is also supplied, so the two expansion shapes never double-render a row.
   */
  treeMode: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expansionRender?: (row: any) => ReactNode;
  hasColumnFilters: boolean;
  stickyLayout: StickyLayout;
  /**
   * Columns are user-sized → `table-layout: fixed`, every column carries an
   * explicit width, and a trailing filler cell absorbs the leftover space.
   */
  fixedLayout: boolean;
  /** Resize plumbing; `undefined` when `columnResizing` is off. */
  columnResizing?: TableColumnResizingContext;
  /** Visible column count incl. utility + filler cells — for `colSpan` (empty/expanded rows). */
  totalColumnCount: number;
  emptyState?: ReactNode;
  paginationEnabled: boolean;
  pageSizeOptions: number[];
  /**
   * Compose the canonical attrs for a slot (theme + instance `classNames` /
   * `slotProps` layered under the canonical `tk-*` class + `data-slot`).
   * Pre-bound to this Table's theme and instance overrides.
   */
  slotAttrs: (slot: TableSlot, attrs?: { className?: string }) => SlotAttrs;
}

export const [TableProvider, useTableContext] = createSafeContext<TableContextValue>('Table');
