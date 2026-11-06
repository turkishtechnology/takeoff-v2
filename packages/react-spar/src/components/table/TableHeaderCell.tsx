import { useCallback, useSyncExternalStore } from 'react';
import { flexRender, type Header } from '@tanstack/react-table';
import { ArrowBottomIconOutlinedRounded } from '@takeoff-icons/react/arrow-bottom';
import { ArrowTopIconOutlinedRounded } from '@takeoff-icons/react/arrow-top';
import { SwapIconOutlinedRounded } from '@takeoff-icons/react/swap';

import { useTableContext } from './context';
import { getDraftWidth, resolveCellWidth, resolveStickyCell } from './helpers';
import { TableColumnFilter } from './TableColumnFilter';
import { TableResizeHandle } from './TableResizeHandle';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHeader = Header<any, unknown>;

const subscribeNothing = () => () => {};

/**
 * One data `<th>`. Table owns the cell **container** (scope, align, sticky,
 * sort affordance, `aria-sort`); the column's `header` render-prop only
 * supplies the content (RFC §3.1, §3.4). The sortable header is a real
 * `<button>` so Enter/Space toggle sorting natively (RFC §3.5).
 */
export const TableHeaderCell = ({ header }: { header: AnyHeader }) => {
  const { slotAttrs, stickyLayout, stickyHeader, fixedLayout, absorberColumnId, resizeEdges, columnResizing } = useTableContext('Table.HeaderCell');
  const column = header.column;
  const meta = column.columnDef.meta;
  const align = meta?.headerAlign ?? meta?.align;
  const canSort = column.getCanSort();
  const canFilter = column.getCanFilter() && !!meta?.filter;
  const sorted = column.getIsSorted();
  // Which edge the handle sits on, if any (see `resizeEdges` in Table).
  const edge = columnResizing ? resizeEdges?.get(column.id) : undefined;
  // A later move of a drag draws this cell's width from the live draft, so
  // only the cells it changes re-render.
  const liveDraft = columnResizing?.liveDraft;
  const liveWidth = useSyncExternalStore(liveDraft?.subscribe ?? subscribeNothing, () => {
    const live = liveDraft?.get();
    // The absorber stays auto even when a width is stored for it.
    return live && column.id !== absorberColumnId ? getDraftWidth(live.draft, column.id) : undefined;
  });
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
      style={{ ...attrs.style, ...sticky.style, ...(liveWidth != null ? { width: liveWidth } : resolveCellWidth(column, stickyLayout, fixedLayout, absorberColumnId)) }}
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
      {edge && <TableResizeHandle column={column} edge={edge} />}
    </th>
  );
};

TableHeaderCell.displayName = 'Table.HeaderCell';
