import { useState, type ChangeEvent } from 'react';
import type { Header } from '@tanstack/react-table';
import { SearchIconOutlinedRounded } from '@takeoff-icons/react/search';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Input } from '../input';
import { Popover } from '../popover';
import { Radio } from '../radio';
import { Select } from '../select';

import { useTableContext } from './context';
import type { TableColumnFilter as TableColumnFilterConfig, TableColumnFilterContext, TableColumnFilterOption } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHeader = Header<any, unknown>;

// Default "is this filter applied?" heuristic when neither a preset nor the
// column supplies its own `isActive`. Covers the common value shapes.
const defaultIsActive = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.length > 0;
  return value != null;
};

/**
 * Header filter control rendered inside a Spar `Popover`. **Two tiers**: a
 * column's `filter` is either a built-in preset (`type` + `options`) that Table
 * renders with v2 components, or a custom `render` escape hatch the consumer
 * owns entirely. Either way Table owns the plumbing — trigger, popover,
 * active-state dot, value wiring (RFC §2.3, §6.5; §7 Q3 revised). The Popover is
 * a real React portal, the correct fix for the legacy sticky-cell z-index bug.
 */
export const TableColumnFilter = ({ header }: { header: AnyHeader }) => {
  const { slotAttrs } = useTableContext('Table.ColumnFilter');
  const [open, setOpen] = useState(false);
  const column = header.column;
  // `meta.filter` is normalized to an object upstream (string presets too).
  const filter = column.columnDef.meta?.filter as TableColumnFilterConfig | undefined;
  if (!filter) return null;

  const value = column.getFilterValue();
  const active = (filter.isActive ?? defaultIsActive)(value);

  const ctx: TableColumnFilterContext = {
    value,
    setValue: next => column.setFilterValue(next),
    clear: () => column.setFilterValue(undefined),
    column,
    close: () => setOpen(false),
  };

  // `Popover.Trigger` / `Popover.Content` are owner nodes (each emits its own
  // `data-slot="root"`), so the Table `data-slot` can't ride along — the trigger
  // is styled by class. The panel wrapper IS a Table-owned slot node.
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="tk-table-filter-button" aria-label="Filter column" data-active={active ? '' : undefined}>
        <SearchIconOutlinedRounded aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Content className="tk-table-filter-panel">
        <div {...slotAttrs('filterPanel')}>{filter.render ? filter.render(ctx) : <PresetFilterControl filter={filter} ctx={ctx} />}</div>
        {active && (
          <Button size="small" appearance="text" onClick={ctx.clear}>
            Clear
          </Button>
        )}
      </Popover.Content>
    </Popover>
  );
};

TableColumnFilter.displayName = 'Table.ColumnFilter';

// ── Built-in preset controls ──────────────────────────────────────────────────

/**
 * Renders one of the declarative presets (`text` / `select` / `multi-select` /
 * `radio` / `checkbox`). The matching predicate is wired upstream in
 * `helpers.ts`; this only renders the v2 control and reads/writes the value.
 */
const PresetFilterControl = ({ filter, ctx }: { filter: TableColumnFilterConfig; ctx: TableColumnFilterContext }) => {
  const { type, options = [], placeholder } = filter;
  const { value, setValue } = ctx;

  if (type === 'text') {
    return (
      <Input>
        <Input.Field
          type="search"
          placeholder={placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value || undefined)}
        />
      </Input>
    );
  }

  if (type === 'select') {
    return <SelectFilter options={options} placeholder={placeholder} value={typeof value === 'string' ? value : ''} onChange={next => setValue(next || undefined)} />;
  }

  if (type === 'radio') {
    return (
      <Radio value={typeof value === 'string' ? value : ''} onChange={next => setValue(next || undefined)}>
        {options.map(option => (
          <Radio.Item key={option.value} value={option.value}>
            <Radio.Label>{option.label}</Radio.Label>
          </Radio.Item>
        ))}
      </Radio>
    );
  }

  // `checkbox` and `multi-select` are both multi-choice. Spar's Select has no
  // multi mode, so both render as a checkbox list (the value is a `string[]`).
  if (type === 'checkbox' || type === 'multi-select') {
    return <CheckboxListFilter options={options} value={Array.isArray(value) ? (value as string[]) : []} onChange={setValue} />;
  }

  return null;
};

PresetFilterControl.displayName = 'Table.PresetFilterControl';

const SelectFilter = ({
  options,
  placeholder,
  value,
  onChange,
}: {
  options: TableColumnFilterOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const selected = options.find(option => option.value === value);
  return (
    <Select value={value} onChange={onChange}>
      <Select.Trigger>{selected ? selected.label : (placeholder ?? 'Select')}</Select.Trigger>
      <Select.Content>
        {options.map(option => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

const CheckboxListFilter = ({ options, value, onChange }: { options: TableColumnFilterOption[]; value: string[]; onChange: (value: string[] | undefined) => void }) => (
  <>
    {options.map(option => {
      const checked = value.includes(option.value);
      return (
        <Checkbox
          key={option.value}
          checked={checked}
          onChange={next => {
            const updated = next ? [...value, option.value] : value.filter(item => item !== option.value);
            onChange(updated.length ? updated : undefined);
          }}
        >
          <Checkbox.Indicator />
          {option.label}
        </Checkbox>
      );
    })}
  </>
);
