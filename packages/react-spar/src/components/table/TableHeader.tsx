import { useTableContext } from './context';
import { TableHeaderCell } from './TableHeaderCell';
import { ExpandHeaderCell, SelectionHeaderCell } from './TableUtilityCells';

/**
 * `<thead>` + header rows. Leading utility cells (selection, then expand)
 * mirror the body row order so columns line up under sticky offsets.
 */
export const TableHeader = () => {
  const { table, slotAttrs, hasSelection, hasExpansion } = useTableContext('Table.Header');

  return (
    <thead {...slotAttrs('header')}>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id} {...slotAttrs('headerRow')}>
          {hasSelection && <SelectionHeaderCell />}
          {hasExpansion && <ExpandHeaderCell />}
          {headerGroup.headers.map(header => (
            <TableHeaderCell key={header.id} header={header} />
          ))}
        </tr>
      ))}
    </thead>
  );
};

TableHeader.displayName = 'Table.Header';
