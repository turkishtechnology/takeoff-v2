import type { TableLabels, TableSize } from './types';

export const DEFAULT_SIZE: TableSize = 'base';
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [10, 25, 50, 100];

// Every user-facing string Table renders, visible or for assistive technology.
// Localizable per table through the root's `labels` prop (or app-wide through
// provider `defaultProps`).
export const DEFAULT_LABELS: TableLabels = {
  noData: 'No data',
  // Only used when `labels.loading` is set; otherwise Spinner's own (provider)
  // default names the overlay, which is also 'Loading' out of the box.
  loading: 'Loading',
  filterButton: 'Filter {column}',
  filterValue: 'Filter {column} value',
  filterClear: 'Clear',
  filterSelectPlaceholder: 'Select',
  pagination: 'Pagination',
  pageStatus: 'Page {page} of {pageCount}',
  pageStatusUnknown: 'Page {page}',
  itemsRange: 'Items {start}-{end} of {total}',
  noItems: '0 items',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
  goToPageNumber: 'Go to page {page}',
  currentPage: 'Page {page}, current page',
  rowsPerPage: 'Rows per page',
  goToPage: 'Go to page',
  goToPageSubmit: 'Go',
  selectAllRows: 'Select all rows',
  selectRow: 'Select row',
  rowSelection: 'Row selection',
  expandRow: 'Expand row',
  collapseRow: 'Collapse row',
  rowDetails: 'Row details',
};

/** Fallback px width used for sticky-offset math when a column omits `width`. */
export const DEFAULT_COLUMN_WIDTH = 150;
/** Fixed px width of the injected selection / expand utility columns. */
export const UTILITY_COLUMN_WIDTH = 48;
