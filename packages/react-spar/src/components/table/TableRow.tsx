import { Fragment } from 'react';
import type { Row } from '@tanstack/react-table';

import { useTableContext } from './context';
import { TableCell } from './TableCell';
import { ExpandBodyCell, SelectionBodyCell } from './TableUtilityCells';

/**
 * One body `<tr>`. In detail-panel mode it also renders a disclosure `<tr>` when
 * expanded — spanning every column and rendering `expansion.render(row.original)`.
 * In tree mode (`getSubRows`) the detail panel is suppressed: TanStack flattens
 * sub-rows into their own body `<tr>`s, so drawing a panel too would double the
 * expanded row.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TableRow = ({ row }: { row: Row<any> }) => {
  const { slotAttrs, hasSelection, hasExpansion, treeMode, expansionRender, totalColumnCount } = useTableContext('Table.Row');
  const selected = row.getIsSelected();

  // Detail panel only outside tree mode — the two expansion shapes are
  // mutually exclusive (sub-rows win).
  const showDetailPanel = hasExpansion && !treeMode && !!expansionRender && row.getIsExpanded();

  return (
    <Fragment>
      <tr {...slotAttrs('row')} data-selected={selected ? '' : undefined}>
        {hasSelection && <SelectionBodyCell row={row} />}
        {hasExpansion && <ExpandBodyCell row={row} />}
        {row.getVisibleCells().map(cell => (
          <TableCell key={cell.id} cell={cell} />
        ))}
      </tr>
      {showDetailPanel && (
        <tr {...slotAttrs('expandedRow')}>
          <td colSpan={totalColumnCount}>{expansionRender!(row.original)}</td>
        </tr>
      )}
    </Fragment>
  );
};

TableRow.displayName = 'Table.Row';
