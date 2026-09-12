import { act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type SyntheticEvent } from 'react';
import { axe } from 'vitest-axe';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';
import { Button } from '../button';

import { Dropdown, type DropdownProps } from './index';

// Floating UI settles the panel position in a promise chain after mount. Flush it
// inside act() before async work outside user-event (e.g. axe) so the positioning
// state update stays inside React's act scope.
const flushPositioning = () =>
  act(async () => {
    await new Promise<void>(resolve => setTimeout(resolve, 0));
  });

const getItem = (name: string) => screen.getByRole('menuitem', { name });

const expectHighlighted = (name: string) => {
  const item = getItem(name);
  expect(item).toHaveAttribute('data-highlighted', '');
  expect(item).toHaveFocus();
  expect(screen.getAllByRole('menuitem').filter(menuItem => menuItem.hasAttribute('data-highlighted'))).toEqual([item]);
};

interface ActionsMenuProps extends Omit<DropdownProps, 'children'> {
  onSelect?: (event: SyntheticEvent<HTMLElement>) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onFocusOutside?: (event: FocusEvent) => void;
}

// Enabled + disabled items, an item whose visible content does not start with its
// typeahead text, and a focusable control that lives outside the menu.
const ActionsMenu = ({ onSelect, onEscapeKeyDown, onPointerDownOutside, onFocusOutside, ...rootProps }: ActionsMenuProps) => (
  <>
    <Dropdown {...rootProps}>
      <Dropdown.Trigger>Actions</Dropdown.Trigger>
      <Dropdown.Content onEscapeKeyDown={onEscapeKeyDown} onPointerDownOutside={onPointerDownOutside} onFocusOutside={onFocusOutside}>
        <Dropdown.Item onSelect={onSelect}>Edit</Dropdown.Item>
        <Dropdown.Item disabled onSelect={onSelect}>
          Refund
        </Dropdown.Item>
        <Dropdown.Item>Duplicate</Dropdown.Item>
        <Dropdown.Item textValue="Archive">
          <span aria-hidden="true">#</span>
          <span>Move to storage</span>
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown>
    <button type="button">Outside</button>
  </>
);

// jsdom has no ResizeObserver. This stub records live observers so a test can
// simulate a trigger resize deterministically.
class ResizeObserverStub {
  static readonly instances = new Set<ResizeObserverStub>();

  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe() {
    ResizeObserverStub.instances.add(this);
  }

  unobserve() {}

  disconnect() {
    ResizeObserverStub.instances.delete(this);
  }

  notify() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

