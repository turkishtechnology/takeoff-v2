import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { axe } from 'vitest-axe';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { Select } from './index';

// jsdom ships no ResizeObserver; Select.Content observes the trigger.
const OriginalResizeObserver = globalThis.ResizeObserver;

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterAll(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
});

const AIRPORTS = ['Istanbul', 'Izmir', 'Ankara', 'Antalya'];

const Airports = ({ onChange, searchProps }: { onChange?: (value: string) => void; searchProps?: Parameters<typeof Select.Search>[0] }) => {
  const [query, setQuery] = useState('');
  const visible = AIRPORTS.filter(name => name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Select onChange={onChange}>
      <Select.Trigger aria-label="Airport" placeholder="Pick an airport" />
      <Select.Content>
        <Select.Search value={query} onValueChange={setQuery} {...searchProps} />
        <Select.Viewport>
          {visible.map(name => (
            <Select.Item key={name} value={name} label={name}>
              {name}
            </Select.Item>
          ))}
          {visible.length === 0 ? <Select.Empty>No airports</Select.Empty> : null}
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
};

const open = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('combobox', { name: 'Airport' }));

describe('Select.Search', () => {
  it('renders a framed field with an icon, named and labelled "Search" by default', async () => {
    const user = userEvent.setup();
    render(<Airports />);
    await open(user);

    const search = screen.getByRole('combobox', { name: 'Search' });
    expect(search).toHaveFocus();
    expect(search).toHaveClass('tk-select-search-input');
    expect(search).toHaveAttribute('placeholder', 'Search');
    expect(search.closest('.tk-select-search')).toBeInTheDocument();
    expect(search.closest('.tk-select-search')?.querySelector('.tk-select-search-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('filters through the consumer and commits the first match with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Airports onChange={onChange} />);
    await open(user);

    await user.keyboard('ant');
    expect(screen.getAllByRole('option')).toHaveLength(1);

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('Antalya');
    expect(screen.getByRole('combobox', { name: 'Airport' })).toHaveTextContent('Antalya');
  });

  it('shows Select.Empty as a polite status once nothing matches', async () => {
    const user = userEvent.setup();
    render(<Airports />);
    await open(user);

    await user.keyboard('xyz');

    const empty = screen.getByRole('status');
    expect(empty).toHaveTextContent('No airports');
    expect(empty).toHaveClass('tk-select-empty');
    expect(empty).toHaveAttribute('aria-live', 'polite');
  });

  it('takes a translated name and placeholder, and keeps the default for a blank one', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Airports searchProps={{ 'aria-label': 'Havalimanı ara', 'placeholder': 'Ara' }} />);
    await open(user);

    expect(screen.getByRole('combobox', { name: 'Havalimanı ara' })).toHaveAttribute('placeholder', 'Ara');
    unmount();

    render(<Airports searchProps={{ 'aria-label': '  ' }} />);
    await open(user);
    expect(screen.getByRole('combobox', { name: 'Search' })).toBeInTheDocument();
  });

  it('lands classNames and slotProps on the wrapper, the input and the icon', async () => {
    const user = userEvent.setup();
    render(
      <TakeoffSparProvider components={{ SelectSearch: { classNames: { root: 'theme-root' } }, SelectEmpty: { classNames: { root: 'theme-empty' } } }}>
        <Airports searchProps={{ classNames: { input: 'extra-input', icon: 'extra-icon' }, slotProps: { root: { id: 'search-row' } } }} />
      </TakeoffSparProvider>,
    );
    await open(user);

    const search = screen.getByRole('combobox', { name: 'Search' });
    expect(search).toHaveClass('extra-input');
    const row = document.getElementById('search-row');
    expect(row).toHaveClass('tk-select-search', 'theme-root');
    expect(row?.querySelector('.tk-select-search-icon')).toHaveClass('extra-icon');

    await user.keyboard('xyz');
    expect(screen.getByRole('status')).toHaveClass('theme-empty');
  });

  it('renders Select.Empty polymorphically', () => {
    render(<Select.Empty as="p">Nothing</Select.Empty>);

    expect(screen.getByRole('status').tagName).toBe('P');
  });

  it('has no axe violations while open and filtered', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<Airports />);
    await open(user);
    await user.keyboard('an');

    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
  });
});
