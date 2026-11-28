import { useCallback, useMemo, type ElementType } from 'react';
import { Pagination as SparPagination } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';
import { resolveLabels } from '../../utils';

import { PaginationBase } from './base';
import { PaginationProvider, type PaginationOwnContextValue } from './context';
import { DEFAULT_LABELS, DEFAULT_MODE, DEFAULT_PAGE_SIZE, DEFAULT_TYPE } from './defaults';
import { PaginationActions } from './PaginationActions';
import { PaginationControls } from './PaginationControls';
import { PaginationInfo } from './PaginationInfo';
import type { PaginationProps } from './types';

const toPageSize = (value: number | undefined): number => (typeof value === 'number' && Number.isFinite(value) && value >= 1 ? Math.floor(value) : DEFAULT_PAGE_SIZE);
const toPageCount = (totalItems: number, pageSize: number): number => (Number.isFinite(totalItems) && totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0);
const clamp = (page: number, pageCount: number): number => Math.min(Math.max(Number.isFinite(page) ? Math.floor(page) : 1, 1), Math.max(pageCount, 1));

export const Pagination = <T extends ElementType = 'nav'>(props: PaginationProps<T>) => {
  const theme = useComponentTheme('Pagination');
  const { rootAttrs, rest } = composeRootAttrs(PaginationBase, props as PaginationProps<'nav'>, theme, {
    stateAttrs: ({ type = DEFAULT_TYPE, mode = DEFAULT_MODE, rounded }) => ({
      'data-type': type,
      'data-mode': mode,
      'data-rounded': rounded ? '' : undefined,
    }),
  });

  const {
    'totalItems': rawTotalItems,
    page,
    defaultPage = 1,
    onPageChange,
    'pageSize': pageSizeProp,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    onPageSizeChange,
    'type': _type,
    mode = DEFAULT_MODE,
    'rounded': _rounded,
    'labels': _labels,
    'aria-label': ariaLabel,
    children,
    ref,
    ...sparProps
  } = rest;

  // `labels` is merged per key rather than taken from the shallow props merge:
  // defaults <- provider `defaultProps.labels` <- instance `labels`.
  const themeLabels = theme?.defaultProps?.labels;
  const labels = useMemo(() => resolveLabels(DEFAULT_LABELS, themeLabels, props.labels), [themeLabels, props.labels]);

  const [rawPage, setRawPage] = useControllableState<number>(page, defaultPage, onPageChange);
  const [rawPageSize, setRawPageSize] = useControllableState<number>(pageSizeProp, defaultPageSize, onPageSizeChange);

  const totalItems = Number.isFinite(rawTotalItems) && rawTotalItems > 0 ? Math.floor(rawTotalItems) : 0;
  const pageSize = toPageSize(rawPageSize);
  const pageCount = toPageCount(totalItems, pageSize);
  const currentPage = clamp(rawPage ?? 1, pageCount);

  const setPageSize = useCallback(
    (next: number) => {
      const nextSize = toPageSize(next);
      if (nextSize === pageSize) return;
      // Keep the first visible item on screen (TanStack's setPageSize rule).
      const nextPage = Math.floor(((currentPage - 1) * pageSize) / nextSize) + 1;
      if (nextPage !== currentPage) setRawPage(nextPage);
      setRawPageSize(nextSize);
    },
    [currentPage, pageSize, setRawPage, setRawPageSize],
  );

  const contextValue = useMemo<PaginationOwnContextValue>(() => ({ labels, mode, totalItems, pageSize, setPageSize }), [labels, mode, totalItems, pageSize, setPageSize]);

  return (
    <PaginationProvider value={contextValue}>
      <SparPagination {...sparProps} ref={ref} {...rootAttrs} aria-label={ariaLabel ?? labels.landmark} page={currentPage} onPageChange={setRawPage} pageCount={pageCount}>
        {children ?? (
          <>
            {mode === 'default' && <PaginationInfo />}
            <PaginationControls />
            <PaginationActions />
          </>
        )}
      </SparPagination>
    </PaginationProvider>
  );
};

Pagination.displayName = 'Pagination';
