import type { TableLabels, TableSize } from './types';

export const DEFAULT_SIZE: TableSize = 'base';
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [10, 25, 50, 100];

// Every user-facing string Table renders, visible or for assistive technology.
// Localizable per table through the root's `labels` prop (or app-wide through
// provider `defaultProps`).
export const DEFAULT_LABELS: TableLabels = {
  noData: 'No data',
  // Unset by default so Spinner's own (provider) default names the overlay
  // ('Loading' out of the box); listed so `resolveLabels` accepts the key.
  loading: undefined,
  filterButton: 'Filter {column}',
  filterValue: 'Filter {column} value',
  filterClear: 'Clear',
  filterSelectPlaceholder: 'Select',
  paginationLandmark: 'Pagination',
  pageStatus: 'Page {page} of {pageCount}',
  pageStatusUnknown: 'Page {page}',
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
  selectAllRows: 'Select all rows',
  selectRow: 'Select row',
  rowSelection: 'Row selection',
  expandRow: 'Expand row',
  collapseRow: 'Collapse row',
  rowDetails: 'Row details',
  resizeHandle: 'Resize {column} column',
};

/** Fallback px width used for sticky-offset math when a column omits `width`. */
export const DEFAULT_COLUMN_WIDTH = 150;
/** Fixed px width of the injected selection / expand utility columns. */
export const UTILITY_COLUMN_WIDTH = 48;
/** Narrowest px width a user resize can reach when a column omits `minWidth`. */
export const DEFAULT_MIN_COLUMN_WIDTH = 50;
/** Pointer travel (px) before a press on a resize handle counts as a drag, so a click's jitter never resizes. */
export const RESIZE_DRAG_THRESHOLD = 3;
/** px a Left/Right arrow press on a resize handle moves the column edge. */
export const RESIZE_KEYBOARD_STEP = 10;
/** px a Shift+Left/Right arrow press moves the column edge. */
export const RESIZE_KEYBOARD_STEP_LARGE = 50;