  describe('rendering and anatomy', () => {
    it('renders only the trigger while closed because the root is state-only', () => {
      const { container } = render(
        <Dropdown>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      const trigger = screen.getByRole('button', { name: 'Actions' });
      expect(container.children).toHaveLength(1);
      expect(container.firstElementChild).toBe(trigger);
      expect(trigger).toHaveAttribute('data-slot', 'root');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });

    it('emits the canonical class and data-slot on every compound part', () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Viewport>
              <Dropdown.Group>
                <Dropdown.Label>Flight</Dropdown.Label>
                <Dropdown.Item>Change flight</Dropdown.Item>
              </Dropdown.Group>
              <Dropdown.Separator />
              <Dropdown.Item>Download invoice</Dropdown.Item>
            </Dropdown.Viewport>
            <Dropdown.Arrow />
          </Dropdown.Content>
        </Dropdown>,
      );

      const menu = screen.getByRole('menu');
      const group = within(menu).getByRole('group');
      const parts: Array<[string, Element | null]> = [
        ['tk-dropdown-trigger', screen.getByRole('button', { name: 'Actions' })],
        ['tk-dropdown-content', menu],
        ['tk-dropdown-viewport', group.parentElement],
        ['tk-dropdown-group', group],
        ['tk-dropdown-label', within(group).getByText('Flight')],
        ['tk-dropdown-item', within(group).getByRole('menuitem', { name: 'Change flight' })],
        ['tk-dropdown-separator', within(menu).getByRole('separator')],
        ['tk-dropdown-arrow', menu.lastElementChild],
      ];

      for (const [className, node] of parts) {
        expect(node).toHaveClass(className);
        expect(node).toHaveAttribute('data-slot', 'root');
      }
      expect(menu.lastElementChild).toHaveAttribute('aria-hidden', 'true');
    });

    it('links the trigger and the menu through ids derived from the root id', () => {
      render(
        <Dropdown id="booking-actions" defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      const trigger = screen.getByRole('button', { name: 'Actions' });
      // The menu takes its accessible name from the trigger.
      const menu = screen.getByRole('menu', { name: 'Actions' });

      expect(trigger).toHaveAttribute('id', 'booking-actions-trigger');
      expect(menu).toHaveAttribute('id', 'booking-actions-content');
      expect(trigger).toHaveAttribute('aria-controls', 'booking-actions-content');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('generates unique, linked trigger and menu ids when no id is given', () => {
      render(
        <>
          <Dropdown defaultOpen>
            <Dropdown.Trigger>Booking</Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Item>Edit booking</Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
          <Dropdown defaultOpen modal={false}>
            <Dropdown.Trigger>Passenger</Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Item>Edit passenger</Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
        </>,
      );

      const bookingTrigger = screen.getByRole('button', { name: 'Booking' });
      const bookingMenu = screen.getByRole('menu', { name: 'Booking' });
      const passengerTrigger = screen.getByRole('button', { name: 'Passenger' });
      const passengerMenu = screen.getByRole('menu', { name: 'Passenger' });

      expect(bookingTrigger.id).toMatch(/.+-trigger$/);
      expect(bookingMenu.id).toBe(bookingTrigger.id.replace(/-trigger$/, '-content'));
      expect(bookingTrigger).toHaveAttribute('aria-controls', bookingMenu.id);
      expect(bookingMenu).toHaveAttribute('aria-labelledby', bookingTrigger.id);
      expect(passengerTrigger).toHaveAttribute('aria-controls', passengerMenu.id);
      expect(passengerTrigger.id).not.toBe(bookingTrigger.id);
      expect(passengerMenu.id).not.toBe(bookingMenu.id);
    });

    it('updates the content size hook when the root size changes', () => {
      const renderMenu = (size: DropdownProps['size']) => (
        <Dropdown defaultOpen size={size}>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      );
      const { rerender } = render(renderMenu('small'));
      expect(screen.getByRole('menu')).toHaveAttribute('data-size', 'small');

      rerender(renderMenu('large'));
      expect(screen.getByRole('menu')).toHaveAttribute('data-size', 'large');

      rerender(renderMenu(undefined));
      expect(screen.getByRole('menu')).toHaveAttribute('data-size', 'base');
    });

    it('defaults the content size hook to base', () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      expect(screen.getByRole('menu')).toHaveAttribute('data-size', 'base');
    });

    it.each(['small', 'base', 'large'] as const)('re-emits size="%s" on the portalled content', size => {
      render(
        <Dropdown defaultOpen size={size}>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      expect(screen.getByRole('menu')).toHaveAttribute('data-size', size);
    });

    it('portals the menu to document.body by default', () => {
      const { container } = render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      const menu = screen.getByRole('menu');
      expect(container).not.toContainElement(menu);
      expect(menu.parentElement).toBe(document.body);
    });

    it('portals the menu into a custom container', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);

      const { unmount } = render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content container={host}>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      expect(screen.getByRole('menu').parentElement).toBe(host);

      unmount();
      host.remove();
    });

    it('forwards side and align to the content placement', async () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content side="top" align="end">
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      await flushPositioning();

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('data-side', 'top');
      expect(menu).toHaveAttribute('data-align', 'end');
    });

    it('places the content on the bottom side with center alignment by default', async () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      await flushPositioning();

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('data-side', 'bottom');
      expect(menu).toHaveAttribute('data-align', 'center');
    });

    it('renders the default bordered pointer glyph when the arrow has no children', () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
            <Dropdown.Arrow />
          </Dropdown.Content>
        </Dropdown>,
      );

