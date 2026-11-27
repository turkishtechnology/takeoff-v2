import { createSafeContext } from '../../hooks';

import type { PaginationLabels, PaginationMode } from './types';

export interface PaginationOwnContextValue {
  labels: PaginationLabels;
  mode: PaginationMode;
  totalItems: number;
  pageSize: number;
  /** Changes the page size and moves the page so the first visible item stays on screen. */
  setPageSize: (pageSize: number) => void;
}

export const [PaginationProvider, usePaginationOwnContext] = createSafeContext<PaginationOwnContextValue>('PaginationProvider');
