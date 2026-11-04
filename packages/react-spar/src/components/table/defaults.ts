import type { TableSize } from './types';

export const DEFAULT_SIZE: TableSize = 'base';
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [10, 25, 50, 100];

// Column-filter popover strings. Localizable per table through the root's
// `filterClearLabel` / `filterButtonLabel` props, and per column through
// `filter.clearLabel`.
export const DEFAULT_FILTER_CLEAR_LABEL = 'Clear';
export const DEFAULT_FILTER_BUTTON_LABEL = 'Filter column';

/** Fallback px width used for sticky-offset math when a column omits `width`. */
export const DEFAULT_COLUMN_WIDTH = 150;
/** Fixed px width of the injected selection / expand utility columns. */
export const UTILITY_COLUMN_WIDTH = 48;
