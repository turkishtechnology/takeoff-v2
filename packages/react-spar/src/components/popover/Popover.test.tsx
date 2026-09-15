import { act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type ReactElement } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';

import { Popover } from './index';
import type { PopoverVariant } from './types';

const VARIANTS: PopoverVariant[] = ['white', 'dark', 'info', 'success', 'warning', 'danger', 'neutral'];

// Content is portaled to document.body, so its documented tk-* hook is looked up on the document.
const getContent = () => document.querySelector<HTMLElement>('.tk-popover-content');

const expectRenderToThrow = (ui: ReactElement, message: RegExp) => {
  // React reports the render error through console.error before rethrowing; keep the run output clean.
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    expect(() => render(ui)).toThrow(message);
  } finally {
    consoleError.mockRestore();
  }
};

interface TriggerRenderState {
  isOpen: boolean;
  disabled: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

describe('Popover (compound)', () => {
  describe('rendering', () => {
    it('renders the trigger slot and keeps the content unmounted while closed', () => {
      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      expect(trigger).toHaveClass('tk-popover-trigger');
      expect(trigger).toHaveAttribute('data-slot', 'root');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(getContent()).toBeNull();
      expect(screen.queryByText('Body')).not.toBeInTheDocument();
    });

    it('portals the open content to document.body with its slot contract and the default variant', () => {
      const { container } = render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const content = getContent() as HTMLElement;
      expect(content).not.toBeNull();
      expect(content.parentElement).toBe(document.body);
      expect(container).not.toContainElement(content);
      expect(content).toHaveAttribute('data-slot', 'root');
      expect(content).toHaveAttribute('data-variant', 'white');
      expect(content.id).not.toBe('');
      expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-controls', content.id);
      expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'true');
    });

    it('renders Header as a div and Description as a p inside the content', () => {
      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Header>Account settings</Popover.Header>
            <Popover.Description>Manage your profile.</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const content = getContent() as HTMLElement;
      const header = within(content).getByText('Account settings');
      const description = within(content).getByText('Manage your profile.');

      expect(header.tagName).toBe('DIV');
      expect(header).toHaveClass('tk-popover-header');
      expect(header).toHaveAttribute('data-slot', 'root');
      expect(header.parentElement).toBe(content);

      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('tk-popover-description');
      expect(description).toHaveAttribute('data-slot', 'root');
      expect(description.parentElement).toBe(content);
    });

    it.each(VARIANTS)('reflects variant="%s" on the content as data-variant', variant => {
      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content variant={variant}>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      expect(getContent()).toHaveAttribute('data-variant', variant);
    });

    it('renders the arrow as a decorative svg with the bordered pointer shape by default', () => {
      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
            <Popover.Arrow />
          </Popover.Content>
        </Popover>,
      );

      const content = getContent() as HTMLElement;
      const arrow = content.querySelector('.tk-popover-arrow');

      expect(arrow).not.toBeNull();
      expect(arrow?.tagName.toLowerCase()).toBe('svg');
      expect(arrow?.parentElement).toBe(content);
      expect(arrow).toHaveAttribute('data-slot', 'root');
      expect(arrow).toHaveAttribute('aria-hidden', 'true');
      expect(arrow?.querySelector('.tk-arrow-border')).not.toBeNull();
      expect(arrow?.querySelector('.tk-arrow-fill')).not.toBeNull();
    });

    it('lets explicit arrow children replace the default pointer shape', () => {
      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
            <Popover.Arrow>
              <path data-testid="custom-pointer" d="M0 0L5 5L10 0" />
            </Popover.Arrow>
          </Popover.Content>
        </Popover>,
      );

      const arrow = getContent()?.querySelector('.tk-popover-arrow');

      expect(arrow).toContainElement(screen.getByTestId('custom-pointer'));
      expect(arrow?.querySelector('.tk-arrow-border')).toBeNull();
      expect(arrow?.querySelector('.tk-arrow-fill')).toBeNull();
    });

    it('renders the trigger and content as custom elements through the as prop', () => {
      render(
        <Popover defaultOpen>
          <Popover.Trigger as="span">Open</Popover.Trigger>
          <Popover.Content as="section">
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      expect(trigger.tagName).toBe('SPAN');
      expect(trigger).toHaveClass('tk-popover-trigger');
      expect(getContent()?.tagName).toBe('SECTION');
    });

    it('renders Header and Description as custom elements through the as prop', () => {
      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Header as="h2">Account settings</Popover.Header>
            <Popover.Description as="div">Manage your profile.</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const header = screen.getByRole('heading', { level: 2, name: 'Account settings' });
      expect(header).toHaveClass('tk-popover-header');
      expect(header).toHaveAttribute('data-slot', 'root');
      expect(header).not.toHaveAttribute('as');

      const description = screen.getByText('Manage your profile.');
      expect(description.tagName).toBe('DIV');
      expect(description).toHaveClass('tk-popover-description');
      expect(description).toHaveAttribute('data-slot', 'root');
      expect(description).not.toHaveAttribute('as');
    });

    it('forwards refs to the DOM node of every part', () => {
      const triggerRef = createRef<HTMLButtonElement>();
      const contentRef = createRef<HTMLDivElement>();
      const headerRef = createRef<HTMLDivElement>();
      const descriptionRef = createRef<HTMLParagraphElement>();
      const arrowRef = createRef<SVGSVGElement>();
      const closeRef = createRef<HTMLButtonElement>();

      render(
        <Popover defaultOpen>
          <Popover.Trigger ref={triggerRef}>Open</Popover.Trigger>
          <Popover.Content ref={contentRef}>
            <Popover.Header ref={headerRef}>Title</Popover.Header>
            <Popover.Description ref={descriptionRef}>Body</Popover.Description>
            <Popover.Arrow ref={arrowRef} />
            <Popover.Close ref={closeRef} />
          </Popover.Content>
        </Popover>,
      );

      const content = getContent() as HTMLElement;
      expect(triggerRef.current).toBe(screen.getByRole('button', { name: 'Open' }));
      expect(contentRef.current).toBe(content);
      expect(headerRef.current).toBe(within(content).getByText('Title'));
      expect(descriptionRef.current).toBe(within(content).getByText('Body'));
      expect(arrowRef.current).toBe(content.querySelector('.tk-popover-arrow'));
      expect(closeRef.current).toBe(within(content).getByRole('button', { name: 'Close' }));
    });

    it('derives the content id from the root id', () => {
      render(
        <Popover id="account" defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      expect(getContent()).toHaveAttribute('id', 'account-content');
      expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-controls', 'account-content');
    });

    it('positions against the documented side/align defaults and forwards overrides to Spar', async () => {
      const { rerender } = render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );
      await act(async () => {});

      expect(getContent()).toHaveAttribute('data-side', 'bottom');
      expect(getContent()).toHaveAttribute('data-align', 'center');

      rerender(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content side="right" align="start">
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );
      await act(async () => {});

      expect(getContent()).toHaveAttribute('data-side', 'right');
      expect(getContent()).toHaveAttribute('data-align', 'start');
    });

    it('portals into a custom container when one is provided', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);

      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content container={host}>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      expect(getContent()?.parentElement).toBe(host);
      host.remove();
    });
  });

  describe('open state', () => {
    it('toggles on trigger click when uncontrolled and reports each change with the next open value', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onClick = vi.fn();

      render(
        <Popover onOpenChange={onOpenChange}>
          <Popover.Trigger onClick={onClick}>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });

      await user.click(trigger);
      expect(getContent()).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));

      await user.click(trigger);
      expect(getContent()).toBeNull();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('follows the controlled open prop and only requests changes through onOpenChange', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const ui = (open: boolean) => (
        <Popover open={open} onOpenChange={onOpenChange}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>
      );

      const { rerender } = render(ui(false));

      await user.click(screen.getByRole('button', { name: 'Open' }));
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      expect(getContent()).toBeNull();

      rerender(ui(true));
      expect(getContent()).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(getContent()).toBeInTheDocument();
    });

    it('stays in sync with a stateful parent in controlled mode', async () => {
      const user = userEvent.setup();
      const ControlledPopover = () => {
        const [open, setOpen] = useState(false);
        return (
          <>
            <Popover open={open} onOpenChange={setOpen}>
              <Popover.Trigger>Controlled</Popover.Trigger>
              <Popover.Content>
                <Popover.Description>Controlled popover</Popover.Description>
              </Popover.Content>
            </Popover>
            <button type="button" onClick={() => setOpen(!open)}>
              {open ? 'Hide' : 'Show'}
            </button>
          </>
        );
      };

      render(<ControlledPopover />);

      await user.click(screen.getByRole('button', { name: 'Show' }));
      expect(screen.getByText('Controlled popover')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Controlled' })).toHaveAttribute('aria-expanded', 'true');

      await user.click(screen.getByRole('button', { name: 'Controlled' }));
      expect(screen.queryByText('Controlled popover')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show' })).toBeInTheDocument();
    });

    it('passes { isOpen, disabled, open, close, toggle } to render-prop trigger children', () => {
      const captured: { current?: TriggerRenderState } = {};

      render(
        <Popover>
          <Popover.Trigger>
            {state => {
              captured.current = state;
              return state.isOpen ? 'Hide details' : 'Show details';
            }}
          </Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Details</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      expect(captured.current).toEqual({
        isOpen: false,
        disabled: false,
        open: expect.any(Function),
        close: expect.any(Function),
        toggle: expect.any(Function),
      });

      act(() => captured.current?.open());
      expect(getContent()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hide details' })).toBeInTheDocument();
      expect(captured.current?.isOpen).toBe(true);

      act(() => captured.current?.close());
      expect(getContent()).toBeNull();

      act(() => captured.current?.toggle());
      expect(getContent()).toBeInTheDocument();
    });

    it('blocks opening from the trigger when the root is disabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const captured: { current?: TriggerRenderState } = {};

      render(
        <Popover disabled onOpenChange={onOpenChange}>
          <Popover.Trigger>
            {state => {
              captured.current = state;
              return 'Open';
            }}
          </Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      expect(trigger).toBeDisabled();
      expect(captured.current?.disabled).toBe(true);

      await user.click(trigger);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(getContent()).toBeNull();
    });

    it('blocks opening when the trigger itself is disabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Popover onOpenChange={onOpenChange}>
          <Popover.Trigger disabled>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      expect(trigger).toBeDisabled();

      await user.click(trigger);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(getContent()).toBeNull();
    });
  });

  describe('dismissal and focus', () => {
    it('closes on Escape, reports the keyboard event and returns focus to the trigger', async () => {
      const user = userEvent.setup();
      const onEscapeKeyDown = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <Popover onOpenChange={onOpenChange}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content onEscapeKeyDown={onEscapeKeyDown}>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      await user.click(trigger);
      expect(getContent()).toHaveFocus();

      await user.keyboard('{Escape}');

      expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
      const [event] = onEscapeKeyDown.mock.calls[0];
      expect(event).toBeInstanceOf(KeyboardEvent);
      expect(event).toMatchObject({ key: 'Escape' });
      expect(getContent()).toBeNull();
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(trigger).toHaveFocus();
    });

    it('stays open when onEscapeKeyDown prevents the default dismissal', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Popover onOpenChange={onOpenChange}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content onEscapeKeyDown={event => event.preventDefault()}>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      await user.keyboard('{Escape}');

      expect(getContent()).toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    it('closes on pointer down outside and reports onPointerDownOutside and onInteractOutside', async () => {
      const user = userEvent.setup();
      const onPointerDownOutside = vi.fn();
      const onInteractOutside = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <>
          <Popover defaultOpen onOpenChange={onOpenChange}>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content onPointerDownOutside={onPointerDownOutside} onInteractOutside={onInteractOutside}>
              <Popover.Description>Body</Popover.Description>
            </Popover.Content>
          </Popover>
          <button type="button">Outside</button>
        </>,
      );

      await user.click(screen.getByRole('button', { name: 'Outside' }));

      expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
      expect(onPointerDownOutside).toHaveBeenCalledWith(expect.objectContaining({ type: 'pointerdown' }));
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
      expect(onInteractOutside).toHaveBeenCalledWith(expect.objectContaining({ type: 'pointerdown' }));
      expect(getContent()).toBeNull();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('stays open when onPointerDownOutside prevents the default dismissal', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Popover defaultOpen>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content onPointerDownOutside={event => event.preventDefault()}>
              <Popover.Description>Body</Popover.Description>
            </Popover.Content>
          </Popover>
          <button type="button">Outside</button>
        </>,
      );

      await user.click(screen.getByRole('button', { name: 'Outside' }));

      expect(getContent()).toBeInTheDocument();
    });

    it('closes when focus moves outside a non-modal popover and reports onFocusOutside and onInteractOutside', () => {
      const onFocusOutside = vi.fn();
      const onInteractOutside = vi.fn();

      render(
        <>
          <Popover defaultOpen>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content onFocusOutside={onFocusOutside} onInteractOutside={onInteractOutside}>
              <Popover.Description>Body</Popover.Description>
            </Popover.Content>
          </Popover>
          <button type="button">Outside</button>
        </>,
      );

      act(() => screen.getByRole('button', { name: 'Outside' }).focus());

      expect(onFocusOutside).toHaveBeenCalledTimes(1);
      expect(onFocusOutside.mock.calls[0][0]).toBeInstanceOf(FocusEvent);
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
      expect(onInteractOutside.mock.calls[0][0]).toBeInstanceOf(FocusEvent);
      expect(getContent()).toBeNull();
    });

    it('moves focus to the first focusable element on open and reports onOpenAutoFocus', async () => {
      const user = userEvent.setup();
      const onOpenAutoFocus = vi.fn();

      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content onOpenAutoFocus={onOpenAutoFocus}>
            <input aria-label="Name" />
            <Popover.Close />
          </Popover.Content>
        </Popover>,
      );

      expect(onOpenAutoFocus).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
      expect(onOpenAutoFocus).toHaveBeenCalledTimes(1);
      expect(onOpenAutoFocus.mock.calls[0][0]).toBeInstanceOf(Event);
    });

    it('reports onCloseAutoFocus on close and skips restoring trigger focus when it is prevented', async () => {
      const user = userEvent.setup();
      const onCloseAutoFocus = vi.fn();

      const { rerender } = render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content onCloseAutoFocus={onCloseAutoFocus}>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });

      await user.click(trigger);
      await user.keyboard('{Escape}');

      expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
      expect(onCloseAutoFocus.mock.calls[0][0]).toBeInstanceOf(Event);
      expect(trigger).toHaveFocus();

      rerender(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content onCloseAutoFocus={event => event.preventDefault()}>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      await user.click(trigger);
      expect(getContent()).toHaveFocus();

      await user.keyboard('{Escape}');

      expect(getContent()).toBeNull();
      expect(trigger).not.toHaveFocus();
    });

    it('opens from the keyboard with Enter and closes with Enter on the close button', async () => {
      const user = userEvent.setup();

      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
            <Popover.Close />
          </Popover.Content>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });

      await user.tab();
      expect(trigger).toHaveFocus();

      await user.keyboard('{Enter}');
      const close = within(getContent() as HTMLElement).getByRole('button', { name: 'Close' });
      expect(close).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(getContent()).toBeNull();
      expect(trigger).toHaveFocus();
    });
  });

  describe('modal and focus trapping', () => {
    it('exposes a modal popover as an aria-modal dialog', () => {
      render(
        <Popover modal defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content aria-label="Filters">
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const dialog = screen.getByRole('dialog', { name: 'Filters' });
      expect(dialog).toBe(getContent());
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('renders non-modal content as a plain container while the trigger advertises a dialog popup', () => {
      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const content = getContent() as HTMLElement;
      expect(content).not.toHaveAttribute('role');
      expect(content).not.toHaveAttribute('aria-modal');
      expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('still dismisses a modal popover on pointer down outside and renders no backdrop', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <>
          <Popover modal defaultOpen onOpenChange={onOpenChange}>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content aria-label="Filters">
              <Popover.Description>Body</Popover.Description>
            </Popover.Content>
          </Popover>
          <button type="button">Outside</button>
        </>,
      );

      // The portal holds only the content: no overlay/backdrop element is added.
      expect(document.body.lastElementChild).toBe(getContent());

      await user.pointer({ keys: '[MouseLeft>]', target: screen.getByRole('button', { name: 'Outside' }) });

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
      expect(getContent()).toBeNull();
    });

    const trapCases: { label: string; modal?: boolean; trapFocus?: boolean }[] = [
      { label: 'a modal popover', modal: true },
      { label: 'content with trapFocus', trapFocus: true },
    ];

    it.each(trapCases)('keeps Tab focus cycling inside $label', async ({ modal, trapFocus }) => {
      const user = userEvent.setup();

      render(
        <>
          <Popover modal={modal}>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content trapFocus={trapFocus} aria-label="Filters">
              <button type="button">First</button>
              <button type="button">Second</button>
            </Popover.Content>
          </Popover>
          <button type="button">Outside</button>
        </>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      const first = screen.getByRole('button', { name: 'First' });
      const second = screen.getByRole('button', { name: 'Second' });
      expect(first).toHaveFocus();

      await user.tab();
      expect(second).toHaveFocus();

      await user.tab();
      expect(first).toHaveFocus();

      await user.tab({ shift: true });
      expect(second).toHaveFocus();
    });
  });

  describe('Popover.Close', () => {
    it('renders the close slot and dismisses the popover, calling the consumer onClick once', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <Popover onOpenChange={onOpenChange}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
            <Popover.Close onClick={onClick} />
          </Popover.Content>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      await user.click(trigger);

      const close = within(getContent() as HTMLElement).getByRole('button', { name: 'Close' });
      expect(close).toHaveClass('tk-popover-close');
      expect(close).toHaveAttribute('data-slot', 'root');

      await user.click(close);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
      expect(getContent()).toBeNull();
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(trigger).toHaveFocus();
    });

    it('passes { isOpen, close } to render-prop children and renders them without the default label', async () => {
      const user = userEvent.setup();
      const captured: { current?: { isOpen: boolean; close: () => void } } = {};

      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Close>
              {state => {
                captured.current = state;
                return 'Dismiss';
              }}
            </Popover.Close>
          </Popover.Content>
        </Popover>,
      );

      const close = screen.getByRole('button', { name: 'Dismiss' });
      expect(close).toHaveClass('tk-popover-close');
      expect(close).not.toHaveAttribute('aria-label');
      expect(captured.current).toEqual({ isOpen: true, close: expect.any(Function) });

      await user.click(close);
      expect(getContent()).toBeNull();
    });
  });

  describe('customization', () => {
    it('merges className, classNames.root and slotProps.root onto each part owner node', () => {
      render(
        <Popover defaultOpen>
          <Popover.Trigger className="trigger-extra" classNames={{ root: 'trigger-slot' }} slotProps={{ root: { title: 'Trigger title' } }}>
            Open
          </Popover.Trigger>
          <Popover.Content className="content-extra" classNames={{ root: 'content-slot' }} slotProps={{ root: { title: 'Content title' } }}>
            <Popover.Header className="header-extra" classNames={{ root: 'header-slot' }} slotProps={{ root: { title: 'Header title' } }}>
              Title
            </Popover.Header>
            <Popover.Description className="description-extra" classNames={{ root: 'description-slot' }} slotProps={{ root: { title: 'Description title' } }}>
              Body
            </Popover.Description>
            <Popover.Arrow className="arrow-extra" classNames={{ root: 'arrow-slot' }} slotProps={{ root: { title: 'Arrow title' } }} />
            <Popover.Close className="close-extra" classNames={{ root: 'close-slot' }} slotProps={{ root: { title: 'Close title' } }} />
          </Popover.Content>
        </Popover>,
      );

      const content = getContent() as HTMLElement;
      const trigger = screen.getByRole('button', { name: 'Open' });
      const header = within(content).getByText('Title');
      const description = within(content).getByText('Body');
      const arrow = content.querySelector('.tk-popover-arrow');
      const close = within(content).getByRole('button', { name: 'Close' });

      expect(trigger).toHaveClass('tk-popover-trigger', 'trigger-extra', 'trigger-slot');
      expect(trigger).toHaveAttribute('title', 'Trigger title');

      expect(content).toHaveClass('tk-popover-content', 'content-extra', 'content-slot');
      expect(content).toHaveAttribute('title', 'Content title');
      expect(content).not.toHaveClass('header-extra');

      expect(header).toHaveClass('tk-popover-header', 'header-extra', 'header-slot');
      expect(header).toHaveAttribute('title', 'Header title');

      expect(description).toHaveClass('tk-popover-description', 'description-extra', 'description-slot');
      expect(description).toHaveAttribute('title', 'Description title');

      expect(arrow).toHaveClass('tk-popover-arrow', 'arrow-extra', 'arrow-slot');
      expect(arrow).toHaveAttribute('title', 'Arrow title');

      expect(close).toHaveClass('tk-popover-close', 'close-extra', 'close-slot');
      expect(close).toHaveAttribute('title', 'Close title');
    });

    it('keeps the canonical data-slot and data-variant hooks when slotProps try to override them', () => {
      const hijack = { 'title': 'Hijack', 'data-slot': 'hijack', 'data-variant': 'dark' };

      render(
        <Popover defaultOpen>
          <Popover.Trigger slotProps={{ root: hijack }}>Open</Popover.Trigger>
          <Popover.Content variant="info" slotProps={{ root: hijack }}>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const content = getContent() as HTMLElement;
      expect(content).toHaveAttribute('title', 'Hijack');
      expect(content).toHaveAttribute('data-slot', 'root');
      expect(content).toHaveAttribute('data-variant', 'info');
      expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('data-slot', 'root');
    });

    it('applies provider theme layers to every part', () => {
      render(
        <TakeoffSparProvider
          components={{
            Popover: { defaultProps: { defaultOpen: true } },
            PopoverTrigger: { classNames: { root: 'theme-trigger' } },
            PopoverContent: { defaultProps: { variant: 'dark' }, className: 'theme-content', slotProps: { root: { title: 'Theme content' } } },
            PopoverHeader: { className: 'theme-header' },
            PopoverDescription: { classNames: { root: 'theme-description' } },
            PopoverArrow: { className: 'theme-arrow' },
            PopoverClose: { slotProps: { root: { title: 'Theme close' } } },
          }}
        >
          <Popover>
            <Popover.Trigger className="instance-trigger">Open</Popover.Trigger>
            <Popover.Content>
              <Popover.Header>Title</Popover.Header>
              <Popover.Description>Body</Popover.Description>
              <Popover.Arrow />
              <Popover.Close />
            </Popover.Content>
          </Popover>
        </TakeoffSparProvider>,
      );

      const content = getContent() as HTMLElement;
      expect(content).not.toBeNull();
      expect(content).toHaveAttribute('data-variant', 'dark');
      expect(content).toHaveClass('tk-popover-content', 'theme-content');
      expect(content).toHaveAttribute('title', 'Theme content');

      expect(screen.getByRole('button', { name: 'Open' })).toHaveClass('tk-popover-trigger', 'theme-trigger', 'instance-trigger');
      expect(within(content).getByText('Title')).toHaveClass('tk-popover-header', 'theme-header');
      expect(within(content).getByText('Body')).toHaveClass('tk-popover-description', 'theme-description');
      expect(content.querySelector('.tk-popover-arrow')).toHaveClass('theme-arrow');
      expect(within(content).getByRole('button', { name: 'Close' })).toHaveAttribute('title', 'Theme close');
    });

    it('lets instance props win over provider theme defaults', async () => {
      const user = userEvent.setup();

      render(
        <TakeoffSparProvider
          components={{
            Popover: { defaultProps: { defaultOpen: true } },
            PopoverContent: { defaultProps: { variant: 'dark' }, slotProps: { root: { title: 'Theme content' } } },
          }}
        >
          <Popover defaultOpen={false}>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content variant="success" slotProps={{ root: { title: 'Instance content' } }}>
              <Popover.Description>Body</Popover.Description>
            </Popover.Content>
          </Popover>
        </TakeoffSparProvider>,
      );

      expect(getContent()).toBeNull();

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(getContent()).toHaveAttribute('data-variant', 'success');
      expect(getContent()).toHaveAttribute('title', 'Instance content');
    });
  });

  describe('context boundaries', () => {
    it('throws when Popover.Trigger renders outside the root', () => {
      expectRenderToThrow(<Popover.Trigger>Open</Popover.Trigger>, /Popover components must be used within Popover/);
    });

    it('throws when Popover.Content renders outside the root', () => {
      expectRenderToThrow(
        <Popover.Content>
          <Popover.Description>Body</Popover.Description>
        </Popover.Content>,
        /Popover components must be used within Popover/,
      );
    });

    it('throws when Popover.Close renders outside the root', () => {
      expectRenderToThrow(<Popover.Close />, /Popover components must be used within Popover/);
    });

    it('throws when Popover.Arrow renders outside the root', () => {
      expectRenderToThrow(<Popover.Arrow />, /Popover components must be used within Popover/);
    });

    it('throws when Popover.Arrow renders inside the root but outside Popover.Content', () => {
      expectRenderToThrow(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Arrow />
        </Popover>,
        /PopoverArrow must be used within PopoverContent/,
      );
    });

    it('renders the presentational Header and Description slots without requiring the root', () => {
      render(
        <>
          <Popover.Header>Title</Popover.Header>
          <Popover.Description>Body</Popover.Description>
        </>,
      );

      expect(screen.getByText('Title')).toHaveClass('tk-popover-header');
      expect(screen.getByText('Body')).toHaveClass('tk-popover-description');
    });
  });

  describe('keyboard and interaction contract', () => {
    it('opens from the keyboard with Space on the focused trigger', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Popover onOpenChange={onOpenChange}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });

      await user.tab();
      expect(trigger).toHaveFocus();

      await user.keyboard(' ');
      expect(getContent()).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(onOpenChange.mock.calls).toEqual([[true]]);
    });

    it('keeps a disabled trigger out of the tab order so keyboard and pointer cannot open it', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onClick = vi.fn();
      const onKeyDown = vi.fn();

      render(
        <>
          <Popover disabled onOpenChange={onOpenChange}>
            <Popover.Trigger onClick={onClick} onKeyDown={onKeyDown}>
              Open
            </Popover.Trigger>
            <Popover.Content>
              <Popover.Description>Body</Popover.Description>
            </Popover.Content>
          </Popover>
          <button type="button">After</button>
        </>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });

      await user.tab();
      expect(trigger).not.toHaveFocus();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();

      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      await user.click(trigger);

      expect(getContent()).toBeNull();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
      expect(onKeyDown).not.toHaveBeenCalled();
    });

    it('moves focus to the first and last focusable element with Home and End and still calls the consumer onKeyDown', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();

      render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content onKeyDown={onKeyDown}>
            <button type="button">First</button>
            <button type="button">Middle</button>
            <button type="button">Last</button>
          </Popover.Content>
        </Popover>,
      );

      await user.click(screen.getByRole('button', { name: 'Open' }));
      expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

      await user.keyboard('{End}');
      expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();

      await user.keyboard('{Home}');
      expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();

      expect(onKeyDown).toHaveBeenCalledTimes(2);
      expect(onKeyDown.mock.calls.map(([event]) => (event as KeyboardEvent).key)).toEqual(['End', 'Home']);
    });

    it('reports render-prop open, close and toggle through onOpenChange with the next open value', () => {
      const onOpenChange = vi.fn();
      const captured: { current?: TriggerRenderState } = {};

      render(
        <Popover onOpenChange={onOpenChange}>
          <Popover.Trigger>
            {state => {
              captured.current = state;
              return 'Open';
            }}
          </Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      act(() => captured.current?.open());
      act(() => captured.current?.close());
      act(() => captured.current?.toggle());

      expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]]);
      expect(captured.current?.isOpen).toBe(true);
      expect(getContent()).toBeInTheDocument();
    });

    it('dismisses once on an outside pointer down and leaves focus on the element that was pressed', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <>
          <Popover onOpenChange={onOpenChange}>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content>
              <Popover.Description>Body</Popover.Description>
            </Popover.Content>
          </Popover>
          <button type="button">Outside</button>
        </>,
      );

      const trigger = screen.getByRole('button', { name: 'Open' });
      const outside = screen.getByRole('button', { name: 'Outside' });

      await user.click(trigger);
      expect(getContent()).toHaveFocus();

      await user.click(outside);

      expect(getContent()).toBeNull();
      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
      expect(outside).toHaveFocus();
      expect(trigger).not.toHaveFocus();
    });

    it('does not treat a pointer down on the trigger as an outside interaction', async () => {
      const user = userEvent.setup();
      const onPointerDownOutside = vi.fn();
      const onInteractOutside = vi.fn();

      render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content onPointerDownOutside={onPointerDownOutside} onInteractOutside={onInteractOutside}>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      await user.click(within(getContent() as HTMLElement).getByText('Body'));
      expect(getContent()).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open' }));

      expect(onPointerDownOutside).not.toHaveBeenCalled();
      expect(onInteractOutside).not.toHaveBeenCalled();
      expect(getContent()).toBeNull();
    });

    it('stays open when onInteractOutside prevents the dismissal from an outside pointer down', () => {
      const onOpenChange = vi.fn();
      const onInteractOutside = vi.fn((event: PointerEvent | FocusEvent) => event.preventDefault());

      render(
        <>
          <Popover defaultOpen onOpenChange={onOpenChange}>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content onInteractOutside={onInteractOutside}>
              <Popover.Description>Body</Popover.Description>
            </Popover.Content>
          </Popover>
          <button type="button">Outside</button>
        </>,
      );

      const outside = screen.getByRole('button', { name: 'Outside' });
      fireEvent.pointerDown(outside);

      expect(getContent()).toBeInTheDocument();
      expect(onInteractOutside).toHaveBeenCalledTimes(1);
      expect(onInteractOutside).toHaveBeenCalledWith(expect.objectContaining({ type: 'pointerdown' }));
      expect((onInteractOutside.mock.calls[0][0] as PointerEvent).target).toBe(outside);
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('merges the provider className shortcut with instance className and classNames.root on the owner node', () => {
      render(
        <TakeoffSparProvider
          components={{
            PopoverContent: { className: 'theme-content' },
            PopoverClose: { className: 'theme-close' },
          }}
        >
          <Popover defaultOpen>
            <Popover.Trigger>Open</Popover.Trigger>
            <Popover.Content className="instance-content" classNames={{ root: 'instance-content-slot' }}>
              <Popover.Description>Body</Popover.Description>
              <Popover.Close className="instance-close" />
            </Popover.Content>
          </Popover>
        </TakeoffSparProvider>,
      );

      const content = getContent() as HTMLElement;
      expect(content).toHaveClass('tk-popover-content', 'theme-content', 'instance-content', 'instance-content-slot');
      expect(screen.getByRole('button', { name: 'Open' })).not.toHaveClass('theme-content');
      expect(within(content).getByRole('button', { name: 'Close' })).toHaveClass('tk-popover-close', 'theme-close', 'instance-close');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations while closed', async () => {
      const { container } = render(
        <Popover>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Description>Body</Popover.Description>
          </Popover.Content>
        </Popover>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when open with the full anatomy', async () => {
      const { container } = render(
        <Popover defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>
            <Popover.Header>Account settings</Popover.Header>
            <Popover.Description>Manage your profile.</Popover.Description>
            <Popover.Arrow />
            <Popover.Close />
          </Popover.Content>
        </Popover>,
      );
      // Let Spar's async positioning update settle inside act before axe runs asynchronously.
      await act(async () => {});

      expect(await axe(container)).toHaveNoViolations();
      expect(await axe(getContent() as HTMLElement)).toHaveNoViolations();
    });

    it('has no axe violations for a named modal popover', async () => {
      const { container } = render(
        <Popover modal defaultOpen>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content aria-label="Account settings">
            <Popover.Description>Manage your profile.</Popover.Description>
            <Popover.Close />
          </Popover.Content>
        </Popover>,
      );
      await act(async () => {});

      expect(await axe(container)).toHaveNoViolations();
      expect(await axe(getContent() as HTMLElement)).toHaveNoViolations();
    });
  });
});