      const arrow = screen.getByRole('menu').lastElementChild as SVGSVGElement;
      expect(arrow).toHaveClass('tk-dropdown-arrow');
      expect(arrow.tagName.toLowerCase()).toBe('svg');
      expect(arrow.querySelectorAll('polygon')).toHaveLength(2);
      expect(arrow.querySelector('polygon.tk-arrow-border')).not.toBeNull();
      expect(arrow.querySelector('polygon.tk-arrow-fill')).not.toBeNull();
    });

    it('replaces the default arrow glyph with custom children', () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
            <Dropdown.Arrow>
              <path data-testid="custom-arrow" d="M0 0 L5 5 L10 0" />
            </Dropdown.Arrow>
          </Dropdown.Content>
        </Dropdown>,
      );

      const arrow = screen.getByRole('menu').lastElementChild as SVGSVGElement;
      expect(arrow).toHaveClass('tk-dropdown-arrow');
      expect(arrow).toContainElement(screen.getByTestId('custom-arrow'));
      expect(arrow.querySelector('.tk-arrow-border, .tk-arrow-fill')).toBeNull();
    });

    it('renders separator children as a labeled divider', () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
            <Dropdown.Separator>or</Dropdown.Separator>
            <Dropdown.Item>Delete</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      const separator = screen.getByRole('separator');
      expect(separator).toHaveClass('tk-dropdown-separator');
      expect(separator).toHaveTextContent('or');
    });

    it('renders parts as custom elements through the as prop', () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Label as="span">Documents</Dropdown.Label>
            <Dropdown.Item as="a" href="/invoice">
              Invoice
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      const link = getItem('Invoice');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/invoice');
      expect(link).toHaveClass('tk-dropdown-item');

      const label = screen.getByText('Documents');
      expect(label.tagName).toBe('SPAN');
      expect(label).toHaveClass('tk-dropdown-label');
    });

    it('forwards refs to every part owner node', () => {
      const refs = {
        trigger: createRef<HTMLButtonElement>(),
        content: createRef<HTMLDivElement>(),
        viewport: createRef<HTMLDivElement>(),
        group: createRef<HTMLDivElement>(),
        label: createRef<HTMLDivElement>(),
        item: createRef<HTMLDivElement>(),
        separator: createRef<HTMLDivElement>(),
        arrow: createRef<SVGSVGElement>(),
      };

      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger ref={refs.trigger}>Actions</Dropdown.Trigger>
          <Dropdown.Content ref={refs.content}>
            <Dropdown.Viewport ref={refs.viewport}>
              <Dropdown.Group ref={refs.group}>
                <Dropdown.Label ref={refs.label}>Flight</Dropdown.Label>
                <Dropdown.Item ref={refs.item}>Change flight</Dropdown.Item>
              </Dropdown.Group>
              <Dropdown.Separator ref={refs.separator} />
            </Dropdown.Viewport>
            <Dropdown.Arrow ref={refs.arrow} />
          </Dropdown.Content>
        </Dropdown>,
      );

      const menu = screen.getByRole('menu');
      const group = screen.getByRole('group');

      expect(refs.trigger.current).toBe(screen.getByRole('button', { name: 'Actions' }));
      expect(refs.content.current).toBe(menu);
      expect(refs.viewport.current).toBe(group.parentElement);
      expect(refs.group.current).toBe(group);
      expect(refs.label.current).toBe(screen.getByText('Flight'));
      expect(refs.item.current).toBe(getItem('Change flight'));
      expect(refs.separator.current).toBe(screen.getByRole('separator'));
      expect(refs.arrow.current).toBe(menu.lastElementChild);
    });
  });

  describe('open state', () => {
    it('toggles uncontrolled visibility from the trigger and reports each change', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onPointerDownOutside = vi.fn();

      render(<ActionsMenu onOpenChange={onOpenChange} onPointerDownOutside={onPointerDownOutside} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });

      await user.click(trigger);
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(onOpenChange).toHaveBeenNthCalledWith(1, true);

      await user.click(trigger);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      // The trigger is part of the menu's interaction boundary, not an outside press.
      expect(onPointerDownOutside).not.toHaveBeenCalled();
    });

    it('only requests opening while controlled closed', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(<ActionsMenu open={false} onOpenChange={onOpenChange} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });

      await user.click(trigger);

      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('follows the controlled open prop and only requests closing', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      const { rerender } = render(<ActionsMenu open={false} onOpenChange={onOpenChange} />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      rerender(<ActionsMenu open onOpenChange={onOpenChange} />);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Outside' }));
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.getByRole('menu')).toBeInTheDocument();

      rerender(<ActionsMenu open={false} onOpenChange={onOpenChange} />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('drives a state-backed controlled menu with a render-prop trigger label', async () => {
      const user = userEvent.setup();

      const ControlledMenu = () => {
        const [open, setOpen] = useState(false);

        return (
          <Dropdown open={open} onOpenChange={setOpen}>
            <Dropdown.Trigger>{({ isOpen }) => (isOpen ? 'Close actions' : 'Open actions')}</Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Item onSelect={() => setOpen(false)}>Done</Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
        );
      };

      render(<ControlledMenu />);

      await user.click(screen.getByRole('button', { name: 'Open actions' }));
      expect(screen.getByRole('menu', { name: 'Close actions' })).toBeInTheDocument();

      await user.click(getItem('Done'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Open actions' })).toHaveAttribute('aria-expanded', 'false');
    });

    it('exposes open, close, and toggle controls through the trigger render prop', () => {
      let controls: { open: () => void; close: () => void; toggle: () => void } | undefined;

      render(
        <Dropdown>
          <Dropdown.Trigger>
            {state => {
              controls = state;
              return state.isOpen ? 'Hide actions' : 'Show actions';
            }}
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      act(() => controls?.open());
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hide actions' })).toHaveAttribute('aria-expanded', 'true');

      act(() => controls?.toggle());
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show actions' })).toBeInTheDocument();

      act(() => controls?.toggle());
      expect(screen.getByRole('menu')).toBeInTheDocument();

      act(() => controls?.close());
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('disables the trigger and blocks opening when the root is disabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Dropdown disabled onOpenChange={onOpenChange}>
          <Dropdown.Trigger>{({ disabled }) => (disabled ? 'Actions unavailable' : 'Actions')}</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      const trigger = screen.getByRole('button', { name: 'Actions unavailable' });
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('data-disabled', '');

      await user.click(trigger);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('reports an enabled trigger through the render prop and forwards trigger clicks', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <Dropdown>
          <Dropdown.Trigger onClick={onClick}>{({ disabled, isOpen }) => `${disabled ? 'Disabled' : 'Enabled'} ${isOpen ? 'open' : 'closed'}`}</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      const trigger = screen.getByRole('button', { name: 'Enabled closed' });
      expect(trigger).toBeEnabled();
      expect(trigger).not.toHaveAttribute('data-disabled');

      await user.click(trigger);

      expect(screen.getByRole('button', { name: 'Enabled open' })).toBe(trigger);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick.mock.lastCall?.[0].type).toBe('click');
    });

    it('keeps a disabled root closed for keyboard users', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<ActionsMenu disabled onOpenChange={onOpenChange} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });

      await user.tab();
      // The disabled trigger is skipped in the tab sequence.
      expect(trigger).not.toHaveFocus();
      expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();

      // Even a keydown that reaches the trigger must not open the menu.
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });
      fireEvent.keyDown(trigger, { key: 'ArrowUp' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('blocks opening through a disabled prop on the trigger itself', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onClick = vi.fn();

      render(
        <Dropdown onOpenChange={onOpenChange}>
          <Dropdown.Trigger disabled onClick={onClick}>
            Actions
          </Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      const trigger = screen.getByRole('button', { name: 'Actions' });
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('data-disabled', '');

      await user.click(trigger);
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('selection', () => {
    it('passes the click event to onSelect with the item as currentTarget', async () => {
      const user = userEvent.setup();
      let currentTarget: EventTarget | null = null;
      const onSelect = vi.fn((event: SyntheticEvent<HTMLElement>) => {
        currentTarget = event.currentTarget;
      });

      render(<ActionsMenu defaultOpen onSelect={onSelect} />);
      const edit = getItem('Edit');

      await user.click(edit);

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect.mock.lastCall?.[0].type).toBe('click');
      expect(currentTarget).toBe(edit);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('keeps the menu open after selection when closeOnSelect is false', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<ActionsMenu defaultOpen closeOnSelect={false} onSelect={onSelect} />);

      await user.click(getItem('Edit'));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('keeps the menu open when onSelect calls preventDefault', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn((event: SyntheticEvent<HTMLElement>) => event.preventDefault());

      render(<ActionsMenu defaultOpen onSelect={onSelect} />);

      await user.click(getItem('Edit'));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('marks disabled items and ignores their selection', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(<ActionsMenu defaultOpen onSelect={onSelect} />);
      const refund = getItem('Refund');

      expect(refund).toHaveAttribute('aria-disabled', 'true');
      expect(refund).toHaveAttribute('data-disabled', '');
      expect(getItem('Edit')).not.toHaveAttribute('aria-disabled');
      expect(getItem('Edit')).not.toHaveAttribute('data-disabled');

      await user.click(refund);

      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('applies part-level theme defaultProps that an instance prop can override', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <TakeoffSparProvider components={{ DropdownItem: { defaultProps: { disabled: true } } }}>
          <Dropdown defaultOpen>
            <Dropdown.Trigger>Actions</Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Item onSelect={onSelect}>Locked</Dropdown.Item>
              <Dropdown.Item disabled={false} onSelect={onSelect}>
                Available
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
        </TakeoffSparProvider>,
      );

      expect(getItem('Locked')).toHaveAttribute('aria-disabled', 'true');
      expect(getItem('Available')).not.toHaveAttribute('aria-disabled');

      await user.click(getItem('Locked'));
      expect(onSelect).not.toHaveBeenCalled();

      await user.click(getItem('Available'));
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('reports the selection close once through onOpenChange and refocuses the trigger', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onSelect = vi.fn();
      render(<ActionsMenu onOpenChange={onOpenChange} onSelect={onSelect} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });

      await user.click(trigger);
      expect(onOpenChange).toHaveBeenCalledTimes(1);

      await user.click(getItem('Edit'));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(trigger).toHaveFocus();
    });
  });

  describe('keyboard interaction', () => {
    it('opens with ArrowDown on the trigger and highlights the first item', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu />);

      await user.tab();
      await user.keyboard('{ArrowDown}');

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expectHighlighted('Edit');
    });

    it('opens with ArrowUp on the trigger and highlights the last item', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu />);

      await user.tab();
      await user.keyboard('{ArrowUp}');

      expectHighlighted('Move to storage');
    });

    it('opens with Enter on the trigger and highlights the first item', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu />);

      await user.tab();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expectHighlighted('Edit');
    });

    it('moves the highlight with arrows, skips disabled items, and jumps with Home/End', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu />);

      await user.tab();
      await user.keyboard('{ArrowDown}');
      expectHighlighted('Edit');

      await user.keyboard('{ArrowDown}');
      expectHighlighted('Duplicate');

      await user.keyboard('{End}');
      expectHighlighted('Move to storage');

      await user.keyboard('{ArrowUp}');
      expectHighlighted('Duplicate');

      await user.keyboard('{Home}');
      expectHighlighted('Edit');
    });

    it('selects the highlighted item with Enter and returns focus to the trigger', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<ActionsMenu onSelect={onSelect} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect.mock.lastCall?.[0]).toMatchObject({ type: 'keydown', key: 'Enter' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });

    it('closes on Escape, forwards the native KeyboardEvent, and returns focus to the trigger', async () => {
      const user = userEvent.setup();
      const onEscapeKeyDown = vi.fn();
      const onOpenChange = vi.fn();
      render(<ActionsMenu onEscapeKeyDown={onEscapeKeyDown} onOpenChange={onOpenChange} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Escape}');

      expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
      const [event] = onEscapeKeyDown.mock.lastCall ?? [];
      expect(event).toBeInstanceOf(KeyboardEvent);
      expect(event.key).toBe('Escape');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(trigger).toHaveFocus();
    });

    it('highlights items by typeahead using textValue when the content is not plain text', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu />);

      await user.tab();
      await user.keyboard('{ArrowDown}');
      expectHighlighted('Edit');

      await user.keyboard('a');

      expectHighlighted('Move to storage');
    });

    it('opens with Space on the trigger and activates the highlighted item with Space', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onOpenChange = vi.fn();
      render(<ActionsMenu onSelect={onSelect} onOpenChange={onOpenChange} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });

      await user.tab();
      await user.keyboard(' ');

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expectHighlighted('Edit');
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      await user.keyboard(' ');

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect.mock.lastCall?.[0]).toMatchObject({ type: 'keydown', key: ' ' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(trigger).toHaveFocus();
    });

    it('wraps the highlight between the last and first enabled items', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu />);

      await user.tab();
      await user.keyboard('{ArrowUp}');
      expectHighlighted('Move to storage');

      await user.keyboard('{ArrowDown}');
      expectHighlighted('Edit');

      await user.keyboard('{ArrowUp}');
      expectHighlighted('Move to storage');
    });

    it('skips disabled items during typeahead', async () => {
      const user = userEvent.setup();
      render(
        <Dropdown>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
            <Dropdown.Item disabled>Refund</Dropdown.Item>
            <Dropdown.Item>Remove</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      await user.tab();
      await user.keyboard('{ArrowDown}');
      expectHighlighted('Edit');

      await user.keyboard('r');

      expectHighlighted('Remove');
      expect(getItem('Refund')).not.toHaveAttribute('data-highlighted');
    });

    it('keeps the menu open and the item highlighted after Enter when closeOnSelect is false', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onOpenChange = vi.fn();
      render(<ActionsMenu closeOnSelect={false} onSelect={onSelect} onOpenChange={onOpenChange} />);

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expectHighlighted('Edit');
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
    });
  });

  describe('pointer interaction', () => {
    it('highlights an item on hover', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu defaultOpen />);

      await user.hover(getItem('Duplicate'));

      expectHighlighted('Duplicate');
    });

    it('does not highlight a disabled item on hover', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu defaultOpen />);

      await user.hover(getItem('Refund'));

      expect(getItem('Refund')).not.toHaveAttribute('data-highlighted');
    });

    it('opens on pointer click without highlighting an item until the keyboard is used', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu />);
      const trigger = screen.getByRole('button', { name: 'Actions' });

      await user.click(trigger);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getAllByRole('menuitem').filter(item => item.hasAttribute('data-highlighted'))).toEqual([]);
      expect(trigger).toHaveFocus();

      await user.keyboard('{ArrowDown}');

      expectHighlighted('Edit');
    });
  });

  describe('dismissal and modality', () => {
    it('closes on an outside pointer press and forwards the event to onPointerDownOutside', async () => {
      const user = userEvent.setup();
      const onPointerDownOutside = vi.fn();
      const onOpenChange = vi.fn();
      render(<ActionsMenu defaultOpen onOpenChange={onOpenChange} onPointerDownOutside={onPointerDownOutside} />);

      await user.click(screen.getByRole('button', { name: 'Outside' }));

      expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
      expect(onPointerDownOutside.mock.lastCall?.[0].type).toBe('pointerdown');
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('keeps a modal menu open and pulls focus back when focus moves outside', async () => {
      const user = userEvent.setup();
      const onFocusOutside = vi.fn();
      render(<ActionsMenu onFocusOutside={onFocusOutside} />);

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      // Focus leaves the trigger for the outside button.
      await user.tab();

      expect(onFocusOutside).toHaveBeenCalledTimes(1);
      expect(onFocusOutside.mock.lastCall?.[0].type).toBe('focusin');
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expectHighlighted('Edit');
    });

    it('closes a non-modal menu when focus moves outside', async () => {
      const user = userEvent.setup();
      const onFocusOutside = vi.fn();
      render(<ActionsMenu modal={false} onFocusOutside={onFocusOutside} />);

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      await user.tab();

      expect(onFocusOutside).toHaveBeenCalledTimes(1);
      expect(onFocusOutside.mock.lastCall?.[0].type).toBe('focusin');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
    });

    it('traps Tab inside a modal menu', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu />);

      await user.tab();
      await user.keyboard('{ArrowDown}');
      await user.tab();

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expectHighlighted('Edit');
    });

    it('closes a non-modal menu on Tab', async () => {
      const user = userEvent.setup();
      render(<ActionsMenu modal={false} />);

      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menu')).toBeInTheDocument();

      await user.tab();

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('leaves focus on the outside target instead of the trigger after an outside press', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<ActionsMenu onOpenChange={onOpenChange} />);
      const trigger = screen.getByRole('button', { name: 'Actions' });
      const outside = screen.getByRole('button', { name: 'Outside' });

      await user.click(trigger);
      await user.click(outside);

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(outside).toHaveFocus();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('customization', () => {
    it('merges theme and instance class names on every part owner node', () => {
      render(
        <TakeoffSparProvider
          components={{
            DropdownTrigger: { className: 'theme-trigger' },
            DropdownContent: { classNames: { root: 'theme-content' } },
            DropdownViewport: { classNames: { root: 'theme-viewport' } },
            DropdownGroup: { classNames: { root: 'theme-group' } },
            DropdownLabel: { classNames: { root: 'theme-label' } },
            DropdownItem: { classNames: { root: 'theme-item' } },
            DropdownSeparator: { classNames: { root: 'theme-separator' } },
            DropdownArrow: { classNames: { root: 'theme-arrow' } },
          }}
        >
          <Dropdown defaultOpen>
            <Dropdown.Trigger className="instance-trigger" classNames={{ root: 'slot-trigger' }}>
              Actions
            </Dropdown.Trigger>
            <Dropdown.Content className="instance-content" classNames={{ root: 'slot-content' }}>
              <Dropdown.Viewport className="instance-viewport" classNames={{ root: 'slot-viewport' }}>
                <Dropdown.Group className="instance-group" classNames={{ root: 'slot-group' }}>
                  <Dropdown.Label className="instance-label" classNames={{ root: 'slot-label' }}>
                    Flight
                  </Dropdown.Label>
                  <Dropdown.Item className="instance-item" classNames={{ root: 'slot-item' }}>
                    Change flight
                  </Dropdown.Item>
                </Dropdown.Group>
                <Dropdown.Separator className="instance-separator" classNames={{ root: 'slot-separator' }} />
              </Dropdown.Viewport>
              <Dropdown.Arrow className="instance-arrow" classNames={{ root: 'slot-arrow' }} />
            </Dropdown.Content>
          </Dropdown>
        </TakeoffSparProvider>,
      );

      const menu = screen.getByRole('menu');
      const group = screen.getByRole('group');
      const parts: Array<[string, Element | null]> = [
        ['trigger', screen.getByRole('button', { name: 'Actions' })],
        ['content', menu],
        ['viewport', group.parentElement],
        ['group', group],
        ['label', screen.getByText('Flight')],
        ['item', getItem('Change flight')],
        ['separator', screen.getByRole('separator')],
        ['arrow', menu.lastElementChild],
      ];

      for (const [part, node] of parts) {
        expect(node).toHaveClass(`tk-dropdown-${part}`, `theme-${part}`, `instance-${part}`, `slot-${part}`);
      }
    });

    it('lands slotProps on each part owner node, with instance entries winning over theme entries', () => {
      const slot = (part: string) => ({ root: { title: `${part} slot` } });

      render(
        <TakeoffSparProvider
          components={{
            DropdownTrigger: { slotProps: { root: { title: 'theme trigger', lang: 'tr' } } },
            DropdownContent: { slotProps: { root: { title: 'theme content', lang: 'tr' } } },
          }}
        >
          <Dropdown defaultOpen>
            <Dropdown.Trigger slotProps={slot('trigger')}>Actions</Dropdown.Trigger>
            <Dropdown.Content slotProps={slot('content')}>
              <Dropdown.Viewport slotProps={slot('viewport')}>
                <Dropdown.Group slotProps={slot('group')}>
                  <Dropdown.Label slotProps={slot('label')}>Flight</Dropdown.Label>
                  <Dropdown.Item slotProps={slot('item')}>Change flight</Dropdown.Item>
                </Dropdown.Group>
                <Dropdown.Separator slotProps={slot('separator')} />
              </Dropdown.Viewport>
              <Dropdown.Arrow slotProps={slot('arrow')} />
            </Dropdown.Content>
          </Dropdown>
        </TakeoffSparProvider>,
      );

      const trigger = screen.getByRole('button', { name: 'Actions' });
      const menu = screen.getByRole('menu');
      const group = screen.getByRole('group');
      const parts: Array<[string, Element | null]> = [
        ['trigger', trigger],
        ['content', menu],
        ['viewport', group.parentElement],
        ['group', group],
        ['label', screen.getByText('Flight')],
        ['item', getItem('Change flight')],
        ['separator', screen.getByRole('separator')],
        ['arrow', menu.lastElementChild],
      ];

      for (const [part, node] of parts) {
        expect(node).toHaveAttribute('title', `${part} slot`);
      }
      // Theme entries that the instance does not override are kept.
      expect(trigger).toHaveAttribute('lang', 'tr');
      expect(menu).toHaveAttribute('lang', 'tr');
    });

    it('keeps canonical slot hooks when slotProps try to override them', () => {
      render(
        <Dropdown defaultOpen size="large">
          <Dropdown.Trigger slotProps={{ root: { 'data-slot': 'custom' } as never }}>Actions</Dropdown.Trigger>
          <Dropdown.Content slotProps={{ root: { 'data-slot': 'custom', 'data-size': 'small' } as never }}>
            <Dropdown.Item slotProps={{ root: { 'data-slot': 'custom' } as never }}>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      const menu = screen.getByRole('menu');
      expect(screen.getByRole('button', { name: 'Actions' })).toHaveAttribute('data-slot', 'root');
      expect(menu).toHaveAttribute('data-slot', 'root');
      expect(menu).toHaveAttribute('data-size', 'large');
      expect(getItem('Edit')).toHaveAttribute('data-slot', 'root');
    });

    it('lets instance root props override provider root defaults', () => {
      render(
        <TakeoffSparProvider components={{ Dropdown: { defaultProps: { size: 'large', contentWidth: 240 } } }}>
          <Dropdown defaultOpen size="small">
            <Dropdown.Trigger>Actions</Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Item>Edit</Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
        </TakeoffSparProvider>,
      );

      const menu = screen.getByRole('menu');
      expect(menu).toHaveAttribute('data-size', 'small');
      expect(menu).toHaveStyle({ width: '240px' });
    });
  });

  describe('content width', () => {
    const originalResizeObserver = globalThis.ResizeObserver;

    beforeAll(() => {
      globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
    });

    afterAll(() => {
      globalThis.ResizeObserver = originalResizeObserver;
    });

    it('adds no width style by default so the panel shrink-wraps its content', () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      expect(screen.getByRole('menu').style.width).toBe('');
    });

    it('applies a CSS width string as-is', () => {
      render(
        <Dropdown defaultOpen contentWidth="20rem">
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      expect(screen.getByRole('menu')).toHaveStyle({ width: '20rem' });
    });

    it('matches the measured trigger width and follows trigger resizes', async () => {
      const user = userEvent.setup();
      let triggerWidth = 223.6;
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        const width = this.classList.contains('tk-dropdown-trigger') ? triggerWidth : 0;
        return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: 0, width, height: 0, toJSON: () => ({}) } as DOMRect;
      });

      render(
        <Dropdown contentWidth="trigger">
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      const menu = screen.getByRole('menu');
      // Border-box width, rounded to whole pixels.
      expect(menu).toHaveStyle({ width: '224px' });

      triggerWidth = 311.4;
      // Resize notifications are coalesced into one animation frame; run it synchronously.
      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        callback(0);
        return 0;
      });
      vi.stubGlobal('cancelAnimationFrame', () => {});

      await act(async () => {
        [...ResizeObserverStub.instances].forEach(observer => observer.notify());
        await new Promise<void>(resolve => setTimeout(resolve, 0));
      });

      expect(menu).toHaveStyle({ width: '311px' });
    });

    it('lets a slotProps style width override the computed contentWidth', () => {
      render(
        <Dropdown defaultOpen contentWidth={280}>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content slotProps={{ root: { style: { width: '300px' } } }}>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      expect(screen.getByRole('menu')).toHaveStyle({ width: '300px' });
    });

    it('gives the direct style prop the final say while keeping other slotProps style entries', () => {
      render(
        <Dropdown defaultOpen contentWidth={280}>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content slotProps={{ root: { style: { width: '300px', color: 'rgb(1, 2, 3)' } } }} style={{ width: '320px' }}>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      expect(screen.getByRole('menu')).toHaveStyle({ width: '320px', color: 'rgb(1, 2, 3)' });
    });

    it('keeps a theme slotProps style when contentWidth adds no width', () => {
      render(
        <TakeoffSparProvider components={{ DropdownContent: { slotProps: { root: { style: { color: 'rgb(4, 5, 6)' } } } } }}>
          <Dropdown defaultOpen>
            <Dropdown.Trigger>Actions</Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Item>Edit</Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
        </TakeoffSparProvider>,
      );

      const menu = screen.getByRole('menu');
      expect(menu).toHaveStyle({ color: 'rgb(4, 5, 6)' });
      expect(menu.style.width).toBe('');
    });

    it('merges a theme slotProps style under the direct style prop and the computed width', () => {
      render(
        <TakeoffSparProvider components={{ DropdownContent: { slotProps: { root: { style: { backgroundColor: 'rgb(4, 5, 6)', color: 'rgb(7, 8, 9)' } } } } }}>
          <Dropdown defaultOpen contentWidth={280}>
            <Dropdown.Trigger>Actions</Dropdown.Trigger>
            <Dropdown.Content style={{ width: '100px', color: 'rgb(1, 2, 3)' }}>
              <Dropdown.Item>Edit</Dropdown.Item>
            </Dropdown.Content>
          </Dropdown>
        </TakeoffSparProvider>,
      );

      // The direct style beats the theme and the computed width; the rest of the theme style still lands.
      expect(screen.getByRole('menu')).toHaveStyle({ width: '100px', color: 'rgb(1, 2, 3)', backgroundColor: 'rgb(4, 5, 6)' });
    });

    it('applies a direct style prop when contentWidth adds no width', () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content style={{ color: 'rgb(7, 8, 9)' }}>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      const menu = screen.getByRole('menu');
      expect(menu).toHaveStyle({ color: 'rgb(7, 8, 9)' });
      expect(menu.style.width).toBe('');
    });

    it('recomputes the panel width when contentWidth changes', () => {
      const renderMenu = (contentWidth: DropdownProps['contentWidth']) => (
        <Dropdown defaultOpen contentWidth={contentWidth}>
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>
      );
      const { rerender } = render(renderMenu(280));
      expect(screen.getByRole('menu')).toHaveStyle({ width: '280px' });

      rerender(renderMenu('50%'));
      expect(screen.getByRole('menu')).toHaveStyle({ width: '50%' });

      rerender(renderMenu('content'));
      expect(screen.getByRole('menu').style.width).toBe('');
    });

    it('measures the trigger and disconnects its resize observer on unmount', async () => {
      const user = userEvent.setup();
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        const width = this.classList.contains('tk-dropdown-trigger') ? 180 : 0;
        return { x: 0, y: 0, top: 0, left: 0, right: width, bottom: 0, width, height: 0, toJSON: () => ({}) } as DOMRect;
      });
      const observersBefore = ResizeObserverStub.instances.size;

      const { unmount } = render(
        <Dropdown contentWidth="trigger">
          <Dropdown.Trigger>Actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>
        </Dropdown>,
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(screen.getByRole('menu')).toHaveStyle({ width: '180px' });
      // The trigger (and the positioning layer) are observed while mounted.
      expect(ResizeObserverStub.instances.size).toBeGreaterThan(observersBefore);

      unmount();

      expect(ResizeObserverStub.instances.size).toBe(observersBefore);
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Dropdown.Trigger renders outside the root', () => {
      expect(() => render(<Dropdown.Trigger>Actions</Dropdown.Trigger>)).toThrow(/Dropdown\.Trigger must be used within DropdownProvider/);
    });

    it('throws a descriptive error when Dropdown.Content renders outside the root', () => {
      expect(() =>
        render(
          <Dropdown.Content>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown.Content>,
        ),
      ).toThrow(/Dropdown\.Content must be used within DropdownProvider/);
    });

    it('throws when Dropdown.Item renders outside Dropdown.Content', () => {
      expect(() =>
        render(
          <Dropdown>
            <Dropdown.Item>Edit</Dropdown.Item>
          </Dropdown>,
        ),
      ).toThrow(/DropdownMenu items must be rendered within DropdownMenuContent/);
    });

    it('throws when Dropdown.Viewport renders outside Dropdown.Content', () => {
      expect(() =>
        render(
          <Dropdown>
            <Dropdown.Viewport />
          </Dropdown>,
        ),
      ).toThrow(/DropdownMenu items must be rendered within DropdownMenuContent/);
    });

    it('throws when Dropdown.Arrow renders outside the root', () => {
      expect(() => render(<Dropdown.Arrow />)).toThrow(/DropdownMenu components must be used within DropdownMenu/);
    });

    it('throws when Dropdown.Arrow renders inside the root but outside Dropdown.Content', () => {
      expect(() =>
        render(
          <Dropdown>
            <Dropdown.Trigger>Actions</Dropdown.Trigger>
            <Dropdown.Arrow />
          </Dropdown>,
        ),
      ).toThrow(/DropdownMenuArrow must be used within DropdownMenuContent/);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations while closed', async () => {
      const { container } = render(<ActionsMenu />);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when open with the full anatomy', async () => {
      const { container } = render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Manage booking</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.Viewport>
              <Dropdown.Group>
                <Dropdown.Label>Flight</Dropdown.Label>
                <Dropdown.Item textValue="Change flight">Change flight</Dropdown.Item>
                <Dropdown.Item disabled>Refund receipt</Dropdown.Item>
              </Dropdown.Group>
              <Dropdown.Separator />
              <Dropdown.Item>Download invoice</Dropdown.Item>
            </Dropdown.Viewport>
            <Dropdown.Arrow />
          </Dropdown.Content>
        </Dropdown>,
      );

      await flushPositioning();

      // The trigger (with aria-controls pointing at the portalled menu) and the
      // menu subtree are checked separately; the menu lives outside `container`.
      expect(await axe(container)).toHaveNoViolations();
      expect(await axe(screen.getByRole('menu'))).toHaveNoViolations();
    });
  });
});
