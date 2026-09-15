import type { FormEvent, HTMLAttributes } from 'react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';

import { createToaster, Toast, type CreateToasterOptions, type ToastAppearance, type ToastData, type ToasterController, type ToastOptions, type ToastType } from './index';

// `data-*` keys are not part of `HTMLAttributes`, so slot overrides that try to
// hijack canonical hooks need an explicit template-literal index signature.
type SlotAttrs = HTMLAttributes<HTMLElement> & Record<`data-${string}`, string>;

const APPEARANCES: ToastAppearance[] = ['filled', 'filledLight', 'outlined', 'gradient'];

const controllers: ToasterController[] = [];

const makeToaster = (options: CreateToasterOptions = {}) => {
  const toaster = createToaster({ removeDelay: 0, ...options });
  controllers.push(toaster);
  return toaster;
};

/** A real controller-backed toast item, for tests that exercise controller wiring. */
const createToast = (options: ToastOptions = {}) => {
  const toaster = makeToaster();
  toaster.create({
    id: 'booking',
    title: 'Booking saved',
    description: 'Passenger details were updated.',
    type: 'success',
    duration: null,
    ...options,
  });
  const [toast] = toaster.getSnapshot();
  return { toaster, toast };
};

/** A plain toast item, for rendering tests that need exact control over every field. */
const makeToast = (overrides: Partial<ToastData> = {}): ToastData => ({
  id: 'booking',
  title: 'Booking saved',
  description: 'Passenger details were updated.',
  type: 'success',
  duration: null,
  createdAt: 0,
  remaining: null,
  status: 'visible',
  announcement: 'polite',
  dismissible: true,
  ...overrides,
});

let consoleError: MockInstance;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error');
});

