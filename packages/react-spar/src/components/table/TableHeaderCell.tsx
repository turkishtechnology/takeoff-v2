import { useCallback } from 'react';
import { flexRender, type Header } from '@tanstack/react-table';
import { ArrowBottomIconOutlinedRounded } from '@takeoff-icons/react/arrow-bottom';
import { ArrowTopIconOutlinedRounded } from '@takeoff-icons/react/arrow-top';
import { SwapIconOutlinedRounded } from '@takeoff-icons/react/swap';

import { useTableContext } from './context';
import { resolveCellWidth, resolveStickyCell } from './helpers';
import { TableColumnFilter } from './TableColumnFilter';
import { TableResizeHandle } from './TableResizeHandle';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHeader = Header<any, unknown>;

/**
 * One data `<th>`. Table owns the cell **container** (scope, align, sticky,
 * sort affordance, `aria-sort`); the column's `header` render-prop only
 * supplies the content (RFC §3.1, §3.4). The sortable header is a real
 * `<button>` so Enter/Space toggle sorting natively (RFC §3.5).
 */
export const TableHeaderCell = ({ header }: { header: AnyHeader }) => {
  const { table, slotAttrs, stickyLayout, stickyHeader, fixedLayout, absorberColumnId, resizeMode, columnResizing } = useTableContext('Table.HeaderCell');
  const column = header.column;
  const meta = column.columnDef.meta;
  const align = meta?.headerAlign ?? meta?.align;
  const canSort = column.getCanSort();
  const canFilter = column.getCanFilter() && !!meta?.filter;
  const sorted = column.getIsSorted();
  // The handle sits on the edge that faces the absorber, the column that
  // takes up the slack: a column before it grows toward the inline end (handle
  // on its end edge), one after it toward the inline start (handle on its
  // start edge), so the edge under the pointer is always the one that moves.
  // The absorber itself has none. Without an absorber the last column has
  // none either in `fit` mode (every column pinned: its end edge is the
  // table's), but does in `expand` mode, where dragging it widens the table.
  const visibleColumns = table.getVisibleLeafColumns();
  const index = visibleColumns.findIndex(candidate => candidate.id === column.id);
  const absorberIndex = absorberColumnId == null ? -1 : visibleColumns.findIndex(candidate => candidate.id === absorberColumnId);
  const edge = absorberIndex >= 0 && index > absorberIndex ? 'start' : 'end';
  const canResize = !!columnResizing && column.getCanResize() && index !== absorberIndex && (edge === 'start' || resizeMode === 'expand' || index !== visibleColumns.length - 1);
  const registerHeaderCell = columnResizing?.registerHeaderCell;
  const headerCellRef = useCallback((element: HTMLTableCellElement | null) => registerHeaderCell?.(column.id, element), [registerHeaderCell, column.id]);

  const sticky = resolveStickyCell(stickyLayout, column.id, { isHeader: true, stickyHeader });
  const attrs = slotAttrs('headerCell', { className: meta?.headerClassName });

  const ariaSort = canSort ? (sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none') : undefined;
  // Wrapped so a header narrower than its text truncates with an ellipsis (a
  // bare text node inside the flex header can't).
  const content = header.isPlaceholder ? null : <span {...slotAttrs('headerLabel')}>{flexRender(column.columnDef.header, header.getContext())}</span>;

  return (
    <th
      {...attrs}
      ref={registerHeaderCell ? headerCellRef : undefined}
      scope="col"
      colSpan={header.colSpan}
      aria-sort={ariaSort}
      data-align={align}
      data-sticky={sticky.dataSticky}
      data-sortable={canSort ? '' : undefined}
      style={{ ...attrs.style, ...sticky.style, ...resolveCellWidth(column, stickyLayout, fixedLayout, absorberColumnId) }}
    >
      <div {...slotAttrs('headerContent')}>
        {canSort ? (
          <button {...slotAttrs('sortTrigger')} type="button" onClick={column.getToggleSortingHandler()}>
            {content}
            <span {...slotAttrs('sortIcon')} data-direction={sorted || 'none'} aria-hidden="true">
              {sorted === 'asc' ? <ArrowTopIconOutlinedRounded /> : sorted === 'desc' ? <ArrowBottomIconOutlinedRounded /> : <SwapIconOutlinedRounded />}
            </span>
          </button>
        ) : (
          content
        )}
        {canFilter && <TableColumnFilter header={header} />}
      </div>
      {canResize && <TableResizeHandle column={column} edge={edge} />}
    </th>
  );
};

TableHeaderCell.displayName = 'Table.HeaderCell';
