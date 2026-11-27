import { useState } from 'react';
import {
  Pagination as SparPagination,
  PaginationEllipsis as SparPaginationEllipsis,
  PaginationFirst as SparPaginationFirst,
  PaginationItem as SparPaginationItem,
  PaginationLast as SparPaginationLast,
  PaginationNext as SparPaginationNext,
  PaginationPrevious as SparPaginationPrevious,
  usePaginationContext,
} from '@turkish-technology/spar';
import { ChevronLeftIconOutlinedRounded } from '@takeoff-icons/react/chevron-left';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';
import { DoubleChevronLeftIconOutlinedRounded } from '@takeoff-icons/react/double-chevron-left';
import { DoubleChevronRightIconOutlinedRounded } from '@takeoff-icons/react/double-chevron-right';
import { Button } from '../button';
import { Input } from '../input';
import { Select } from '../select';
import { formatLabel } from '../../utils';

import { useTableContext } from './context';
import type { TableLabels } from './types';

// The page buttons read the visible range from the Spar root, so the window
// (one sibling each side, first and last always shown) is computed once.
const TablePaginationPages = ({ labels }: { labels: TableLabels }) => {
  const { items, page: currentPage } = usePaginationContext();
  return items.map(item => {
    if (typeof item !== 'number') return <SparPaginationEllipsis key={item} />;
    const current = item === currentPage;
    return (
      <SparPaginationItem
        key={item}
        as={Button}
        page={item}
        size="small"
        variant="neutral"
        appearance={current ? 'outlined' : 'text'}
        aria-label={formatLabel(current ? labels.currentPageButton : labels.pageButton, { page: item })}
      >
        {item}
      </SparPaginationItem>
    );
  });
};

/**
 * Pagination controls — composed from Spar-derived v2 wrappers (RFC §4): a
 * `Select` for page size and `Button`s for navigation, rendered through the
 * Spar Pagination primitive (TanStack owns the page, so it is controlled),
 * which owns the page range and the edge-disabled First/Previous/Next/Last.
 * Lives outside the `<table>` so it carries no table semantics.
 */
export const TablePagination = () => {
  const { table, slotAttrs, pageSizeOptions, labels } = useTableContext('Table.Pagination');
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const [pageInput, setPageInput] = useState('');

  const totalRows = table.getRowCount();
  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalRows);
  const itemsLabel = totalRows === 0 ? formatLabel(labels.noItems, { total: 0 }) : formatLabel(labels.itemsRange, { start: startItem, end: endItem, total: totalRows });

  // The active `pageSize` can come from a `pagination.pageSize` prop that isn't
  // one of `pageSizeOptions`. Fold it in (sorted) so the Select always has a
  // matching item for its current value instead of rendering an unselectable
  // mismatch.
  const sizeOptions = pageSizeOptions.includes(pageSize) ? pageSizeOptions : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

  const goToPage = () => {
    const requestedPage = Number(pageInput);
    if (!Number.isFinite(requestedPage) || pageCount <= 0 || pageInput === '') return;
    const targetPage = Math.min(Math.max(Math.trunc(requestedPage), 1), pageCount);
    table.setPageIndex(targetPage - 1);
    setPageInput('');
  };

  return (
    <SparPagination
      as="div"
      {...slotAttrs('pagination')}
      role="navigation"
      aria-label={labels.paginationLandmark}
      page={pageIndex + 1}
      onPageChange={page => table.setPageIndex(page - 1)}
      pageCount={pageCount}
    >
      <div {...slotAttrs('paginationInfo')}>
        <span aria-live="polite">{formatLabel(pageCount > 0 ? labels.pageStatus : labels.pageStatusUnknown, { page: pageIndex + 1, pageCount })}</span>
        <span aria-live="polite">{itemsLabel}</span>
      </div>
      <div {...slotAttrs('paginationNav')}>
        <SparPaginationFirst as={Button} size="small" variant="neutral" appearance="text" aria-label={labels.firstPage} startContent={<DoubleChevronLeftIconOutlinedRounded />} />
        <SparPaginationPrevious as={Button} size="small" variant="neutral" appearance="text" aria-label={labels.previousPage} startContent={<ChevronLeftIconOutlinedRounded />} />
        <TablePaginationPages labels={labels} />
        <SparPaginationNext as={Button} size="small" variant="neutral" appearance="text" aria-label={labels.nextPage} startContent={<ChevronRightIconOutlinedRounded />} />
        <SparPaginationLast as={Button} size="small" variant="neutral" appearance="text" aria-label={labels.lastPage} startContent={<DoubleChevronRightIconOutlinedRounded />} />
      </div>
      <div {...slotAttrs('paginationActions')}>
        <div {...slotAttrs('paginationSize')}>
          <Select size="small" value={String(pageSize)} onChange={value => table.setPageSize(Number(value))}>
            <Select.Trigger aria-label={labels.rowsPerPage}>{pageSize}</Select.Trigger>
            <Select.Content>
              {sizeOptions.map(option => (
                <Select.Item key={option} value={String(option)}>
                  {option}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div {...slotAttrs('paginationGoToPage')}>
          <Input size="small">
            <Input.Field
              type="number"
              min={1}
              max={Math.max(pageCount, 1)}
              inputMode="numeric"
              aria-label={labels.pageJumpInput}
              placeholder={String(pageIndex + 1)}
              value={pageInput}
              disabled={pageCount <= 0}
              onChange={event => setPageInput(event.currentTarget.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') goToPage();
              }}
            />
            {/* A focusable submit, so a Button in the input's action hook rather than
                Input.TrailingIcon, which is decorative and hides itself. */}
            <Button
              classNames={{ root: 'tk-input-action' }}
              type="button"
              appearance="text"
              rounded
              size="small"
              aria-label={labels.pageJumpSubmit}
              disabled={pageCount <= 0}
              onClick={goToPage}
              startContent={<ChevronRightIconOutlinedRounded />}
            />
          </Input>
        </div>
      </div>
    </SparPagination>
  );
};

TablePagination.displayName = 'Table.Pagination';
