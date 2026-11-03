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
  /** Narrowed widths of the columns to its right that gave up room for it. */
  donors?: ColumnSizingState;
}

/** Where a growing column takes its room from (see `getGrowPlan`). */
export interface TableGrowPlan {
  /** What the absorber can give up; `Infinity` when there is none or nothing can be measured. */
  absorberSpare: number;
  /** Then the sized columns to its right, nearest first: their width and what each can give up. */
  donors: Array<{ id: string; width: number; spare: number }>;
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
  /**
   * Show (or clear, with `null`) a live drag width without committing it. The
   * first draft of a drag renders (it freezes the layout); later drafts of the
   * same drag on an unpinned column are written straight to the header cell and
   * the table's min-width, so a large body is not re-rendered per pointer move.
   */
  setDraft: (draft: TableResizeDraft | null) => void;
  /** Commit a new layout → `columnResizing.onChange`. */
  commit: (sizing: ColumnSizingState) => void;
  /**
   * Drop one column's user width so it falls back to its declared `width`, or
   * fit it to its content when it declares none and other columns stay sized.
   */
  reset: (columnId: string) => void;
  /**
   * Where a column can take room from when it grows, so a resize never pushes
   * the table past its container: first the absorber, then the resizable,
   * unpinned columns to its right (nearest first), each down to its min width
   * or its content's min-content, whichever is wider.
   */
  getGrowPlan: (columnId: string, base: ColumnSizingState) => TableGrowPlan;
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
   * Columns are user-sized → `table-layout: fixed`, and every column but the
   * absorber carries an explicit width.
   */
  fixedLayout: boolean;
  /**
   * With `columnResizing`, the column that takes up the leftover width (see
   * `getAbsorberColumnId`): it renders no resize handle and, once the layout is
   * fixed, no explicit width.
   */
  absorberColumnId?: string;
  /** Resize plumbing; `undefined` when `columnResizing` is off. */
  columnResizing?: TableColumnResizingContext;
  /** Visible column count incl. utility cells — for `colSpan` (empty/expanded rows). */
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
