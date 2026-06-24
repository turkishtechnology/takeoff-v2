import { flexRender, type Header } from '@tanstack/react-table';

import { PlaceholderChevronDown, PlaceholderChevronsUpDown, PlaceholderChevronUp } from '../../icons';

import { useTableContext } from './context';
import { resolveStickyCell } from './helpers';
import { TableColumnFilter } from './TableColumnFilter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHeader = Header<any, unknown>;

/**
 * One data `<th>`. Table owns the cell **container** (scope, align, sticky,
 * sort affordance, `aria-sort`); the column's `header` render-prop only
 * supplies the content (RFC §3.1, §3.4). The sortable header is a real
 * `<button>` so Enter/Space toggle sorting natively (RFC §3.5).
 */
export const TableHeaderCell = ({ header }: { header: AnyHeader }) => {
  const { slotAttrs, stickyLayout, stickyHeader } = useTableContext('Table.HeaderCell');
  const column = header.column;
  const meta = column.columnDef.meta;
  const align = meta?.headerAlign ?? meta?.align;
  const canSort = column.getCanSort();
  const canFilter = column.getCanFilter() && !!meta?.filter;
  const sorted = column.getIsSorted();

  const sticky = resolveStickyCell(stickyLayout, column.id, { isHeader: true, stickyHeader });
  const hasWidth = meta?.width != null || stickyLayout.has(column.id);
  const attrs = slotAttrs('headerCell', { className: meta?.headerClassName });

  const ariaSort = canSort ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined;
  const content = header.isPlaceholder ? null : flexRender(column.columnDef.header, header.getContext());

  return (
    <th
      {...attrs}
      scope="col"
      colSpan={header.colSpan}
      aria-sort={ariaSort}
      data-align={align}
      data-sticky={sticky.dataSticky}
      data-sortable={canSort ? '' : undefined}
      style={{ ...attrs.style, ...sticky.style, ...(hasWidth ? { width: column.getSize() } : undefined) }}
    >
      <div {...slotAttrs('headerContent')}>
        {canSort ? (
          <button {...slotAttrs('sortTrigger')} type="button" onClick={column.getToggleSortingHandler()}>
            {content}
            <span {...slotAttrs('sortIcon')} data-direction={sorted || 'none'} aria-hidden="true">
              {sorted === 'asc' ? <PlaceholderChevronUp /> : sorted === 'desc' ? <PlaceholderChevronDown /> : <PlaceholderChevronsUpDown />}
            </span>
          </button>
        ) : (
          content
        )}
        {canFilter && <TableColumnFilter header={header} />}
      </div>
    </th>
  );
};

TableHeaderCell.displayName = 'Table.HeaderCell';
