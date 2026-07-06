import userEvent from '@testing-library/user-event';
import type { HTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { renderWithProvider as render, screen } from '../../test-utils';

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

    it('lets error and disabled win over the derived status', () => {
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
      expect(items[0]).toHaveAttribute('data-state', 'error');
      expect(items[1]).toHaveAttribute('data-state', 'disabled');
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

  describe('selection gating', () => {
    it('emits onStepClick for every non-disabled press with the step status', async () => {
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
      expect(onStepClick).toHaveBeenCalledExactlyOnceWith({ index: 1, status: 'inactive' });
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
      render(
        <Stepper defaultActive={0} linear onActiveChange={onActiveChange}>
          <Stepper.Item error>
            <Stepper.Title>One</Stepper.Title>
          </Stepper.Item>
          <Stepper.Item>
            <Stepper.Title>Two</Stepper.Title>
          </Stepper.Item>
        </Stepper>,
      );

      await user.click(screen.getByRole('button', { name: 'Two' }));
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
      // effect-fed registry exists; the non-clickable one is gated already.
      expect(items[0]).toContain('data-clickable');
      expect(items[2]).toContain('data-clickable');
      expect(items[1]).not.toContain('data-clickable');
      expect(markup.match(/aria-disabled/g)).toHaveLength(1);
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
