import userEvent from '@testing-library/user-event';
import type { HTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { renderWithProvider as render, screen } from '../../test-utils';

import { useStepperContext } from './context';
import { Stepper } from './index';

const renderSteps = (rootProps: Parameters<typeof Stepper>[0] = {}) =>
  render(
    <Stepper {...rootProps}>
      <Stepper.Item>
        <Stepper.Title>Shipping</Stepper.Title>
        <Stepper.Description>Address details</Stepper.Description>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Payment</Stepper.Title>
      </Stepper.Item>
      <Stepper.Item>
        <Stepper.Title>Review</Stepper.Title>
      </Stepper.Item>
    </Stepper>,
  );

describe('Stepper (compound)', () => {
  describe('rendering', () => {
    it('renders an ordered list of steps with the canonical anatomy', () => {
      const { container } = renderSteps();

      const root = container.querySelector('ol.tk-stepper');
      expect(root).not.toBeNull();
      expect(root).toHaveAttribute('data-slot', 'root');

      const items = container.querySelectorAll('li.tk-stepper-item');
      expect(items).toHaveLength(3);

      const first = items[0] as HTMLElement;
      expect(first.querySelector('button.tk-stepper-trigger[data-slot="trigger"]')).not.toBeNull();
      expect(first.querySelector('.tk-stepper-rail[data-slot="rail"]')).not.toBeNull();
      expect(first.querySelector('.tk-stepper-indicator[data-slot="indicator"]')).not.toBeNull();
      expect(first.querySelector('.tk-stepper-content[data-slot="content"]')).not.toBeNull();
      expect(first.querySelector('.tk-stepper-title')).toHaveTextContent('Shipping');
      expect(first.querySelector('.tk-stepper-description')).toHaveTextContent('Address details');
    });

    it('emits the resolved variant data attributes on the root', () => {
      const { container } = renderSteps();
      const root = container.querySelector('.tk-stepper') as HTMLElement;

      expect(root).toHaveAttribute('data-orientation', 'horizontal');
      expect(root).toHaveAttribute('data-mode', 'default');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).not.toHaveAttribute('data-linear');
      expect(root).not.toHaveAttribute('data-reverse');
    });

    it('reflects non-default root props into data attributes', () => {
      const { container } = renderSteps({ orientation: 'vertical', mode: 'compact', size: 'small', linear: true, reverse: true });
      const root = container.querySelector('.tk-stepper') as HTMLElement;

      expect(root).toHaveAttribute('data-orientation', 'vertical');
      expect(root).toHaveAttribute('data-mode', 'compact');
      expect(root).toHaveAttribute('data-size', 'small');
      expect(root).toHaveAttribute('data-linear', '');
      expect(root).toHaveAttribute('data-reverse', '');
    });

    it('renders as a custom element through the as prop', () => {
      const { container } = render(
        <Stepper as="div">
          <Stepper.Item>
            <Stepper.Title>Only</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const root = container.querySelector('.tk-stepper') as HTMLElement;
      expect(root.tagName).toBe('DIV');
    });

    it('omits the rail in compact mode', () => {
      const { container } = renderSteps({ mode: 'compact' });
      expect(container.querySelector('.tk-stepper-rail')).toBeNull();
    });

    it('renders items as custom elements through the item as prop', () => {
      const { container } = render(
        <Stepper as="div">
          <Stepper.Item as="div">
            <Stepper.Title>Only</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const item = container.querySelector('.tk-stepper-item') as HTMLElement;
      expect(item.tagName).toBe('DIV');
    });

    it('assigns one shared index to Fragment-wrapped items (documented pitfall)', () => {
      const { container } = render(
        <Stepper defaultActive={0}>
          <>
            <Stepper.Item>
              <Stepper.Title>One</Stepper.Title>
            </Stepper.Item>
            <Stepper.Item>
              <Stepper.Title>Two</Stepper.Title>
            </Stepper.Item>
          </>
          <Stepper.Item>
            <Stepper.Title>Three</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const items = container.querySelectorAll('.tk-stepper-item');
      // The Fragment consumes a single index: both wrapped items read 0, and
      // the trailing item lands on 1 — render items directly or from arrays.
      expect(items[0]).toHaveAttribute('data-state', 'active');
      expect(items[1]).toHaveAttribute('data-state', 'active');
      expect(items[2]).toHaveAttribute('data-state', 'inactive');
    });

    it('does not let non-element children consume a step index', () => {
      const { container } = render(
        <Stepper defaultActive={0}>
          {'stray text'}
          <Stepper.Item>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const items = container.querySelectorAll('.tk-stepper-item');
      expect(items[0]).toHaveAttribute('data-state', 'active');
      expect(items[1]).toHaveAttribute('data-state', 'inactive');
    });
  });

  describe('step status', () => {
    it('derives completed/active/inactive states from the active index', () => {
      const { container } = renderSteps({ defaultActive: 1 });
      const items = container.querySelectorAll('.tk-stepper-item');

      expect(items[0]).toHaveAttribute('data-state', 'completed');
      expect(items[1]).toHaveAttribute('data-state', 'active');
      expect(items[2]).toHaveAttribute('data-state', 'inactive');
    });

    it('exposes error and disabled as modifiers without overriding progress status', () => {
      const { container } = render(
        <Stepper defaultActive={2}>
          <Stepper.Item error>
            <Stepper.Title>Errored</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item disabled>
            <Stepper.Title>Disabled</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Active</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const items = container.querySelectorAll('.tk-stepper-item');
      expect(items[0]).toHaveAttribute('data-state', 'completed');
      expect(items[0]).toHaveAttribute('data-error', '');
      expect(items[1]).toHaveAttribute('data-state', 'completed');
      expect(items[1]).toHaveAttribute('data-disabled', '');
      expect(items[2]).toHaveAttribute('data-state', 'active');
    });

    it('marks only the active trigger with aria-current="step"', () => {
      const { container } = renderSteps({ defaultActive: 1 });
      const triggers = container.querySelectorAll('.tk-stepper-trigger');

      expect(triggers[0]).not.toHaveAttribute('aria-current');
      expect(triggers[1]).toHaveAttribute('aria-current', 'step');
      expect(triggers[2]).not.toHaveAttribute('aria-current');
    });

    it('never pairs aria-disabled with aria-current on the active linear step', () => {
      renderSteps({ defaultActive: 1, linear: true });

      const active = screen.getByRole('button', { name: 'Payment' });
      expect(active).toHaveAttribute('aria-current', 'step');
      expect(active).not.toHaveAttribute('aria-disabled');
    });

    it('keeps an errored active step current without announcing it disabled', () => {
      render(
        <Stepper defaultActive={0} linear>
          <Stepper.Item error>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const active = screen.getByRole('button', { name: 'One, error' });
      expect(active).toHaveAttribute('aria-current', 'step');
      expect(active).not.toHaveAttribute('aria-disabled');
      expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute('aria-disabled', 'true');
    });

    it('marks only the unreachable linear steps aria-disabled', () => {
      renderSteps({ defaultActive: 0, linear: true });

      expect(screen.getByRole('button', { name: /Shipping/ })).not.toHaveAttribute('aria-disabled');
      expect(screen.getByRole('button', { name: 'Payment' })).not.toHaveAttribute('aria-disabled');
      expect(screen.getByRole('button', { name: 'Review' })).toHaveAttribute('aria-disabled', 'true');
    });

    it('extends the trigger accessible name with the completed/error status', () => {
      render(
        <Stepper defaultActive={2}>
          <Stepper.Item>
            <Stepper.Title>Done</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item error>
            <Stepper.Title>Failed</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Current</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      expect(screen.getByRole('button', { name: 'Done, completed' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Failed, error' })).toBeInTheDocument();
      // Active and inactive steps keep their bare name — aria-current and the
      // default announcement already cover them.
      expect(screen.getByRole('button', { name: 'Current' })).toBeInTheDocument();
    });

    it('localizes the status suffixes through the root completedLabel/errorLabel props', () => {
      const { container } = render(
        <Stepper defaultActive={2} completedLabel="tamamlandı" errorLabel="hatalı">
          <Stepper.Item>
            <Stepper.Title>Uçuş</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item error>
            <Stepper.Title>Yolcu</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Ödeme</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      expect(screen.getByRole('button', { name: 'Uçuş, tamamlandı' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yolcu, hatalı' })).toBeInTheDocument();

      // Consumed by the provider chain, not forwarded to the <ol>.
      const root = container.querySelector('.tk-stepper') as HTMLElement;
      expect(root).not.toHaveAttribute('completedlabel');
      expect(root).not.toHaveAttribute('errorlabel');
    });

    it('drops the status suffix for an empty label', () => {
      render(
        <Stepper defaultActive={1} completedLabel="">
          <Stepper.Item>
            <Stepper.Title>Done</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Current</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });
  });

  describe('accessible descriptions', () => {
    it('links the description to the trigger via aria-describedby instead of the accessible name', () => {
      const { container } = renderSteps();

      // Name stays the bare title: the description is aria-hidden for name
      // computation but reaches assistive technology as the description.
      const trigger = screen.getByRole('button', { name: 'Shipping' });
      const description = container.querySelector('.tk-stepper-description') as HTMLElement;

      expect(description).toHaveAttribute('aria-hidden', 'true');
      expect(description.id).not.toBe('');
      expect(trigger).toHaveAttribute('aria-describedby', description.id);
      expect(trigger).toHaveAccessibleDescription('Address details');
    });

    it('omits aria-describedby on steps without a description', () => {
      renderSteps();
      expect(screen.getByRole('button', { name: 'Payment' })).not.toHaveAttribute('aria-describedby');
    });

    it('adopts a consumer-provided description id', () => {
      render(
        <Stepper>
          <Stepper.Item>
            <Stepper.Title>Only</Stepper.Title>
            <Stepper.Description id="custom-description">Details</Stepper.Description>
          </Stepper.Item>
        </Stepper>,
      );

      expect(screen.getByRole('button', { name: 'Only' })).toHaveAttribute('aria-describedby', 'custom-description');
    });
  });

  describe('indicator glyphs', () => {
    it('renders the check glyph for completed steps and the close glyph for errored steps', () => {
      const { container } = render(
        <Stepper defaultActive={1}>
          <Stepper.Item>
            <Stepper.Title>Done</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item error>
            <Stepper.Title>Failed</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const indicators = container.querySelectorAll('.tk-stepper-indicator');
      const completedGlyph = indicators[0].querySelector('svg');
      const errorGlyph = indicators[1].querySelector('svg');
      expect(completedGlyph).not.toBeNull();
      expect(errorGlyph).not.toBeNull();
      // Two distinct built-in glyphs — check vs close — without leaning on
      // shipped test ids or exact path data.
      expect(completedGlyph!.innerHTML).not.toBe(errorGlyph!.innerHTML);
    });

    it('prefers consumer indicator content over the built-in glyphs, except on disabled steps', () => {
      const { container } = render(
        <Stepper defaultActive={2}>
          <Stepper.Item indicator={<svg data-testid="custom-indicator" />}>
            <Stepper.Title>Custom</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item disabled indicator={<svg data-testid="ignored-indicator" />}>
            <Stepper.Title>Disabled</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Active</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const indicators = container.querySelectorAll('.tk-stepper-indicator');
      expect(indicators[0].querySelector('[data-testid="custom-indicator"]')).not.toBeNull();
      expect(indicators[1]).toBeEmptyDOMElement();
      expect(indicators[2]).toBeEmptyDOMElement();
    });

    it('resolves an indicator render function with the step status and index', () => {
      const numbered = vi.fn(({ status, index }: { status: string; index: number }) => (status === 'completed' ? undefined : String(index + 1)));
      const { container } = render(
        <Stepper defaultActive={1}>
          <Stepper.Item indicator={numbered}>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item indicator={numbered}>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      expect(numbered).toHaveBeenCalledWith({ status: 'completed', index: 0 });
      expect(numbered).toHaveBeenCalledWith({ status: 'active', index: 1 });

      const indicators = container.querySelectorAll('.tk-stepper-indicator');
      // Returning undefined for the completed step falls back to the built-in
      // check glyph; the active step keeps its rendered number.
      expect(indicators[0].querySelector('svg')).not.toBeNull();
      expect(indicators[1]).toHaveTextContent('2');
    });

    it('treats a `null` indicator the same as `undefined`, falling back to the built-in glyph', () => {
      const numbered = vi.fn(({ status, index }: { status: string; index: number }) => (status === 'completed' ? null : String(index + 1)));
      const { container } = render(
        <Stepper defaultActive={2}>
          <Stepper.Item indicator={numbered}>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item indicator={null}>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Three</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const indicators = container.querySelectorAll('.tk-stepper-indicator');
      // The natural "hide my own content once completed" pattern returns
      // `null`, not `undefined` — it must still surface the check glyph.
      expect(indicators[0].querySelector('svg')).not.toBeNull();
      // A static `indicator={null}` on a completed step falls back to the
      // built-in check glyph rather than rendering an empty indicator.
      expect(indicators[1].querySelector('svg')).not.toBeNull();
    });
  });

  describe('uncontrolled behavior', () => {
    it('activates a pressed step and reports the change', async () => {
      const user = userEvent.setup();
      const onActiveChange = vi.fn();
      const { container } = renderSteps({ defaultActive: 0, onActiveChange });

      await user.click(screen.getByRole('button', { name: 'Review' }));

      expect(onActiveChange).toHaveBeenCalledExactlyOnceWith(2);
      const items = container.querySelectorAll('.tk-stepper-item');
      expect(items[2]).toHaveAttribute('data-state', 'active');
      expect(items[0]).toHaveAttribute('data-state', 'completed');
    });

    it('does not report a change when the active step is pressed again', async () => {
      const user = userEvent.setup();
      const onActiveChange = vi.fn();
      const onStepClick = vi.fn();
      renderSteps({ defaultActive: 0, onActiveChange, onStepClick });

      await user.click(screen.getByRole('button', { name: /Shipping/ }));

      expect(onActiveChange).not.toHaveBeenCalled();
      expect(onStepClick).toHaveBeenCalledExactlyOnceWith({ index: 0, status: 'active' });
    });
  });

  describe('controlled behavior', () => {
    it('keeps the active step until the prop changes', async () => {
      const user = userEvent.setup();
      const onActiveChange = vi.fn();
      const { container, rerender } = render(
        <Stepper active={0} onActiveChange={onActiveChange}>
          <Stepper.Item>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      await user.click(screen.getByRole('button', { name: 'Two' }));

      expect(onActiveChange).toHaveBeenCalledExactlyOnceWith(1);
      expect(container.querySelectorAll('.tk-stepper-item')[1]).toHaveAttribute('data-state', 'inactive');

      rerender(
        <Stepper active={1} onActiveChange={onActiveChange}>
          <Stepper.Item>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      expect(container.querySelectorAll('.tk-stepper-item')[1]).toHaveAttribute('data-state', 'active');
    });
  });

  describe('context value stability', () => {
    it('keeps the provider value referentially stable across renders even with inline onActiveChange/onStepClick props', () => {
      const seenContextValues: unknown[] = [];
      function ContextSpy() {
        seenContextValues.push(useStepperContext('spy'));
        return null;
      }

      // Hoisted so `Stepper`'s `children` prop keeps its reference across
      // Harness re-renders — isolates the one thing under test (inline
      // onActiveChange/onStepClick identity) from `renderStepsMeta`/`items`
      // recomputation, which already legitimately depends on `children`.
      const stepChildren = (
        <Stepper.Item>
          <ContextSpy />
          <Stepper.Title>One</Stepper.Title>
        </Stepper.Item>
      );

      // `tick` forces the Harness (and therefore Stepper) to re-render with a
      // brand-new inline `onActiveChange`/`onStepClick` each time — the
      // idiomatic way consumers pass these props. Neither identity should
      // reach the memoized context value.
      function Harness({ tick: _tick }: { tick: number }) {
        return (
          <Stepper onActiveChange={() => {}} onStepClick={() => {}}>
            {stepChildren}
          </Stepper>
        );
      }

      const { rerender } = render(<Harness tick={0} />);
      rerender(<Harness tick={1} />);
      rerender(<Harness tick={2} />);

      // Mount commits twice: the initial render, then the update from the
      // item's registerStep effect populating `stepsMeta` (a legitimate
      // dependency of the memo). With `children` held stable, a stable
      // `contextValue` lets React fully bail out of the two later
      // tick-driven re-renders — ContextSpy (a context consumer) isn't
      // invoked again. Before the fix, the fresh `onActiveChange`/
      // `onStepClick` identity on each render invalidated the memo, forcing
      // ContextSpy to re-render anyway (4 entries instead of 2).
      expect(seenContextValues).toHaveLength(2);
      expect(seenContextValues[0]).not.toBe(seenContextValues[1]);
    });
  });

  describe('selection gating', () => {
    it('does not advertise the active step as clickable — its press cannot change the selection', () => {
      const { container } = renderSteps({ defaultActive: 1 });
      const items = container.querySelectorAll('.tk-stepper-item');

      expect(items[0]).toHaveAttribute('data-clickable');
      expect(items[1]).not.toHaveAttribute('data-clickable');
      expect(items[2]).toHaveAttribute('data-clickable');
    });

    it('keeps a non-clickable active step silent on press', async () => {
      const user = userEvent.setup();
      const onActiveChange = vi.fn();
      const onStepClick = vi.fn();
      render(
        <Stepper defaultActive={0} onActiveChange={onActiveChange} onStepClick={onStepClick}>
          <Stepper.Item isClickable={false}>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      await user.click(screen.getByRole('button', { name: 'One' }));
      expect(onStepClick).not.toHaveBeenCalled();
      expect(onActiveChange).not.toHaveBeenCalled();
    });

    it('emits onStepClick for selectable presses with the progress status', async () => {
      const user = userEvent.setup();
      const onStepClick = vi.fn();
      renderSteps({ defaultActive: 1, onStepClick });

      await user.click(screen.getByRole('button', { name: /Shipping/ }));
      expect(onStepClick).toHaveBeenLastCalledWith({ index: 0, status: 'completed' });

      await user.click(screen.getByRole('button', { name: 'Review' }));
      expect(onStepClick).toHaveBeenLastCalledWith({ index: 2, status: 'inactive' });
    });

    it('blocks disabled steps natively: unfocusable, silent, and unselectable', async () => {
      const user = userEvent.setup();
      const onActiveChange = vi.fn();
      const onStepClick = vi.fn();
      render(
        <Stepper defaultActive={0} onActiveChange={onActiveChange} onStepClick={onStepClick}>
          <Stepper.Item>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item disabled>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const disabledTrigger = screen.getByRole('button', { name: 'Two' });
      expect(disabledTrigger).toBeDisabled();

      await user.click(disabledTrigger);
      expect(onStepClick).not.toHaveBeenCalled();
      expect(onActiveChange).not.toHaveBeenCalled();
    });

    it('keeps non-clickable steps out of the tab order and ignores their presses', async () => {
      const user = userEvent.setup();
      const onActiveChange = vi.fn();
      const onStepClick = vi.fn();
      const { container } = render(
        <Stepper defaultActive={0} onActiveChange={onActiveChange} onStepClick={onStepClick}>
          <Stepper.Item>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item isClickable={false}>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      const trigger = screen.getByRole('button', { name: 'Two' });
      expect(trigger).toHaveAttribute('tabindex', '-1');
      expect(container.querySelectorAll('.tk-stepper-item')[1]).not.toHaveAttribute('data-clickable');

      await user.click(trigger);
      expect(onStepClick).not.toHaveBeenCalled();
      expect(onActiveChange).not.toHaveBeenCalled();
    });

    it('restricts linear progression to previous steps and the immediate next step', async () => {
      const user = userEvent.setup();
      const onActiveChange = vi.fn();
      const { container } = renderSteps({ defaultActive: 1, linear: true, onActiveChange });

      const items = container.querySelectorAll('.tk-stepper-item');
      expect(items[0]).toHaveAttribute('data-clickable');
      expect(items[1]).not.toHaveAttribute('data-clickable');
      expect(items[2]).toHaveAttribute('data-clickable');

      await user.click(screen.getByRole('button', { name: 'Review' }));
      expect(onActiveChange).toHaveBeenCalledExactlyOnceWith(2);

      // From step 2 the only forward move would be step 3 — pressing the first
      // step still works because previous steps stay selectable.
      await user.click(screen.getByRole('button', { name: /Shipping/ }));
      expect(onActiveChange).toHaveBeenLastCalledWith(0);
    });

    it('blocks the next linear step while the current one is errored', async () => {
      const user = userEvent.setup();
      const onActiveChange = vi.fn();
      const onStepClick = vi.fn();
      render(
        <Stepper defaultActive={0} linear onActiveChange={onActiveChange} onStepClick={onStepClick}>
          <Stepper.Item error>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      await user.click(screen.getByRole('button', { name: 'Two' }));
      expect(onStepClick).not.toHaveBeenCalled();
      expect(onActiveChange).not.toHaveBeenCalled();
    });

    it('blocks jumping past the next step in linear mode', async () => {
      const user = userEvent.setup();
      const onActiveChange = vi.fn();
      renderSteps({ defaultActive: 0, linear: true, onActiveChange });

      await user.click(screen.getByRole('button', { name: 'Review' }));
      expect(onActiveChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('moves focus between triggers with arrow keys, skipping disabled and non-clickable steps', async () => {
      const user = userEvent.setup();
      render(
        <Stepper>
          <Stepper.Item>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item disabled>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item isClickable={false}>
            <Stepper.Title>Three</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Four</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'One' })).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: 'Four' })).toHaveFocus();

      // No wrap: the edges hold focus.
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: 'Four' })).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('button', { name: 'One' })).toHaveFocus();

      await user.keyboard('{End}');
      expect(screen.getByRole('button', { name: 'Four' })).toHaveFocus();

      await user.keyboard('{Home}');
      expect(screen.getByRole('button', { name: 'One' })).toHaveFocus();
    });

    it('follows the orientation for the arrow axis', async () => {
      const user = userEvent.setup();
      renderSteps({ orientation: 'vertical' });

      await user.tab();
      expect(screen.getByRole('button', { name: 'Shipping' })).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('button', { name: 'Payment' })).toHaveFocus();

      // Cross-axis keys are left alone in vertical mode.
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('button', { name: 'Payment' })).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('button', { name: 'Shipping' })).toHaveFocus();
    });

    it('consumes matched navigation keys even at the list edges instead of scrolling the page', async () => {
      const user = userEvent.setup();
      const onWrapperKeyDown = vi.fn();
      render(
        <div onKeyDown={event => onWrapperKeyDown(event.key, event.defaultPrevented)}>
          <Stepper>
            <Stepper.Item>
              <Stepper.Title>One</Stepper.Title>
            </Stepper.Item>
            <Stepper.Item>
              <Stepper.Title>Two</Stepper.Title>
            </Stepper.Item>
          </Stepper>
        </div>,
      );

      await user.tab();
      await user.keyboard('{ArrowLeft}');

      expect(screen.getByRole('button', { name: 'One' })).toHaveFocus();
      expect(onWrapperKeyDown).toHaveBeenCalledWith('ArrowLeft', true);
    });

    it('activates the focused step with Enter through the native button semantics', async () => {
      const user = userEvent.setup();
      const onActiveChange = vi.fn();
      renderSteps({ defaultActive: 0, onActiveChange });

      screen.getByRole('button', { name: 'Review' }).focus();
      await user.keyboard('{Enter}');

      expect(onActiveChange).toHaveBeenCalledExactlyOnceWith(2);
    });

    it('yields to a consumer onKeyDown that prevents default', async () => {
      const user = userEvent.setup();
      renderSteps({ onKeyDown: event => event.preventDefault() });

      await user.tab();
      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('button', { name: 'Shipping' })).toHaveFocus();
    });

    it('scopes arrow-key navigation to the nearest Stepper, ignoring a nested Stepper rendered inside a step', async () => {
      const user = userEvent.setup();
      render(
        <Stepper>
          <Stepper.Item>
            <Stepper.Title>Outer One</Stepper.Title>
            <Stepper>
              <Stepper.Item>
                <Stepper.Title>Inner One</Stepper.Title>
              </Stepper.Item>
              <Stepper.Item>
                <Stepper.Title>Inner Two</Stepper.Title>
              </Stepper.Item>
            </Stepper>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Outer Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      screen.getByRole('button', { name: 'Inner One' }).focus();
      await user.keyboard('{ArrowRight}');

      // Moves within the inner Stepper only — the outer list's "Outer Two"
      // trigger must not join the inner list's navigation sequence.
      expect(screen.getByRole('button', { name: 'Inner Two' })).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      // No wrap into the outer stepper's triggers at the inner list's edge.
      expect(screen.getByRole('button', { name: 'Inner Two' })).toHaveFocus();
    });
  });

  describe('customization surfaces', () => {
    it('lands classNames and slotProps on the matching item slots', () => {
      const { container } = render(
        <Stepper>
          <Stepper.Item classNames={{ indicator: 'indicator-extra', trigger: 'trigger-extra' }} slotProps={{ content: { id: 'step-content' } }}>
            <Stepper.Title>Only</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      expect(container.querySelector('.tk-stepper-indicator')).toHaveClass('indicator-extra');
      expect(container.querySelector('.tk-stepper-trigger')).toHaveClass('trigger-extra');
      expect(container.querySelector('.tk-stepper-content')).toHaveAttribute('id', 'step-content');
    });

    it('appends instance className to the root without dropping the canonical class', () => {
      const { container } = renderSteps({ className: 'extra' });
      const root = container.querySelector('.tk-stepper') as HTMLElement;
      expect(root.className).toContain('extra');
    });

    it('keeps the trigger type locked to "button" against slotProps overrides', () => {
      // The slot type does not admit `type`, so an override can only arrive
      // from untyped layers (themes, casts) — simulated with the cast here.
      const { container } = render(
        <Stepper>
          <Stepper.Item slotProps={{ trigger: { type: 'submit' } as HTMLAttributes<HTMLElement> }}>
            <Stepper.Title>Only</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      expect(container.querySelector('.tk-stepper-trigger')).toHaveAttribute('type', 'button');
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Stepper.Item renders outside the root', () => {
      expect(() =>
        render(
          <Stepper.Item>
            <Stepper.Title>Loose</Stepper.Title>
          </Stepper.Item>,
        ),
      ).toThrow(/Stepper\.Item must be used within StepperProvider/);
    });

    it('throws a descriptive error when Stepper.Title renders outside the root', () => {
      expect(() => render(<Stepper.Title>Loose</Stepper.Title>)).toThrow(/Stepper\.Title must be used within StepperProvider/);
    });

    it('throws a descriptive error when Stepper.Description renders outside an item', () => {
      expect(() =>
        render(
          <Stepper>
            <Stepper.Description>Loose</Stepper.Description>
          </Stepper>,
        ),
      ).toThrow(/Stepper\.Description must be used within Stepper\.Item/);
    });
  });

  describe('server rendering', () => {
    it('gates selection from step props in the pre-hydration markup', () => {
      const markup = renderToStaticMarkup(
        <TakeoffSparProvider>
          <Stepper defaultActive={0}>
            <Stepper.Item>
              <Stepper.Title>One</Stepper.Title>
            </Stepper.Item>
            <Stepper.Item isClickable={false}>
              <Stepper.Title>Two</Stepper.Title>
            </Stepper.Item>
            <Stepper.Item>
              <Stepper.Title>Three</Stepper.Title>
            </Stepper.Item>
          </Stepper>
        </TakeoffSparProvider>,
      );

      const items = [...markup.matchAll(/<li[^>]*>/g)].map(match => match[0]);
      expect(items).toHaveLength(3);
      // Selectable steps are clickable and not aria-disabled before the
      // effect-fed registry exists; the active step (its press cannot change
      // the selection) and the non-clickable one are gated already.
      expect(items[0]).not.toContain('data-clickable');
      expect(items[2]).toContain('data-clickable');
      expect(items[1]).not.toContain('data-clickable');
      expect(markup.match(/aria-disabled/g)).toHaveLength(1);
    });

    it('blocks the next linear step from the active step props in the pre-hydration markup', () => {
      const markup = renderToStaticMarkup(
        <TakeoffSparProvider>
          <Stepper defaultActive={0} linear>
            <Stepper.Item error>
              <Stepper.Title>One</Stepper.Title>
            </Stepper.Item>
            <Stepper.Item>
              <Stepper.Title>Two</Stepper.Title>
            </Stepper.Item>
          </Stepper>
        </TakeoffSparProvider>,
      );

      const items = [...markup.matchAll(/<li[^>]*>/g)].map(match => match[0]);
      expect(items).toHaveLength(2);
      expect(items[1]).not.toContain('data-clickable');
      expect(markup).toContain('aria-current="step"');
      expect(markup).toContain('aria-disabled="true"');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for the default anatomy', async () => {
      const { container } = renderSteps({ defaultActive: 1 });
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations with error and disabled steps', async () => {
      const { container } = render(
        <Stepper defaultActive={2}>
          <Stepper.Item error>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item disabled>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Three</Stepper.Title>
            <Stepper.Description>Details</Stepper.Description>
          </Stepper.Item>
        </Stepper>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
