import { useEffect, useId, useState, type ChangeEvent } from 'react';
import type { Header } from '@tanstack/react-table';
import { SearchIconOutlinedRounded } from '@takeoff-icons/react/search';

import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Input } from '../input';
import { Popover } from '../popover';
import { Radio } from '../radio';
import { Select } from '../select';
import { formatLabel, visuallyHidden } from '../../utils';

import { useTableContext, type SlotAttrs } from './context';
import { warnFilterLabelFallsBackToId, warnIgnoredFilterButtonName } from './devWarnings';
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
  const { slotAttrs, labels } = useTableContext('Table.ColumnFilter');
  const [open, setOpen] = useState(false);
  // The panel node is held in state (not a ref) because it is the portal
  // `container` for the `select` preset's listbox, and that prop is read during
  // render — a ref would still be `null` on the render that mounts the panel.
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const column = header.column;
  // `meta.filter` is normalized to an object upstream (string presets too).
  const filter = column.columnDef.meta?.filter as TableColumnFilterConfig | undefined;

  // `Popover.Trigger` / `Popover.Content` are owner nodes (each emits its own
  // `data-slot="root"`), so the Table `data-slot` is dropped from the trigger
  // attrs — but the class and the theme/instance `classNames.filterButton` /
  // `slotProps.filterButton` layers still go through `slotAttrs`, like every
  // other slot. The name comes only from `labels`: a slotProps `aria-label` or
  // `aria-labelledby` (which would outrank it) is dropped from the spread and
  // reported once in development. Read before the early return so the effect
  // runs unconditionally. The panel wrapper IS a Table-owned slot node.
  const { 'data-slot': _filterButtonSlot, 'aria-label': ignoredAriaLabel, 'aria-labelledby': ignoredAriaLabelledBy, ...filterButtonAttrs } = slotAttrs('filterButton');
  useEffect(() => warnIgnoredFilterButtonName(ignoredAriaLabel, ignoredAriaLabelledBy), [ignoredAriaLabel, ignoredAriaLabelledBy]);

  // `{column}` in the filter labels: `filter.label`, else the header text, else
  // the id (an empty, node or render-function header has no text to use).
  const headerText = typeof column.columnDef.header === 'string' ? column.columnDef.header.trim() : '';
  // `filter.label` is typed as a string but may come from loose data; guard it.
  const labelText = typeof filter?.label === 'string' ? filter.label.trim() : '';
  const fallsBackToId = !!filter && !labelText && !headerText;
  useEffect(() => {
    if (fallsBackToId) warnFilterLabelFallsBackToId(column.id);
  }, [fallsBackToId, column.id]);

  if (!filter) return null;

  const columnName = labelText || headerText || column.id;
  const value = column.getFilterValue();
  const active = (filter.isActive ?? defaultIsActive)(value);
  const fieldLabel = formatLabel(labels.filterValue, { column: columnName });

  const ctx: TableColumnFilterContext = {
    value,
    setValue: next => column.setFilterValue(next),
    clear: () => column.setFilterValue(undefined),
    column,
    close: () => setOpen(false),
    fieldLabel,
  };

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
              fieldLabel={fieldLabel}
              selectPlaceholder={labels.filterSelectPlaceholder}
              optionsAttrs={slotAttrs('filterOptions')}
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
  optionsAttrs,
}: {
  filter: TableColumnFilterConfig;
  ctx: TableColumnFilterContext;
  container: HTMLElement | null;
  fieldLabel: string;
  selectPlaceholder: string;
  optionsAttrs: SlotAttrs;
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
        // Empty or whitespace-only falls back, like every `labels` value.
        placeholder={typeof placeholder === 'string' && placeholder.trim() !== '' ? placeholder : selectPlaceholder}
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
    return <CheckboxListFilter attrs={optionsAttrs} label={fieldLabel} options={options} value={Array.isArray(value) ? (value as string[]) : []} onChange={setValue} />;
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
  // A combobox does not take its name from content, so the trigger is named by
  // a hidden column label plus its own visible value (WCAG 2.5.3, label in
  // name). Spar labels the listbox by the trigger, which a name computation
  // reads as the chosen option only, so the listbox is pointed at the column
  // label directly (a consumer `aria-labelledby` wins in Spar). The label span
  // is `aria-hidden` so browse mode doesn't read it as stray panel text;
  // `aria-labelledby` still resolves hidden nodes.
  return (
    <Select value={value} onChange={onChange}>
      <span id={labelId} style={visuallyHidden} aria-hidden="true">
        {label}
      </span>
      <Select.Trigger aria-labelledby={`${labelId} ${valueId}`}>
        <span id={valueId}>{selected ? selected.label : placeholder}</span>
      </Select.Trigger>
      <Select.Content container={container} aria-labelledby={labelId}>
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
  attrs,
  label,
  options,
  value,
  onChange,
}: {
  attrs: SlotAttrs;
  label: string;
  options: TableColumnFilterOption[];
  value: string[];
  onChange: (value: string[] | undefined) => void;
}) => {
  // A named group (`filterOptions` slot) that stacks the options like the panel
  // body. Its role and name come from Table and `labels`, so slotProps naming
  // attributes are dropped from the spread.
  const { 'role': _role, 'aria-label': _ariaLabel, 'aria-labelledby': _ariaLabelledBy, ...groupAttrs } = attrs;
  return (
    <div {...groupAttrs} role="group" aria-label={label}>
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
};
