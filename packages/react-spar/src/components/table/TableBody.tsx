import { useTableContext } from './context';
import { TableRow } from './TableRow';

/** `<tbody>` — rows, or a full-width empty-state cell when there are no rows. */
export const TableBody = () => {
  const { table, slotAttrs, totalColumnCount, emptyState, loading } = useTableContext('Table.Body');
  const rows = table.getRowModel().rows;

  return (
    <tbody {...slotAttrs('body')}>
      {rows.length === 0 ? (
        <tr {...slotAttrs('row')}>
          <td {...slotAttrs('empty')} colSpan={totalColumnCount}>
            {/* While loading, the overlay communicates state; suppress the
                empty copy so it does not flash "no data" mid-fetch. */}
            {loading ? null : (emptyState ?? 'No data')}
          </td>
        </tr>
      ) : (
        rows.map(row => <TableRow key={row.id} row={row} />)
      )}
    </tbody>
  );
};

TableBody.displayName = 'Table.Body';
