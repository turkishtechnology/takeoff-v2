import type { Table as TanStackTable } from '@tanstack/react-table';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { renderWithProvider as render, screen, within } from '../../test-utils';

import { Table } from './Table';
import { TableBody } from './TableBody';
import { getExportRows } from './helpers';
import type { TableColumnDef } from './types';

// Spar Select/Popover content observe their anchor; jsdom lacks ResizeObserver.
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

interface User {
  id: string;
  name: string;
  role: string;
  age: number;
  profile: { city: string };
}

const users: User[] = [
  { id: '1', name: 'Ada', role: 'admin', age: 42, profile: { city: 'London' } },
  { id: '2', name: 'Linus', role: 'user', age: 35, profile: { city: 'Helsinki' } },
  { id: '3', name: 'Grace', role: 'admin', age: 28, profile: { city: 'New York' } },
];

const baseColumns: TableColumnDef<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'role', header: 'Role', accessor: 'role' },
  { id: 'city', header: 'City', accessor: 'profile.city' }, // dot-path accessor
  { id: 'age', header: 'Age', accessor: row => row.age, align: 'end' }, // fn accessor
];

const getRowId = (user: User) => user.id;
const bodyRowTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('tbody tr')).map(row => row.querySelector('td')?.textContent);

describe('Table (props-first)', () => {
  describe('rendering', () => {
    it('renders a native table with header + body and the root slot contract', () => {
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} />);

      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveClass('tk-table');
      expect(root).toHaveAttribute('data-size', 'base');
      const viewport = container.querySelector('[data-slot="table-viewport"]');
      expect(viewport).toHaveClass('tk-table-viewport');
      expect(viewport).toContainElement(container.querySelector('table'));
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      // 3 data rows (header row is in a separate rowgroup but still a row).
      expect(within(container.querySelector('tbody') as HTMLElement).getAllByRole('row')).toHaveLength(3);
    });

    it('resolves dot-path and function accessors', () => {
      render(<Table data={users} columns={baseColumns} getRowId={getRowId} />);
      expect(screen.getByText('London')).toBeInTheDocument(); // profile.city
      expect(screen.getByText('42')).toBeInTheDocument(); // () => row.age
    });

    it('renders a custom cell render-prop (content owner) inside the Table-owned cell container', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'role', header: 'Role', accessor: 'role', cell: ({ row }) => <span data-testid="badge">{row.original.role.toUpperCase()}</span> },
      ];
      render(<Table data={users} columns={columns} getRowId={getRowId} />);

      const badge = screen.getAllByTestId('badge')[0];
      expect(badge).toHaveTextContent('ADMIN');
      expect(badge.closest('td')).toHaveAttribute('data-slot', 'cell');
    });

    it('emits density + striped visual hooks on the root', () => {
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} size="small" striped bordered />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-size', 'small');
      expect(root).toHaveAttribute('data-striped', '');
      expect(root).toHaveAttribute('data-bordered', '');
    });

    it('renders the empty state when there are no rows', () => {
      render(<Table data={[]} columns={baseColumns} getRowId={getRowId} emptyState={<span>Nothing here</span>} />);
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('toggles aria-sort and reorders rows on header activation', async () => {
      const user = userEvent.setup();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} sorting={{}} />);

      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus', 'Grace']);

      await user.click(screen.getByRole('button', { name: 'Name' }));
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Grace', 'Linus']);

      await user.click(screen.getByRole('button', { name: 'Name' }));
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending');
      expect(bodyRowTexts(container)).toEqual(['Linus', 'Grace', 'Ada']);
    });

    it('drives a controlled sorting callback', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Table data={users} columns={baseColumns} getRowId={getRowId} sorting={{ value: [], onChange }} />);

      await user.click(screen.getByRole('button', { name: 'Name' }));
      expect(onChange).toHaveBeenCalledWith([{ id: 'name', desc: false }]);
    });
  });

  describe('selection', () => {
    it('selects a row and toggles all (multiple) with select-all in the header', async () => {
      const user = userEvent.setup();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'multiple' }} />);

      const tbody = container.querySelector('tbody') as HTMLElement;
      const rowCheckboxes = within(tbody).getAllByRole('checkbox');
      expect(rowCheckboxes).toHaveLength(3);

      await user.click(rowCheckboxes[0]);
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(1);

      // Header select-all checkbox is the only checkbox in the thead.
      const selectAll = within(container.querySelector('thead') as HTMLElement).getByRole('checkbox');
      await user.click(selectAll);
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(3);
    });

    it('reflects controlled selection value', () => {
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'multiple', value: { '2': true }, onChange: vi.fn() }} />);
      const selected = container.querySelectorAll('tbody tr[data-selected]');
      expect(selected).toHaveLength(1);
      expect(within(selected[0] as HTMLElement).getByText('Linus')).toBeInTheDocument();
    });

    it('renders radios (not checkboxes) and caps to one row in single mode', async () => {
      const user = userEvent.setup();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'single' }} />);

      const tbody = container.querySelector('tbody') as HTMLElement;
      const radios = within(tbody).getAllByRole('radio');
      expect(radios).toHaveLength(3);
      // Single mode has no select-all control in the header.
      expect(within(container.querySelector('thead') as HTMLElement).queryByRole('checkbox')).toBeNull();

      await user.click(radios[0]);
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(1);
      await user.click(radios[1]);
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(1);
    });
  });

  describe('filtering', () => {
    // Two-tier API: declarative presets (`'text'`, `{ type: 'checkbox', options }`)
    // for the common cases, and a `render` escape hatch for everything else.
    // These cover both tiers plus the plumbing Table owns (trigger, Clear, active).

    it('filters rows from controlled column-filter state', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'role', header: 'Role', accessor: 'role', filter: 'text' },
        { id: 'name', header: 'Name', accessor: 'name' },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} filtering={{ value: [{ id: 'role', value: 'admin' }] }} />);

      expect(bodyRowTexts(container)).toEqual(['admin', 'admin']);
      expect(screen.queryByText('user')).not.toBeInTheDocument();
    });

    it('renders a filter trigger for filterable columns', () => {
      const columns: TableColumnDef<User>[] = [{ id: 'role', header: 'Role', accessor: 'role', filter: 'text' }];
      render(<Table data={users} columns={columns} getRowId={getRowId} />);
      expect(screen.getByRole('button', { name: 'Filter column' })).toBeInTheDocument();
    });

    it('groups sort and filter controls in the header content slot', () => {
      const columns: TableColumnDef<User>[] = [{ id: 'name', header: 'Name', accessor: 'name', sortable: true, filter: 'text' }];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} />);
      const headerContent = container.querySelector('[data-slot="header-content"]') as HTMLElement;

      expect(within(headerContent).getByRole('button', { name: 'Name' })).toBeInTheDocument();
      expect(within(headerContent).getByRole('button', { name: 'Filter column' })).toBeInTheDocument();
    });

    it('narrows rows through the `text` preset (string shorthand)', async () => {
      const user = userEvent.setup();
      const columns: TableColumnDef<User>[] = [{ id: 'name', header: 'Name', accessor: 'name', filter: 'text' }];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} />);

      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      await user.type(await screen.findByRole('searchbox'), 'Ada');
      expect(bodyRowTexts(container)).toEqual(['Ada']);
    });

    it('narrows rows through the `radio` preset and clears', async () => {
      const user = userEvent.setup();
      const columns: TableColumnDef<User>[] = [
        {
          id: 'role',
          header: 'Role',
          accessor: 'role',
          filter: {
            type: 'radio',
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
            ],
          },
        },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} />);

      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      await user.click(await screen.findByRole('radio', { name: 'User' }));
      expect(bodyRowTexts(container)).toEqual(['user']);

      await user.click(screen.getByRole('button', { name: 'Clear' }));
      expect(bodyRowTexts(container)).toEqual(['admin', 'user', 'admin']);
    });

    it('narrows rows through the `checkbox` preset (multi-select, membership)', async () => {
      const user = userEvent.setup();
      const columns: TableColumnDef<User>[] = [
        {
          id: 'role',
          header: 'Role',
          accessor: 'role',
          filter: {
            type: 'checkbox',
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
            ],
          },
        },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} />);

      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      await user.click(await screen.findByRole('checkbox', { name: 'Admin' }));
      expect(bodyRowTexts(container)).toEqual(['admin', 'admin']);
    });

    it('narrows rows through a custom `render` escape hatch', async () => {
      const user = userEvent.setup();
      const columns: TableColumnDef<User>[] = [
        {
          id: 'name',
          header: 'Name',
          accessor: 'name',
          filter: {
            render: ({ value, setValue }) => (
              <input aria-label="custom filter" value={typeof value === 'string' ? value : ''} onChange={event => setValue(event.target.value || undefined)} />
            ),
          },
        },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} />);

      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      await user.type(await screen.findByLabelText('custom filter'), 'Grace');
      expect(bodyRowTexts(container)).toEqual(['Grace']);
    });

    it('uses a custom isActive to drive the trigger active state', async () => {
      const user = userEvent.setup();
      const columns: TableColumnDef<User>[] = [
        {
          id: 'name',
          header: 'Name',
          accessor: 'name',
          filter: {
            isActive: value => typeof value === 'string' && value.length >= 2,
            render: ({ value, setValue }) => <input aria-label="filter" value={typeof value === 'string' ? value : ''} onChange={e => setValue(e.target.value || undefined)} />,
          },
        },
      ];
      render(<Table data={users} columns={columns} getRowId={getRowId} />);

      const trigger = screen.getByRole('button', { name: 'Filter column' });
      expect(trigger).not.toHaveAttribute('data-active');

      await user.click(trigger);
      const input = await screen.findByLabelText('filter');
      await user.type(input, 'A'); // length 1 → still inactive by custom predicate
      expect(trigger).not.toHaveAttribute('data-active');
      await user.type(input, 'd'); // length 2 → active
      expect(trigger).toHaveAttribute('data-active');
    });
  });

  describe('expansion', () => {
    it('renders disclosure content when a row is expanded', async () => {
      const user = userEvent.setup();
      render(<Table data={users} columns={baseColumns} getRowId={getRowId} expansion={{ render: row => <span>Detail for {row.name}</span> }} />);

      expect(screen.queryByText('Detail for Ada')).not.toBeInTheDocument();
      await user.click(screen.getAllByRole('button', { name: 'Expand row' })[0]);
      expect(screen.getByText('Detail for Ada')).toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('paginates client-side and gates the navigation buttons', async () => {
      const user = userEvent.setup();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} pagination={{ pageSize: 2 }} />);

      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus']);
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      expect(container.querySelector('[data-slot="pagination-info"]')).toHaveTextContent('Page 1 of 2');
      expect(within(container.querySelector('[data-slot="pagination-actions"]') as HTMLElement).getAllByRole('button')).toHaveLength(6);
      expect(screen.getByRole('button', { name: 'Page 1, current page' })).toHaveAttribute('aria-current', 'page');
      expect(container.querySelector('[data-slot="pagination-size"] .tk-select')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next page' }));
      expect(bodyRowTexts(container)).toEqual(['Grace']);
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Page 2, current page' })).toHaveAttribute('aria-current', 'page');

      const pageInput = screen.getByRole('spinbutton', { name: 'Go to page' });
      await user.type(pageInput, '1{enter}');
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus']);
      expect(screen.getByRole('button', { name: 'Page 1, current page' })).toHaveAttribute('aria-current', 'page');
    });

    it('condenses large page ranges around the current page', () => {
      const { container } = render(
        <Table data={users} columns={baseColumns} getRowId={getRowId} manual pagination={{ pageSize: 10, pageIndex: 5, rowCount: 100 }} onDataRequest={vi.fn()} />,
      );
      const actions = container.querySelector('[data-slot="pagination-actions"]') as HTMLElement;

      expect(within(actions).getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
      expect(within(actions).getByRole('button', { name: 'Page 6, current page' })).toHaveAttribute('aria-current', 'page');
      expect(within(actions).getByRole('button', { name: 'Go to page 10' })).toBeInTheDocument();
      expect(actions.querySelectorAll(':scope > span')).toHaveLength(2);
    });
  });

  describe('server (manual) mode', () => {
    it('emits a bundled onDataRequest derived from the state slices', () => {
      const onDataRequest = vi.fn();
      render(<Table data={users} columns={baseColumns} getRowId={getRowId} manual pagination={{ pageSize: 10, rowCount: 50 }} onDataRequest={onDataRequest} />);

      expect(onDataRequest).toHaveBeenCalledTimes(1);
      expect(onDataRequest).toHaveBeenCalledWith(expect.objectContaining({ pagination: expect.objectContaining({ pageSize: 10 }), sorting: [], filters: [] }));
    });

    it('does NOT re-fire onDataRequest when an inline callback changes identity on re-render', () => {
      const fetchSpy = vi.fn();
      const { rerender } = render(
        <Table data={users} columns={baseColumns} getRowId={getRowId} manual pagination={{ pageSize: 10, rowCount: 50 }} onDataRequest={() => fetchSpy()} />,
      );
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // A fresh inline callback (new identity) with unchanged state must not re-fetch.
      rerender(<Table data={users} columns={baseColumns} getRowId={getRowId} manual pagination={{ pageSize: 10, rowCount: 50 }} onDataRequest={() => fetchSpy()} />);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('sticky columns', () => {
    it('emits data-sticky + inline positioning on pinned cells', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sticky: 'left', width: 120 },
        { id: 'role', header: 'Role', accessor: 'role' },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} stickyHeader />);

      const stickyHeader = container.querySelector('th[data-sticky="left"]') as HTMLElement;
      expect(stickyHeader).toBeInTheDocument();
      expect(stickyHeader.style.position).toBe('sticky');
      expect(stickyHeader.style.left).toBe('0px');
      expect(container.querySelector('td[data-sticky="left"]')).toBeInTheDocument();

      const viewport = container.querySelector('[data-slot="table-viewport"]') as HTMLElement;
      expect(viewport).not.toHaveAttribute('data-scrolled');
      viewport.scrollTop = 20;
      fireEvent.scroll(viewport);
      expect(viewport).toHaveAttribute('data-scrolled', '');
      viewport.scrollTop = 0;
      fireEvent.scroll(viewport);
      expect(viewport).not.toHaveAttribute('data-scrolled');
    });
  });

  describe('export + instance ref', () => {
    it('exposes the instance via tableRef and projects export rows', () => {
      const ref: { current: TanStackTable<User> | null } = { current: null };
      render(<Table data={users} columns={baseColumns} getRowId={getRowId} tableRef={ref} />);

      expect(ref.current).not.toBeNull();
      const rows = getExportRows(ref.current);
      expect(rows).toHaveLength(3);
      expect(rows[0]).toEqual({ name: 'Ada', role: 'admin', city: 'London', age: 42 });
    });
  });

  describe('loading', () => {
    it('marks the root busy and suppresses the empty copy while loading', () => {
      const { container } = render(<Table data={[]} columns={baseColumns} getRowId={getRowId} loading emptyState="No data yet" />);
      expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-loading', '');
      expect(container.querySelector('[data-slot="loading"]')).toBeInTheDocument();
      expect(screen.queryByText('No data yet')).not.toBeInTheDocument();
    });
  });

  describe('customization surfaces', () => {
    it('lands classNames and slotProps on the correct slot owner nodes', () => {
      const { container } = render(
        <Table
          data={users}
          columns={baseColumns}
          getRowId={getRowId}
          classNames={{ cell: 'my-cell', headerContent: 'my-header-content' }}
          slotProps={{ table: { 'aria-label': 'Users' }, headerContent: { 'aria-label': 'Header content' } }}
        />,
      );

      expect(container.querySelector('table')).toHaveAttribute('aria-label', 'Users');
      expect(container.querySelector('td[data-slot="cell"]')).toHaveClass('tk-table-cell', 'my-cell');
      expect(container.querySelector('[data-slot="header-content"]')).toHaveClass('tk-table-header-content', 'my-header-content');
      expect(container.querySelector('[data-slot="header-content"]')).toHaveAttribute('aria-label', 'Header content');
    });
  });

  describe('context boundary', () => {
    it('throws a labeled error when an internal part renders outside Table', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<TableBody />)).toThrow(/Table\.Body must be used within Table/);
      spy.mockRestore();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for a sortable, selectable table', async () => {
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} sorting={{}} selection={{ mode: 'multiple' }} />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
