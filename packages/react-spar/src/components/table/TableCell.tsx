import { flexRender, type Cell } from '@tanstack/react-table';

import { useTableContext } from './context';
import { resolveCellWidth, resolveStickyCell } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCell = Cell<any, unknown>;

/**
 * One data `<td>`. Renders the column's `cell` render-prop. Every column carries
 * an explicit cell — the consumer's, or our object-safe default (see
 * `toTanStackColumns`) — so `flexRender` always has one. Container concerns
 * (align, sticky, width) are Table-owned.
 */
export const TableCell = ({ cell }: { cell: AnyCell }) => {
  const { slotAttrs, stickyLayout, stickyHeader } = useTableContext('Table.Cell');
  const column = cell.column;
  const meta = column.columnDef.meta;

  const sticky = resolveStickyCell(stickyLayout, column.id, { isHeader: false, stickyHeader });
  const attrs = slotAttrs('cell', { className: meta?.className });

  const content = flexRender(column.columnDef.cell, cell.getContext());

  return (
    <td {...attrs} data-align={meta?.align} data-sticky={sticky.dataSticky} style={{ ...attrs.style, ...sticky.style, ...resolveCellWidth(column, stickyLayout) }}>
      {content}
    </td>
  );
};

TableCell.displayName = 'Table.Cell';
