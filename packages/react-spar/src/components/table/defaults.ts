import type { TableSize } from './types';

export const DEFAULT_SIZE: TableSize = 'base';
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [10, 25, 50, 100];

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
