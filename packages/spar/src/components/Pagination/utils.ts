import type { PaginationRangeItem, PaginationRangeOptions } from './types';

const range = (start: number, end: number): number[] => (end < start ? [] : Array.from({ length: end - start + 1 }, (_, index) => start + index));

const toCount = (value: number | undefined, fallback: number): number => (value == null || !Number.isFinite(value) ? fallback : Math.max(0, Math.floor(value)));

/**
 * Clamps a requested page to `1` and, once the page count is known (`>= 1`),
 * to `pageCount`. An unknown count (`0` or less, e.g. a server table that has
 * not reported its total yet) leaves the upper end open.
 */
export const clampPage = (page: number, pageCount: number): number => {
  const lower = Number.isFinite(page) ? Math.max(Math.floor(page), 1) : 1;
  return pageCount >= 1 ? Math.min(lower, Math.floor(pageCount)) : lower;
};

/**
 * Builds the visible page range: the boundary pages at each end, the current
 * page with its siblings, and an ellipsis wherever pages are hidden. The item
 * count stays constant while paging (an ellipsis only stands in for two or more
 * pages), so the control row does not change width.
 *
 * @example
 * getPaginationItems({ page: 6, pageCount: 10 });
 * // [1, 'start-ellipsis', 5, 6, 7, 'end-ellipsis', 10]
 */
export const getPaginationItems = ({ page, pageCount, siblingCount, boundaryCount }: PaginationRangeOptions): PaginationRangeItem[] => {
  const count = toCount(pageCount, 0);
  if (count === 0) return [];
  const siblings = toCount(siblingCount, 1);
  const boundaries = toCount(boundaryCount, 1);
  const current = clampPage(page, count);

  const startPages = range(1, Math.min(boundaries, count));
  const endPages = range(Math.max(count - boundaries + 1, boundaries + 1), count);

  const siblingsStart = Math.max(Math.min(current - siblings, count - boundaries - siblings * 2 - 1), boundaries + 2);
  const siblingsEnd = Math.min(Math.max(current + siblings, boundaries + siblings * 2 + 2), count - boundaries - 1);

  const items: PaginationRangeItem[] = [...startPages];

  if (siblingsStart > boundaries + 2) items.push('start-ellipsis');
  else if (boundaries + 1 < count - boundaries) items.push(boundaries + 1);

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < count - boundaries - 1) items.push('end-ellipsis');
  else if (count - boundaries > boundaries) items.push(count - boundaries);

  items.push(...endPages);

  // With few pages the windows overlap; keep the first occurrence of each page.
  const seen = new Set<PaginationRangeItem>();
  return items.filter(item => {
    if (typeof item === 'number' && (item < 1 || item > count)) return false;
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
};
