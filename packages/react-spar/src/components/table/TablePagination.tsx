import { useState, type SubmitEvent } from 'react';
import { ArrowLeftIconOutlinedRounded } from '@takeoff-icons/react/arrow-left';
import { ArrowRightIconOutlinedRounded } from '@takeoff-icons/react/arrow-right';
import { ChevronLeftIconOutlinedRounded } from '@takeoff-icons/react/chevron-left';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';

import { Button } from '../button';
import { Input } from '../input';
import { Select } from '../select';

import { useTableContext } from './context';

type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

const getPaginationItems = (pageIndex: number, pageCount: number): PaginationItem[] => {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index);
  if (pageIndex <= 3) return [0, 1, 2, 3, 4, 'end-ellipsis', pageCount - 1];
  if (pageIndex >= pageCount - 4) return [0, 'start-ellipsis', pageCount - 5, pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1];
  return [0, 'start-ellipsis', pageIndex - 1, pageIndex, pageIndex + 1, 'end-ellipsis', pageCount - 1];
};

/**
 * Pagination controls — composed from Spar-derived v2 wrappers (RFC §4): a
 * `Select` for page size and `Button`s for navigation. Lives outside the
 * `<table>` so it carries no table semantics.
 */
export const TablePagination = () => {
  const { table, slotAttrs, pageSizeOptions } = useTableContext('Table.Pagination');
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const paginationItems = getPaginationItems(pageIndex, pageCount);
  const [pageInput, setPageInput] = useState('');
  const paginationGoToPageAttrs = slotAttrs('paginationGoToPage');

  const handleGoToPage = (event: SubmitEvent<HTMLFormElement>) => {
    paginationGoToPageAttrs.onSubmit?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();
    const requestedPage = Number(pageInput);
    if (!Number.isFinite(requestedPage) || pageCount <= 0) return;
    const targetPage = Math.min(Math.max(Math.trunc(requestedPage), 1), pageCount);
    table.setPageIndex(targetPage - 1);
    setPageInput(String(targetPage));
  };

  return (
    <div {...slotAttrs('pagination')} role="navigation" aria-label="Pagination">
      <span {...slotAttrs('paginationInfo')} aria-live="polite">
        {pageCount > 0 ? `Page ${pageIndex + 1} of ${pageCount}` : `Page ${pageIndex + 1}`}
      </span>

      <div {...slotAttrs('paginationActions')}>
        <Button
          size="small"
          variant="neutral"
          appearance="text"
          aria-label="First page"
          startContent={<ArrowLeftIconOutlinedRounded />}
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.setPageIndex(0)}
        />
        <Button
          size="small"
          variant="neutral"
          appearance="text"
          aria-label="Previous page"
          startContent={<ChevronLeftIconOutlinedRounded />}
          disabled={!table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        />
        {paginationItems.map(item => {
          if (typeof item !== 'number') {
            return (
              <span key={item} aria-hidden="true">
                …
              </span>
            );
          }

          const pageNumber = item + 1;
          const current = item === pageIndex;
          return (
            <Button
              key={item}
              type="button"
              size="small"
              variant="neutral"
              appearance={current ? 'outlined' : 'text'}
              aria-label={current ? `Page ${pageNumber}, current page` : `Go to page ${pageNumber}`}
              aria-current={current ? 'page' : undefined}
              onClick={() => table.setPageIndex(item)}
            >
              {pageNumber}
            </Button>
          );
        })}
        <Button
          size="small"
          variant="neutral"
          appearance="text"
          aria-label="Next page"
          startContent={<ChevronRightIconOutlinedRounded />}
          disabled={!table.getCanNextPage() || pageCount <= 0}
          onClick={() => table.nextPage()}
        />
        <Button
          size="small"
          variant="neutral"
          appearance="text"
          aria-label="Last page"
          startContent={<ArrowRightIconOutlinedRounded />}
          disabled={!table.getCanNextPage() || pageCount <= 0}
          onClick={() => table.setPageIndex(pageCount - 1)}
        />
      </div>

      <div {...slotAttrs('paginationSize')}>
        <form {...paginationGoToPageAttrs} onSubmit={handleGoToPage}>
          <Input size="small">
            <Input.Field
              type="number"
              min={1}
              max={Math.max(pageCount, 1)}
              inputMode="numeric"
              aria-label="Go to page"
              placeholder={String(pageIndex + 1)}
              value={pageInput}
              disabled={pageCount <= 0}
              onChange={event => setPageInput(event.currentTarget.value)}
            />
            <Input.Suffix>
              {' '}
              <Button type="submit" size="small" variant="neutral" appearance="text" disabled={pageCount <= 0 || pageInput === ''}>
                Go
              </Button>
            </Input.Suffix>
          </Input>
        </form>

        <Select value={String(pageSize)} onChange={value => table.setPageSize(Number(value))}>
          <Select.Trigger aria-label="Rows per page">{pageSize}</Select.Trigger>
          <Select.Content>
            {pageSizeOptions.map(option => (
              <Select.Item key={option} value={String(option)}>
                {option}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
    </div>
  );
};

TablePagination.displayName = 'Table.Pagination';
