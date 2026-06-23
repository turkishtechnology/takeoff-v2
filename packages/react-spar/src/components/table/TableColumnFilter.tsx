import type { ChangeEvent } from 'react';
import type { Header } from '@tanstack/react-table';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Popover } from '../popover';
import { Radio } from '../radio';

import { useTableContext } from './context';
import type { TableColumnFilter as TableColumnFilterConfig } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHeader = Header<any, unknown>;

const isActive = (value: unknown): boolean => (Array.isArray(value) ? value.length > 0 : value != null && value !== '');

/**
 * Header filter control rendered inside a Spar `Popover` — the correct fix for
 * the legacy sticky-cell z-index bug (a real React portal, not a `document.body`
 * `createElement` hack; RFC §2.3, §6.5). Phase 1 ships text / checkbox / radio
 * controls (RFC §7 Q3), composed from existing v2 wrappers.
 */
export const TableColumnFilter = ({ header }: { header: AnyHeader }) => {
  const column = header.column;
  const filter = column.columnDef.meta?.filter as TableColumnFilterConfig | undefined;
  if (!filter) return null;

  const value = column.getFilterValue();

  // `Popover.Trigger` / `Popover.Content` are the owner nodes here — each runs
  // its own `composeRootAttrs` and emits `data-slot="root"`, so a Table
  // `data-slot` cannot ride along. We style them by class instead of inventing
  // a slot anchor that would never reach the DOM (data-attribute-vocabulary
  // rules 3/4). The filter controls inside remain Table-owned slot nodes.
  return (
    <Popover>
      <Popover.Trigger className="tk-table-filter-button" aria-label="Filter column" data-active={isActive(value) ? '' : undefined}>
        <span aria-hidden="true">⏷</span>
      </Popover.Trigger>
      <Popover.Content className="tk-table-filter-panel">
        <TableFilterControl filter={filter} column={column} />
        <Button size="small" appearance="text" onClick={() => column.setFilterValue(undefined)}>
          Clear
        </Button>
      </Popover.Content>
    </Popover>
  );
};

TableColumnFilter.displayName = 'Table.ColumnFilter';

const TableFilterControl = ({ filter, column }: { filter: TableColumnFilterConfig; column: AnyHeader['column'] }) => {
  const { slotAttrs } = useTableContext('Table.FilterControl');
  const value = column.getFilterValue();

  if (filter.type === 'text') {
    return (
      <input
        {...slotAttrs('filterInput')}
        type="search"
        placeholder={filter.placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(event: ChangeEvent<HTMLInputElement>) => column.setFilterValue(event.target.value || undefined)}
      />
    );
  }

  const options = filter.options ?? [];

  if (filter.type === 'radio') {
    return (
      <Radio value={typeof value === 'string' ? value : ''} onChange={next => column.setFilterValue(next || undefined)}>
        {options.map(option => (
          <Radio.Item key={option.value} value={option.value}>
            <Radio.Label>{option.label}</Radio.Label>
          </Radio.Item>
        ))}
      </Radio>
    );
  }

  // checkbox — faceted multi-select. The filter value is a `string[]`.
  const selected = Array.isArray(value) ? (value as string[]) : [];
  return (
    <>
      {options.map(option => {
        const checked = selected.includes(option.value);
        return (
          <label key={option.value} {...slotAttrs('filterOption')}>
            <Checkbox
              checked={checked}
              onChange={next => {
                const updated = next ? [...selected, option.value] : selected.filter(item => item !== option.value);
                column.setFilterValue(updated.length ? updated : undefined);
              }}
            >
              <Checkbox.Indicator />
            </Checkbox>
            {option.label}
          </label>
        );
      })}
    </>
  );
};

TableFilterControl.displayName = 'Table.FilterControl';
