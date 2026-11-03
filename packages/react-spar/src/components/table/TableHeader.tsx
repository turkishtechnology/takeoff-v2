import { useTableContext } from './context';
import { getFillerIndex } from './helpers';
import { TableHeaderCell } from './TableHeaderCell';
import { ExpandHeaderCell, SelectionHeaderCell, withFiller } from './TableUtilityCells';

/**
 * `<thead>` + header rows. Leading utility cells (selection, then expand)
 * mirror the body row order so columns line up under sticky offsets.
 */
export const TableHeader = () => {
  const { table, slotAttrs, hasSelection, hasExpansion, fixedLayout } = useTableContext('Table.Header');

  return (
    <thead {...slotAttrs('header')}>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id} {...slotAttrs('headerRow')}>
          {hasSelection && <SelectionHeaderCell />}
          {hasExpansion && <ExpandHeaderCell />}
          {withFiller(
            headerGroup.headers.map(header => <TableHeaderCell key={header.id} header={header} />),
            fixedLayout ? getFillerIndex(headerGroup.headers.map(header => header.column)) : -1,
          )}
        </tr>
      ))}
    </thead>
  );
};

TableHeader.displayName = 'Table.Header';
