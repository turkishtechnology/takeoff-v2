import { useCallback, useMemo, type ElementType } from 'react';
import { useControlledState } from '../../hooks';
import { PaginationContext } from './hooks';
import { clampPage, getPaginationItems } from './utils';
import type { PaginationContextValue, PaginationProps } from './types';

/**
 * Root of a pagination control. Owns the current page (controlled or
 * uncontrolled), derives the visible range and renders the navigation landmark.
 * A `pageCount` below 1 means the count is unknown: the page is not clamped
 * from above and only backward moves are available.
 */
export const Pagination = <T extends ElementType = 'nav'>({
  as,
  children,
  'aria-label': ariaLabel = 'Pagination',
  'page': pageProp,
  defaultPage = 1,
  onPageChange,
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
  disabled = false,
  ...props
}: PaginationProps<T>) => {
  const Component = as || 'nav';
  const [rawPage, setRawPage] = useControlledState<number>(pageProp, defaultPage, onPageChange);
  const page = clampPage(rawPage ?? 1, pageCount);

  const setPage = useCallback(
    (next: number) => {
      if (disabled || !Number.isFinite(next)) return;
      const target = Math.floor(next);
      // Moving back only needs a page to exist below; moving forward needs the
      // target inside a known page count.
      if (target < 1 || target === page || (target > page && target > pageCount)) return;
      setRawPage(target);
    },
    [disabled, page, pageCount, setRawPage],
  );

  const items = useMemo(() => getPaginationItems({ page, pageCount, siblingCount, boundaryCount }), [page, pageCount, siblingCount, boundaryCount]);

  const contextValue = useMemo<PaginationContextValue>(() => ({ page, pageCount, items, disabled, setPage }), [page, pageCount, items, disabled, setPage]);

  return (
    <PaginationContext.Provider value={contextValue}>
      <Component {...props} aria-label={ariaLabel} aria-disabled={disabled || undefined} data-disabled={disabled ? '' : undefined}>
        {children}
      </Component>
    </PaginationContext.Provider>
  );
};

Pagination.displayName = 'Pagination';
