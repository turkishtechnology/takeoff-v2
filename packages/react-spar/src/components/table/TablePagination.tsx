import { PlaceholderChevronLeft, PlaceholderChevronRight, PlaceholderChevronsLeft, PlaceholderChevronsRight } from '../../icons';
import { Button } from '../button';
import { Select } from '../select';

import { useTableContext } from './context';

/**
 * Pagination controls — composed from Spar-derived v2 wrappers (RFC §4): a
 * `Select` for page size and `Button`s for navigation. Lives outside the
 * `<table>` so it carries no table semantics.
 */
export const TablePagination = () => {
  const { table, slotAttrs, pageSizeOptions } = useTableContext('Table.Pagination');
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div {...slotAttrs('pagination')} role="navigation" aria-label="Pagination">
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

      <span aria-live="polite">{pageCount > 0 ? `Page ${pageIndex + 1} of ${pageCount}` : `Page ${pageIndex + 1}`}</span>

      <Button size="small" appearance="text" aria-label="First page" startContent={<PlaceholderChevronsLeft />} disabled={!table.getCanPreviousPage()} onClick={() => table.setPageIndex(0)} />
      <Button size="small" appearance="text" aria-label="Previous page" startContent={<PlaceholderChevronLeft />} disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()} />
      <Button size="small" appearance="text" aria-label="Next page" startContent={<PlaceholderChevronRight />} disabled={!table.getCanNextPage() || pageCount <= 0} onClick={() => table.nextPage()} />
      <Button size="small" appearance="text" aria-label="Last page" startContent={<PlaceholderChevronsRight />} disabled={!table.getCanNextPage() || pageCount <= 0} onClick={() => table.setPageIndex(pageCount - 1)} />
    </div>
  );
};

TablePagination.displayName = 'Table.Pagination';
