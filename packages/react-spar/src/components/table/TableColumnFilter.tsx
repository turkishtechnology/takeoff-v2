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
import { isEmptyFilterValue } from './helpers';
import type { TableColumnFilter as TableColumnFilterConfig, TableColumnFilterContext, TableColumnFilterOption } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHeader = Header<any, unknown>;

// Default "is this filter applied?" heuristic when neither a preset nor the
// column supplies its own `isActive`. A filter is active exactly when its value
// is not the "clears the filter" empty value — the inverse of the matching
// predicates' `autoRemove`.
const defaultIsActive = (value: unknown): boolean => !isEmptyFilterValue(value);

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
  // The panel node is held in state (not a ref) because it is the portal
  // `container` for the `select` preset's listbox, and that prop is read during
  // render — a ref would still be `null` on the render that mounts the panel.
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
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
  // `data-slot="root"`), so the Table `data-slot` is dropped from the trigger
  // attrs — but the class and the theme/instance `classNames.filterButton` /
  // `slotProps.filterButton` layers still go through `slotAttrs`, like every
  // other slot. The panel wrapper IS a Table-owned slot node.
  const { 'data-slot': _filterButtonSlot, ...filterButtonAttrs } = slotAttrs('filterButton');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger aria-label="Filter column" {...filterButtonAttrs} data-active={active ? '' : undefined}>
        <SearchIconOutlinedRounded aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Content className="tk-table-filter-panel">
        <div {...slotAttrs('filterPanel')} ref={setPanel}>
          {filter.render ? filter.render(ctx) : <PresetFilterControl filter={filter} ctx={ctx} container={panel} />}
        </div>
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
const PresetFilterControl = ({ filter, ctx, container }: { filter: TableColumnFilterConfig; ctx: TableColumnFilterContext; container: HTMLElement | null }) => {
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
    return (
      <SelectFilter
        options={options}
        placeholder={placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={next => setValue(next || undefined)}
        container={container}
      />
    );
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
  container,
}: {
  options: TableColumnFilterOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  container: HTMLElement | null;
}) => {
  const selected = options.find(option => option.value === value);
  // The listbox is portalled INTO the filter panel rather than `document.body`.
  // Spar's Popover treats any pointer-down or focus outside its content node as
  // a dismiss, and the focus path cannot be vetoed (`focusin` is not
  // cancelable), so a body-portalled listbox closed the popover the moment the
  // Select opened and focused it. Keeping the listbox inside the panel makes it
  // an "inside" interaction with no wrapper-side dismiss logic.
  return (
    <Select value={value} onChange={onChange}>
      <Select.Trigger>{selected ? selected.label : (placeholder ?? 'Select')}</Select.Trigger>
      <Select.Content container={container}>
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
