import { useId, useState, type ChangeEvent } from 'react';
import type { Header } from '@tanstack/react-table';
import { SearchIconOutlinedRounded } from '@takeoff-icons/react/search';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Input } from '../input';
import { Popover } from '../popover';
import { Radio } from '../radio';
import { Select } from '../select';

import { useTableContext } from './context';
import { formatLabel, isEmptyFilterValue, visuallyHidden } from './helpers';
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
  const { slotAttrs, labels } = useTableContext('Table.ColumnFilter');
  const [open, setOpen] = useState(false);
  // The panel node is held in state (not a ref) because it is the portal
  // `container` for the `select` preset's listbox, and that prop is read during
  // render — a ref would still be `null` on the render that mounts the panel.
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const column = header.column;
  // `meta.filter` is normalized to an object upstream (string presets too).
  const filter = column.columnDef.meta?.filter as TableColumnFilterConfig | undefined;
  if (!filter) return null;

  // `{column}` in the filter labels: the header text, or the id when the
  // header is empty, a node or a render function.
  const headerText = typeof column.columnDef.header === 'string' ? column.columnDef.header.trim() : '';
  const columnName = headerText || column.id;
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
  // other slot. The name comes only from `labels`, so it is set after the
  // spread. The panel wrapper IS a Table-owned slot node.
  const { 'data-slot': _filterButtonSlot, ...filterButtonAttrs } = slotAttrs('filterButton');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger {...filterButtonAttrs} aria-label={formatLabel(labels.filterButton, { column: columnName })} data-active={active ? '' : undefined}>
        <SearchIconOutlinedRounded aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Content className="tk-table-filter-panel">
        <div {...slotAttrs('filterPanel')} ref={setPanel}>
          {filter.render ? (
            filter.render(ctx)
          ) : (
            <PresetFilterControl
              filter={filter}
              ctx={ctx}
              container={panel}
              fieldLabel={formatLabel(labels.filterValue, { column: columnName })}
              selectPlaceholder={labels.filterSelectPlaceholder}
            />
          )}
        </div>
        {active && (
          <Button size="small" appearance="text" onClick={ctx.clear}>
            {labels.filterClear}
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
const PresetFilterControl = ({
  filter,
  ctx,
  container,
  fieldLabel,
  selectPlaceholder,
}: {
  filter: TableColumnFilterConfig;
  ctx: TableColumnFilterContext;
  container: HTMLElement | null;
  fieldLabel: string;
  selectPlaceholder: string;
}) => {
  const { type, options = [], placeholder } = filter;
  const { value, setValue } = ctx;

  if (type === 'text') {
    return (
      <Input>
        <Input.Field
          type="search"
          // Always the per-column `filterValue`, so names stay unique when
          // placeholders repeat; the placeholder remains a visible hint.
          aria-label={fieldLabel}
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
        label={fieldLabel}
        placeholder={placeholder || selectPlaceholder}
        value={typeof value === 'string' ? value : ''}
        onChange={next => setValue(next || undefined)}
        container={container}
      />
    );
  }

  if (type === 'radio') {
    return (
      <Radio aria-label={fieldLabel} value={typeof value === 'string' ? value : ''} onChange={next => setValue(next || undefined)}>
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
    return <CheckboxListFilter label={fieldLabel} options={options} value={Array.isArray(value) ? (value as string[]) : []} onChange={setValue} />;
  }

  return null;
};

PresetFilterControl.displayName = 'Table.PresetFilterControl';

const SelectFilter = ({
  options,
  label,
  placeholder,
  value,
  onChange,
  container,
}: {
  options: TableColumnFilterOption[];
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  container: HTMLElement | null;
}) => {
  const selected = options.find(option => option.value === value);
  const labelId = useId();
  const valueId = useId();
  // The listbox is portalled INTO the filter panel rather than `document.body`.
  // Spar's Popover treats any pointer-down or focus outside its content node as
  // a dismiss, and the focus path cannot be vetoed (`focusin` is not
  // cancelable), so a body-portalled listbox closed the popover the moment the
  // Select opened and focused it. Keeping the listbox inside the panel makes it
  // an "inside" interaction with no wrapper-side dismiss logic.
  //
  // The trigger is named by the hidden column label plus its own visible text,
  // so the name always contains what is shown (WCAG 2.5.3, label in name).
  return (
    <Select value={value} onChange={onChange}>
      <span id={labelId} style={visuallyHidden}>
        {label}
      </span>
      {/* Spar's trigger forwards a consumer `aria-labelledby` as-is (covered
          by the Table filter tests), so the hidden label and value span name it. */}
      <Select.Trigger aria-labelledby={`${labelId} ${valueId}`}>
        <span id={valueId}>{selected ? selected.label : placeholder}</span>
      </Select.Trigger>
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

const CheckboxListFilter = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: TableColumnFilterOption[];
  value: string[];
  onChange: (value: string[] | undefined) => void;
}) => (
  // A named group; `tk-table-filter-options` stacks the options like the panel body.
  <div role="group" aria-label={label} className="tk-table-filter-options">
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
  </div>
);
