import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';
import { Button } from '../button';

import { Dropdown } from './index';

describe('Dropdown', () => {
  it('renders trigger, content, and item slot classes', () => {
    render(
      <Dropdown defaultOpen size="large">
        <Dropdown.Trigger>Actions</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Arrow data-testid="dropdown-arrow" />
          <Dropdown.Label>Flight</Dropdown.Label>
          <Dropdown.Item>Edit</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
    );

    expect(screen.getByRole('button', { name: 'Actions' })).toHaveClass('tk-dropdown-trigger');
    const menu = screen.getByRole('menu');

    expect(menu).toHaveClass('tk-dropdown-content');
    expect(menu).toHaveAttribute('data-size', 'large');
    expect(screen.getByTestId('dropdown-arrow')).toHaveClass('tk-dropdown-arrow');
    expect(screen.getByText('Flight')).toHaveClass('tk-dropdown-label');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveClass('tk-dropdown-item');
  });

  it('wraps items in a viewport slot while preserving menu semantics', () => {
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>Actions</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Viewport data-testid="dropdown-viewport">
            <Dropdown.Item>Edit</Dropdown.Item>
            <Dropdown.Item>Duplicate</Dropdown.Item>
          </Dropdown.Viewport>
        </Dropdown.Content>
      </Dropdown>,
    );

    const viewport = screen.getByTestId('dropdown-viewport');
    expect(viewport).toHaveClass('tk-dropdown-viewport');
    expect(viewport).toHaveAttribute('role', 'presentation');
    // Items nested in the viewport stay menuitems owned by the menu.
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    expect(viewport).toContainElement(screen.getByRole('menuitem', { name: 'Edit' }));
  });

  it('applies explicit content width from the root', () => {
    render(
      <Dropdown defaultOpen contentWidth={280}>
        <Dropdown.Trigger>Actions</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Edit</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
    );

    expect(screen.getByRole('menu')).toHaveStyle({ width: '280px' });
  });

  it('merges the computed content width with a slotProps root style', () => {
    render(
      <Dropdown defaultOpen contentWidth={280}>
        <Dropdown.Trigger>Actions</Dropdown.Trigger>
        <Dropdown.Content slotProps={{ root: { style: { color: 'rgb(1, 2, 3)' } } }}>
          <Dropdown.Item>Edit</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
    );

    // The computed width must not clobber (or be clobbered by) a slotProps style.
    expect(screen.getByRole('menu')).toHaveStyle({ width: '280px', color: 'rgb(1, 2, 3)' });
  });

  it('opens from the trigger and calls item selection handlers', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Dropdown>
        <Dropdown.Trigger>Actions</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item onSelect={onSelect}>Archive</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Archive' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menuitem', { name: 'Archive' })).not.toBeInTheDocument();
  });

  it('supports polymorphic triggers for Takeoff Button composition', () => {
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger as={Button} variant="secondary">
          More
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Item>Download</Dropdown.Item>
        </Dropdown.Content>
      </Dropdown>,
    );

    const trigger = screen.getByRole('button', { name: 'More' });
    expect(trigger).toHaveClass('tk-button');
    expect(trigger).toHaveClass('tk-dropdown-trigger');
  });

  it('applies provider defaults and per-slot customization', () => {
    render(
      <TakeoffSparProvider
        components={{
          Dropdown: { defaultProps: { size: 'small' } },
          DropdownItem: {
            classNames: { root: 'theme-item' },
            slotProps: { root: { title: 'Theme item' } },
          },
        }}
      >
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item classNames={{ root: 'instance-item' }} slotProps={{ root: { id: 'print-item' } }}>
              Print
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      </TakeoffSparProvider>,
    );

    const content = screen.getByRole('menu');
    const item = screen.getByRole('menuitem', { name: 'Print' });

    expect(content).toHaveAttribute('data-size', 'small');
    expect(item).toHaveClass('tk-dropdown-item', 'theme-item', 'instance-item');
    expect(item).toHaveAttribute('title', 'Theme item');
    expect(item).toHaveAttribute('id', 'print-item');
  });
});
