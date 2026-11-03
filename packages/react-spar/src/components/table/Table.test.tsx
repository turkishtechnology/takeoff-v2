import type { Table as TanStackTable } from '@tanstack/react-table';
import { act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { axe } from 'vitest-axe';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { ClassNamesMap, SlotPropsMap } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render as renderPlain, renderWithProvider as render, screen, within } from '../../test-utils';

import { Table } from './Table';
import { TableBody } from './TableBody';
import { getExportRows } from './helpers';
import type { TableColumnDef, TableSlot } from './types';

// Spar Select/Popover content observe their anchor; jsdom lacks ResizeObserver.
const originalResizeObserver = globalThis.ResizeObserver;
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterAll(() => {
  globalThis.ResizeObserver = originalResizeObserver;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
// 12 rows over a single Name column — enough for multi-page client pagination.
const manyUsers: User[] = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  name: `User ${index + 1}`,
  role: index % 2 === 0 ? 'admin' : 'user',
  age: 20 + index,
  profile: { city: 'Istanbul' },
}));
const nameColumns: TableColumnDef<User>[] = [{ id: 'name', header: 'Name', accessor: 'name' }];
const bodyRowTexts = (container: HTMLElement) => Array.from(container.querySelectorAll('tbody tr')).map(row => row.querySelector('td')?.textContent);
const goToPageButton = (container: HTMLElement) =>
  within(container.querySelector('[data-slot="pagination-go-to-page"]') as HTMLElement).getByRole('button', { name: 'Go to page' });

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

    it('falls back to a stringified value (and warns) when an accessor returns an object with no cell render-prop', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Accessor returns a plain object and the column has no `cell` — would
      // otherwise throw "Objects are not valid as a React child".
      const columns: TableColumnDef<User>[] = [{ id: 'profile', header: 'Profile', accessor: row => row.profile }];

      expect(() => render(<Table data={users} columns={columns} getRowId={getRowId} />)).not.toThrow();
      expect(screen.getByText('{"city":"London"}')).toBeInTheDocument();
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('non-renderable object value'));
      consoleError.mockRestore();
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

    it('falls back to the default "No data" copy in a full-width cell spanning the utility columns', () => {
      const { container } = render(<Table data={[]} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'multiple' }} expansion={{ render: () => null }} />);

      const empty = container.querySelector('td[data-slot="empty"]');
      expect(empty).toHaveClass('tk-table-empty');
      expect(empty).toHaveTextContent('No data');
      // 4 data columns + selection + expand utility columns.
      expect(empty).toHaveAttribute('colspan', '6');
    });

    it('emits data-sticky-header on the root only when stickyHeader is set', () => {
      const { container, rerender } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).not.toHaveAttribute('data-sticky-header');
      expect(root).not.toHaveAttribute('data-striped');
      expect(root).not.toHaveAttribute('data-bordered');

      rerender(<Table data={users} columns={baseColumns} getRowId={getRowId} stickyHeader />);
      expect(root).toHaveAttribute('data-sticky-header', '');
    });

    it('emits data-align on body + header cells and lets meta.headerAlign override the header only', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', align: 'center', meta: { headerAlign: 'start', className: 'name-td', headerClassName: 'name-th' } },
        { id: 'age', header: 'Age', accessor: 'age', align: 'end' },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} />);
      const [nameHeader, ageHeader] = screen.getAllByRole('columnheader');
      const [nameCell, ageCell] = Array.from(container.querySelectorAll('tbody tr:first-child td'));

      expect(nameHeader).toHaveAttribute('data-align', 'start');
      expect(nameCell).toHaveAttribute('data-align', 'center');
      expect(ageHeader).toHaveAttribute('data-align', 'end');
      expect(ageCell).toHaveAttribute('data-align', 'end');
      // meta.className / meta.headerClassName land on the td / th owner nodes.
      expect(nameCell).toHaveClass('tk-table-cell', 'name-td');
      expect(nameHeader).toHaveClass('tk-table-header-cell', 'name-th');
      expect(nameHeader).not.toHaveClass('name-td');
      expect(ageCell).not.toHaveClass('name-td');
    });

    it('renders every header as a scoped column header and forwards ref to the root node', () => {
      const ref = createRef<HTMLDivElement>();
      const { container } = render(<Table ref={ref} data={users} columns={baseColumns} getRowId={getRowId} className="instance-root" />);

      const root = container.querySelector('[data-slot="root"]');
      expect(ref.current).toBe(root);
      expect(root).toHaveClass('tk-table', 'instance-root');
      for (const header of screen.getAllByRole('columnheader')) expect(header).toHaveAttribute('scope', 'col');
    });

    it('renders a header render-prop with the TanStack header context', () => {
      const columns: TableColumnDef<User>[] = [{ id: 'name', header: ({ column }) => <span data-testid="hdr">Col {column.id}</span>, accessor: 'name' }];
      render(<Table data={users} columns={columns} getRowId={getRowId} />);
      expect(screen.getByTestId('hdr')).toHaveTextContent('Col name');
      expect(screen.getByTestId('hdr').closest('th')).toHaveAttribute('data-slot', 'header-cell');
    });

    it('does not crash when an object accessor value cannot be JSON-serialized', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      const columns: TableColumnDef<User>[] = [{ id: 'circular', header: 'Circular', accessor: () => circular }];

      const { container } = render(<Table data={users.slice(0, 1)} columns={columns} getRowId={getRowId} />);
      expect(container.querySelector('td[data-slot="cell"]')).toHaveTextContent('[object Object]');
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Column "circular" resolved to a non-renderable object value'));
    });

    it('emits the canonical tk-* class and data-slot on every Table-owned anatomy node, with no state hooks by default', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sortable: true, filter: 'text' },
        { id: 'role', header: 'Role', accessor: 'role' },
      ];
      const { container } = render(
        <Table
          data={manyUsers}
          columns={columns}
          getRowId={getRowId}
          selection={{ mode: 'multiple' }}
          expansion={{ defaultValue: { '1': true }, render: row => <span>Detail for {row.name}</span> }}
          pagination={{ pageSize: 5 }}
          loading
        />,
      );
      const anatomy: [slot: string, className: string, tagName: string][] = [
        ['table', 'tk-table-table', 'TABLE'],
        ['header', 'tk-table-header', 'THEAD'],
        ['header-row', 'tk-table-header-row', 'TR'],
        ['header-cell', 'tk-table-header-cell', 'TH'],
        ['header-content', 'tk-table-header-content', 'DIV'],
        ['sort-trigger', 'tk-table-sort-trigger', 'BUTTON'],
        ['sort-icon', 'tk-table-sort-icon', 'SPAN'],
        ['body', 'tk-table-body', 'TBODY'],
        ['row', 'tk-table-row', 'TR'],
        ['cell', 'tk-table-cell', 'TD'],
        ['expand-button', 'tk-table-expand-button', 'BUTTON'],
        ['expanded-row', 'tk-table-expanded-row', 'TR'],
        ['pagination', 'tk-table-pagination', 'DIV'],
        ['pagination-info', 'tk-table-pagination-info', 'DIV'],
        ['pagination-nav', 'tk-table-pagination-nav', 'DIV'],
        ['pagination-actions', 'tk-table-pagination-actions', 'DIV'],
        ['pagination-size', 'tk-table-pagination-size', 'DIV'],
        ['pagination-go-to-page', 'tk-table-pagination-go-to-page', 'DIV'],
        ['loading', 'tk-table-loading', 'DIV'],
      ];
      for (const [slot, className, tagName] of anatomy) {
        const node = container.querySelector(`[data-slot="${slot}"]`);
        expect(node, slot).toHaveClass(className);
        expect(node?.tagName, slot).toBe(tagName);
      }

      // Structural ownership: header row under thead, controls grouped under the actions slot.
      const table = screen.getByRole('table');
      expect(container.querySelector('[data-slot="header"]')).toContainElement(container.querySelector('[data-slot="header-row"]'));
      expect(container.querySelector('[data-slot="body"]')).toContainElement(container.querySelector('[data-slot="expanded-row"]'));
      const actions = container.querySelector('[data-slot="pagination-actions"]') as HTMLElement;
      expect(actions).toContainElement(screen.getByRole('combobox', { name: 'Rows per page' }));
      expect(actions).toContainElement(screen.getByRole('spinbutton', { name: 'Go to page' }));
      expect(screen.getByRole('navigation', { name: 'Pagination' })).toContainElement(actions);
      // Pagination and the loading overlay sit beside the <table>, not inside it.
      expect(table).not.toContainElement(actions);
      expect(table).not.toContainElement(container.querySelector('[data-slot="loading"]'));

      // Opt-in hooks are absent when their props are not set.
      const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
      const firstBodyCell = container.querySelector('tbody td[data-slot="cell"]') as HTMLElement;
      for (const node of [nameHeader, firstBodyCell]) {
        expect(node).not.toHaveAttribute('data-align');
        expect(node).not.toHaveAttribute('data-sticky');
        expect(node.style.position).toBe('');
      }
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(0);
      expect(screen.getByRole('button', { name: 'Filter column' })).not.toHaveAttribute('data-active');
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

    it('emits aria-sort, data-sortable and the sort-icon data-direction hook only on sortable headers', async () => {
      const user = userEvent.setup();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} />);
      const nameHeader = screen.getByRole('columnheader', { name: /Name/ });
      const roleHeader = screen.getByRole('columnheader', { name: 'Role' });
      const icon = container.querySelector('[data-slot="sort-icon"]') as HTMLElement;

      expect(nameHeader).toHaveAttribute('aria-sort', 'none');
      expect(nameHeader).toHaveAttribute('data-sortable', '');
      expect(within(nameHeader).getByRole('button', { name: 'Name' })).toHaveClass('tk-table-sort-trigger');
      expect(icon).toHaveClass('tk-table-sort-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('data-direction', 'none');
      // Non-sortable header: no sort semantics, no button.
      expect(roleHeader).not.toHaveAttribute('aria-sort');
      expect(roleHeader).not.toHaveAttribute('data-sortable');
      expect(within(roleHeader).queryByRole('button')).toBeNull();
      expect(container.querySelectorAll('[data-slot="sort-icon"]')).toHaveLength(1);

      await user.click(screen.getByRole('button', { name: 'Name' }));
      expect(icon).toHaveAttribute('data-direction', 'asc');
      await user.click(screen.getByRole('button', { name: 'Name' }));
      expect(icon).toHaveAttribute('data-direction', 'desc');
    });

    it('toggles sorting from the keyboard (Enter and Space) on the header button', async () => {
      const user = userEvent.setup();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} />);
      const header = screen.getByRole('columnheader', { name: /Name/ });

      screen.getByRole('button', { name: 'Name' }).focus();
      await user.keyboard('{Enter}');
      expect(header).toHaveAttribute('aria-sort', 'ascending');
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Grace', 'Linus']);

      await user.keyboard(' ');
      expect(header).toHaveAttribute('aria-sort', 'descending');
      expect(bodyRowTexts(container)).toEqual(['Linus', 'Grace', 'Ada']);
    });

    it('keeps a controlled sort until the parent commits the requested value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container, rerender } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} sorting={{ value: [], onChange }} />);

      await user.click(screen.getByRole('button', { name: 'Name' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      // The parent has not committed the change → order and aria-sort are unchanged.
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus', 'Grace']);
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'none');

      rerender(<Table data={users} columns={baseColumns} getRowId={getRowId} sorting={{ value: [{ id: 'name', desc: true }], onChange }} />);
      expect(bodyRowTexts(container)).toEqual(['Linus', 'Grace', 'Ada']);
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending');
    });

    it('seeds an uncontrolled sort from defaultValue and reports each committed change', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} sorting={{ defaultValue: [{ id: 'name', desc: true }], onChange }} />);

      expect(bodyRowTexts(container)).toEqual(['Linus', 'Grace', 'Ada']);
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending');

      // desc → removed (TanStack's asc → desc → none cycle).
      await user.click(screen.getByRole('button', { name: 'Name' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith([]);
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus', 'Grace']);
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'none');
    });

    it('stacks sort columns on shift-click only when sorting.multi is enabled', async () => {
      const user = userEvent.setup();
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sortable: true },
        { id: 'role', header: 'Role', accessor: 'role', sortable: true },
      ];
      const multiChange = vi.fn();
      const { unmount } = render(<Table data={users} columns={columns} getRowId={getRowId} sorting={{ multi: true, onChange: multiChange }} />);

      await user.click(screen.getByRole('button', { name: 'Role' }));
      await user.keyboard('{Shift>}');
      await user.click(screen.getByRole('button', { name: 'Name' }));
      await user.keyboard('{/Shift}');
      expect(multiChange).toHaveBeenLastCalledWith([
        { id: 'role', desc: false },
        { id: 'name', desc: false },
      ]);
      unmount();

      const singleChange = vi.fn();
      render(<Table data={users} columns={columns} getRowId={getRowId} sorting={{ onChange: singleChange }} />);
      await user.click(screen.getByRole('button', { name: 'Role' }));
      await user.keyboard('{Shift>}');
      await user.click(screen.getByRole('button', { name: 'Name' }));
      await user.keyboard('{/Shift}');
      expect(singleChange).toHaveBeenLastCalledWith([{ id: 'name', desc: false }]);
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

    it('reports RowSelectionState payloads keyed by getRowId for row and select-all changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'multiple', onChange }} />);

      const selectAll = screen.getByRole('checkbox', { name: 'Select all rows' });
      const rowCheckboxes = screen.getAllByRole('checkbox', { name: 'Select row' });
      expect(rowCheckboxes).toHaveLength(3);
      expect(selectAll).not.toBeChecked();

      await user.click(rowCheckboxes[1]);
      expect(onChange).toHaveBeenLastCalledWith({ '2': true });
      expect(selectAll).toBePartiallyChecked();

      await user.click(selectAll);
      expect(onChange).toHaveBeenLastCalledWith({ '1': true, '2': true, '3': true });
      expect(selectAll).toBeChecked();

      await user.click(selectAll);
      expect(onChange).toHaveBeenLastCalledWith({});
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(0);
      expect(onChange).toHaveBeenCalledTimes(3);
    });

    it('emits data-selection-mode + the canonical class on header and body selection cells', () => {
      const { container, unmount } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'multiple' }} />);
      const multipleCells = container.querySelectorAll('[data-slot="selection-cell"]');
      expect(multipleCells).toHaveLength(4); // 1 header + 3 body
      for (const cell of multipleCells) {
        expect(cell).toHaveClass('tk-table-selection-cell');
        expect(cell).toHaveAttribute('data-selection-mode', 'multiple');
      }
      expect(multipleCells[0].tagName).toBe('TH');
      unmount();

      const single = render(<Table data={users} columns={baseColumns} getRowId={getRowId} />);
      expect(single.container.querySelector('[data-slot="selection-cell"]')).toBeNull();
      single.unmount();

      const { container: singleContainer } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'single' }} />);
      for (const cell of singleContainer.querySelectorAll('[data-slot="selection-cell"]')) expect(cell).toHaveAttribute('data-selection-mode', 'single');
    });

    it('keeps controlled selection until the parent commits it', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container, rerender } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'multiple', value: {}, onChange }} />);

      await user.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]);
      expect(onChange).toHaveBeenCalledWith({ '1': true });
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(0);
      expect(screen.getAllByRole('checkbox', { name: 'Select row' })[0]).not.toBeChecked();

      rerender(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'multiple', value: { '1': true }, onChange }} />);
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(1);
      expect(screen.getAllByRole('checkbox', { name: 'Select row' })[0]).toBeChecked();
    });

    it('seeds uncontrolled selection from defaultValue and replaces the row in single mode', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'single', defaultValue: { '3': true }, onChange }} />);

      const selected = container.querySelectorAll('tbody tr[data-selected]');
      expect(selected).toHaveLength(1);
      expect(within(selected[0] as HTMLElement).getByText('Grace')).toBeInTheDocument();

      await user.click(within(container.querySelector('tbody') as HTMLElement).getAllByRole('radio')[0]);
      expect(onChange).toHaveBeenLastCalledWith({ '1': true });
      const nowSelected = container.querySelectorAll('tbody tr[data-selected]');
      expect(nowSelected).toHaveLength(1);
      expect(within(nowSelected[0] as HTMLElement).getByText('Ada')).toBeInTheDocument();
    });

    it('scopes select-all to the rows on the current page', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Table data={manyUsers} columns={nameColumns} getRowId={getRowId} selection={{ mode: 'multiple', onChange }} pagination={{ pageSize: 5 }} />);

      await user.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({ '1': true, '2': true, '3': true, '4': true, '5': true });
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(5);
      expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeChecked();

      // The next page's rows were not part of the select-all.
      await user.click(screen.getByRole('button', { name: 'Next page' }));
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(0);
      expect(screen.getByRole('checkbox', { name: 'Select all rows' })).not.toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Select all rows' })).not.toBePartiallyChecked();
    });

    it('toggles a row checkbox from the keyboard with Space', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'multiple', onChange }} />);
      const [firstRowCheckbox] = screen.getAllByRole('checkbox', { name: 'Select row' });

      firstRowCheckbox.focus();
      await user.keyboard(' ');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({ '1': true });
      expect(firstRowCheckbox).toBeChecked();
      expect(container.querySelector('tbody tr[data-selected]')).toHaveTextContent('Ada');

      await user.keyboard(' ');
      expect(onChange).toHaveBeenLastCalledWith({});
      expect(container.querySelectorAll('tbody tr[data-selected]')).toHaveLength(0);
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
      const columns: TableColumnDef<User>[] = [
        { id: 'role', header: 'Role', accessor: 'role', filter: 'text' },
        { id: 'name', header: 'Name', accessor: 'name' },
      ];
      render(<Table data={users} columns={columns} getRowId={getRowId} />);
      expect(screen.getByRole('button', { name: 'Filter column' })).toBeInTheDocument();
      // Only the filterable column gets a trigger, and the panel is not mounted until opened.
      expect(screen.getAllByRole('button', { name: 'Filter column' })).toHaveLength(1);
      expect(within(screen.getByRole('columnheader', { name: /Role/ })).getByRole('button', { name: 'Filter column' })).toHaveAttribute('aria-expanded', 'false');
      expect(within(screen.getByRole('columnheader', { name: 'Name' })).queryByRole('button')).toBeNull();
      expect(document.querySelector('[data-slot="filter-panel"]')).toBeNull();
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

    it('seeds uncontrolled filters from defaultValue, reports ColumnFiltersState payloads and clears an emptied text filter', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const columns: TableColumnDef<User>[] = [{ id: 'name', header: 'Name', accessor: 'name', filter: { type: 'text', placeholder: 'Search names' } }];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} filtering={{ defaultValue: [{ id: 'name', value: 'a' }], onChange }} />);

      // Case-insensitive substring: "a" matches Ada + Grace, not Linus.
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Grace']);
      const trigger = screen.getByRole('button', { name: 'Filter column' });
      expect(trigger).toHaveClass('tk-table-filter-button');
      expect(trigger).toHaveAttribute('data-active', '');

      await user.click(trigger);
      const searchbox = await screen.findByRole('searchbox');
      expect(searchbox).toHaveAttribute('placeholder', 'Search names');
      expect(searchbox).toHaveValue('a');
      expect(searchbox.closest('[data-slot="filter-panel"]')).toHaveClass('tk-table-filter-panel-body');

      await user.type(searchbox, 'd');
      expect(onChange).toHaveBeenLastCalledWith([{ id: 'name', value: 'ad' }]);
      expect(bodyRowTexts(container)).toEqual(['Ada']);

      // Emptying the input writes `undefined`, which removes the filter entirely.
      await user.clear(searchbox);
      expect(onChange).toHaveBeenLastCalledWith([]);
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus', 'Grace']);
      expect(trigger).not.toHaveAttribute('data-active');
      expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
    });

    it('removes the checkbox filter once the last option is unchecked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
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
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} filtering={{ onChange }} />);

      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      await user.click(await screen.findByRole('checkbox', { name: 'Admin' }));
      await user.click(screen.getByRole('checkbox', { name: 'User' }));
      expect(onChange).toHaveBeenLastCalledWith([{ id: 'role', value: ['admin', 'user'] }]);
      expect(bodyRowTexts(container)).toEqual(['admin', 'user', 'admin']);

      await user.click(screen.getByRole('checkbox', { name: 'Admin' }));
      expect(onChange).toHaveBeenLastCalledWith([{ id: 'role', value: ['user'] }]);
      expect(bodyRowTexts(container)).toEqual(['user']);

      await user.click(screen.getByRole('checkbox', { name: 'User' }));
      expect(onChange).toHaveBeenLastCalledWith([]);
      expect(bodyRowTexts(container)).toEqual(['admin', 'user', 'admin']);
      expect(screen.getByRole('button', { name: 'Filter column' })).not.toHaveAttribute('data-active');
    });

    it('renders the `multi-select` preset as a checkbox list with membership matching', async () => {
      const user = userEvent.setup();
      const columns: TableColumnDef<User>[] = [
        {
          id: 'name',
          header: 'Name',
          accessor: 'name',
          filter: {
            type: 'multi-select',
            options: [
              { label: 'Ada', value: 'Ada' },
              { label: 'Grace', value: 'Grace' },
              { label: 'Linus', value: 'Linus' },
            ],
          },
        },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} />);

      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      expect(await screen.findAllByRole('checkbox')).toHaveLength(3);
      await user.click(screen.getByRole('checkbox', { name: 'Linus' }));
      await user.click(screen.getByRole('checkbox', { name: 'Ada' }));
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus']);
    });

    it('uses equality (not substring) for the `select` preset and labels its trigger from the selection', async () => {
      const user = userEvent.setup();
      const roleOptions = [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ];
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        { id: 'role', header: 'Role', accessor: 'role', filter: { type: 'select', placeholder: 'Pick a role', options: roleOptions } },
      ];
      const ui = (value: string) => <Table data={users} columns={columns} getRowId={getRowId} filtering={{ value: [{ id: 'role', value }] }} />;
      const { container, rerender } = render(ui('adm'));

      // A partial value matches nothing under equality.
      expect(screen.getByText('No data')).toBeInTheDocument();

      rerender(ui('admin'));
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Grace']);
      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      const panel = document.querySelector('[data-slot="filter-panel"]') as HTMLElement;
      expect(within(panel).getByRole('combobox')).toHaveTextContent('Admin');
    });

    it('labels the `select` preset trigger with the placeholder, or "Select" by default, while nothing is chosen', async () => {
      const user = userEvent.setup();
      const options = [{ label: 'Admin', value: 'admin' }];
      const withPlaceholder: TableColumnDef<User>[] = [{ id: 'role', header: 'Role', accessor: 'role', filter: { type: 'select', placeholder: 'Pick a role', options } }];
      const { unmount } = render(<Table data={users} columns={withPlaceholder} getRowId={getRowId} />);

      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      expect(within(document.querySelector('[data-slot="filter-panel"]') as HTMLElement).getByRole('combobox')).toHaveTextContent('Pick a role');
      unmount();

      const withoutPlaceholder: TableColumnDef<User>[] = [{ id: 'role', header: 'Role', accessor: 'role', filter: { type: 'select', options } }];
      render(<Table data={users} columns={withoutPlaceholder} getRowId={getRowId} />);
      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      expect(within(document.querySelector('[data-slot="filter-panel"]') as HTMLElement).getByRole('combobox')).toHaveTextContent('Select');
    });

    it('hands a custom render the column and a close() that dismisses the popover', async () => {
      const user = userEvent.setup();
      const columns: TableColumnDef<User>[] = [
        {
          id: 'name',
          header: 'Name',
          accessor: 'name',
          filter: {
            render: ({ column, close }) => (
              <button type="button" onClick={close}>
                Done with {column.id}
              </button>
            ),
          },
        },
      ];
      render(<Table data={users} columns={columns} getRowId={getRowId} />);
      const trigger = screen.getByRole('button', { name: 'Filter column' });

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await user.click(await screen.findByRole('button', { name: 'Done with name' }));
      expect(screen.queryByRole('button', { name: 'Done with name' })).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('picks a value from the `select` preset without dismissing the filter popover', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const columns: TableColumnDef<User>[] = [
        {
          id: 'role',
          header: 'Role',
          accessor: 'role',
          filter: {
            type: 'select',
            options: [
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
            ],
          },
        },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} filtering={{ onChange }} />);
      const trigger = screen.getByRole('button', { name: 'Filter column' });

      await user.click(trigger);
      const panel = document.querySelector('[data-slot="filter-panel"]') as HTMLElement;
      await user.click(within(panel).getByRole('combobox'));

      // The listbox is portalled into the panel, so opening and focusing it is
      // not an outside interaction for the surrounding Popover.
      const listbox = await screen.findByRole('listbox');
      expect(panel).toContainElement(listbox);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.click(within(listbox).getByRole('option', { name: 'User' }));

      expect(onChange).toHaveBeenLastCalledWith([{ id: 'role', value: 'user' }]);
      expect(bodyRowTexts(container)).toEqual(['user']);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('data-active', '');
      expect(within(panel).getByRole('combobox')).toHaveTextContent('User');
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });

    it('prefers an explicit filterFn over the value-shape default', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        {
          id: 'age',
          header: 'Age',
          accessor: 'age',
          // "Minimum age" — the shape default for a number would be strict equality.
          filter: { filterFn: (row, columnId, value) => row.getValue<number>(columnId) >= Number(value), render: () => null },
        },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} filtering={{ value: [{ id: 'age', value: 35 }] }} />);
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus']);
    });

    it('matches a custom render filter by value shape when no filterFn is given (array → membership, other → equality)', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        { id: 'role', header: 'Role', accessor: 'role', filter: { render: () => null } },
        { id: 'age', header: 'Age', accessor: 'age', filter: { render: () => null } },
      ];
      const ui = (filters: { id: string; value: unknown }[]) => <Table data={users} columns={columns} getRowId={getRowId} filtering={{ value: filters }} />;
      const { container, rerender } = render(ui([{ id: 'role', value: ['user', 'guest'] }]));
      expect(bodyRowTexts(container)).toEqual(['Linus']);

      rerender(ui([{ id: 'age', value: 28 }]));
      expect(bodyRowTexts(container)).toEqual(['Grace']);
    });

    it('does not narrow rows or mark triggers active for empty controlled filter values', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', filter: 'text' },
        { id: 'role', header: 'Role', accessor: 'role', filter: { type: 'checkbox', options: [{ label: 'Admin', value: 'admin' }] } },
        { id: 'city', header: 'City', accessor: 'profile.city', filter: { type: 'select', options: [{ label: 'London', value: 'London' }] } },
        { id: 'age', header: 'Age', accessor: 'age', filter: { render: () => null } },
      ];
      const { container } = render(
        <Table
          data={users}
          columns={columns}
          getRowId={getRowId}
          filtering={{
            value: [
              { id: 'name', value: '' },
              { id: 'role', value: [] },
              { id: 'city', value: '' },
              { id: 'age', value: '' },
            ],
          }}
        />,
      );

      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus', 'Grace']);
      const triggers = screen.getAllByRole('button', { name: 'Filter column' });
      expect(triggers).toHaveLength(4);
      for (const trigger of triggers) expect(trigger).not.toHaveAttribute('data-active');
    });

    it('opens the filter popover from the keyboard, focuses its control and dismisses on Escape or an outside press', async () => {
      const user = userEvent.setup();
      const columns: TableColumnDef<User>[] = [{ id: 'name', header: 'Name', accessor: 'name', filter: 'text' }];
      render(<Table data={users} columns={columns} getRowId={getRowId} />);
      const trigger = screen.getByRole('button', { name: 'Filter column' });

      trigger.focus();
      await user.keyboard('{Enter}');
      const searchbox = await screen.findByRole('searchbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(searchbox).toHaveFocus();
      // The trigger controls the Table-classed popover content that hosts the panel slot.
      const content = document.getElementById(trigger.getAttribute('aria-controls') ?? '');
      expect(content).toHaveClass('tk-table-filter-panel');
      expect(content).toContainElement(document.querySelector('[data-slot="filter-panel"]'));
      expect(content).toContainElement(searchbox);

      await user.keyboard('{Escape}');
      expect(screen.queryByRole('searchbox')).toBeNull();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();

      await user.click(trigger);
      expect(await screen.findByRole('searchbox')).toBeInTheDocument();
      await user.click(document.body);
      expect(screen.queryByRole('searchbox')).toBeNull();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
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

    it('reveals flattened sub-rows in tree mode (getSubRows) and suppresses the detail panel', async () => {
      const user = userEvent.setup();
      interface TreeUser extends User {
        reports?: TreeUser[];
      }
      const tree: TreeUser[] = [
        { id: '1', name: 'Ada', role: 'admin', age: 42, profile: { city: 'London' }, reports: [{ id: '1a', name: 'Junior', role: 'user', age: 24, profile: { city: 'Leeds' } }] },
      ];
      const treeColumns: TableColumnDef<TreeUser>[] = [{ id: 'name', header: 'Name', accessor: 'name' }];

      const { container } = render(
        // `expansion.render` supplied alongside `getSubRows` must NOT double-render:
        // tree mode wins, so the detail panel is suppressed.
        <Table
          data={tree}
          columns={treeColumns}
          getRowId={(row: TreeUser) => row.id}
          getSubRows={row => row.reports}
          expansion={{ render: () => <span>SHOULD NOT RENDER</span> }}
        />,
      );

      expect(screen.queryByText('Junior')).not.toBeInTheDocument();
      expect(container.querySelectorAll('tbody tr')).toHaveLength(1);
      await user.click(screen.getAllByRole('button', { name: 'Expand row' })[0]);
      // Sub-row is now a real body row (2 rows: parent + flattened child).
      expect(screen.getByText('Junior')).toBeInTheDocument();
      expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
      // Detail panel suppressed.
      expect(screen.queryByText('SHOULD NOT RENDER')).not.toBeInTheDocument();
      expect(container.querySelector('.tk-table-expanded-row')).not.toBeInTheDocument();
    });

    it('toggles the disclosure button state, reports ExpandedState payloads and collapses again', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} expansion={{ render: row => <span>Detail for {row.name}</span>, onChange }} />);

      const toggle = screen.getAllByRole('button', { name: 'Expand row' })[0];
      expect(toggle).toHaveClass('tk-table-expand-button');
      expect(toggle).toHaveAttribute('data-slot', 'expand-button');
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(toggle.closest('td')).toHaveClass('tk-table-expand-cell');
      expect(container.querySelector('th[data-slot="expand-cell"]')).toBeInTheDocument();

      await user.click(toggle);
      expect(onChange).toHaveBeenLastCalledWith({ '1': true });
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(toggle).toHaveAccessibleName('Collapse row');
      const detailRow = container.querySelector('tr[data-slot="expanded-row"]') as HTMLElement;
      expect(detailRow).toHaveClass('tk-table-expanded-row');
      expect(detailRow).toHaveTextContent('Detail for Ada');
      // Spans the 4 data columns + the expand utility column.
      expect(detailRow.querySelector('td')).toHaveAttribute('colspan', '5');

      await user.click(screen.getByRole('button', { name: 'Collapse row' }));
      expect(onChange).toHaveBeenLastCalledWith({});
      expect(screen.queryByText('Detail for Ada')).not.toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('keeps controlled expansion until the parent commits it', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const ui = (value: Record<string, boolean>) => (
        <Table data={users} columns={baseColumns} getRowId={getRowId} expansion={{ value, onChange, render: row => <span>Detail for {row.name}</span> }} />
      );
      const { rerender } = render(ui({}));

      await user.click(screen.getAllByRole('button', { name: 'Expand row' })[1]);
      expect(onChange).toHaveBeenCalledWith({ '2': true });
      expect(screen.queryByText('Detail for Linus')).not.toBeInTheDocument();

      rerender(ui({ '2': true }));
      expect(screen.getByText('Detail for Linus')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Collapse row' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows the tree toggle only on rows with sub-rows and expands everything from defaultValue: true', () => {
      interface TreeUser extends User {
        reports?: TreeUser[];
      }
      const tree: TreeUser[] = [
        { id: '1', name: 'Ada', role: 'admin', age: 42, profile: { city: 'London' }, reports: [{ id: '1a', name: 'Junior', role: 'user', age: 24, profile: { city: 'Leeds' } }] },
        { id: '2', name: 'Linus', role: 'user', age: 35, profile: { city: 'Helsinki' } },
      ];
      const columns: TableColumnDef<TreeUser>[] = [{ id: 'name', header: 'Name', accessor: 'name', cell: ({ row }) => <span data-depth={row.depth}>{row.original.name}</span> }];
      const { container } = render(<Table data={tree} columns={columns} getRowId={(row: TreeUser) => row.id} getSubRows={row => row.reports} expansion={{ defaultValue: true }} />);

      // Sub-rows are flattened into body rows directly beneath their parent.
      expect(Array.from(container.querySelectorAll('tbody td[data-slot="cell"]')).map(cell => cell.textContent)).toEqual(['Ada', 'Junior', 'Linus']);
      // Only Ada has children → exactly one toggle, already expanded.
      const toggles = screen.getAllByRole('button', { name: 'Collapse row' });
      expect(toggles).toHaveLength(1);
      expect(screen.queryByRole('button', { name: 'Expand row' })).toBeNull();
      expect(screen.getByText('Junior')).toHaveAttribute('data-depth', '1');
    });
  });

  describe('pagination', () => {
    it('paginates client-side and gates the navigation buttons', async () => {
      const user = userEvent.setup();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} pagination={{ pageSize: 2 }} />);

      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus']);
      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      expect(container.querySelector('.tk-table-pagination-info')).toHaveTextContent('Page 1 of 2');
      expect(within(container.querySelector('.tk-table-pagination-nav') as HTMLElement).getAllByRole('button')).toHaveLength(6);
      expect(screen.getByRole('button', { name: 'Page 1, current page' })).toHaveAttribute('aria-current', 'page');
      expect(container.querySelector('.tk-table-pagination-size .tk-select')).toBeInTheDocument();

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

    it('includes the active pageSize in the size Select even when it is outside pageSizeOptions', async () => {
      const user = userEvent.setup();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} pagination={{ pageSize: 3, pageSizeOptions: [10, 25, 50] }} />);

      // pageSize 3 is not one of the options — it must still be a selectable item.
      const sizeSelect = container.querySelector('.tk-table-pagination-size .tk-select-trigger') as HTMLElement;
      await user.click(sizeSelect);
      expect(screen.getByRole('option', { name: '3' })).toBeInTheDocument();
      // Folded in and kept in ascending order.
      expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['3', '10', '25', '50']);
    });

    it('condenses large page ranges around the current page', () => {
      const { container } = render(
        <Table data={users} columns={baseColumns} getRowId={getRowId} manual pagination={{ pageSize: 10, pageIndex: 5, rowCount: 100 }} onDataRequest={vi.fn()} />,
      );
      const actions = container.querySelector('.tk-table-pagination-nav') as HTMLElement;

      expect(within(actions).getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
      expect(within(actions).getByRole('button', { name: 'Page 6, current page' })).toHaveAttribute('aria-current', 'page');
      expect(within(actions).getByRole('button', { name: 'Go to page 10' })).toBeInTheDocument();
      expect(actions.querySelectorAll(':scope > span')).toHaveLength(2);
      // First, one neighbour either side of the current page, then last — nothing else.
      expect(
        within(actions)
          .getAllByRole('button')
          .map(button => button.getAttribute('aria-label'))
          .filter(label => /page \d+/i.test(label ?? '')),
      ).toEqual(['Go to page 1', 'Go to page 5', 'Page 6, current page', 'Go to page 7', 'Go to page 10']);
    });

    it('condenses toward the edges when the current page is near the start or the end', () => {
      const ui = (pageIndex: number) => (
        <Table data={users} columns={baseColumns} getRowId={getRowId} manual pagination={{ pageSize: 10, pageIndex, rowCount: 100 }} onDataRequest={vi.fn()} />
      );
      const { container, rerender } = render(ui(8));
      const nav = container.querySelector('[data-slot="pagination-nav"]') as HTMLElement;
      const pageLabels = () =>
        within(nav)
          .getAllByRole('button')
          .map(button => button.getAttribute('aria-label'))
          .filter(label => /page \d+/i.test(label ?? ''));

      expect(pageLabels()).toEqual(['Go to page 1', 'Go to page 6', 'Go to page 7', 'Go to page 8', 'Page 9, current page', 'Go to page 10']);
      expect(nav.querySelectorAll(':scope > span[aria-hidden="true"]')).toHaveLength(1);

      rerender(ui(0));
      expect(pageLabels()).toEqual(['Page 1, current page', 'Go to page 2', 'Go to page 3', 'Go to page 4', 'Go to page 5', 'Go to page 10']);
      expect(nav.querySelectorAll(':scope > span[aria-hidden="true"]')).toHaveLength(1);
    });

    it('navigates with First / Previous / Last / numbered buttons and reports PaginationState payloads', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Table data={manyUsers} columns={nameColumns} getRowId={getRowId} pagination={{ pageSize: 5, onChange }} />);
      const info = container.querySelector('[data-slot="pagination-info"]') as HTMLElement;
      const region = screen.getByRole('navigation', { name: 'Pagination' });

      expect(region).toHaveClass('tk-table-pagination');
      expect(within(info).getByText('Page 1 of 3')).toBeInTheDocument();
      expect(within(info).getByText('Items 1-5 of 12')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();

      await user.click(screen.getByRole('button', { name: 'Last page' }));
      expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 2, pageSize: 5 });
      expect(bodyRowTexts(container)).toEqual(['User 11', 'User 12']);
      expect(within(info).getByText('Items 11-12 of 12')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

      await user.click(screen.getByRole('button', { name: 'Previous page' }));
      expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 5 });
      expect(within(info).getByText('Page 2 of 3')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'First page' }));
      expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 5 });
      expect(bodyRowTexts(container)).toEqual(['User 1', 'User 2', 'User 3', 'User 4', 'User 5']);

      await user.click(screen.getByRole('button', { name: 'Go to page 3' }));
      expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 2, pageSize: 5 });
      expect(screen.getByRole('button', { name: 'Page 3, current page' })).toHaveAttribute('aria-current', 'page');
      expect(onChange).toHaveBeenCalledTimes(4);
    });

    it('enables pagination with defaults for `pagination: true` and resizes pages from the Rows per page Select', async () => {
      const user = userEvent.setup();
      const { container } = render(<Table data={manyUsers} columns={nameColumns} getRowId={getRowId} pagination />);
      const info = container.querySelector('[data-slot="pagination-info"]') as HTMLElement;

      expect(container.querySelectorAll('tbody tr')).toHaveLength(10);
      expect(within(info).getByText('Page 1 of 2')).toBeInTheDocument();

      const sizeTrigger = screen.getByRole('combobox', { name: 'Rows per page' });
      expect(sizeTrigger).toHaveTextContent('10');
      await user.click(sizeTrigger);
      expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['10', '25', '50', '100']);

      await user.click(screen.getByRole('option', { name: '25' }));
      expect(container.querySelectorAll('tbody tr')).toHaveLength(12);
      expect(within(info).getByText('Page 1 of 1')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveTextContent('25');
    });

    it('jumps via the Go to page field, clamping out-of-range input and ignoring an empty submit', async () => {
      const user = userEvent.setup();
      const { container } = render(<Table data={manyUsers} columns={nameColumns} getRowId={getRowId} pagination={{ pageSize: 5 }} />);
      const info = container.querySelector('[data-slot="pagination-info"]') as HTMLElement;
      const input = screen.getByRole('spinbutton', { name: 'Go to page' });

      expect(input).toHaveAttribute('max', '3');
      expect(input).toHaveAttribute('placeholder', '1');

      await user.click(input);
      await user.keyboard('{Enter}');
      expect(within(info).getByText('Page 1 of 3')).toBeInTheDocument();

      await user.type(input, '99');
      await user.click(goToPageButton(container));
      expect(within(info).getByText('Page 3 of 3')).toBeInTheDocument();
      expect(input).toHaveValue(null); // cleared after a jump

      await user.type(input, '0{enter}');
      expect(within(info).getByText('Page 1 of 3')).toBeInTheDocument();
    });

    it('reports "0 items" and disables forward navigation + the page jump when there are no rows', () => {
      const { container } = render(<Table data={[]} columns={nameColumns} getRowId={getRowId} pagination />);
      const info = container.querySelector('[data-slot="pagination-info"]') as HTMLElement;
      const nav = container.querySelector('[data-slot="pagination-nav"]') as HTMLElement;

      expect(within(info).getByText('Page 1')).toBeInTheDocument();
      expect(within(info).getByText('0 items')).toBeInTheDocument();
      // No numbered page buttons — only First / Previous / Next / Last, all disabled.
      const buttons = within(nav).getAllByRole('button');
      expect(buttons).toHaveLength(4);
      for (const button of buttons) expect(button).toBeDisabled();
      expect(screen.getByRole('spinbutton', { name: 'Go to page' })).toBeDisabled();
      expect(goToPageButton(container)).toBeDisabled();
    });

    it('follows changed pageIndex / pageSize props in client mode without resetting user navigation on unrelated re-renders', async () => {
      const user = userEvent.setup();
      const ui = (pagination: { pageIndex: number; pageSize: number }, striped = false) => (
        <Table data={manyUsers} columns={nameColumns} getRowId={getRowId} pagination={pagination} striped={striped} />
      );
      const { container, rerender } = render(ui({ pageIndex: 0, pageSize: 5 }));
      const info = container.querySelector('[data-slot="pagination-info"]') as HTMLElement;

      rerender(ui({ pageIndex: 2, pageSize: 5 }));
      expect(bodyRowTexts(container)).toEqual(['User 11', 'User 12']);
      expect(within(info).getByText('Page 3 of 3')).toBeInTheDocument();

      rerender(ui({ pageIndex: 2, pageSize: 4 }));
      expect(container.querySelectorAll('tbody tr')).toHaveLength(4);
      expect(screen.getByRole('combobox', { name: 'Rows per page' })).toHaveTextContent('4');

      await user.click(screen.getByRole('button', { name: 'First page' }));
      expect(within(info).getByText('Page 1 of 3')).toBeInTheDocument();
      // Same pagination props + an unrelated prop change must not snap back to pageIndex 2.
      rerender(ui({ pageIndex: 2, pageSize: 4 }, true));
      expect(within(info).getByText('Page 1 of 3')).toBeInTheDocument();
      expect(bodyRowTexts(container)).toEqual(['User 1', 'User 2', 'User 3', 'User 4']);
    });

    it('reports a Rows per page change through pagination.onChange with the recomputed page', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Table data={manyUsers} columns={nameColumns} getRowId={getRowId} pagination={{ pageSize: 5, onChange }} />);
      const info = container.querySelector('[data-slot="pagination-info"]') as HTMLElement;

      await user.click(screen.getByRole('button', { name: 'Next page' }));
      expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 5 });

      await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
      await user.click(screen.getByRole('option', { name: '25' }));
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 25 });
      expect(container.querySelectorAll('tbody tr')).toHaveLength(12);
      expect(within(info).getByText('Items 1-12 of 12')).toBeInTheDocument();
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

    it('does NOT re-fire onDataRequest when a controlled sorting array changes identity but not value', () => {
      const fetchSpy = vi.fn();
      const props = (sorting: { id: string; desc: boolean }[]) => (
        <Table
          data={users}
          columns={baseColumns}
          getRowId={getRowId}
          manual
          sorting={{ value: sorting }}
          pagination={{ pageSize: 10, rowCount: 50 }}
          onDataRequest={() => fetchSpy()}
        />
      );
      // Fresh array identity, same value — the serialized request key keeps the
      // effect from self-sustaining a refetch loop.
      const { rerender } = render(props([{ id: 'name', desc: false }]));
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      rerender(props([{ id: 'name', desc: false }]));
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('resets pageIndex to 0 when sorting changes mid-pagination (server mode)', async () => {
      const user = userEvent.setup();
      const onPaginationChange = vi.fn();
      render(
        <Table
          data={users}
          columns={baseColumns}
          getRowId={getRowId}
          manual
          pagination={{ pageSize: 10, pageIndex: 3, rowCount: 100, onChange: onPaginationChange }}
          onDataRequest={vi.fn()}
        />,
      );

      // Toggling a sortable header from page 3 must snap pagination back to page 0
      // so the next fetch isn't for an out-of-range page.
      await user.click(screen.getByRole('button', { name: 'Name' }));
      expect(onPaginationChange).toHaveBeenCalledWith(expect.objectContaining({ pageIndex: 0 }));
    });

    it('keeps server pagination controlled and requests a page only once the parent commits it', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onDataRequest = vi.fn();
      const ui = (pageIndex: number) => (
        <Table data={users} columns={baseColumns} getRowId={getRowId} manual pagination={{ pageSize: 10, pageIndex, rowCount: 30, onChange }} onDataRequest={onDataRequest} />
      );
      const { container, rerender } = render(ui(0));
      const info = container.querySelector('[data-slot="pagination-info"]') as HTMLElement;

      expect(within(info).getByText('Page 1 of 3')).toBeInTheDocument();
      expect(within(info).getByText('Items 1-10 of 30')).toBeInTheDocument();
      expect(onDataRequest).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole('button', { name: 'Next page' }));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 10 });
      // Not committed yet → the page and the request stay put.
      expect(within(info).getByText('Page 1 of 3')).toBeInTheDocument();
      expect(onDataRequest).toHaveBeenCalledTimes(1);

      rerender(ui(1));
      expect(within(info).getByText('Page 2 of 3')).toBeInTheDocument();
      expect(within(info).getByText('Items 11-20 of 30')).toBeInTheDocument();
      expect(onDataRequest).toHaveBeenCalledTimes(2);
      expect(onDataRequest).toHaveBeenLastCalledWith({ pagination: { pageIndex: 1, pageSize: 10 }, sorting: [], filters: [] });
      // The supplied server page is rendered as-is — no client-side slicing.
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus', 'Grace']);
    });

    it('bundles sort and filter state into onDataRequest without sorting or filtering the loaded rows in memory', async () => {
      const user = userEvent.setup();
      const onDataRequest = vi.fn();
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sortable: true },
        { id: 'role', header: 'Role', accessor: 'role', filter: 'text' },
      ];
      const { container } = render(
        <Table
          data={users}
          columns={columns}
          getRowId={getRowId}
          manual
          filtering={{ defaultValue: [{ id: 'role', value: 'admin' }] }}
          pagination={{ pageSize: 10, rowCount: 3 }}
          onDataRequest={onDataRequest}
        />,
      );

      expect(onDataRequest).toHaveBeenLastCalledWith({ pagination: { pageIndex: 0, pageSize: 10 }, sorting: [], filters: [{ id: 'role', value: 'admin' }] });
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus', 'Grace']);
      expect(screen.getByRole('button', { name: 'Filter column' })).toHaveAttribute('data-active', '');

      await user.click(screen.getByRole('button', { name: 'Name' }));
      expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'ascending');
      expect(onDataRequest).toHaveBeenCalledTimes(2);
      expect(onDataRequest).toHaveBeenLastCalledWith({
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [{ id: 'name', desc: false }],
        filters: [{ id: 'role', value: 'admin' }],
      });
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus', 'Grace']);
    });

    it('resets pageIndex to 0 when a filter changes mid-pagination (server mode)', async () => {
      const user = userEvent.setup();
      const onPaginationChange = vi.fn();
      const onDataRequest = vi.fn();
      const columns: TableColumnDef<User>[] = [{ id: 'name', header: 'Name', accessor: 'name', filter: 'text' }];
      const { container } = render(
        <Table
          data={users}
          columns={columns}
          getRowId={getRowId}
          manual
          pagination={{ pageSize: 10, pageIndex: 3, rowCount: 100, onChange: onPaginationChange }}
          onDataRequest={onDataRequest}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      await user.type(await screen.findByRole('searchbox'), 'A');

      expect(onPaginationChange).toHaveBeenCalledTimes(1);
      expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 0, pageSize: 10 });
      expect(onDataRequest).toHaveBeenLastCalledWith(expect.objectContaining({ filters: [{ id: 'name', value: 'A' }] }));
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus', 'Grace']);
    });

    it('issues exactly one request with page 0 and the new sort when the parent commits the page reset', async () => {
      const user = userEvent.setup();
      const onDataRequest = vi.fn();
      const ServerTable = () => {
        const [pageIndex, setPageIndex] = useState(3);
        return (
          <Table
            data={users}
            columns={baseColumns}
            getRowId={getRowId}
            manual
            pagination={{ pageSize: 10, pageIndex, rowCount: 100, onChange: next => setPageIndex(next.pageIndex) }}
            onDataRequest={onDataRequest}
          />
        );
      };
      const { container } = render(<ServerTable />);
      const info = container.querySelector('[data-slot="pagination-info"]') as HTMLElement;

      expect(onDataRequest).toHaveBeenCalledTimes(1);
      expect(onDataRequest).toHaveBeenLastCalledWith({ pagination: { pageIndex: 3, pageSize: 10 }, sorting: [], filters: [] });
      expect(within(info).getByText('Page 4 of 10')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Name' }));
      // No intermediate request for the stale (out-of-range) page with the new sort.
      expect(onDataRequest).toHaveBeenCalledTimes(2);
      expect(onDataRequest).toHaveBeenLastCalledWith({ pagination: { pageIndex: 0, pageSize: 10 }, sorting: [{ id: 'name', desc: false }], filters: [] });
      expect(within(info).getByText('Page 1 of 10')).toBeInTheDocument();
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

    it('offsets right pins from the right edge, pins utility cells with a left pin and layers z-index under stickyHeader', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sticky: 'left', width: 120 },
        { id: 'role', header: 'Role', accessor: 'role' },
        { id: 'city', header: 'City', accessor: 'profile.city', sticky: 'right', width: 100 },
        { id: 'age', header: 'Age', accessor: 'age', sticky: 'right', width: 80 },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} stickyHeader selection={{ mode: 'multiple' }} />);
      const [selectionTh, nameTh, roleTh, cityTh, ageTh] = Array.from(container.querySelectorAll<HTMLElement>('thead th'));
      const [selectionTd, nameTd, roleTd, cityTd, ageTd] = Array.from(container.querySelectorAll<HTMLElement>('tbody tr:first-child td'));

      // A left-pinned data column pulls the leading utility cell into the pinned group.
      expect(selectionTh).toHaveAttribute('data-sticky', 'left');
      expect(selectionTd).toHaveAttribute('data-sticky', 'left');
      expect(selectionTd.style.left).toBe('0px');
      expect(nameTd).toHaveAttribute('data-sticky', 'left');
      expect(nameTd.style.left).toBe('48px');
      expect(nameTd.style.width).toBe('120px');

      // Right pins accumulate the widths of the pins that follow them.
      expect(ageTd).toHaveAttribute('data-sticky', 'right');
      expect(ageTd.style.right).toBe('0px');
      expect(cityTh).toHaveAttribute('data-sticky', 'right');
      expect(cityTh.style.right).toBe('80px');
      expect(cityTd.style.right).toBe('80px');
      expect(cityTd.style.width).toBe('100px');

      // z-index layers: sticky body column (1) < sticky header (2) < pinned header corner (3).
      expect(nameTd.style.zIndex).toBe('1');
      expect(nameTd.style.top).toBe('');
      expect(roleTh).not.toHaveAttribute('data-sticky');
      expect(roleTh.style.position).toBe('sticky');
      expect(roleTh.style.top).toBe('0px');
      expect(roleTh.style.zIndex).toBe('2');
      expect(nameTh.style.zIndex).toBe('3');
      expect(ageTh.style.zIndex).toBe('3');

      // Unpinned, auto-width body cells get no inline positioning or width.
      expect(roleTd).not.toHaveAttribute('data-sticky');
      expect(roleTd.style.position).toBe('');
      expect(roleTd.style.width).toBe('');
    });

    it('warns in development when pinned columns are not contiguous against their edge', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const pinnedColumns = (sides: TableColumnDef<User>['sticky'][]) =>
        sides.map((sticky, index): TableColumnDef<User> => ({ id: `col-${index}`, header: `Col ${index}`, accessor: 'name', sticky, width: 100 }));

      const contiguous = render(<Table data={users} columns={pinnedColumns(['left', undefined, 'right'])} getRowId={getRowId} />);
      expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining('Non-contiguous'));
      contiguous.unmount();

      const splitLeft = render(<Table data={users} columns={pinnedColumns(['left', undefined, 'left'])} getRowId={getRowId} />);
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Non-contiguous left column pinning'));
      expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining('Non-contiguous right column pinning'));
      splitLeft.unmount();
      consoleError.mockClear();

      render(<Table data={users} columns={pinnedColumns(['right', undefined, 'right'])} getRowId={getRowId} />);
      expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Non-contiguous right column pinning'));
      expect(consoleError).not.toHaveBeenCalledWith(expect.stringContaining('Non-contiguous left column pinning'));
    });

    it('gives header and body cells an explicit width only for columns that declare one', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', width: 200 },
        { id: 'role', header: 'Role', accessor: 'role' },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} />);
      const [nameTh, roleTh] = screen.getAllByRole('columnheader');
      const [nameTd, roleTd] = Array.from(container.querySelectorAll<HTMLElement>('tbody tr:first-child td'));

      expect(nameTh.style.width).toBe('200px');
      expect(nameTd.style.width).toBe('200px');
      // A width alone does not pin the column.
      expect(nameTd).not.toHaveAttribute('data-sticky');
      expect(nameTd.style.position).toBe('');
      expect(roleTh.style.width).toBe('');
      expect(roleTd.style.width).toBe('');
    });
  });

  describe('column resizing', () => {
    const resizeColumns: TableColumnDef<User>[] = [
      { id: 'name', header: 'Name', accessor: 'name' },
      { id: 'role', header: 'Role', accessor: 'role', width: 140 },
      { id: 'age', header: 'Age', accessor: 'age', resizable: false },
    ];

    // jsdom lays nothing out; give every header cell a measurable width so the
    // first resize has an auto layout to freeze.
    // Measuring clones (`width: min-/max-content`) read 0 unless a test says otherwise.
    const mockHeaderWidth = (width: number, byHeader: Record<string, number> = {}) =>
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const isLiveHeader = this.tagName === 'TH' && !this.style.width.endsWith('-content');
        const measured = isLiveHeader ? (byHeader[this.textContent ?? ''] ?? width) : 0;
        return { width: measured, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
      });

    const handleFor = (name: string) => screen.getByRole('separator', { name: `Resize ${name} column` });
    const headerFor = (container: HTMLElement, name: string) =>
      within(container.querySelector('thead') as HTMLElement)
        .getByText(name)
        .closest('th') as HTMLElement;

    const drag = (handle: HTMLElement, from: number, to: number, pointerId = 1) => {
      fireEvent.pointerDown(handle, { clientX: from, pointerId, button: 0 });
      fireEvent.pointerMove(handle, { clientX: to, pointerId });
      fireEvent.pointerUp(handle, { clientX: to, pointerId });
    };

    it('renders no handles and keeps the auto layout without columnResizing', () => {
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} />);

      expect(screen.queryByRole('separator')).not.toBeInTheDocument();
      expect(container.querySelector('[data-slot="root"]')).not.toHaveAttribute('data-fixed-layout');
    });

    it('puts a labelled separator on every resizable header and skips resizable: false and the last column', () => {
      const header = () => <span>Custom</span>;
      const [name, role, age] = resizeColumns as [TableColumnDef<User>, TableColumnDef<User>, TableColumnDef<User>];
      const { container } = render(
        <Table
          data={users}
          columns={[
            name,
            { ...role, resizable: false },
            { id: 'city', header, accessor: 'profile.city', minWidth: 80, maxWidth: 300 },
            { ...age, resizable: true },
            { id: 'key', header: 'Key', accessor: 'id' },
          ]}
          getRowId={getRowId}
          columnResizing
        />,
      );

      const separators = screen.getAllByRole('separator');
      expect(separators).toHaveLength(3);
      expect(handleFor('Name')).toHaveAttribute('aria-orientation', 'vertical');
      expect(handleFor('Name')).toHaveAttribute('tabindex', '0');
      expect(handleFor('Name')).toHaveAttribute('aria-valuemin', '50');
      expect(handleFor('Name')).not.toHaveAttribute('aria-valuemax');
      expect(handleFor('Age')).toHaveAttribute('aria-valuenow', '150');
      // A non-string header falls back to a generic name.
      const custom = screen.getByRole('separator', { name: 'Resize column' });
      expect(custom).toHaveAttribute('aria-valuemin', '80');
      expect(custom).toHaveAttribute('aria-valuemax', '300');
      expect(headerFor(container, 'Role').querySelector('.tk-table-resize-handle')).toBeNull();
      // The last column absorbs the slack and its edge is the table's own edge.
      expect(headerFor(container, 'Key').querySelector('.tk-table-resize-handle')).toBeNull();
      expect(handleFor('Name')).toHaveClass('tk-table-resize-handle');
      expect(handleFor('Name')).toHaveAttribute('data-slot', 'resize-handle');
    });

    it('freezes the measured layout on the first drag and commits once on release', () => {
      mockHeaderWidth(120);
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);
      const root = container.querySelector('[data-slot="root"]') as HTMLElement;
      const handle = handleFor('Name');

      fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1, button: 0 });
      expect(handle).toHaveAttribute('data-resizing', '');
      fireEvent.pointerMove(handle, { clientX: 130, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 160, pointerId: 1 });

      // Live: the column follows the pointer, nothing is committed yet.
      expect(onChange).not.toHaveBeenCalled();
      expect(headerFor(container, 'Name').style.width).toBe('180px');
      expect(root).toHaveAttribute('data-fixed-layout', '');
      // Every other column is frozen at its measured width; the last one stays
      // auto and absorbs the slack, floored at its min width.
      expect(headerFor(container, 'Role').style.width).toBe('120px');
      expect(headerFor(container, 'Age').style.width).toBe('');
      expect(container.querySelector('table')).toHaveStyle({ minWidth: '350px' });

      fireEvent.pointerUp(handle, { clientX: 160, pointerId: 1 });
      expect(handle).not.toHaveAttribute('data-resizing');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({ name: 180, role: 120 });
      expect(headerFor(container, 'Name').style.width).toBe('180px');
      expect(
        within(container.querySelector('tbody') as HTMLElement)
          .getByText('Ada')
          .closest('td'),
      ).toHaveStyle({ width: '180px' });
    });

    it('falls back to the column size when nothing can be measured', () => {
      const onChange = vi.fn();
      render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);

      drag(handleFor('Role'), 0, 10);
      // jsdom measures 0 → declared width (140) / TanStack's default size (150).
      expect(onChange).toHaveBeenCalledWith({ name: 150, role: 150 });
    });

    it('clamps a drag to the default min width and to minWidth / maxWidth', () => {
      // A wide absorber, so its spare width is not what stops the drag here.
      mockHeaderWidth(120, { Age: 1000 });
      const onChange = vi.fn();
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        { id: 'role', header: 'Role', accessor: 'role', minWidth: 100, maxWidth: 200 },
        { id: 'age', header: 'Age', accessor: 'age' },
      ];
      render(<Table data={users} columns={columns} getRowId={getRowId} columnResizing={{ onChange }} />);

      drag(handleFor('Name'), 200, 0);
      expect(onChange).toHaveBeenLastCalledWith({ name: 50, role: 120 });
      drag(handleFor('Role'), 0, 500);
      expect(onChange).toHaveBeenLastCalledWith({ name: 50, role: 200 });
      drag(handleFor('Role'), 500, 0);
      expect(onChange).toHaveBeenLastCalledWith({ name: 50, role: 100 });
    });

    it('grows a column from the absorber first, then from the columns to its right, and stops there', () => {
      const onChange = vi.fn();
      // The absorber (Age) renders 200px wide; every column's content needs 80px.
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = this.style.width === 'min-content' ? (this.tagName === 'TH' ? 40 : 80) : this.tagName === 'TH' ? (this.textContent === 'Age' ? 200 : 120) : 0;
        return { width, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
      });
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);
      const handle = handleFor('Name');

      // Within the absorber's 120px spare width nothing else moves…
      fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1, button: 0 });
      fireEvent.pointerMove(handle, { clientX: 100, pointerId: 1 });
      expect(headerFor(container, 'Role').style.width).toBe('120px');
      // …past it Role gives up room (live, without a re-render) down to its 80px…
      fireEvent.pointerMove(handle, { clientX: 140, pointerId: 1 });
      expect(headerFor(container, 'Name').style.width).toBe('260px');
      expect(headerFor(container, 'Role').style.width).toBe('100px');
      // …and then the drag stops: 120 + 120 + 40.
      fireEvent.pointerMove(handle, { clientX: 300, pointerId: 1 });
      expect(headerFor(container, 'Role').style.width).toBe('80px');
      // Back below the absorber's share, Role gets its width back.
      fireEvent.pointerMove(handle, { clientX: 50, pointerId: 1 });
      expect(headerFor(container, 'Role').style.width).toBe('120px');
      fireEvent.pointerUp(handle, { clientX: 300, pointerId: 1 });
      expect(onChange).toHaveBeenLastCalledWith({ name: 280, role: 80 });

      // Shrinking is never limited.
      drag(handleFor('Name'), 0, -100);
      expect(onChange).toHaveBeenLastCalledWith({ name: 180, role: 80 });
    });

    it('never takes room from a pinned or non-resizable column', () => {
      const onChange = vi.fn();
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = this.style.width === 'min-content' ? 60 : this.tagName === 'TH' ? (this.textContent === 'City' ? 100 : 120) : 0;
        return { width, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
      });
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        { id: 'role', header: 'Role', accessor: 'role', resizable: false },
        { id: 'city', header: 'City', accessor: 'profile.city' },
        { id: 'age', header: 'Age', accessor: 'age', sticky: 'right', width: 120 },
      ];
      render(<Table data={users} columns={columns} getRowId={getRowId} columnResizing={{ onChange }} />);

      // Only the absorber (City) gives: 100 - 60 = 40px.
      drag(handleFor('Name'), 0, 300);
      expect(onChange).toHaveBeenLastCalledWith({ name: 160, role: 120, age: 120 });
    });

    it('applies the same limit to a keyboard step', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      // The absorber renders 200px wide and its longest word needs 180px.
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = this.style.width === 'min-content' ? 180 : this.tagName === 'TH' ? (this.textContent === 'Age' ? 200 : 120) : 0;
        return { width, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
      });
      render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);

      handleFor('Name').focus();
      await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
      expect(onChange).toHaveBeenLastCalledWith({ name: 140, role: 120 });
    });

    it('lets the min win over an inverted maxWidth', () => {
      const onChange = vi.fn();
      const { container } = render(
        <Table
          data={users}
          columns={[
            { id: 'name', header: 'Name', accessor: 'name', width: 90, minWidth: 80, maxWidth: 60 },
            { id: 'role', header: 'Role', accessor: 'role' },
          ]}
          getRowId={getRowId}
          columnResizing={{ onChange }}
        />,
      );

      expect(handleFor('Name')).toHaveAttribute('aria-valuemax', '80');
      // It renders at the min too, so the width on screen and the handle agree
      // and a drag that cannot move it commits nothing.
      expect(headerFor(container, 'Name').style.width).toBe('80px');
      drag(handleFor('Name'), 0, 100);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps stored widths it is not using when another column is resized', () => {
      const onChange = vi.fn();
      const ref: { current: TanStackTable<User> | null } = { current: null };
      render(<Table data={users} columns={resizeColumns} getRowId={getRowId} tableRef={ref} columnResizing={{ defaultValue: { name: 200, role: 140, age: 300 }, onChange }} />);

      act(() => ref.current?.getColumn('role')?.toggleVisibility(false));
      drag(handleFor('Name'), 0, 20);
      // The absorber's (age) and the hidden column's (role) widths survive.
      expect(onChange).toHaveBeenCalledWith({ name: 220, role: 140, age: 300 });
    });

    it('stays in the natural layout when only the absorber has a stored width', () => {
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ defaultValue: { age: 300 } }} />);

      expect(container.querySelector('[data-slot="root"]')).not.toHaveAttribute('data-fixed-layout');
      expect(headerFor(container, 'Name').style.width).toBe('');
      expect(headerFor(container, 'Age').style.width).toBe('');
    });

    it('treats a press without movement as a click and leaves the layout alone', () => {
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);
      const handle = handleFor('Name');

      fireEvent.pointerDown(handle, { clientX: 100, pointerId: 1, button: 0 });
      fireEvent.pointerUp(handle, { clientX: 100, pointerId: 1 });

      expect(onChange).not.toHaveBeenCalled();
      expect(container.querySelector('[data-slot="root"]')).not.toHaveAttribute('data-fixed-layout');
    });

    it('ignores secondary buttons, foreign pointers and moves without a press', () => {
      const onChange = vi.fn();
      render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);
      const handle = handleFor('Name');

      fireEvent.pointerMove(handle, { clientX: 50, pointerId: 1 });
      fireEvent.pointerUp(handle, { clientX: 50, pointerId: 1 });
      fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1, button: 2 });
      expect(handle).not.toHaveAttribute('data-resizing');

      fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1, button: 0 });
      fireEvent.pointerMove(handle, { clientX: 40, pointerId: 2 });
      fireEvent.pointerUp(handle, { clientX: 40, pointerId: 2 });
      expect(handle).toHaveAttribute('data-resizing', '');
      fireEvent.pointerUp(handle, { clientX: 0, pointerId: 1 });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('discards the draft on pointercancel', () => {
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);
      const handle = handleFor('Name');

      fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1, button: 0 });
      fireEvent.pointerMove(handle, { clientX: 40, pointerId: 1 });
      expect(headerFor(container, 'Name').style.width).toBe('190px');
      fireEvent.pointerCancel(handle, { clientX: 40, pointerId: 1 });

      expect(onChange).not.toHaveBeenCalled();
      expect(handle).not.toHaveAttribute('data-resizing');
      expect(container.querySelector('[data-slot="root"]')).not.toHaveAttribute('data-fixed-layout');
    });

    it('drops the draft when the pointer capture is lost mid-drag', () => {
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);
      const handle = handleFor('Name');

      fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1, button: 0 });
      fireEvent.pointerMove(handle, { clientX: 40, pointerId: 1 });
      // Another pointer's capture loss is not ours.
      fireEvent.lostPointerCapture(handle, { pointerId: 2 });
      expect(headerFor(container, 'Name').style.width).toBe('190px');
      fireEvent.lostPointerCapture(handle, { pointerId: 1 });

      expect(handle).not.toHaveAttribute('data-resizing');
      expect(container.querySelector('[data-slot="root"]')).not.toHaveAttribute('data-fixed-layout');
      // The late pointerup of the abandoned drag commits nothing.
      fireEvent.pointerUp(handle, { clientX: 40, pointerId: 1 });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('moves an unpinned column without re-rendering the body, and hands the styles back on cancel', () => {
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ defaultValue: { name: 200, role: 140 } }} />);
      const handle = handleFor('Name');
      const bodyCell = within(container.querySelector('tbody') as HTMLElement)
        .getByText('Ada')
        .closest('td') as HTMLElement;
      const tableElement = container.querySelector('table') as HTMLElement;

      fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1, button: 0 });
      // The first move renders the draft (here at the stored width)…
      fireEvent.pointerMove(handle, { clientX: 0, pointerId: 1 });
      expect(tableElement.style.minWidth).toBe('390px');
      // …later moves only touch the header cell and the min-width floor.
      fireEvent.pointerMove(handle, { clientX: 40, pointerId: 1 });
      expect(headerFor(container, 'Name').style.width).toBe('240px');
      expect(tableElement.style.minWidth).toBe('430px');
      expect(bodyCell.style.width).toBe('200px');

      fireEvent.pointerCancel(handle, { clientX: 40, pointerId: 1 });
      expect(headerFor(container, 'Name').style.width).toBe('200px');
      expect(tableElement.style.minWidth).toBe('390px');
    });

    it('re-renders every move of a pinned column so later sticky offsets follow it', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sticky: 'left', width: 120 },
        { id: 'role', header: 'Role', accessor: 'role', sticky: 'left', width: 100 },
        { id: 'city', header: 'City', accessor: 'profile.city' },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} columnResizing />);
      const handle = handleFor('Name');

      fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1, button: 0 });
      fireEvent.pointerMove(handle, { clientX: 10, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 40, pointerId: 1 });
      expect(headerFor(container, 'Role').style.left).toBe('160px');
      fireEvent.pointerUp(handle, { clientX: 40, pointerId: 1 });
    });

    it('drops the draft when the window loses focus mid-drag', () => {
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);
      const handle = handleFor('Name');

      fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1, button: 0 });
      fireEvent.pointerMove(handle, { clientX: 40, pointerId: 1 });
      fireEvent.blur(window);

      expect(handle).not.toHaveAttribute('data-resizing');
      expect(container.querySelector('[data-slot="root"]')).not.toHaveAttribute('data-fixed-layout');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('drops the draft when the dragged handle unmounts mid-drag', () => {
      const onChange = vi.fn();
      const { container, rerender } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);

      fireEvent.pointerDown(handleFor('Name'), { clientX: 0, pointerId: 1, button: 0 });
      fireEvent.pointerMove(handleFor('Name'), { clientX: 40, pointerId: 1 });
      expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-fixed-layout', '');

      rerender(
        <Table
          data={users}
          columns={resizeColumns.map(column => (column.id === 'name' ? { ...column, resizable: false } : column))}
          getRowId={getRowId}
          columnResizing={{ onChange }}
        />,
      );

      expect(container.querySelector('[data-slot="root"]')).not.toHaveAttribute('data-fixed-layout');
      expect(headerFor(container, 'Name').style.width).toBe('');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('lets the last unpinned column absorb the slack so right pins stay flush right', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        { id: 'role', header: 'Role', accessor: 'role' },
        { id: 'age', header: 'Age', accessor: 'age', sticky: 'right', width: 80 },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} columnResizing={{ defaultValue: { name: 120, role: 300 } }} />);

      expect(Array.from((container.querySelector('thead tr') as Element).children).map(cell => cell.textContent)).toEqual(['Name', 'Role', 'Age']);
      // The absorber ignores a stored width and renders no handle; the pinned
      // last column keeps its width but has no handle on the table's edge.
      expect(headerFor(container, 'Role').style.width).toBe('');
      expect(headerFor(container, 'Age').style.width).toBe('80px');
      expect(screen.getAllByRole('separator')).toEqual([handleFor('Name')]);
      expect(container.querySelector('table')).toHaveStyle({ minWidth: '250px' });
    });

    it('captures and releases the pointer when the platform supports it', () => {
      render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing />);
      const handle = handleFor('Name');
      const captured = new Set<number>();
      handle.setPointerCapture = vi.fn((id: number) => void captured.add(id));
      handle.hasPointerCapture = vi.fn((id: number) => captured.has(id));
      handle.releasePointerCapture = vi.fn((id: number) => void captured.delete(id));

      drag(handle, 0, 20, 7);

      expect(handle.setPointerCapture).toHaveBeenCalledWith(7);
      expect(handle.releasePointerCapture).toHaveBeenCalledWith(7);
    });

    it('resizes from the keyboard with Left/Right arrows and Shift for a larger step', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ defaultValue: { name: 200 }, onChange }} />);

      await user.click(document.body);
      handleFor('Name').focus();
      await user.keyboard('{ArrowRight}');
      expect(onChange).toHaveBeenLastCalledWith({ name: 210, role: 140 });
      await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
      expect(onChange).toHaveBeenLastCalledWith({ name: 160, role: 140 });
      await user.keyboard('{ArrowUp}');
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('does not commit a keyboard step that the bounds swallow', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Table
          data={users}
          columns={[
            { id: 'name', header: 'Name', accessor: 'name' },
            { id: 'role', header: 'Role', accessor: 'role' },
          ]}
          getRowId={getRowId}
          columnResizing={{ defaultValue: { name: 50 }, onChange }}
        />,
      );

      handleFor('Name').focus();
      await user.keyboard('{ArrowLeft}');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('flips the drag and arrow direction in RTL', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const realGetComputedStyle = window.getComputedStyle;
      vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
        const style = realGetComputedStyle(element, pseudo);
        if ((element as HTMLElement).classList.contains('tk-table-resize-handle')) style.direction = 'rtl';
        return style;
      });
      render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ defaultValue: { name: 200 }, onChange }} />);

      drag(handleFor('Name'), 100, 70);
      expect(onChange).toHaveBeenLastCalledWith({ name: 230, role: 140 });
      handleFor('Name').focus();
      // ArrowLeft points at the inline end in RTL, so it widens.
      await user.keyboard('{ArrowLeft}');
      expect(onChange).toHaveBeenLastCalledWith({ name: 240, role: 140 });
    });

    it('double-click returns a column to its declared width', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ defaultValue: { name: 200, role: 300 }, onChange }} />);

      await user.dblClick(handleFor('Role'));
      expect(onChange).toHaveBeenLastCalledWith({ name: 200 });
      expect(headerFor(container, 'Role').style.width).toBe('140px');

      await user.dblClick(handleFor('Name'));
      expect(onChange).toHaveBeenLastCalledWith({});
      // Nothing user-sized anymore → back to the natural auto layout.
      expect(container.querySelector('[data-slot="root"]')).not.toHaveAttribute('data-fixed-layout');
    });

    it('fits an undeclared column to its content on double-click while others stay sized', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      // Clones measured at max-content: a header and a body cell, the body one wider.
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = this.style.width === 'max-content' ? (this.tagName === 'TH' ? 90 : 233.4) : 0;
        return { width, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
      });
      const { container } = render(
        <Table
          data={users}
          columns={resizeColumns}
          getRowId={getRowId}
          columnResizing={{ defaultValue: { name: 400, role: 300 }, onChange }}
          expansion={{ render: row => <span>Detail {row.name}</span> }}
        />,
      );
      // An expanded detail row does not line up with the header and is skipped.
      await user.click(within(container.querySelector('tbody') as HTMLElement).getAllByRole('button', { name: 'Expand row' })[0] as HTMLElement);

      await user.dblClick(handleFor('Name'));
      expect(onChange).toHaveBeenLastCalledWith({ role: 300, name: 234 });
      // The probe is gone again.
      expect(container.querySelector('[aria-hidden="true"][style*="visibility"]')).toBeNull();
    });

    it('fits an unsized column too, and leaves the live content of the cells alone', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
        const width = this.style.width === 'max-content' ? 180 : this.tagName === 'IFRAME' ? 64 : 0;
        return { width, height: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
      });
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name' },
        {
          id: 'pick',
          header: 'Pick',
          cell: ({ row }) => (
            <span>
              <input type="radio" name="pick" aria-label={`Pick ${row.original.name}`} defaultChecked={row.index === 0} />
              <iframe title="preview" />
            </span>
          ),
        },
        { id: 'age', header: 'Age', accessor: 'age' },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} columnResizing={{ defaultValue: { name: 200 }, onChange }} />);

      // `pick` has no stored width (it renders at the 150px default) yet still fits.
      await user.dblClick(screen.getByRole('separator', { name: 'Resize Pick column' }));
      expect(onChange).toHaveBeenLastCalledWith({ name: 200, pick: 180 });
      expect(screen.getByRole('radio', { name: 'Pick Ada' })).toBeChecked();
      expect(container.querySelectorAll('iframe')).toHaveLength(users.length);

      // Fitting again to the same width commits nothing.
      onChange.mockClear();
      await user.dblClick(screen.getByRole('separator', { name: 'Resize Pick column' }));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('drops the width instead when the content cannot be measured', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ defaultValue: { name: 400, role: 300 }, onChange }} />);

      await user.dblClick(handleFor('Name'));
      expect(onChange).toHaveBeenLastCalledWith({ role: 300 });
      expect(headerFor(container, 'Name').style.width).toBe('150px');
    });

    it('reports the rendered header width to assistive tech', () => {
      mockHeaderWidth(120);
      const observers: Array<() => void> = [];
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(private readonly callback: () => void) {}
          observe() {
            observers.push(this.callback);
          }
          disconnect() {}
        },
      );
      render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing />);
      act(() => observers.forEach(callback => callback()));

      expect(handleFor('Name')).toHaveAttribute('aria-valuenow', '120');
      expect(handleFor('Name')).toHaveAttribute('aria-valuetext', '120 px');
    });

    it('keeps the reported width inside the announced range, as the auto layout can undercut the min', () => {
      mockHeaderWidth(30);
      const observers: Array<() => void> = [];
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(private readonly callback: () => void) {}
          observe() {
            observers.push(this.callback);
          }
          disconnect() {}
        },
      );
      render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing />);
      act(() => observers.forEach(callback => callback()));

      expect(handleFor('Name')).toHaveAttribute('aria-valuenow', '50');
    });

    it('wraps the header text so a narrow column can end it in an ellipsis', () => {
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing />);
      const label = headerFor(container, 'Name').querySelector('.tk-table-header-label');
      expect(label).toHaveTextContent('Name');
      expect(label).toHaveAttribute('data-slot', 'header-label');
    });

    it('does not fire onChange when a double-click has nothing to reset', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ onChange }} />);

      await user.dblClick(handleFor('Name'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('never widens a column declared narrower than the default min when it is shrunk', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Table data={users} columns={[{ id: 'name', header: 'Name', accessor: 'name', width: 40 }, ...resizeColumns.slice(1)]} getRowId={getRowId} columnResizing={{ onChange }} />,
      );

      expect(handleFor('Name')).toHaveAttribute('aria-valuemin', '40');
      handleFor('Name').focus();
      await user.keyboard('{ArrowLeft}');
      expect(onChange).not.toHaveBeenCalled();
      drag(handleFor('Name'), 0, -30);
      expect(onChange).not.toHaveBeenCalled();
      await user.keyboard('{ArrowRight}');
      expect(onChange).toHaveBeenLastCalledWith({ name: 50, role: 140 });
    });

    it('starts in the fixed layout from defaultValue with the utility columns in the min width', () => {
      const { container } = render(
        <Table data={[]} columns={resizeColumns} getRowId={getRowId} columnResizing={{ defaultValue: { name: 220 } }} selection={{ mode: 'multiple' }} />,
      );

      expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-fixed-layout', '');
      expect(headerFor(container, 'Name').style.width).toBe('220px');
      // Unsized columns render at their declared / default size.
      expect(headerFor(container, 'Role').style.width).toBe('140px');
      expect(headerFor(container, 'Age').style.width).toBe('');
      expect(container.querySelector('table')).toHaveStyle({ minWidth: '458px' });
      expect(container.querySelector('[data-slot="empty"]')).toHaveAttribute('colspan', '4');
    });

    it('keeps the detail-panel colSpan in the fixed layout', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Table
          data={users}
          columns={resizeColumns}
          getRowId={getRowId}
          columnResizing={{ defaultValue: { name: 220 } }}
          expansion={{ render: row => <span>Detail {row.name}</span> }}
        />,
      );

      await user.click(within(container.querySelector('tbody') as HTMLElement).getAllByRole('button', { name: 'Expand row' })[0] as HTMLElement);
      expect(screen.getByText('Detail Ada').closest('td')).toHaveAttribute('colspan', '4');
    });

    it('follows the pointer while controlled and keeps the parent value when it declines the change', () => {
      const onChange = vi.fn();
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ value: { name: 200 }, onChange }} />);
      const handle = handleFor('Name');

      fireEvent.pointerDown(handle, { clientX: 0, pointerId: 1, button: 0 });
      fireEvent.pointerMove(handle, { clientX: 50, pointerId: 1 });
      expect(headerFor(container, 'Name').style.width).toBe('250px');
      fireEvent.pointerUp(handle, { clientX: 50, pointerId: 1 });

      expect(onChange).toHaveBeenCalledWith({ name: 250, role: 140 });
      expect(headerFor(container, 'Name').style.width).toBe('200px');
    });

    it('applies a controlled value the parent commits', () => {
      const Controlled = () => {
        const [sizing, setSizing] = useState<Record<string, number>>({ name: 200 });
        return <Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing={{ value: sizing, onChange: setSizing }} />;
      };
      const { container } = render(<Controlled />);

      drag(handleFor('Name'), 0, -40);
      expect(headerFor(container, 'Name').style.width).toBe('160px');
    });

    it('moves later sticky offsets when a pinned column is resized', () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sticky: 'left', width: 120 },
        { id: 'role', header: 'Role', accessor: 'role', sticky: 'left', width: 100 },
        { id: 'city', header: 'City', accessor: 'profile.city' },
      ];
      const { container } = render(<Table data={users} columns={columns} getRowId={getRowId} columnResizing />);

      expect(headerFor(container, 'Role').style.left).toBe('120px');
      drag(handleFor('Name'), 0, 60);
      expect(headerFor(container, 'Role').style.left).toBe('180px');
    });

    it('routes tableRef sizing calls through onChange, and ignores them when resizing is off', () => {
      const ref: { current: TanStackTable<User> | null } = { current: null };
      const onChange = vi.fn();
      const { rerender } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} tableRef={ref} columnResizing={{ onChange }} />);

      act(() => ref.current?.setColumnSizing({ name: 99 }));
      expect(onChange).toHaveBeenCalledWith({ name: 99 });

      const offRef: { current: TanStackTable<User> | null } = { current: null };
      rerender(<Table data={users} columns={resizeColumns} getRowId={getRowId} tableRef={offRef} />);
      const plain = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} tableRef={offRef} />);
      act(() => offRef.current?.setColumnSizing({ name: 99 }));
      expect(plain.container.querySelector('[data-slot="root"]')).not.toHaveAttribute('data-fixed-layout');
    });

    it('composes slotProps.resizeHandle handlers and honours preventDefault and aria-label', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onKeyDown = vi.fn((event: React.KeyboardEvent) => event.preventDefault());
      const onDoubleClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
      const onPointerDown = vi.fn((event: React.PointerEvent) => event.preventDefault());
      const onPointerMove = vi.fn();
      const onPointerUp = vi.fn();
      const onPointerCancel = vi.fn();
      render(
        <Table
          data={users}
          columns={[
            { id: 'name', header: 'Name', accessor: 'name' },
            { id: 'role', header: 'Role', accessor: 'role' },
          ]}
          getRowId={getRowId}
          columnResizing={{ defaultValue: { name: 200 }, onChange }}
          slotProps={{ resizeHandle: { 'aria-label': 'Drag to resize', onKeyDown, onDoubleClick, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } }}
        />,
      );
      const handle = screen.getByRole('separator', { name: 'Drag to resize' });

      handle.focus();
      await user.keyboard('{ArrowRight}');
      await user.dblClick(handle);
      drag(handle, 0, 40);
      fireEvent.pointerCancel(handle, { pointerId: 1 });

      expect(onKeyDown).toHaveBeenCalled();
      expect(onDoubleClick).toHaveBeenCalled();
      expect(onPointerDown).toHaveBeenCalled();
      expect(onPointerMove).toHaveBeenCalled();
      expect(onPointerUp).toHaveBeenCalled();
      expect(onPointerCancel).toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('has no axe violations with resize handles in the auto and fixed layouts', async () => {
      const { container } = render(<Table data={users} columns={resizeColumns} getRowId={getRowId} columnResizing sorting={{}} />);
      expect(await axe(container)).toHaveNoViolations();

      drag(handleFor('Name'), 0, 30);
      expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-fixed-layout', '');
      expect(await axe(container)).toHaveNoViolations();
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

    it('exports every filtered + sorted row across pages, skips display-only columns and tolerates a missing instance', () => {
      const ref: { current: TanStackTable<User> | null } = { current: null };
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sortable: true },
        { id: 'role', header: 'Role', accessor: 'role', filter: 'text' },
        { id: 'actions', header: 'Actions', cell: () => <button type="button">Edit</button> },
      ];
      const { container } = render(
        <Table
          data={users}
          columns={columns}
          getRowId={getRowId}
          tableRef={ref}
          sorting={{ defaultValue: [{ id: 'name', desc: true }] }}
          filtering={{ defaultValue: [{ id: 'role', value: 'admin' }] }}
          pagination={{ pageSize: 1 }}
        />,
      );

      // One row per page on screen, but the export spans the whole filtered + sorted result.
      expect(bodyRowTexts(container)).toEqual(['Grace']);
      expect(getExportRows(ref.current)).toEqual([
        { name: 'Grace', role: 'admin' },
        { name: 'Ada', role: 'admin' },
      ]);
      expect(getExportRows(null)).toEqual([]);
      expect(getExportRows(undefined)).toEqual([]);
    });

    it('hands a callback tableRef the live instance and releases both ref forms on unmount', () => {
      const callbackRef = vi.fn();
      const callbackRender = render(<Table data={users} columns={baseColumns} getRowId={getRowId} tableRef={callbackRef} />);

      expect(callbackRef).toHaveBeenCalledTimes(1);
      const instance = callbackRef.mock.calls[0]?.[0] as TanStackTable<User>;
      expect(instance.getRowModel().rows.map(row => row.id)).toEqual(['1', '2', '3']);
      callbackRender.unmount();
      expect(callbackRef).toHaveBeenLastCalledWith(null);

      const objectRef: { current: TanStackTable<User> | null } = { current: null };
      const objectRender = render(<Table data={users} columns={baseColumns} getRowId={getRowId} tableRef={objectRef} />);
      expect(objectRef.current).not.toBeNull();
      objectRender.unmount();
      expect(objectRef.current).toBeNull();
    });
  });

  describe('loading', () => {
    it('marks the root busy and suppresses the empty copy while loading', () => {
      const { container } = render(<Table data={[]} columns={baseColumns} getRowId={getRowId} loading emptyState="No data yet" />);
      expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-loading', '');
      expect(container.querySelector('[data-slot="loading"]')).toBeInTheDocument();
      expect(screen.queryByText('No data yet')).not.toBeInTheDocument();
    });

    it('keeps rows visible, marks the table aria-busy and announces a status spinner only while loading', () => {
      const { container, rerender } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} loading />);
      const table = screen.getByRole('table');
      const overlay = container.querySelector('[data-slot="loading"]') as HTMLElement;

      expect(table).toHaveAttribute('aria-busy', 'true');
      expect(overlay).toHaveClass('tk-table-loading');
      expect(within(overlay).getByRole('status', { name: 'Loading' })).toBeInTheDocument();
      expect(bodyRowTexts(container)).toEqual(['Ada', 'Linus', 'Grace']);

      rerender(<Table data={users} columns={baseColumns} getRowId={getRowId} loading={false} />);
      expect(table).not.toHaveAttribute('aria-busy');
      expect(container.querySelector('[data-slot="root"]')).not.toHaveAttribute('data-loading');
      expect(container.querySelector('[data-slot="loading"]')).toBeNull();
      expect(screen.queryByRole('status')).toBeNull();
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

    it('layers provider theme defaultProps / className / classNames / slotProps beneath instance overrides', () => {
      const { container } = renderPlain(
        <TakeoffSparProvider
          components={{
            Table: {
              defaultProps: { size: 'small' },
              className: 'theme-root',
              classNames: { row: 'theme-row', headerCell: 'theme-header-cell' },
              slotProps: { table: { 'aria-label': 'Theme users' }, tableViewport: { title: 'theme-viewport' } },
            },
          }}
        >
          <Table
            data={users}
            columns={baseColumns}
            getRowId={getRowId}
            selection={{ mode: 'multiple' }}
            classNames={{ headerCell: 'instance-header-cell', selectionCell: 'instance-selection-cell' }}
            slotProps={{ table: { 'aria-label': 'Instance users' } }}
          />
        </TakeoffSparProvider>,
      );

      const root = container.querySelector('[data-slot="root"]');
      const viewport = container.querySelector('[data-slot="table-viewport"]');
      expect(root).toHaveClass('tk-table', 'theme-root');
      expect(root).toHaveAttribute('data-size', 'small');
      expect(viewport).toHaveAttribute('title', 'theme-viewport');
      expect(viewport).not.toHaveClass('theme-root');
      // Instance slotProps win over the theme layer for the same attribute.
      expect(screen.getByRole('table')).toHaveAccessibleName('Instance users');

      // Body rows carry the theme `row` class; the header row is a separate slot.
      const bodyRows = container.querySelectorAll('tbody tr');
      expect(bodyRows).toHaveLength(3);
      for (const row of bodyRows) expect(row).toHaveClass('tk-table-row', 'theme-row');
      expect(container.querySelector('thead tr')).toHaveClass('tk-table-header-row');
      expect(container.querySelector('thead tr')).not.toHaveClass('theme-row');

      // Theme and instance classes concatenate on the same owner node.
      expect(screen.getByRole('columnheader', { name: 'Role' })).toHaveClass('tk-table-header-cell', 'theme-header-cell', 'instance-header-cell');
      const selectionCells = container.querySelectorAll('[data-slot="selection-cell"]');
      expect(selectionCells).toHaveLength(4);
      for (const cell of selectionCells) {
        expect(cell).toHaveClass('tk-table-selection-cell', 'instance-selection-cell');
        expect(cell).not.toHaveClass('theme-header-cell');
      }
    });

    it('routes classNames.filterButton and slotProps.filterButton (theme + instance) onto the filter trigger', () => {
      const columns: TableColumnDef<User>[] = [{ id: 'name', header: 'Name', accessor: 'name', filter: 'text' }];
      renderPlain(
        <TakeoffSparProvider
          components={{
            Table: {
              classNames: { filterButton: 'theme-filter-button' },
              slotProps: { filterButton: { title: 'Theme title', lang: 'en' } },
            },
          }}
        >
          <Table
            data={users}
            columns={columns}
            getRowId={getRowId}
            classNames={{ filterButton: 'instance-filter-button' }}
            slotProps={{ filterButton: { 'title': 'Instance title', 'aria-label': 'Filter names' } }}
          />
        </TakeoffSparProvider>,
      );

      // The instance `aria-label` replaces the built-in "Filter column" label.
      const trigger = screen.getByRole('button', { name: 'Filter names' });
      expect(trigger).toHaveClass('tk-table-filter-button', 'theme-filter-button', 'instance-filter-button');
      expect(trigger).toHaveAttribute('title', 'Instance title');
      expect(trigger).toHaveAttribute('lang', 'en');
      // `Popover.Trigger` owns the node: it keeps its own data-slot; the Table
      // slot name does not ride along, and the Table state hook still lands.
      expect(trigger).toHaveAttribute('data-slot', 'root');
      expect(trigger).not.toHaveAttribute('data-active');
    });

    it('composes slotProps.tableViewport (style + onScroll) with the built-in data-scrolled hook', () => {
      const onScroll = vi.fn();
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} slotProps={{ tableViewport: { style: { maxHeight: 280 }, onScroll } }} />);
      const viewport = container.querySelector('[data-slot="table-viewport"]') as HTMLElement;

      expect(viewport.style.maxHeight).toBe('280px');
      viewport.scrollTop = 20;
      fireEvent.scroll(viewport);
      viewport.scrollTop = 40;
      fireEvent.scroll(viewport);
      expect(onScroll).toHaveBeenCalledTimes(2);
      expect(viewport).toHaveAttribute('data-scrolled', '');

      viewport.scrollTop = 0;
      fireEvent.scroll(viewport);
      expect(onScroll).toHaveBeenCalledTimes(3);
      expect(viewport).not.toHaveAttribute('data-scrolled');
    });

    it("routes classNames and slotProps for every Table-owned slot to that slot's owner node", async () => {
      const user = userEvent.setup();
      // `filterButton` is intentionally absent: the trigger is a Popover-owned node and does not
      // currently receive the slot layers (reported separately), so it is not pinned here.
      const slots: [slot: TableSlot, dataSlot: string][] = [
        ['root', 'root'],
        ['tableViewport', 'table-viewport'],
        ['table', 'table'],
        ['header', 'header'],
        ['headerRow', 'header-row'],
        ['headerCell', 'header-cell'],
        ['headerContent', 'header-content'],
        ['sortTrigger', 'sort-trigger'],
        ['sortIcon', 'sort-icon'],
        ['body', 'body'],
        ['row', 'row'],
        ['cell', 'cell'],
        ['selectionCell', 'selection-cell'],
        ['expandCell', 'expand-cell'],
        ['expandButton', 'expand-button'],
        ['expandedRow', 'expanded-row'],
        ['filterPanel', 'filter-panel'],
        ['pagination', 'pagination'],
        ['paginationInfo', 'pagination-info'],
        ['paginationNav', 'pagination-nav'],
        ['paginationActions', 'pagination-actions'],
        ['paginationSize', 'pagination-size'],
        ['paginationGoToPage', 'pagination-go-to-page'],
        ['loading', 'loading'],
        ['empty', 'empty'],
      ];
      const classNames: ClassNamesMap<TableSlot> = Object.fromEntries(slots.map(([slot]) => [slot, `custom-${slot}`]));
      const slotProps: SlotPropsMap<TableSlot> = Object.fromEntries(slots.map(([slot]) => [slot, { title: `title-${slot}` }]));
      const columns: TableColumnDef<User>[] = [{ id: 'name', header: 'Name', accessor: 'name', sortable: true, filter: 'text' }];
      const expectSlotLayers = ([slot, dataSlot]: [TableSlot, string]) => {
        const nodes = document.querySelectorAll(`.custom-${slot}`);
        expect(nodes.length, slot).toBeGreaterThan(0);
        for (const node of nodes) {
          expect(node, slot).toHaveAttribute('data-slot', dataSlot);
          expect(node, slot).toHaveAttribute('title', `title-${slot}`);
        }
        // Every owner node of that slot carries the layer (none is skipped). Nested Spar parts
        // also emit `data-slot="root"`, so the Table root is matched by its canonical class.
        const ownerSelector = dataSlot === 'root' ? '.tk-table' : `[data-slot="${dataSlot}"]`;
        expect(document.querySelectorAll(`${ownerSelector}:not(.custom-${slot})`), slot).toHaveLength(0);
      };

      const populated = render(
        <Table
          data={manyUsers}
          columns={columns}
          getRowId={getRowId}
          classNames={classNames}
          slotProps={slotProps}
          selection={{ mode: 'multiple' }}
          expansion={{ defaultValue: { '1': true }, render: row => <span>Detail for {row.name}</span> }}
          pagination={{ pageSize: 5 }}
          loading
        />,
      );
      await user.click(screen.getByRole('button', { name: 'Filter column' }));
      expect(await screen.findByRole('searchbox')).toBeInTheDocument();
      for (const entry of slots.filter(([slot]) => slot !== 'empty')) expectSlotLayers(entry);
      await user.keyboard('{Escape}');
      populated.unmount();

      render(<Table data={[]} columns={columns} getRowId={getRowId} classNames={classNames} slotProps={slotProps} />);
      expectSlotLayers(['empty', 'empty']);
      expect(screen.getByText('No data')).toHaveClass('tk-table-empty', 'custom-empty');
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

    it('has no axe violations for a filterable, paginated table while loading', async () => {
      const columns: TableColumnDef<User>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sortable: true, filter: 'text' },
        { id: 'role', header: 'Role', accessor: 'role' },
      ];
      const { container } = render(<Table data={manyUsers} columns={columns} getRowId={getRowId} pagination={{ pageSize: 5 }} loading />);

      expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Filter column' })).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('names every single-selection radio and passes axe', async () => {
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} selection={{ mode: 'single' }} />);

      expect(within(container.querySelector('tbody') as HTMLElement).getAllByRole('radio', { name: 'Select row' })).toHaveLength(3);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for an expandable table', async () => {
      const { container } = render(<Table data={users} columns={baseColumns} getRowId={getRowId} expansion={{ render: row => <span>Detail for {row.name}</span> }} />);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('exposes the go-to-page submit button by name and passes axe on a paginated table', async () => {
      const { container } = render(<Table data={manyUsers} columns={baseColumns} getRowId={getRowId} pagination={{ pageSize: 5 }} />);

      expect(screen.getByRole('button', { name: 'Go to page' })).not.toHaveAttribute('aria-hidden');
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
