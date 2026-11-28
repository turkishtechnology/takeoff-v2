import type { PaginationLabels, PaginationMode, PaginationType } from './types';

export const DEFAULT_TYPE: PaginationType = 'outlined';
export const DEFAULT_MODE: PaginationMode = 'default';
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [5, 10, 20, 50];

// Every user-facing string Pagination renders, visible or for assistive
// technology. Keys shared with Table's pagination use Table's names and
// defaults so one translation fits both.
export const DEFAULT_LABELS: PaginationLabels = {
  landmark: 'Pagination',
  pageStatus: 'Page {page} of {pageCount}',
  itemsRange: 'Items {start}-{end} of {total}',
  noItems: '0 items',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
  pageButton: 'Go to page {page}',
  currentPageButton: 'Page {page}, current page',
  rowsPerPage: 'Rows per page',
  pageJumpInput: 'Go to page',
  pageJumpSubmit: 'Go',
};