afterEach(() => {
  controllers.splice(0).forEach(toaster => toaster.destroy());
  try {
    // Guards against React act()/key warnings leaking out of any test.
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});

describe('Toast', () => {
  describe('rendering', () => {
    it('renders the root slot contract with the documented toast data attributes', () => {
      render(<Toast toast={makeToast()} />);

      const root = screen.getByRole('status');
      expect(root.tagName).toBe('DIV');
      expect(root).toHaveClass('tk-toast');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-toast-id', 'booking');
      expect(root).toHaveAttribute('data-status', 'visible');
      expect(root).toHaveAttribute('data-type', 'success');
      expect(root).toHaveAttribute('aria-live', 'polite');
      expect(root).toHaveAttribute('tabindex', '0');
    });

    it('renders the default Takeoff Alert anatomy from the toast data', () => {
      render(<Toast toast={makeToast()} />);

      const root = screen.getByRole('status');
      const alert = root.querySelector('.tk-alert') as HTMLElement;
      expect(alert.parentElement).toBe(root);
      expect(alert).toHaveAttribute('role', 'presentation');
      expect(alert).toHaveAttribute('data-slot', 'root');
      expect(alert).toHaveAttribute('data-variant', 'success');
      expect(alert).toHaveAttribute('data-type', 'filled');

      const content = alert.querySelector('.tk-alert-content') as HTMLElement;
      expect(content.parentElement).toBe(alert);

      const title = within(root).getByRole('heading', { level: 5, name: 'Booking saved' });
      expect(title).toHaveClass('tk-alert-title');
      expect(title.parentElement).toBe(content);

      const description = within(root).getByText('Passenger details were updated.');
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('tk-alert-description');
      expect(description.parentElement).toBe(content);

      const close = within(root).getByRole('button', { name: 'Dismiss notification' });
      expect(close).toHaveClass('tk-alert-close');
      expect(close).toHaveAttribute('type', 'button');
      expect(close.parentElement).toBe(alert);
      expect(close.querySelector('svg')).not.toBeNull();

      expect(alert.querySelector('.tk-alert-actions')).toBeNull();
    });

    it.each<[ToastType, string]>([
      ['default', 'neutral'],
      ['success', 'success'],
      ['error', 'danger'],
      ['warning', 'warning'],
      ['info', 'info'],
      ['loading', 'neutral'],
    ])('maps toast type "%s" to the "%s" Alert and action variant', (type, variant) => {
      const { container } = render(<Toast toast={makeToast({ type, action: { label: 'Undo', altText: 'Undo booking update' } })} />);

      expect(container.querySelector('.tk-toast')).toHaveAttribute('data-type', type);
      expect(container.querySelector('.tk-alert')).toHaveAttribute('data-variant', variant);
      expect(screen.getByRole('button', { name: 'Undo booking update' })).toHaveAttribute('data-variant', variant);
    });

    it.each(APPEARANCES)('applies appearance="%s" to the default Alert renderer only', appearance => {
      const { container } = render(<Toast toast={makeToast()} appearance={appearance} />);

      expect(container.querySelector('.tk-alert')).toHaveAttribute('data-type', appearance);
      // The toast root keeps reflecting the headless toast type.
      expect(container.querySelector('.tk-toast')).toHaveAttribute('data-type', 'success');
    });

    it('names the default close control with closeLabel', () => {
      render(<Toast toast={makeToast()} closeLabel="Bildirimi kapat" />);

      expect(screen.getByRole('button', { name: 'Bildirimi kapat' })).toHaveClass('tk-alert-close');
      expect(screen.queryByRole('button', { name: 'Dismiss notification' })).toBeNull();
    });

    it('announces assertive toasts through the alert role', () => {
      render(<Toast toast={makeToast({ type: 'error', announcement: 'assertive' })} />);

      const root = screen.getByRole('alert');
      expect(root).toHaveClass('tk-toast');
      expect(root).toHaveAttribute('aria-live', 'assertive');
      expect(screen.queryByRole('status')).toBeNull();
    });

    it('reflects lifecycle transitions as data-status', () => {
      const { container, rerender } = render(<Toast toast={makeToast({ status: 'queued' })} />);
      expect(container.querySelector('.tk-toast')).toHaveAttribute('data-status', 'queued');

      rerender(<Toast toast={makeToast({ status: 'dismissing' })} />);
      expect(container.querySelector('.tk-toast')).toHaveAttribute('data-status', 'dismissing');
    });

    it('renders through the as prop and forwards the ref and native attributes', () => {
      let node: HTMLElement | null = null;

      render(
        <Toast
          as="section"
          id="booking-toast"
          ref={(element: HTMLElement | null) => {
            node = element;
          }}
          toast={makeToast()}
        />,
      );

      const root = screen.getByRole('status');
      expect(root.tagName).toBe('SECTION');
      expect(root).toHaveClass('tk-toast');
      expect(root).toHaveAttribute('id', 'booking-toast');
      expect(node).toBe(root);
    });

    it('lets a consumer tabIndex replace the default focusable tab stop', () => {
      render(<Toast toast={makeToast()} tabIndex={-1} />);

      expect(screen.getByRole('status')).toHaveAttribute('tabindex', '-1');
    });

    it('renders ReactNode title and description content inside the Alert parts', () => {
      render(
        <Toast
          toast={makeToast({
            title: <em>Booking saved</em>,
            description: <a href="#booking">View booking</a>,
          })}
        />,
      );

      const heading = screen.getByRole('heading', { level: 5, name: 'Booking saved' });
      expect(heading).toHaveClass('tk-alert-title');
      expect(heading.querySelector('em')).toHaveTextContent('Booking saved');

      const link = screen.getByRole('link', { name: 'View booking' });
      expect(link.parentElement).toHaveClass('tk-alert-description');
    });
  });

  describe('conditional parts', () => {
    it('skips the title and description when the toast has neither', () => {
      const { container } = render(<Toast toast={makeToast({ title: undefined, description: undefined })} />);

      expect(container.querySelector('.tk-alert-content')).not.toBeNull();
      expect(container.querySelector('.tk-alert-title')).toBeNull();
      expect(container.querySelector('.tk-alert-description')).toBeNull();
      expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument();
    });

    it('renders a description-only toast without a heading', () => {
      render(<Toast toast={makeToast({ title: undefined })} />);

      expect(screen.queryByRole('heading')).toBeNull();
      expect(screen.getByText('Passenger details were updated.')).toHaveClass('tk-alert-description');
    });

    it('renders a title-only toast without a description', () => {
      const { container } = render(<Toast toast={makeToast({ description: undefined })} />);

      expect(screen.getByRole('heading', { name: 'Booking saved' })).toHaveClass('tk-alert-title');
      expect(container.querySelector('.tk-alert-description')).toBeNull();
    });

    it('renders the action inside Alert.Actions as a small text Button named by altText', () => {
      const { container } = render(<Toast toast={makeToast({ type: 'info', action: { label: 'Undo', altText: 'Undo booking update' } })} />);

      const actions = container.querySelector('.tk-alert-actions') as HTMLElement;
      expect(actions).toHaveAttribute('data-slot', 'root');
      expect(actions.parentElement).toBe(container.querySelector('.tk-alert'));

      const action = within(actions).getByRole('button', { name: 'Undo booking update' });
      expect(action).toHaveClass('tk-button', 'tk-alert-action');
      expect(action).toHaveTextContent('Undo');
      expect(action).toHaveAttribute('data-variant', 'info');
      expect(action).toHaveAttribute('data-type', 'text');
      expect(action).toHaveAttribute('data-size', 'small');
    });

    it('omits the close control for non-dismissible toasts', () => {
      render(<Toast toast={makeToast({ dismissible: false })} />);

      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.getByRole('heading', { name: 'Booking saved' })).toBeInTheDocument();
    });

    it('keeps the action but skips the close control for a non-dismissible toast with an action', () => {
      const { container } = render(<Toast toast={makeToast({ dismissible: false, action: { label: 'Undo', altText: 'Undo booking update' } })} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveAccessibleName('Undo booking update');
      expect(buttons[0].closest('.tk-alert-actions')).not.toBeNull();
      expect(container.querySelector('.tk-alert-close')).toBeNull();
    });

    it('replaces the default Alert anatomy with custom children', () => {
      const { container } = render(
        <Toast toast={makeToast()}>
          <strong>Boarding pass</strong>
        </Toast>,
      );

      const root = screen.getByRole('status');
      expect(within(root).getByText('Boarding pass')).toBeInTheDocument();
      expect(container.querySelector('.tk-alert')).toBeNull();
      expect(within(root).queryByRole('button')).toBeNull();
      expect(within(root).queryByText('Booking saved')).toBeNull();
    });

    it('treats a null title or description like a missing one', () => {
      const { container, rerender } = render(<Toast toast={makeToast({ title: null })} />);

      expect(screen.queryByRole('heading')).toBeNull();
      expect(container.querySelector('.tk-alert-title')).toBeNull();
      expect(screen.getByText('Passenger details were updated.')).toHaveClass('tk-alert-description');

      rerender(<Toast toast={makeToast({ description: null })} />);

      expect(screen.getByRole('heading', { name: 'Booking saved' })).toHaveClass('tk-alert-title');
      expect(container.querySelector('.tk-alert-description')).toBeNull();
    });
  });

  describe('controller integration', () => {
    it('dismisses through the toaster when the default close control is clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      const toaster = makeToaster({ onDismiss });
      toaster.success({ id: 'booking', title: 'Booking saved', duration: null });
      const [toast] = toaster.getSnapshot();
      const dismiss = vi.spyOn(toaster, 'dismiss');

      render(<Toast toast={toast} toaster={toaster} />);
      await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));

      expect(dismiss).toHaveBeenCalledTimes(1);
      expect(dismiss).toHaveBeenCalledWith('booking');
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(onDismiss).toHaveBeenCalledWith(expect.objectContaining({ id: 'booking', status: 'dismissing' }));
      expect(toaster.getSnapshot()).toHaveLength(0);
    });

    it('runs the action callback with the toast payload, then dismisses the toast', async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      const { toaster, toast } = createToast({ action: { label: 'Undo', altText: 'Undo booking update', onClick: onAction } });
      const dismiss = vi.spyOn(toaster, 'dismiss');

      render(<Toast toast={toast} toaster={toaster} />);
      await user.click(screen.getByRole('button', { name: 'Undo booking update' }));

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith(toast);
      expect(dismiss).toHaveBeenCalledTimes(1);
      expect(dismiss).toHaveBeenCalledWith('booking');
      // The action runs against the still-visible toast, and only then is it dismissed.
      expect(onAction.mock.invocationCallOrder[0]).toBeLessThan(dismiss.mock.invocationCallOrder[0]);
      expect(toaster.getSnapshot()).toHaveLength(0);
    });

    it('dismisses on Escape while focused and still calls the consumer onKeyDown', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      const { toaster, toast } = createToast();
      const dismiss = vi.spyOn(toaster, 'dismiss');

      render(<Toast toast={toast} toaster={toaster} onKeyDown={onKeyDown} />);

      await user.tab();
      expect(screen.getByRole('status')).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(dismiss).not.toHaveBeenCalled();

      await user.keyboard('{Escape}');
      expect(dismiss).toHaveBeenCalledTimes(1);
      expect(dismiss).toHaveBeenCalledWith('booking');
      expect(onKeyDown).toHaveBeenCalledTimes(2);
    });

    it('pauses on hover and focus, resumes on leave and blur, and keeps consumer handlers', async () => {
      const user = userEvent.setup();
      const handlers = { onPointerEnter: vi.fn(), onPointerLeave: vi.fn(), onFocus: vi.fn(), onBlur: vi.fn() };
      const { toaster, toast } = createToast({ dismissible: false });
      const pause = vi.spyOn(toaster, 'pause');
      const resume = vi.spyOn(toaster, 'resume');

      render(
        <>
          <Toast toast={toast} toaster={toaster} {...handlers} />
          <button type="button">Outside</button>
        </>,
      );
      const root = screen.getByRole('status');

      await user.hover(root);
      expect(pause).toHaveBeenCalledTimes(1);
      expect(pause).toHaveBeenLastCalledWith('booking');
      expect(handlers.onPointerEnter).toHaveBeenCalledTimes(1);

      await user.unhover(root);
      expect(resume).toHaveBeenCalledTimes(1);
      expect(resume).toHaveBeenLastCalledWith('booking');
      expect(handlers.onPointerLeave).toHaveBeenCalledTimes(1);

      await user.tab();
      expect(root).toHaveFocus();
      expect(pause).toHaveBeenCalledTimes(2);
      expect(pause).toHaveBeenLastCalledWith('booking');
      expect(handlers.onFocus).toHaveBeenCalledTimes(1);

      await user.tab();
      expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
      expect(resume).toHaveBeenCalledTimes(2);
      expect(resume).toHaveBeenLastCalledWith('booking');
      expect(handlers.onBlur).toHaveBeenCalledTimes(1);
    });

    it('stays interactive without a toaster controller', async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      const toast = makeToast({ action: { label: 'Undo', altText: 'Undo booking update', onClick: onAction } });

      render(<Toast toast={toast} />);
      const root = screen.getByRole('status');

      await user.hover(root);
      await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('button', { name: 'Undo booking update' }));

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith(toast);
      expect(root).toBeInTheDocument();
    });

    it('dismisses on Escape pressed from a focused control inside the toast', async () => {
      const user = userEvent.setup();
      const { toaster, toast } = createToast();
      const dismiss = vi.spyOn(toaster, 'dismiss');

      render(<Toast toast={toast} toaster={toaster} />);

      await user.tab();
      await user.tab();
      expect(screen.getByRole('button', { name: 'Dismiss notification' })).toHaveFocus();

      await user.keyboard('{Escape}');
      expect(dismiss).toHaveBeenCalledTimes(1);
      expect(dismiss).toHaveBeenCalledWith('booking');
    });

    it('keeps pause and Escape dismissal wired when the toast renders custom children', async () => {
      const user = userEvent.setup();
      const { toaster, toast } = createToast();
      const pause = vi.spyOn(toaster, 'pause');
      const dismiss = vi.spyOn(toaster, 'dismiss');

      render(
        <Toast toast={toast} toaster={toaster}>
          <strong>Boarding pass</strong>
        </Toast>,
      );

      const root = screen.getByRole('status');
      expect(root.querySelector('.tk-alert')).toBeNull();

      await user.hover(root);
      expect(pause).toHaveBeenCalledTimes(1);
      expect(pause).toHaveBeenLastCalledWith('booking');

      await user.tab();
      expect(root).toHaveFocus();

      await user.keyboard('{Escape}');
      expect(dismiss).toHaveBeenCalledTimes(1);
      expect(dismiss).toHaveBeenCalledWith('booking');
      expect(toaster.getSnapshot()).toHaveLength(0);
    });

    it('never submits a surrounding form from the default close or action controls', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
      const { toaster, toast } = createToast({ action: { label: 'Undo', altText: 'Undo booking update' } });

      render(
        <form onSubmit={onSubmit}>
          <Toast toast={toast} toaster={toaster} />
        </form>,
      );

      const action = screen.getByRole('button', { name: 'Undo booking update' });
      const close = screen.getByRole('button', { name: 'Dismiss notification' });
      expect(action).toHaveAttribute('type', 'button');
      expect(close).toHaveAttribute('type', 'button');

      await user.click(action);
      await user.click(close);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('customization', () => {
    it('merges className, classNames and slotProps onto the toast root only', () => {
      render(<Toast toast={makeToast()} className="toast-extra" classNames={{ root: 'toast-slot' }} slotProps={{ root: { title: 'toast-title' } }} />);

      const root = screen.getByRole('status');
      expect(root).toHaveClass('tk-toast', 'toast-extra', 'toast-slot');
      expect(root).toHaveAttribute('title', 'toast-title');

      const alert = root.querySelector('.tk-alert');
      expect(alert).not.toHaveClass('toast-extra');
      expect(alert).not.toHaveClass('toast-slot');
      expect(alert).not.toHaveAttribute('title');
    });

    it('keeps data-slot and the toast data attributes when slotProps try to override them', () => {
      const hijack: SlotAttrs = { 'data-slot': 'hijack', 'data-status': 'queued', 'data-type': 'error', 'data-toast-id': 'other' };

      render(<Toast toast={makeToast()} slotProps={{ root: hijack }} />);

      const root = screen.getByRole('status');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-status', 'visible');
      expect(root).toHaveAttribute('data-type', 'success');
      expect(root).toHaveAttribute('data-toast-id', 'booking');
    });

    it('composes slotProps.root event handlers with the controller wiring', async () => {
      const user = userEvent.setup();
      const slotHandlers = { onPointerEnter: vi.fn(), onFocus: vi.fn(), onKeyDown: vi.fn() };
      const { toaster, toast } = createToast({ dismissible: false });
      const pause = vi.spyOn(toaster, 'pause');
      const dismiss = vi.spyOn(toaster, 'dismiss');

      render(<Toast toast={toast} toaster={toaster} slotProps={{ root: slotHandlers }} />);
      const root = screen.getByRole('status');

      await user.hover(root);
      expect(slotHandlers.onPointerEnter).toHaveBeenCalledTimes(1);
      expect(pause).toHaveBeenCalledTimes(1);

      await user.tab();
      expect(root).toHaveFocus();
      expect(slotHandlers.onFocus).toHaveBeenCalledTimes(1);
      expect(pause).toHaveBeenCalledTimes(2);

      await user.keyboard('{Escape}');
      expect(slotHandlers.onKeyDown).toHaveBeenCalledTimes(1);
      expect(slotHandlers.onKeyDown.mock.calls[0][0]).toMatchObject({ key: 'Escape' });
      expect(dismiss).toHaveBeenCalledTimes(1);
      expect(dismiss).toHaveBeenCalledWith('booking');
    });

    it('keeps the live-region role and aria-live when slotProps try to override them', () => {
      const hijack: SlotAttrs = { 'role': 'log', 'aria-live': 'off' };

      render(
        <>
          <Toast toast={makeToast({ id: 'polite' })} slotProps={{ root: hijack }} />
          <Toast toast={makeToast({ id: 'assertive', type: 'error', announcement: 'assertive' })} slotProps={{ root: hijack }} />
        </>,
      );

      expect(screen.queryByRole('log')).toBeNull();
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
    });

    it('applies provider theme defaults, classes and slotProps under the instance', () => {
      render(
        <TakeoffSparProvider
          components={{
            Toast: {
              defaultProps: { appearance: 'outlined', closeLabel: 'Kapat' },
              className: 'theme-toast',
              slotProps: { root: { title: 'theme-title' } },
            },
          }}
        >
          <Toast toast={makeToast({ id: 'themed' })} className="instance-toast" />
          <Toast toast={makeToast({ id: 'instance' })} appearance="gradient" closeLabel="Close this" slotProps={{ root: { title: 'instance-title' } }} />
        </TakeoffSparProvider>,
      );

      const [themed, instance] = screen.getAllByRole('status');

      expect(themed).toHaveClass('tk-toast', 'theme-toast', 'instance-toast');
      expect(themed).toHaveAttribute('title', 'theme-title');
      expect(themed.querySelector('.tk-alert')).toHaveAttribute('data-type', 'outlined');
      expect(within(themed).getByRole('button', { name: 'Kapat' })).toBeInTheDocument();

      expect(instance).toHaveClass('tk-toast', 'theme-toast');
      expect(instance).toHaveAttribute('title', 'instance-title');
      expect(instance.querySelector('.tk-alert')).toHaveAttribute('data-type', 'gradient');
      expect(within(instance).getByRole('button', { name: 'Close this' })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations for a default toast with an action', async () => {
      const { toaster, toast } = createToast({ action: { label: 'Undo', altText: 'Undo booking update' } });
      const { container } = render(<Toast toast={toast} toaster={toaster} />);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for an assertive toast and a custom-rendered toast', async () => {
      const { container } = render(
        <>
          <Toast toast={makeToast({ id: 'error', type: 'error', announcement: 'assertive', title: 'Payment failed' })} appearance="filledLight" />
          <Toast toast={makeToast({ id: 'custom' })}>
            <strong>Boarding pass</strong>
          </Toast>
        </>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
