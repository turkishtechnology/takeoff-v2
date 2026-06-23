import type { HTMLAttributes, ReactNode } from 'react';
import type { Table as TanStackTable } from '@tanstack/react-table';

import { createSafeContext } from '../../hooks';

import type { StickyLayout } from './helpers';
import type { TableSize, TableSlot } from './types';

/** Attrs returned by {@link TableContextValue.slotAttrs} — spreadable onto any rendered slot node. */
export type SlotAttrs = HTMLAttributes<HTMLElement> & Record<`data-${string}`, string | undefined>;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expansionRender?: (row: any) => ReactNode;
  hasColumnFilters: boolean;
  stickyLayout: StickyLayout;
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
