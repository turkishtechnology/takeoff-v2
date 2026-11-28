import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Select, SelectTrigger, SelectContent, SelectViewport, SelectSearch, SelectItem } from '../index';

expect.extend(toHaveNoViolations);

const CITIES = [
  { value: 'ist', label: 'Istanbul' },
  { value: 'izm', label: 'Izmir' },
  { value: 'ank', label: 'Ankara' },
  { value: 'lon', label: 'London', disabled: true },
  { value: 'lis', label: 'Lisbon' },
];

/** The consumer filters; SelectSearch only reports the query. */
const SearchableSelect = ({ onChange, onQueryChange, defaultValue }: { onChange?: (value: string) => void; onQueryChange?: (query: string) => void; defaultValue?: string }) => {
  const [query, setQuery] = useState('');
  const visible = CITIES.filter(city => city.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <Select onChange={onChange} defaultValue={defaultValue}>
      <SelectTrigger aria-label="City" placeholder="Pick a city" />
      <SelectContent>
        <SelectSearch
          aria-label="Search cities"
          value={query}
          onValueChange={next => {
            setQuery(next);
            onQueryChange?.(next);
          }}
        />
        <SelectViewport data-testid="viewport">
          {visible.map(city => (
            <SelectItem key={city.value} value={city.value} label={city.label} disabled={city.disabled}>
              {city.label}
            </SelectItem>
          ))}
        </SelectViewport>
      </SelectContent>
    </Select>
  );
};

const search = () => screen.getByRole('combobox', { name: 'Search cities' });
const trigger = () => screen.getByRole('combobox', { name: 'City' });
const highlighted = () => search().getAttribute('aria-activedescendant');
const optionId = (name: string) => screen.getByRole('option', { name }).id;

describe('SelectSearch', () => {
  it('takes focus on open and becomes the combobox, with the viewport as its listbox', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<SearchableSelect />);

    await user.click(trigger());

    expect(search()).toHaveFocus();
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBe(screen.getByTestId('viewport'));
    expect(search()).toHaveAttribute('aria-controls', listbox.id);
    expect(search()).toHaveAttribute('aria-expanded', 'true');
    expect(search()).toHaveAttribute('aria-autocomplete', 'list');
    expect(listbox).toHaveAttribute('aria-labelledby', trigger().id);

    // The content is no longer a listbox, and no longer owns the active descendant.
    const content = baseElement.querySelector('[data-state="open"][data-side]');
    expect(content).not.toHaveAttribute('role');
    expect(content).not.toHaveAttribute('aria-activedescendant');
  });

  it('types into the field instead of running typeahead, Space included', async () => {
    const user = userEvent.setup();
    const onQueryChange = jest.fn();
    render(<SearchableSelect onQueryChange={onQueryChange} />);

    await user.click(trigger());
    await user.keyboard('is b');

    expect(search()).toHaveValue('is b');
    expect(onQueryChange).toHaveBeenLastCalledWith('is b');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('keeps Home and End in the field', async () => {
    const user = userEvent.setup();
    render(<SearchableSelect />);

    await user.click(trigger());
    await user.keyboard('{ArrowDown}');
    const before = highlighted();
    await user.keyboard('{Home}{End}');

    expect(highlighted()).toBe(before);
  });

  it('drives the list with the arrows and commits with Enter', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SearchableSelect onChange={onChange} />);

    await user.click(trigger());
    expect(highlighted()).toBe(optionId('Istanbul'));

    await user.keyboard('{ArrowDown}');
    expect(highlighted()).toBe(optionId('Izmir'));

    await user.keyboard('{PageDown}');
    expect(highlighted()).toBe(optionId('Lisbon'));

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('lis');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('moves the highlight to the first match when the highlighted option is filtered out', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SearchableSelect onChange={onChange} />);

    await user.click(trigger());
    expect(highlighted()).toBe(optionId('Istanbul'));

    await user.keyboard('ank');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(highlighted()).toBe(optionId('Ankara'));

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('ank');
  });

  it('clears the highlight when nothing matches, so Enter commits nothing', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<SearchableSelect onChange={onChange} />);

    await user.click(trigger());
    await user.keyboard('zzz');

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(search()).not.toHaveAttribute('aria-activedescendant');

    await user.keyboard('{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps a highlight that still matches, and skips a disabled match when it moves', async () => {
    const user = userEvent.setup();
    render(<SearchableSelect />);

    await user.click(trigger());
    await user.keyboard('l');
    // Istanbul has an "l" too, so the highlight has no reason to move.
    expect(highlighted()).toBe(optionId('Istanbul'));

    await user.clear(search());
    await user.keyboard('o');
    // Only London and Lisbon match, and London is disabled.
    expect(highlighted()).toBe(optionId('Lisbon'));
  });

  it('resets the query when the list closes, and keeps the trigger label of a filtered-out value', async () => {
    const user = userEvent.setup();
    const onQueryChange = jest.fn();
    render(<SearchableSelect defaultValue="ank" onQueryChange={onQueryChange} />);

    await user.click(trigger());
    await user.keyboard('iz');
    expect(trigger()).toHaveTextContent('Ankara');

    await user.keyboard('{Escape}');
    expect(onQueryChange).toHaveBeenLastCalledWith('');

    await user.click(trigger());
    expect(search()).toHaveValue('');
    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('works uncontrolled and forwards onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <Select>
        <SelectTrigger aria-label="City" />
        <SelectContent>
          <SelectSearch aria-label="Search cities" defaultValue="is" onChange={onChange} />
          <SelectViewport>
            <SelectItem value="ist" label="Istanbul">
              Istanbul
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </Select>,
    );

    await user.click(trigger());
    expect(search()).toHaveValue('is');

    await user.keyboard('t');
    expect(search()).toHaveValue('ist');
    expect(onChange).toHaveBeenCalled();
  });

  it('leaves the query alone when onChange prevents the edit', async () => {
    const user = userEvent.setup();
    render(
      <Select>
        <SelectTrigger aria-label="City" />
        <SelectContent>
          <SelectSearch aria-label="Search cities" onChange={event => event.preventDefault()} />
          <SelectViewport>
            <SelectItem value="ist" label="Istanbul">
              Istanbul
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </Select>,
    );

    await user.click(trigger());
    await user.keyboard('x');

    expect(search()).toHaveValue('');
  });

  it('restores the listbox role to the content once the search unmounts', async () => {
    const user = userEvent.setup();
    const Toggle = () => {
      const [withSearch, setWithSearch] = useState(true);
      return (
        <Select defaultOpen>
          <SelectTrigger aria-label="City" />
          <SelectContent data-testid="content">
            {withSearch ? <SelectSearch aria-label="Search cities" /> : null}
            <SelectViewport data-testid="viewport">
              <SelectItem value="ist" label="Istanbul" onClick={() => setWithSearch(false)}>
                Istanbul
              </SelectItem>
            </SelectViewport>
          </SelectContent>
        </Select>
      );
    };
    render(<Toggle />);

    await screen.findByTestId('viewport');
    expect(screen.getByTestId('viewport')).toHaveAttribute('role', 'listbox');

    await user.click(screen.getByRole('option', { name: 'Istanbul' }));
    await user.click(trigger());
    expect(screen.getByTestId('content')).toHaveAttribute('role', 'listbox');
    expect(screen.getByTestId('viewport')).toHaveAttribute('role', 'presentation');
  });

  it('has no axe violations while open', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<SearchableSelect />);

    await user.click(trigger());

    // `aria-required-children` stays on: it is the rule a text field inside a
    // listbox would break. `region` is a page-level landmark rule that a bare
    // test document cannot meet.
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
