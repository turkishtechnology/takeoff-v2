import type { HTMLAttributes } from 'react';
import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';

import { createToaster, Toast, Toaster, type CreateToasterOptions, type ToastData, type ToasterController, type ToastPlacement } from './index';

// `data-*` keys are not part of `HTMLAttributes`, so slot overrides that try to
// hijack canonical hooks need an explicit template-literal index signature.
type SlotAttrs = HTMLAttributes<HTMLElement> & Record<`data-${string}`, string>;

const PLACEMENTS: ToastPlacement[] = ['top-start', 'top', 'top-end', 'bottom-start', 'bottom', 'bottom-end'];

const controllers: ToasterController[] = [];

const makeToaster = (options: CreateToasterOptions = {}) => {
  const toaster = createToaster({ removeDelay: 0, ...options });
  controllers.push(toaster);
  return toaster;
};

const toastIn = (region: HTMLElement, id: string) => region.querySelector<HTMLElement>(`.tk-toast[data-toast-id="${id}"]`);

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

describe('Toaster', () => {
  describe('rendering', () => {
    it('renders the viewport root slot contract with its defaults', () => {
      render(<Toaster toaster={makeToaster()} />);

      const region = screen.getByRole('region', { name: 'Notifications (F8)' });
      expect(region.tagName).toBe('DIV');
      expect(region).toHaveClass('tk-toaster');
      expect(region).toHaveAttribute('data-slot', 'root');
      expect(region).toHaveAttribute('data-placement', 'bottom-end');
      expect(region).toHaveAttribute('tabindex', '-1');
      expect(region).not.toHaveAttribute('data-overlap');
      expect(region).not.toHaveAttribute('data-expanded');
      expect(region.querySelector('.tk-toast')).toBeNull();
    });

    it.each(PLACEMENTS)('reflects placement "%s" as data-placement', placement => {
      render(<Toaster toaster={makeToaster({ placement })} />);

      expect(screen.getByRole('region')).toHaveAttribute('data-placement', placement);
    });

    it('renders one default Toast per visible toast with the default appearance and close label', () => {
      const toaster = makeToaster();
      toaster.success({ id: 'saved', title: 'Booking saved', duration: null });
      toaster.error({ id: 'failed', title: 'Payment failed', description: 'Please try again.', duration: null });

      render(<Toaster toaster={toaster} />);

      const region = screen.getByRole('region');
      expect(region.querySelectorAll('.tk-toast')).toHaveLength(2);

      const saved = toastIn(region, 'saved') as HTMLElement;
      expect(saved.parentElement).toBe(region);
      expect(saved).toHaveAttribute('data-type', 'success');
      expect(saved.querySelector('.tk-alert')).toHaveAttribute('data-variant', 'success');
      expect(saved.querySelector('.tk-alert')).toHaveAttribute('data-type', 'filled');
      expect(within(saved).getByRole('heading', { name: 'Booking saved' })).toBeInTheDocument();
      expect(within(saved).getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument();

      const failed = toastIn(region, 'failed') as HTMLElement;
      expect(failed).toHaveAttribute('role', 'alert');
      expect(failed.querySelector('.tk-alert')).toHaveAttribute('data-variant', 'danger');
      expect(within(failed).getByText('Please try again.')).toHaveClass('tk-alert-description');
    });

    it('passes appearance and closeLabel to every default toast', () => {
      const toaster = makeToaster();
      toaster.info({ id: 'first', title: 'First', duration: null });
      toaster.info({ id: 'second', title: 'Second', duration: null });

      render(<Toaster toaster={toaster} appearance="outlined" closeLabel="Kapat" />);

      const region = screen.getByRole('region');
      const alerts = region.querySelectorAll('.tk-alert');
      expect(alerts).toHaveLength(2);
      alerts.forEach(alert => expect(alert).toHaveAttribute('data-type', 'outlined'));
      expect(within(region).getAllByRole('button', { name: 'Kapat' })).toHaveLength(2);
      expect(within(region).queryByRole('button', { name: 'Dismiss notification' })).toBeNull();
    });

    it('renders at most maxVisibleToasts items and leaves the rest queued', () => {
      const toaster = makeToaster({ maxVisibleToasts: 2 });
      ['one', 'two', 'three'].forEach(id => toaster.info({ id, title: id, duration: null }));

      render(<Toaster toaster={toaster} />);

      const region = screen.getByRole('region');
      expect(region.querySelectorAll('.tk-toast')).toHaveLength(2);
      expect(toastIn(region, 'three')).not.toBeNull();
      expect(toastIn(region, 'two')).not.toBeNull();
      expect(toastIn(region, 'one')).toBeNull();
    });

    it('names the viewport with label and forwards as, ref and native attributes', () => {
      let node: HTMLElement | null = null;

      render(
        <Toaster
          as="section"
          id="notifications"
          label="Bildirimler"
          ref={(element: HTMLElement | null) => {
            node = element;
          }}
          toaster={makeToaster()}
        />,
      );

      const region = screen.getByRole('region', { name: 'Bildirimler' });
      expect(region.tagName).toBe('SECTION');
      expect(region).toHaveClass('tk-toaster');
      expect(region).toHaveAttribute('id', 'notifications');
      expect(node).toBe(region);
    });

    it('promotes a queued toast into the viewport once a visible one is dismissed', () => {
      const toaster = makeToaster({ maxVisibleToasts: 2 });
      ['one', 'two', 'three'].forEach(id => toaster.info({ id, title: id, duration: null }));

      render(<Toaster toaster={toaster} />);

      const region = screen.getByRole('region');
      expect(toastIn(region, 'one')).toBeNull();

      act(() => {
        toaster.dismiss('three');
      });

      expect(region.querySelectorAll('.tk-toast')).toHaveLength(2);
      expect(toastIn(region, 'three')).toBeNull();
      expect(toastIn(region, 'two')).toHaveAttribute('data-status', 'visible');
      expect(toastIn(region, 'one')).toHaveAttribute('data-status', 'visible');
    });
  });

  describe('custom rendering', () => {
    it('calls the children render function with each visible toast payload', () => {
      const toaster = makeToaster();
      toaster.info({ id: 'boarding', title: 'TK 1845', description: 'Boarding starts at Gate A12.', duration: null, data: { gate: 'A12' } });

      const renderToast = vi.fn((toast: ToastData) => (
        <Toast toast={toast} toaster={toaster} className="custom-toast">
          <strong>{toast.title}</strong>
          <span>Gate {(toast.data as { gate: string }).gate}</span>
        </Toast>
      ));

      render(<Toaster toaster={toaster}>{renderToast}</Toaster>);

      expect(renderToast).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'boarding',
          title: 'TK 1845',
          description: 'Boarding starts at Gate A12.',
          type: 'info',
          status: 'visible',
          dismissible: true,
          data: { gate: 'A12' },
        }),
      );

      const region = screen.getByRole('region');
      const toastRoot = toastIn(region, 'boarding') as HTMLElement;
      expect(toastRoot).toHaveClass('tk-toast', 'custom-toast');
      expect(within(toastRoot).getByText('Gate A12')).toBeInTheDocument();
      expect(region.querySelector('.tk-alert')).toBeNull();
    });

    it('renders arbitrary custom output without the default Toast', () => {
      const toaster = makeToaster();
      toaster.info({ id: 'plain', title: 'Plain', duration: null });

      render(<Toaster toaster={toaster}>{toast => <p>{toast.title} notification</p>}</Toaster>);

      const region = screen.getByRole('region');
      expect(within(region).getByText('Plain notification')).toBeInTheDocument();
      expect(region.querySelector('.tk-toast')).toBeNull();
    });

    it('keys multiple items in both the default and the custom renderer', () => {
      const custom = makeToaster();
      const defaults = makeToaster();
      [custom, defaults].forEach(toaster => {
        toaster.info({ id: 'first', title: 'First', duration: null });
        toaster.info({ id: 'second', title: 'Second', duration: null });
      });

      render(
        <>
          <Toaster toaster={custom} label="Custom">
            {toast => <p>{toast.title}</p>}
          </Toaster>
          <Toaster toaster={defaults} label="Default" />
        </>,
      );

      expect(within(screen.getByRole('region', { name: 'Custom' })).getAllByText(/First|Second/)).toHaveLength(2);
      expect(screen.getByRole('region', { name: 'Default' }).querySelectorAll('.tk-toast')).toHaveLength(2);
      // A missing key would surface as a React console.error warning.
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('overlap', () => {
    it('marks the viewport as overlapping and expands it while hovered', async () => {
      const user = userEvent.setup();
      const toaster = makeToaster();
      toaster.info({ id: 'stacked', title: 'Stacked toast', duration: null });

      render(<Toaster toaster={toaster} overlap />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('data-overlap', '');
      expect(region).not.toHaveAttribute('data-expanded');

      await user.hover(region);
      expect(region).toHaveAttribute('data-expanded', '');

      await user.unhover(region);
      expect(region).not.toHaveAttribute('data-expanded');
    });

    it('expands while focus is inside the stack and collapses once focus leaves it', async () => {
      const user = userEvent.setup();
      const toaster = makeToaster();
      toaster.info({ id: 'stacked', title: 'Stacked toast', duration: null, dismissible: false });

      render(
        <>
          <Toaster toaster={toaster} overlap />
          <button type="button">Outside</button>
        </>,
      );

      const region = screen.getByRole('region');

      await user.tab();
      expect(toastIn(region, 'stacked')).toHaveFocus();
      expect(region).toHaveAttribute('data-expanded', '');

      await user.tab();
      expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
      expect(region).not.toHaveAttribute('data-expanded');
    });

    it('stays expanded while focus moves between toasts inside the stack', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      const toaster = makeToaster();
      toaster.info({ id: 'first', title: 'First toast', duration: null, dismissible: false });
      toaster.info({ id: 'second', title: 'Second toast', duration: null, dismissible: false });

      render(
        <>
          <Toaster toaster={toaster} overlap onBlur={onBlur} />
          <button type="button">Outside</button>
        </>,
      );

      const region = screen.getByRole('region');
      const [firstInOrder, secondInOrder] = Array.from(region.querySelectorAll<HTMLElement>('.tk-toast'));

      await user.tab();
      expect(firstInOrder).toHaveFocus();
      expect(region).toHaveAttribute('data-expanded', '');

      await user.tab();
      expect(secondInOrder).toHaveFocus();
      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(region).toHaveAttribute('data-expanded', '');

      await user.tab();
      expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
      expect(onBlur).toHaveBeenCalledTimes(2);
      expect(region).not.toHaveAttribute('data-expanded');
    });

    it('never marks overlap or expansion when overlap is off', async () => {
      const user = userEvent.setup();
      const toaster = makeToaster();
      toaster.info({ id: 'single', title: 'Toast', duration: null });

      render(<Toaster toaster={toaster} />);

      const region = screen.getByRole('region');
      await user.hover(region);

      expect(region).not.toHaveAttribute('data-overlap');
      expect(region).not.toHaveAttribute('data-expanded');
    });

    it('keeps consumer pointer, focus and keyboard handlers on the viewport', async () => {
      const user = userEvent.setup();
      const handlers = { onPointerEnter: vi.fn(), onPointerLeave: vi.fn(), onFocus: vi.fn(), onKeyDown: vi.fn() };
      const toaster = makeToaster();
      toaster.info({ id: 'stacked', title: 'Stacked toast', duration: null, dismissible: false });

      render(<Toaster toaster={toaster} overlap {...handlers} />);

      const region = screen.getByRole('region');

      await user.hover(region);
      expect(handlers.onPointerEnter).toHaveBeenCalledTimes(1);
      expect(region).toHaveAttribute('data-expanded', '');

      await user.unhover(region);
      expect(handlers.onPointerLeave).toHaveBeenCalledTimes(1);
      expect(region).not.toHaveAttribute('data-expanded');

      await user.tab();
      expect(toastIn(region, 'stacked')).toHaveFocus();
      expect(handlers.onFocus).toHaveBeenCalledTimes(1);
      expect(region).toHaveAttribute('data-expanded', '');

      await user.keyboard('a');
      expect(handlers.onKeyDown).toHaveBeenCalledTimes(1);
      expect(handlers.onKeyDown.mock.calls[0][0]).toMatchObject({ key: 'a' });
    });
  });

  describe('keyboard', () => {
    it('moves focus to the viewport with the default F8 hotkey', async () => {
      const user = userEvent.setup();

      render(
        <>
          <button type="button">Save</button>
          <Toaster toaster={makeToaster()} />
        </>,
      );

      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();

      await user.keyboard('{F8}');
      expect(screen.getByRole('region')).toHaveFocus();
    });

    it('uses a custom hotkey for focus and in the default viewport name', async () => {
      const user = userEvent.setup();

      render(<Toaster toaster={makeToaster()} hotkey={['F6']} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAccessibleName('Notifications (F6)');

      await user.keyboard('{F8}');
      expect(region).not.toHaveFocus();

      await user.keyboard('{F6}');
      expect(region).toHaveFocus();
    });

    it('lets keyboard users reach a toast from the hotkey and dismiss only that toast with Escape', async () => {
      const user = userEvent.setup();
      const toaster = makeToaster();
      toaster.success({ id: 'saved', title: 'Booking saved', duration: null, dismissible: false });
      toaster.info({ id: 'gate', title: 'Gate changed', duration: null, dismissible: false });

      render(
        <>
          <button type="button">Save</button>
          <Toaster toaster={toaster} />
        </>,
      );

      const region = screen.getByRole('region');
      await user.click(screen.getByRole('button', { name: 'Save' }));
      await user.keyboard('{F8}');
      expect(region).toHaveFocus();

      await user.tab();
      const focused = document.activeElement as HTMLElement;
      expect(focused).toHaveClass('tk-toast');
      expect(region).toContainElement(focused);

      const focusedId = focused.getAttribute('data-toast-id') as string;
      const otherId = focusedId === 'saved' ? 'gate' : 'saved';

      await user.keyboard('{Escape}');
      expect(toastIn(region, focusedId)).toBeNull();
      expect(toastIn(region, otherId)).not.toBeNull();
    });
  });

  describe('controller updates', () => {
    it('renders toasts created, updated and dismissed after mount', () => {
      const toaster = makeToaster();
      render(<Toaster toaster={toaster} />);

      const region = screen.getByRole('region');
      expect(region.querySelector('.tk-toast')).toBeNull();

      let id = '';
      act(() => {
        id = toaster.loading({ title: 'Saving booking' });
      });

      const loading = toastIn(region, id) as HTMLElement;
      expect(loading).toHaveAttribute('data-type', 'loading');
      expect(loading.querySelector('.tk-alert')).toHaveAttribute('data-variant', 'neutral');
      expect(within(loading).getByRole('heading', { name: 'Saving booking' })).toBeInTheDocument();

      act(() => {
        toaster.update(id, { title: 'Booking saved', type: 'success' });
      });

      const saved = toastIn(region, id) as HTMLElement;
      expect(saved).toHaveAttribute('data-type', 'success');
      expect(saved.querySelector('.tk-alert')).toHaveAttribute('data-variant', 'success');
      expect(within(saved).getByRole('heading', { name: 'Booking saved' })).toBeInTheDocument();

      act(() => {
        toaster.dismiss(id);
      });

      expect(region.querySelector('.tk-toast')).toBeNull();
    });

    it('removes only the toast whose default close control is clicked', async () => {
      const user = userEvent.setup();
      const toaster = makeToaster();
      toaster.success({ id: 'saved', title: 'Booking saved', duration: null });
      toaster.info({ id: 'gate', title: 'Gate changed', duration: null });

      render(<Toaster toaster={toaster} />);

      const region = screen.getByRole('region');
      await user.click(within(toastIn(region, 'saved') as HTMLElement).getByRole('button', { name: 'Dismiss notification' }));

      expect(toastIn(region, 'saved')).toBeNull();
      expect(toastIn(region, 'gate')).not.toBeNull();
    });

    it('runs the action callback with the toast payload and removes the toast', async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      const toaster = makeToaster();
      toaster.success({ id: 'saved', title: 'Booking saved', duration: null, action: { label: 'Undo', altText: 'Undo booking update', onClick: onAction } });

      render(<Toaster toaster={toaster} />);

      await user.click(screen.getByRole('button', { name: 'Undo booking update' }));

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'saved', title: 'Booking saved', type: 'success' }));
      expect(toastIn(screen.getByRole('region'), 'saved')).toBeNull();
    });

    it('removes every rendered toast on dismiss() without an id and on clear()', () => {
      const toaster = makeToaster();
      toaster.success({ id: 'saved', title: 'Booking saved', duration: null });
      toaster.info({ id: 'gate', title: 'Gate changed', duration: null });

      render(<Toaster toaster={toaster} />);

      const region = screen.getByRole('region');
      expect(region.querySelectorAll('.tk-toast')).toHaveLength(2);

      act(() => {
        toaster.dismiss();
      });
      expect(region.querySelector('.tk-toast')).toBeNull();

      act(() => {
        toaster.warning({ id: 'weather', title: 'Weather delay', duration: null });
        toaster.error({ id: 'payment', title: 'Payment failed', duration: null });
      });
      expect(region.querySelectorAll('.tk-toast')).toHaveLength(2);

      act(() => {
        toaster.clear();
      });
      expect(region.querySelector('.tk-toast')).toBeNull();
    });

    it('swaps a promise toast from loading to the resolved success content', async () => {
      const toaster = makeToaster();
      render(<Toaster toaster={toaster} />);

      let resolve: (booking: { pnr: string }) => void = () => {};
      const pending = new Promise<{ pnr: string }>(done => {
        resolve = done;
      });

      let result: Promise<{ pnr: string }> = pending;
      act(() => {
        result = toaster.promise(pending, {
          loading: { id: 'save', title: 'Saving booking' },
          success: booking => ({ title: 'Booking saved', description: `PNR ${booking.pnr} is ready.`, duration: null }),
          error: { title: 'Booking could not be saved', duration: null },
        });
      });

      const region = screen.getByRole('region');
      const loading = toastIn(region, 'save') as HTMLElement;
      expect(loading).toHaveAttribute('data-type', 'loading');
      expect(loading.querySelector('.tk-alert')).toHaveAttribute('data-variant', 'neutral');
      expect(within(loading).getByRole('heading', { name: 'Saving booking' })).toBeInTheDocument();

      await act(async () => {
        resolve({ pnr: 'ABC123' });
        await expect(result).resolves.toEqual({ pnr: 'ABC123' });
      });

      const saved = toastIn(region, 'save') as HTMLElement;
      expect(saved).toHaveAttribute('data-type', 'success');
      expect(saved).toHaveAttribute('role', 'status');
      expect(saved.querySelector('.tk-alert')).toHaveAttribute('data-variant', 'success');
      expect(within(saved).getByRole('heading', { name: 'Booking saved' })).toBeInTheDocument();
      expect(within(saved).getByText('PNR ABC123 is ready.')).toHaveClass('tk-alert-description');
      expect(within(saved).queryByText('Saving booking')).toBeNull();
    });

    it('swaps a promise toast to an assertive danger toast when the promise rejects', async () => {
      const toaster = makeToaster();
      render(<Toaster toaster={toaster} />);

      let reject: (reason: Error) => void = () => {};
      const pending = new Promise<string>((_done, fail) => {
        reject = fail;
      });

      let settled: Promise<unknown> = Promise.resolve();
      act(() => {
        // Attach the rejection handler synchronously so the rejection is never unhandled.
        settled = toaster
          .promise(pending, {
            loading: { id: 'save', title: 'Saving booking' },
            success: { title: 'Booking saved', duration: null },
            error: failure => ({ title: 'Booking could not be saved', description: (failure as Error).message, duration: null }),
          })
          .catch((failure: unknown) => failure);
      });

      const region = screen.getByRole('region');
      expect(toastIn(region, 'save')).toHaveAttribute('data-type', 'loading');

      await act(async () => {
        reject(new Error('Card declined'));
        const failure = await settled;
        expect(failure).toBeInstanceOf(Error);
        expect((failure as Error).message).toBe('Card declined');
      });

      const failed = toastIn(region, 'save') as HTMLElement;
      expect(failed).toHaveAttribute('data-type', 'error');
      expect(failed).toHaveAttribute('role', 'alert');
      expect(failed).toHaveAttribute('aria-live', 'assertive');
      expect(failed.querySelector('.tk-alert')).toHaveAttribute('data-variant', 'danger');
      expect(within(failed).getByRole('heading', { name: 'Booking could not be saved' })).toBeInTheDocument();
      expect(within(failed).getByText('Card declined')).toHaveClass('tk-alert-description');
    });
  });

  describe('timers', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('keeps a dismissed toast mounted as dismissing until removeDelay elapses', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const toaster = makeToaster({ removeDelay: 60_000 });
      toaster.info({ id: 'gate', title: 'Gate changed', duration: null });

      render(<Toaster toaster={toaster} />);

      const region = screen.getByRole('region');
      await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
      expect(toastIn(region, 'gate')).toHaveAttribute('data-status', 'dismissing');

      // Still mounted (for exit motion) shortly before removeDelay elapses.
      act(() => {
        vi.advanceTimersByTime(30_000);
      });
      expect(toastIn(region, 'gate')).toHaveAttribute('data-status', 'dismissing');

      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(toastIn(region, 'gate')).toBeNull();
    });

    it('auto-dismisses a toast only once its duration has elapsed', () => {
      const toaster = makeToaster({ duration: 60_000 });
      toaster.success({ id: 'saved', title: 'Booking saved' });

      render(<Toaster toaster={toaster} />);
      const region = screen.getByRole('region');

      act(() => {
        vi.advanceTimersByTime(50_000);
      });
      expect(toastIn(region, 'saved')).toHaveAttribute('data-status', 'visible');

      act(() => {
        vi.advanceTimersByTime(20_000);
      });
      expect(toastIn(region, 'saved')).toBeNull();
    });

    it('never auto-dismisses a persistent toast created with duration null', () => {
      const toaster = makeToaster({ duration: 1_000 });
      toaster.info({ id: 'review', title: 'Manual review required', duration: null });

      render(<Toaster toaster={toaster} />);

      act(() => {
        vi.advanceTimersByTime(600_000);
      });
      expect(toastIn(screen.getByRole('region'), 'review')).toHaveAttribute('data-status', 'visible');
    });

    it('pauses auto-dismiss while a toast has keyboard focus and resumes once focus leaves', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const toaster = makeToaster({ duration: 60_000 });
      toaster.info({ id: 'gate', title: 'Gate changed', dismissible: false });

      render(
        <>
          <Toaster toaster={toaster} />
          <button type="button">Outside</button>
        </>,
      );

      const region = screen.getByRole('region');

      await user.tab();
      expect(toastIn(region, 'gate')).toHaveFocus();
      act(() => {
        vi.advanceTimersByTime(120_000);
      });
      expect(toastIn(region, 'gate')).not.toBeNull();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus();
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(toastIn(region, 'gate')).toBeNull();
    });

    it('pauses timers while the page is hidden only when pauseOnPageIdle is enabled', () => {
      const visibility = vi.spyOn(document, 'visibilityState', 'get');

      try {
        const idle = makeToaster({ duration: 60_000, pauseOnPageIdle: true });
        const regular = makeToaster({ duration: 60_000 });
        idle.info({ id: 'idle', title: 'Idle-aware toast' });
        regular.info({ id: 'regular', title: 'Regular toast' });

        render(
          <>
            <Toaster toaster={idle} label="Idle" />
            <Toaster toaster={regular} label="Regular" />
          </>,
        );

        const idleRegion = screen.getByRole('region', { name: 'Idle' });
        const regularRegion = screen.getByRole('region', { name: 'Regular' });

        visibility.mockReturnValue('hidden');
        act(() => {
          document.dispatchEvent(new Event('visibilitychange'));
          vi.advanceTimersByTime(120_000);
        });
        expect(toastIn(idleRegion, 'idle')).toHaveAttribute('data-status', 'visible');
        expect(toastIn(regularRegion, 'regular')).toBeNull();

        visibility.mockReturnValue('visible');
        act(() => {
          document.dispatchEvent(new Event('visibilitychange'));
          vi.advanceTimersByTime(60_000);
        });
        expect(toastIn(idleRegion, 'idle')).toBeNull();
      } finally {
        visibility.mockRestore();
      }
    });

    it('auto-dismisses after the duration, pausing while the toast is hovered', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const toaster = makeToaster({ duration: 60_000 });
      toaster.success({ id: 'saved', title: 'Booking saved' });

      render(<Toaster toaster={toaster} />);

      const region = screen.getByRole('region');
      const toastRoot = toastIn(region, 'saved') as HTMLElement;

      await user.hover(toastRoot);
      act(() => {
        vi.advanceTimersByTime(120_000);
      });
      expect(toastIn(region, 'saved')).not.toBeNull();

      await user.unhover(toastRoot);
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(toastIn(region, 'saved')).toBeNull();
    });
  });

  describe('customization', () => {
    it('merges className, classNames and slotProps onto the viewport root only', () => {
      const toaster = makeToaster();
      toaster.info({ id: 'first', title: 'First', duration: null });

      render(<Toaster toaster={toaster} className="toaster-extra" classNames={{ root: 'toaster-slot' }} slotProps={{ root: { title: 'toaster-title' } }} />);

      const region = screen.getByRole('region');
      expect(region).toHaveClass('tk-toaster', 'toaster-extra', 'toaster-slot');
      expect(region).toHaveAttribute('title', 'toaster-title');

      const toastRoot = toastIn(region, 'first');
      expect(toastRoot).not.toHaveClass('toaster-extra');
      expect(toastRoot).not.toHaveClass('toaster-slot');
      expect(toastRoot).not.toHaveAttribute('title');
    });

    it('keeps data-slot and data-placement when slotProps try to override them', () => {
      const hijack: SlotAttrs = { 'data-slot': 'hijack', 'data-placement': 'top' };

      render(<Toaster toaster={makeToaster({ placement: 'bottom-start' })} slotProps={{ root: hijack }} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('data-slot', 'root');
      expect(region).toHaveAttribute('data-placement', 'bottom-start');
    });

    it('composes slotProps.root pointer handlers with the overlap expansion', async () => {
      const user = userEvent.setup();
      const slotHandlers = { onPointerEnter: vi.fn(), onPointerLeave: vi.fn() };
      const toaster = makeToaster();
      toaster.info({ id: 'stacked', title: 'Stacked toast', duration: null });

      render(<Toaster toaster={toaster} overlap slotProps={{ root: slotHandlers }} />);
      const region = screen.getByRole('region');

      await user.hover(region);
      expect(slotHandlers.onPointerEnter).toHaveBeenCalledTimes(1);
      expect(region).toHaveAttribute('data-expanded', '');

      await user.unhover(region);
      expect(slotHandlers.onPointerLeave).toHaveBeenCalledTimes(1);
      expect(region).not.toHaveAttribute('data-expanded');
    });

    it('applies provider theme defaults and classes below instance props', () => {
      const themed = makeToaster();
      const instance = makeToaster();
      [themed, instance].forEach(toaster => toaster.info({ id: 'item', title: 'Item', duration: null }));

      render(
        <TakeoffSparProvider
          components={{
            Toaster: { defaultProps: { appearance: 'gradient', closeLabel: 'Kapat', overlap: true }, className: 'theme-toaster' },
            Toast: { className: 'theme-toast' },
          }}
        >
          <Toaster toaster={themed} label="Themed" className="instance-class" />
          <Toaster toaster={instance} label="Instance" appearance="outlined" closeLabel="Close item" overlap={false} />
        </TakeoffSparProvider>,
      );

      const themedRegion = screen.getByRole('region', { name: 'Themed' });
      expect(themedRegion).toHaveClass('tk-toaster', 'theme-toaster', 'instance-class');
      expect(themedRegion).toHaveAttribute('data-overlap', '');
      expect(toastIn(themedRegion, 'item')).toHaveClass('theme-toast');
      expect(themedRegion.querySelector('.tk-alert')).toHaveAttribute('data-type', 'gradient');
      expect(within(themedRegion).getByRole('button', { name: 'Kapat' })).toBeInTheDocument();

      const instanceRegion = screen.getByRole('region', { name: 'Instance' });
      expect(instanceRegion).toHaveClass('tk-toaster', 'theme-toaster');
      expect(instanceRegion).not.toHaveAttribute('data-overlap');
      expect(instanceRegion.querySelector('.tk-alert')).toHaveAttribute('data-type', 'outlined');
      expect(within(instanceRegion).getByRole('button', { name: 'Close item' })).toBeInTheDocument();
    });

    it('layers theme slotProps under instance slotProps on the viewport root', () => {
      render(
        <TakeoffSparProvider components={{ Toaster: { slotProps: { root: { title: 'theme-title', lang: 'tr' } } } }}>
          <Toaster toaster={makeToaster()} label="Themed" />
          <Toaster toaster={makeToaster()} label="Instance" slotProps={{ root: { title: 'instance-title' } }} />
        </TakeoffSparProvider>,
      );

      const themed = screen.getByRole('region', { name: 'Themed' });
      expect(themed).toHaveAttribute('title', 'theme-title');
      expect(themed).toHaveAttribute('lang', 'tr');

      const instance = screen.getByRole('region', { name: 'Instance' });
      expect(instance).toHaveAttribute('title', 'instance-title');
      expect(instance).toHaveAttribute('lang', 'tr');
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations with default toasts in an overlapping viewport', async () => {
      const toaster = makeToaster({ placement: 'top-end' });
      toaster.success({
        id: 'saved',
        title: 'Booking saved',
        description: 'Passenger details were updated.',
        duration: null,
        action: { label: 'Undo', altText: 'Undo booking update' },
      });
      toaster.error({ id: 'failed', title: 'Payment failed', duration: null });

      const { container } = render(<Toaster toaster={toaster} overlap />);

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
