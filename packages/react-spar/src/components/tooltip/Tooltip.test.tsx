import { act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, isValidElement, useState, type ReactElement } from 'react';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';

import { Tooltip } from './index';
import type { TooltipVariant } from './types';

const VARIANTS: TooltipVariant[] = ['white', 'dark', 'info', 'success', 'warning', 'danger', 'neutral'];

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
  show: () => void;
  hide: () => void;
}

describe('Tooltip (compound)', () => {
  describe('rendering', () => {
    it('renders the trigger slot and no tooltip while closed', () => {
      render(
        <Tooltip>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: 'Save' });
      expect(trigger).toHaveClass('tk-tooltip-trigger');
      expect(trigger).toHaveAttribute('data-slot', 'root');
      expect(trigger).not.toHaveAttribute('aria-describedby');
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('portals the open tooltip to document.body with its slot contract and describes the trigger', () => {
      const { container } = render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveClass('tk-tooltip-content');
      expect(tooltip).toHaveAttribute('data-slot', 'root');
      expect(tooltip).toHaveAttribute('data-variant', 'white');
      expect(tooltip.parentElement).toBe(document.body);
      expect(container).not.toContainElement(tooltip);
      expect(tooltip.id).not.toBe('');
      expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-describedby', tooltip.id);
      expect(screen.getByRole('button', { name: 'Save' })).toHaveAccessibleDescription('Saves the draft');
    });

    it('renders Header as a div and Description as a p inside the content', () => {
      render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Header>Important</Tooltip.Header>
            <Tooltip.Description>Unsaved changes will be lost.</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const tooltip = screen.getByRole('tooltip');
      const header = within(tooltip).getByText('Important');
      const description = within(tooltip).getByText('Unsaved changes will be lost.');

      expect(header.tagName).toBe('DIV');
      expect(header).toHaveClass('tk-tooltip-header');
      expect(header).toHaveAttribute('data-slot', 'root');
      expect(header.parentElement).toBe(tooltip);

      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('tk-tooltip-description');
      expect(description).toHaveAttribute('data-slot', 'root');
      expect(description.parentElement).toBe(tooltip);
    });

    it.each(VARIANTS)('reflects variant="%s" on the content as data-variant', variant => {
      render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content variant={variant}>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      expect(screen.getByRole('tooltip')).toHaveAttribute('data-variant', variant);
    });

    it('renders the arrow as a decorative svg with the bordered pointer shape by default', () => {
      render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip>,
      );

      const tooltip = screen.getByRole('tooltip');
      const arrow = tooltip.querySelector('.tk-tooltip-arrow');

      expect(arrow).not.toBeNull();
      expect(arrow?.tagName.toLowerCase()).toBe('svg');
      expect(arrow?.parentElement).toBe(tooltip);
      expect(arrow).toHaveAttribute('data-slot', 'root');
      expect(arrow).toHaveAttribute('aria-hidden', 'true');
      expect(arrow?.querySelector('.tk-arrow-border')).not.toBeNull();
      expect(arrow?.querySelector('.tk-arrow-fill')).not.toBeNull();
    });

    it('lets explicit arrow children replace the default pointer shape', () => {
      render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
            <Tooltip.Arrow>
              <path data-testid="custom-pointer" d="M0 0L5 5L10 0" />
            </Tooltip.Arrow>
          </Tooltip.Content>
        </Tooltip>,
      );

      const arrow = screen.getByRole('tooltip').querySelector('.tk-tooltip-arrow');

      expect(arrow).toContainElement(screen.getByTestId('custom-pointer'));
      expect(arrow?.querySelector('.tk-arrow-border')).toBeNull();
      expect(arrow?.querySelector('.tk-arrow-fill')).toBeNull();
    });

    it('renders the trigger and content as custom elements through the as prop', () => {
      render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger as="span">Save</Tooltip.Trigger>
          <Tooltip.Content as="section">
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: 'Save' });
      expect(trigger.tagName).toBe('SPAN');
      expect(trigger).toHaveClass('tk-tooltip-trigger');
      expect(screen.getByRole('tooltip').tagName).toBe('SECTION');
    });

    it('renders Header and Description as custom elements through the as prop', () => {
      render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Header as="h2">Important</Tooltip.Header>
            <Tooltip.Description as="div">Unsaved changes will be lost.</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const tooltip = screen.getByRole('tooltip');
      const header = within(tooltip).getByRole('heading', { level: 2, name: 'Important' });
      expect(header).toHaveClass('tk-tooltip-header');
      expect(header).toHaveAttribute('data-slot', 'root');
      expect(header).not.toHaveAttribute('as');

      const description = within(tooltip).getByText('Unsaved changes will be lost.');
      expect(description.tagName).toBe('DIV');
      expect(description).toHaveClass('tk-tooltip-description');
      expect(description).toHaveAttribute('data-slot', 'root');
      expect(description).not.toHaveAttribute('as');
    });

    it('forwards refs to the DOM node of every part', () => {
      const triggerRef = createRef<HTMLButtonElement>();
      const contentRef = createRef<HTMLDivElement>();
      const headerRef = createRef<HTMLDivElement>();
      const descriptionRef = createRef<HTMLParagraphElement>();
      const arrowRef = createRef<SVGSVGElement>();

      render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger ref={triggerRef}>Save</Tooltip.Trigger>
          <Tooltip.Content ref={contentRef}>
            <Tooltip.Header ref={headerRef}>Title</Tooltip.Header>
            <Tooltip.Description ref={descriptionRef}>Body</Tooltip.Description>
            <Tooltip.Arrow ref={arrowRef} />
          </Tooltip.Content>
        </Tooltip>,
      );

      const tooltip = screen.getByRole('tooltip');
      expect(triggerRef.current).toBe(screen.getByRole('button', { name: 'Save' }));
      expect(contentRef.current).toBe(tooltip);
      expect(headerRef.current).toBe(within(tooltip).getByText('Title'));
      expect(descriptionRef.current).toBe(within(tooltip).getByText('Body'));
      expect(arrowRef.current).toBe(tooltip.querySelector('.tk-tooltip-arrow'));
    });

    it('derives the trigger and content ids from the root id', () => {
      render(
        <Tooltip id="save-hint" defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: 'Save' });
      expect(trigger).toHaveAttribute('id', 'save-hint-trigger');
      expect(screen.getByRole('tooltip')).toHaveAttribute('id', 'save-hint-content');
      expect(trigger).toHaveAttribute('aria-describedby', 'save-hint-content');
    });

    it('positions against the documented top/center default and forwards side/align overrides to Spar', async () => {
      const { rerender } = render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );
      await act(async () => {});

      expect(screen.getByRole('tooltip')).toHaveAttribute('data-placement', 'top');

      rerender(
        <Tooltip defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content side="bottom" align="start">
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );
      await act(async () => {});

      expect(screen.getByRole('tooltip')).toHaveAttribute('data-placement', 'bottom-start');
    });

    it('portals into a custom container when one is provided', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);

      render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content container={host}>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      expect(screen.getByRole('tooltip').parentElement).toBe(host);
      host.remove();
    });
  });

  describe('open state', () => {
    it('opens when the trigger receives keyboard focus and closes on blur', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <>
          <Tooltip delay={0} onOpenChange={onOpenChange}>
            <Tooltip.Trigger>Save</Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Description>Saves the draft</Tooltip.Description>
            </Tooltip.Content>
          </Tooltip>
          <button type="button">Next</button>
        </>,
      );

      const trigger = screen.getByRole('button', { name: 'Save' });

      await user.tab();
      expect(trigger).toHaveFocus();

      const tooltip = await screen.findByRole('tooltip');
      expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);

      await user.tab();
      expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();

      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      expect(trigger).not.toHaveAttribute('aria-describedby');
      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    });

    it('dismisses on Escape and keeps focus on the trigger', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Tooltip delay={0} onOpenChange={onOpenChange}>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: 'Save' });

      await user.tab();
      await screen.findByRole('tooltip');

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('fires onEscapeKeyDown with the native keyboard event when Escape is pressed inside the content', async () => {
      const user = userEvent.setup();
      const onEscapeKeyDown = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <Tooltip open onOpenChange={onOpenChange}>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content tabIndex={-1} onEscapeKeyDown={onEscapeKeyDown}>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      act(() => screen.getByRole('tooltip').focus());
      await user.keyboard('{Escape}');

      expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
      const [event] = onEscapeKeyDown.mock.calls[0];
      expect(event).toBeInstanceOf(KeyboardEvent);
      expect(event).toMatchObject({ key: 'Escape' });
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    });

    it('does not expose the Spar dismiss/auto-focus hooks the tooltip never fires', () => {
      // Type-level contract: Spar never calls these on a tooltip and would
      // spread them onto the DOM, so the wrapper does not pick them. The
      // elements are only created, never rendered.
      const elements = [
        // @ts-expect-error onPointerDownOutside is not a Tooltip.Content prop
        <Tooltip.Content key="pointer" onPointerDownOutside={() => {}} />,
        // @ts-expect-error onOpenAutoFocus is not a Tooltip.Content prop
        <Tooltip.Content key="open" onOpenAutoFocus={() => {}} />,
        // @ts-expect-error onCloseAutoFocus is not a Tooltip.Content prop
        <Tooltip.Content key="close" onCloseAutoFocus={() => {}} />,
      ];

      expect(elements.every(isValidElement)).toBe(true);
    });

    it('follows the controlled open prop and only requests changes through onOpenChange', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const ui = (open: boolean) => (
        <Tooltip open={open} delay={0} onOpenChange={onOpenChange}>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>
      );

      const { rerender } = render(ui(false));
      const trigger = screen.getByRole('button', { name: 'Save' });

      await user.hover(trigger);
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      rerender(ui(true));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      await user.unhover(trigger);
      await waitFor(() => expect(onOpenChange).toHaveBeenLastCalledWith(false));
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('stays in sync with a stateful parent in controlled mode', async () => {
      const user = userEvent.setup();
      const ControlledTooltip = () => {
        const [open, setOpen] = useState(false);
        return (
          <>
            <Tooltip open={open} onOpenChange={setOpen}>
              <Tooltip.Trigger>Controlled</Tooltip.Trigger>
              <Tooltip.Content>
                <Tooltip.Description>Controlled tooltip</Tooltip.Description>
              </Tooltip.Content>
            </Tooltip>
            <button type="button" onClick={() => setOpen(!open)}>
              {open ? 'Hide' : 'Show'}
            </button>
          </>
        );
      };

      render(<ControlledTooltip />);

      await user.click(screen.getByRole('button', { name: 'Show' }));
      expect(screen.getByRole('tooltip')).toHaveTextContent('Controlled tooltip');

      await user.click(screen.getByRole('button', { name: 'Hide' }));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('passes { isOpen, disabled, show, hide } to render-prop trigger children', async () => {
      const captured: { current?: TriggerRenderState } = {};

      render(
        <Tooltip>
          <Tooltip.Trigger>
            {state => {
              captured.current = state;
              return state.isOpen ? 'Visible' : 'Hidden';
            }}
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      expect(captured.current).toEqual({
        isOpen: false,
        disabled: false,
        show: expect.any(Function),
        hide: expect.any(Function),
      });

      act(() => captured.current?.show());
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Visible' })).toBeInTheDocument();
      expect(captured.current?.isOpen).toBe(true);

      act(() => captured.current?.hide());
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      expect(screen.getByRole('button', { name: 'Hidden' })).toBeInTheDocument();
    });

    it('never shows the tooltip or describes the trigger while disabled', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const captured: { current?: TriggerRenderState } = {};

      render(
        <Tooltip disabled defaultOpen delay={0} onOpenChange={onOpenChange}>
          <Tooltip.Trigger>
            {state => {
              captured.current = state;
              return 'Save';
            }}
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: 'Save' });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(trigger).not.toHaveAttribute('aria-describedby');
      expect(captured.current?.disabled).toBe(true);

      await user.hover(trigger);

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('timing', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const setupUser = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    it('opens on hover once the delay elapses and closes on unhover', async () => {
      const user = setupUser();
      const onOpenChange = vi.fn();

      render(
        <Tooltip delay={600} onOpenChange={onOpenChange}>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: 'Save' });

      await user.hover(trigger);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('tooltip')).toHaveTextContent('Saves the draft');
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      await user.unhover(trigger);
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      expect(onOpenChange).toHaveBeenCalledTimes(2);
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('falls back to the Spar default 700ms show delay when none is configured', async () => {
      const user = setupUser();

      render(
        <Tooltip>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      await user.hover(screen.getByRole('button', { name: 'Save' }));
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('keeps the tooltip visible until hideDelay elapses after unhover', async () => {
      const user = setupUser();

      render(
        <Tooltip delay={0} hideDelay={600}>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: 'Save' });

      await user.hover(trigger);
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();

      await user.unhover(trigger);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('keeps the tooltip open while the pointer rests on its content and closes when it leaves', async () => {
      const user = setupUser();

      render(
        <Tooltip delay={0} hideDelay={300}>
          <Tooltip.Trigger>Info</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Details</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      await user.hover(screen.getByRole('button', { name: 'Info' }));
      const tooltip = await screen.findByRole('tooltip');

      await user.hover(tooltip);
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      await user.unhover(tooltip);
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    });
  });

  describe('Tooltip.Provider', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    const setupUser = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    it('shares delayDuration with every tooltip in the group', async () => {
      const user = setupUser();

      render(
        <Tooltip.Provider delayDuration={1000}>
          <Tooltip>
            <Tooltip.Trigger>Bold</Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Description>Bold text</Tooltip.Description>
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>,
      );

      await user.hover(screen.getByRole('button', { name: 'Bold' }));
      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.getByRole('tooltip')).toHaveTextContent('Bold text');
    });

    it('lets a per-tooltip delay override the provider delayDuration', async () => {
      const user = setupUser();

      render(
        <Tooltip.Provider delayDuration={5000}>
          <Tooltip delay={300}>
            <Tooltip.Trigger>Bold</Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Description>Bold text</Tooltip.Description>
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>,
      );

      await user.hover(screen.getByRole('button', { name: 'Bold' }));
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('tooltip')).toHaveTextContent('Bold text');
    });

    it('opens a sibling instantly within skipDelayDuration and restores the delay once the window passes', async () => {
      const user = setupUser();

      render(
        <Tooltip.Provider delayDuration={600} skipDelayDuration={400}>
          <Tooltip>
            <Tooltip.Trigger>First</Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Description>First tip</Tooltip.Description>
            </Tooltip.Content>
          </Tooltip>
          <Tooltip>
            <Tooltip.Trigger>Second</Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Description>Second tip</Tooltip.Description>
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>,
      );

      const first = screen.getByRole('button', { name: 'First' });
      const second = screen.getByRole('button', { name: 'Second' });

      await user.hover(first);
      act(() => {
        vi.advanceTimersByTime(600);
      });
      expect(screen.getByRole('tooltip')).toHaveTextContent('First tip');

      await user.hover(second);
      await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Second tip'));
      expect(screen.getAllByRole('tooltip')).toHaveLength(1);

      await user.unhover(second);
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      act(() => {
        vi.advanceTimersByTime(400);
      });

      await user.hover(first);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByRole('tooltip')).toHaveTextContent('First tip');
    });

    it('closes after hideDelay even over the content when disableHoverableContent is set', async () => {
      const user = setupUser();

      render(
        <Tooltip.Provider disableHoverableContent>
          <Tooltip delay={0} hideDelay={300}>
            <Tooltip.Trigger>Info</Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Description>Details</Tooltip.Description>
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>,
      );

      await user.hover(screen.getByRole('button', { name: 'Info' }));
      const tooltip = await screen.findByRole('tooltip');

      await user.hover(tooltip);
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('disabled', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('also disables the trigger control itself, as documented', () => {
      render(
        <Tooltip disabled>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('stays closed after the delay elapses on hover, focus or programmatic show()', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onOpenChange = vi.fn();
      const captured: { current?: TriggerRenderState } = {};

      render(
        <Tooltip disabled delay={200} onOpenChange={onOpenChange}>
          <Tooltip.Trigger>
            {state => {
              captured.current = state;
              return 'Save';
            }}
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const trigger = screen.getByRole('button', { name: 'Save' });

      await user.hover(trigger);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      fireEvent.focusIn(trigger);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => captured.current?.show());
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      expect(trigger).not.toHaveAttribute('aria-describedby');
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(captured.current?.isOpen).toBe(false);
    });
  });

  describe('trigger event composition', () => {
    it('still calls consumer focus, blur and pointer handlers while driving the tooltip', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      const onPointerEnter = vi.fn();
      const onPointerLeave = vi.fn();

      render(
        <>
          <Tooltip delay={0}>
            <Tooltip.Trigger onFocus={onFocus} onBlur={onBlur} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
              Save
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Description>Saves the draft</Tooltip.Description>
            </Tooltip.Content>
          </Tooltip>
          <button type="button">Next</button>
        </>,
      );

      const trigger = screen.getByRole('button', { name: 'Save' });

      await user.tab();
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Saves the draft');
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onFocus).toHaveBeenCalledWith(expect.objectContaining({ type: 'focus', target: trigger }));

      await user.tab();
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledWith(expect.objectContaining({ type: 'blur', target: trigger }));

      await user.hover(trigger);
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
      expect(onPointerEnter).toHaveBeenCalledTimes(1);
      expect(onPointerEnter).toHaveBeenCalledWith(expect.objectContaining({ type: 'pointerenter' }));

      await user.unhover(trigger);
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
      expect(onPointerLeave).toHaveBeenCalledTimes(1);
      expect(onPointerLeave).toHaveBeenCalledWith(expect.objectContaining({ type: 'pointerleave' }));
    });
  });

  describe('customization', () => {
    it('merges the provider className shortcut with instance className and classNames.root on the content owner node', () => {
      render(
        <TakeoffSparProvider components={{ TooltipContent: { className: 'theme-content' }, TooltipTrigger: { classNames: { root: 'theme-trigger-slot' } } }}>
          <Tooltip defaultOpen>
            <Tooltip.Trigger classNames={{ root: 'instance-trigger-slot' }}>Save</Tooltip.Trigger>
            <Tooltip.Content className="instance-content" classNames={{ root: 'instance-content-slot' }}>
              <Tooltip.Description>Saves the draft</Tooltip.Description>
            </Tooltip.Content>
          </Tooltip>
        </TakeoffSparProvider>,
      );

      expect(screen.getByRole('tooltip')).toHaveClass('tk-tooltip-content', 'theme-content', 'instance-content', 'instance-content-slot');
      expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('tk-tooltip-trigger', 'theme-trigger-slot', 'instance-trigger-slot');
      expect(screen.getByRole('button', { name: 'Save' })).not.toHaveClass('theme-content');
    });

    it('merges className, classNames.root and slotProps.root onto each part owner node', () => {
      render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger className="trigger-extra" classNames={{ root: 'trigger-slot' }} slotProps={{ root: { title: 'Trigger title' } }}>
            Save
          </Tooltip.Trigger>
          <Tooltip.Content className="content-extra" classNames={{ root: 'content-slot' }} slotProps={{ root: { title: 'Content title' } }}>
            <Tooltip.Header className="header-extra" classNames={{ root: 'header-slot' }} slotProps={{ root: { title: 'Header title' } }}>
              Title
            </Tooltip.Header>
            <Tooltip.Description className="description-extra" classNames={{ root: 'description-slot' }} slotProps={{ root: { title: 'Description title' } }}>
              Body
            </Tooltip.Description>
            <Tooltip.Arrow className="arrow-extra" classNames={{ root: 'arrow-slot' }} slotProps={{ root: { title: 'Arrow title' } }} />
          </Tooltip.Content>
        </Tooltip>,
      );

      const tooltip = screen.getByRole('tooltip');
      const trigger = screen.getByRole('button', { name: 'Save' });
      const header = within(tooltip).getByText('Title');
      const description = within(tooltip).getByText('Body');
      const arrow = tooltip.querySelector('.tk-tooltip-arrow');

      expect(trigger).toHaveClass('tk-tooltip-trigger', 'trigger-extra', 'trigger-slot');
      expect(trigger).toHaveAttribute('title', 'Trigger title');

      expect(tooltip).toHaveClass('tk-tooltip-content', 'content-extra', 'content-slot');
      expect(tooltip).toHaveAttribute('title', 'Content title');
      expect(tooltip).not.toHaveClass('header-extra');

      expect(header).toHaveClass('tk-tooltip-header', 'header-extra', 'header-slot');
      expect(header).toHaveAttribute('title', 'Header title');

      expect(description).toHaveClass('tk-tooltip-description', 'description-extra', 'description-slot');
      expect(description).toHaveAttribute('title', 'Description title');

      expect(arrow).toHaveClass('tk-tooltip-arrow', 'arrow-extra', 'arrow-slot');
      expect(arrow).toHaveAttribute('title', 'Arrow title');
    });

    it('keeps the canonical data-slot and data-variant hooks when slotProps try to override them', () => {
      const hijack = { 'title': 'Hijack', 'data-slot': 'hijack', 'data-variant': 'dark' };

      render(
        <Tooltip defaultOpen>
          <Tooltip.Trigger slotProps={{ root: hijack }}>Save</Tooltip.Trigger>
          <Tooltip.Content variant="warning" slotProps={{ root: hijack }}>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('title', 'Hijack');
      expect(tooltip).toHaveAttribute('data-slot', 'root');
      expect(tooltip).toHaveAttribute('data-variant', 'warning');
      expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('data-slot', 'root');
    });

    it('applies provider theme layers to every part', () => {
      render(
        <TakeoffSparProvider
          components={{
            TooltipTrigger: { classNames: { root: 'theme-trigger' } },
            TooltipContent: { defaultProps: { variant: 'danger' }, className: 'theme-content', slotProps: { root: { title: 'Theme content' } } },
            TooltipHeader: { className: 'theme-header' },
            TooltipDescription: { classNames: { root: 'theme-description' } },
            TooltipArrow: { className: 'theme-arrow' },
          }}
        >
          <Tooltip defaultOpen>
            <Tooltip.Trigger className="instance-trigger">Save</Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Header>Title</Tooltip.Header>
              <Tooltip.Description>Body</Tooltip.Description>
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip>
        </TakeoffSparProvider>,
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('data-variant', 'danger');
      expect(tooltip).toHaveClass('tk-tooltip-content', 'theme-content');
      expect(tooltip).toHaveAttribute('title', 'Theme content');

      expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('tk-tooltip-trigger', 'theme-trigger', 'instance-trigger');
      expect(within(tooltip).getByText('Title')).toHaveClass('tk-tooltip-header', 'theme-header');
      expect(within(tooltip).getByText('Body')).toHaveClass('tk-tooltip-description', 'theme-description');
      expect(tooltip.querySelector('.tk-tooltip-arrow')).toHaveClass('tk-tooltip-arrow', 'theme-arrow');
    });

    it('lets instance props win over provider theme defaults', () => {
      render(
        <TakeoffSparProvider
          components={{
            TooltipContent: { defaultProps: { variant: 'danger' }, slotProps: { root: { title: 'Theme content' } } },
          }}
        >
          <Tooltip defaultOpen>
            <Tooltip.Trigger>Save</Tooltip.Trigger>
            <Tooltip.Content variant="success" slotProps={{ root: { title: 'Instance content' } }}>
              <Tooltip.Description>Body</Tooltip.Description>
            </Tooltip.Content>
          </Tooltip>
        </TakeoffSparProvider>,
      );

      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveAttribute('data-variant', 'success');
      expect(tooltip).toHaveAttribute('title', 'Instance content');
    });
  });

  describe('context boundaries', () => {
    it('throws when Tooltip.Trigger renders outside the root', () => {
      expectRenderToThrow(<Tooltip.Trigger>Save</Tooltip.Trigger>, /Tooltip components must be used within Tooltip/);
    });

    it('throws when Tooltip.Content renders outside the root', () => {
      expectRenderToThrow(
        <Tooltip.Content>
          <Tooltip.Description>Body</Tooltip.Description>
        </Tooltip.Content>,
        /Tooltip components must be used within Tooltip/,
      );
    });

    it('throws when Tooltip.Arrow renders outside the root', () => {
      expectRenderToThrow(<Tooltip.Arrow />, /Tooltip components must be used within Tooltip/);
    });

    it('throws when Tooltip.Arrow renders inside the root but outside Tooltip.Content', () => {
      expectRenderToThrow(
        <Tooltip>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Arrow />
        </Tooltip>,
        /TooltipArrow must be used within TooltipContent/,
      );
    });

    it('renders the presentational Header and Description slots without requiring the root', () => {
      render(
        <>
          <Tooltip.Header>Title</Tooltip.Header>
          <Tooltip.Description>Body</Tooltip.Description>
        </>,
      );

      expect(screen.getByText('Title')).toHaveClass('tk-tooltip-header');
      expect(screen.getByText('Body')).toHaveClass('tk-tooltip-description');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations while closed', async () => {
      const { container } = render(
        <Tooltip>
          <Tooltip.Trigger>Save</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Description>Saves the draft</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations when open with the full anatomy inside a provider', async () => {
      const { container } = render(
        <Tooltip.Provider>
          <Tooltip defaultOpen>
            <Tooltip.Trigger>Save</Tooltip.Trigger>
            <Tooltip.Content variant="info">
              <Tooltip.Header>Important</Tooltip.Header>
              <Tooltip.Description>Unsaved changes will be lost.</Tooltip.Description>
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>,
      );
      // Let Spar's async positioning update settle inside act before axe runs asynchronously.
      await act(async () => {});

      expect(await axe(container)).toHaveNoViolations();
      expect(await axe(screen.getByRole('tooltip'))).toHaveNoViolations();
    });
  });
});
