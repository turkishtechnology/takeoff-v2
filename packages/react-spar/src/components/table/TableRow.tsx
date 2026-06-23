import { Fragment } from 'react';
import type { Row } from '@tanstack/react-table';

import { useTableContext } from './context';
import { TableCell } from './TableCell';
import { ExpandBodyCell, SelectionBodyCell } from './TableUtilityCells';

/**
 * One body `<tr>`, plus its disclosure `<tr>` when expanded. The expanded row
 * spans every column and renders `expansion.render(row.original)`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TableRow = ({ row }: { row: Row<any> }) => {
  const { slotAttrs, hasSelection, hasExpansion, expansionRender, totalColumnCount } = useTableContext('Table.Row');
  const selected = row.getIsSelected();

  return (
    <Fragment>
      <tr {...slotAttrs('row')} data-selected={selected ? '' : undefined}>
        {hasSelection && <SelectionBodyCell row={row} />}
        {hasExpansion && <ExpandBodyCell row={row} />}
        {row.getVisibleCells().map(cell => (
          <TableCell key={cell.id} cell={cell} />
        ))}
      </tr>
      {hasExpansion && expansionRender && row.getIsExpanded() && (
        <tr {...slotAttrs('expandedRow')}>
          <td colSpan={totalColumnCount}>{expansionRender(row.original)}</td>
        </tr>
      )}
    </Fragment>
  );
};

TableRow.displayName = 'Table.Row';
