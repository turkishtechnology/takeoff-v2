import type { CSSProperties } from 'react';
import type { Row } from '@tanstack/react-table';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';

import { Checkbox } from '../checkbox';
import { Radio } from '../radio';

import { useTableContext } from './context';
import { UTILITY_COLUMN_WIDTH } from './defaults';
import { EXPAND_COLUMN_KEY, resolveStickyCell, SELECTION_COLUMN_KEY, visuallyHidden } from './helpers';

const mergeStyle = (...styles: (CSSProperties | undefined)[]): CSSProperties => Object.assign({}, ...styles);

// ── Selection ───────────────────────────────────────────────────────────────

export const SelectionHeaderCell = () => {
  const { table, slotAttrs, selectionMode, stickyLayout, stickyHeader, labels } = useTableContext('Table.SelectionHeaderCell');
  const sticky = resolveStickyCell(stickyLayout, SELECTION_COLUMN_KEY, { isHeader: true, stickyHeader });
  const attrs = slotAttrs('selectionCell');
  const allSelected = table.getIsAllPageRowsSelected();

  return (
    <th {...attrs} scope="col" data-sticky={sticky.dataSticky} data-selection-mode={selectionMode} style={mergeStyle(attrs.style, sticky.style, { width: UTILITY_COLUMN_WIDTH })}>
      {/* Select-all is a multi-select concept only (RFC §5). Single mode still
          names the column, or the header reads as empty. */}
      {selectionMode === 'multiple' ? (
        <Checkbox
          aria-label={labels.selectAllRows}
          checked={allSelected}
          indeterminate={table.getIsSomePageRowsSelected() && !allSelected}
          onChange={checked => table.toggleAllPageRowsSelected(checked)}
        >
          <Checkbox.Indicator />
        </Checkbox>
      ) : (
        <span style={visuallyHidden}>{labels.rowSelection}</span>
      )}
    </th>
  );
};

SelectionHeaderCell.displayName = 'Table.SelectionHeaderCell';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SelectionBodyCell = ({ row }: { row: Row<any> }) => {
  const { slotAttrs, selectionMode, stickyLayout, stickyHeader, labels } = useTableContext('Table.SelectionBodyCell');
  const sticky = resolveStickyCell(stickyLayout, SELECTION_COLUMN_KEY, { isHeader: false, stickyHeader });
  const attrs = slotAttrs('selectionCell');

  return (
    <td {...attrs} data-sticky={sticky.dataSticky} data-selection-mode={selectionMode} style={mergeStyle(attrs.style, sticky.style, { width: UTILITY_COLUMN_WIDTH })}>
      {/* Single mode = mutually-exclusive choice → Radio (role=radio); multiple
          = independent toggles → Checkbox. TanStack's enableMultiRowSelection
          already caps single mode to one row (RFC §2.3, types.ts contract).

          TODO(a11y, separate PR): single mode renders one 1-item Radio group per
          row, so each control reads as "1 of 1" and arrow keys can't move
          between rows; selection also can't be cleared within its own group.
          Move to a single table-wide radio group (one `name`, arrow-navigable)
          so the rows form one logical radiogroup. Tracked off PR #120 review.

          The name sits on the radio, which is what gets announced, not on its
          group. */}
      {selectionMode === 'single' ? (
        <Radio value={row.getIsSelected() ? row.id : ''} onChange={() => row.toggleSelected(true)}>
          <Radio.Item value={row.id} aria-label={labels.selectRow} disabled={!row.getCanSelect()}>
            <Radio.Indicator />
          </Radio.Item>
        </Radio>
      ) : (
        <Checkbox aria-label={labels.selectRow} checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={checked => row.toggleSelected(checked)}>
          <Checkbox.Indicator />
        </Checkbox>
      )}
    </td>
  );
};

SelectionBodyCell.displayName = 'Table.SelectionBodyCell';

// ── Expansion ────────────────────────────────────────────────────────────────

export const ExpandHeaderCell = () => {
  const { slotAttrs, stickyLayout, stickyHeader, labels } = useTableContext('Table.ExpandHeaderCell');
  const sticky = resolveStickyCell(stickyLayout, EXPAND_COLUMN_KEY, { isHeader: true, stickyHeader });
  const attrs = slotAttrs('expandCell');

  return (
    <th {...attrs} scope="col" data-sticky={sticky.dataSticky} style={mergeStyle(attrs.style, sticky.style, { width: UTILITY_COLUMN_WIDTH })}>
      <span style={visuallyHidden}>{labels.rowDetails}</span>
    </th>
  );
};

ExpandHeaderCell.displayName = 'Table.ExpandHeaderCell';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ExpandBodyCell = ({ row }: { row: Row<any> }) => {
  const { slotAttrs, stickyLayout, stickyHeader, labels } = useTableContext('Table.ExpandBodyCell');
  const sticky = resolveStickyCell(stickyLayout, EXPAND_COLUMN_KEY, { isHeader: false, stickyHeader });
  const attrs = slotAttrs('expandCell');
  const expanded = row.getIsExpanded();

  return (
    <td {...attrs} data-sticky={sticky.dataSticky} style={mergeStyle(attrs.style, sticky.style, { width: UTILITY_COLUMN_WIDTH })}>
      {row.getCanExpand() && (
        <button
          {...slotAttrs('expandButton')}
          type="button"
          aria-label={expanded ? labels.collapseRow : labels.expandRow}
          aria-expanded={expanded}
          onClick={row.getToggleExpandedHandler()}
        >
          {expanded ? <ChevronBottomIconOutlinedRounded /> : <ChevronRightIconOutlinedRounded />}
        </button>
      )}
    </td>
  );
};

ExpandBodyCell.displayName = 'Table.ExpandBodyCell';
