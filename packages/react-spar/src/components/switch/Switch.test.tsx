import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { Switch, type SwitchIndicatorRenderProps, type SwitchRenderProps, type SwitchSize } from './index';

const indicatorOf = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-slot="indicator"]');
const thumbOf = (root: HTMLElement) => root.querySelector<HTMLElement>('[data-slot="thumb"]');

describe('Switch', () => {
  it('renders a switch role by default', () => {
    render(
      <Switch>
        <Switch.Indicator />
      </Switch>,
    );

    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  describe('Field context inheritance', () => {
    // Regression: the wrapper used to apply an eager `invalid = false` default
    // and forward it unconditionally, overriding Spar's
    // `invalid ?? fieldCtx?.invalid` chain — a `<Field invalid>` switch never
    // showed the invalid state. `disabled`/`readOnly`/`required` already
    // passed through; these tests lock in the full set.

    it('inherits invalid from a wrapping Field (no explicit prop)', () => {
      render(
        <Field invalid>
          <Field.Label>Alerts</Field.Label>
          <Switch>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      expect(screen.getByRole('switch')).toHaveAttribute('data-invalid', '');
    });

    it('inherits disabled from a wrapping Field', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field disabled>
          <Field.Label>Alerts</Field.Label>
          <Switch onChange={handleChange}>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      const control = screen.getByRole('switch');
      expect(control).toHaveAttribute('data-disabled', '');

      await user.click(control);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('lets an explicit invalid prop override the Field value', () => {
      render(
        <Field invalid>
          <Field.Label>Alerts</Field.Label>
          <Switch invalid={false}>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      expect(screen.getByRole('switch')).not.toHaveAttribute('data-invalid');
    });

    it('inherits required from a wrapping Field', () => {
      render(
        <Field required>
          <Field.Label>Alerts</Field.Label>
          <Switch>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      const control = screen.getByRole('switch');
      expect(control).toHaveAttribute('data-required', '');
      expect(control).toHaveAttribute('aria-required', 'true');
    });

    it('inherits readOnly from a wrapping Field', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field readOnly>
          <Field.Label>Alerts</Field.Label>
          <Switch onChange={handleChange}>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      const control = screen.getByRole('switch');
      expect(control).toHaveAttribute('data-readonly', '');
      expect(control).toHaveAttribute('aria-readonly', 'true');

      await user.click(control);
      expect(handleChange).not.toHaveBeenCalled();
      expect(control).toHaveAttribute('aria-checked', 'false');
    });

    it('lets an explicit disabled prop override the Field value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field disabled>
          <Field.Label>Alerts</Field.Label>
          <Switch disabled={false} onChange={handleChange}>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      const control = screen.getByRole('switch');
      expect(control).not.toHaveAttribute('data-disabled');
      expect(control).toBeEnabled();

      await user.click(control);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('takes its accessible name and description from the Field parts', () => {
      render(
        <Field id="alerts">
          <Field.Label>Flight status alerts</Field.Label>
          <Field.Description>Delays and gate changes.</Field.Description>
          <Switch>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      const control = screen.getByRole('switch', { name: 'Flight status alerts' });
      expect(control).toHaveAttribute('id', 'alerts-field');
      expect(control).toHaveAccessibleDescription('Delays and gate changes.');
    });
  });

  describe('Standalone behavior', () => {
    it('marks itself invalid when the prop is passed directly', () => {
      render(
        <Switch invalid>
          <Switch.Indicator />
        </Switch>,
      );

      expect(screen.getByRole('switch')).toHaveAttribute('data-invalid', '');
    });

    it('toggles on click when enabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Switch onChange={handleChange}>
          <Switch.Indicator />
        </Switch>,
      );

      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('rendering', () => {
    it('renders the root slot contract with the default size, variant and unchecked state', () => {
      render(
        <Switch aria-label="Alerts">
          <Switch.Indicator />
        </Switch>,
      );

      const root = screen.getByRole('switch', { name: 'Alerts' });
      expect(root.tagName).toBe('BUTTON');
      expect(root).toHaveAttribute('type', 'button');
      expect(root).toHaveClass('tk-toggle');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-variant', 'info');
      expect(root).toHaveAttribute('data-state', 'unchecked');
      expect(root).toHaveAttribute('aria-checked', 'false');
      for (const attribute of ['data-checked', 'data-disabled', 'data-readonly', 'data-required', 'data-invalid']) {
        expect(root).not.toHaveAttribute(attribute);
      }
    });

    it('renders the canonical indicator anatomy — a track wrapping a decorative thumb', () => {
      render(
        <Switch aria-label="Alerts">
          <Switch.Indicator />
        </Switch>,
      );

      const root = screen.getByRole('switch');
      const indicator = indicatorOf(root);
      expect(indicator?.tagName).toBe('SPAN');
      expect(indicator).toHaveClass('tk-toggle-input-container');
      expect(indicator?.parentElement).toBe(root);

      const thumb = thumbOf(root);
      expect(thumb?.tagName).toBe('SPAN');
      expect(thumb).toHaveClass('tk-toggle-thumb');
      expect(thumb).toHaveAttribute('aria-hidden', 'true');
      expect(thumb?.parentElement).toBe(indicator);
    });

    it.each<SwitchSize>(['xsmall', 'small', 'base', 'large', 'xlarge'])('reflects size="%s" as data-size without leaking a raw size attribute', size => {
      render(
        <Switch aria-label="Alerts" size={size}>
          <Switch.Indicator />
        </Switch>,
      );

      const root = screen.getByRole('switch');
      expect(root).toHaveAttribute('data-size', size);
      expect(root).not.toHaveAttribute('size');
    });

    it('reflects the success variant as data-variant without leaking a raw variant attribute', () => {
      render(
        <Switch aria-label="Auto check-in" variant="success" defaultChecked>
          <Switch.Indicator />
        </Switch>,
      );

      const root = screen.getByRole('switch');
      expect(root).toHaveAttribute('data-variant', 'success');
      expect(root).not.toHaveAttribute('variant');
    });

    it('renders as a custom element through the as prop and keeps switch semantics', () => {
      render(
        <Switch as="span" aria-label="Alerts" disabled>
          <Switch.Indicator />
        </Switch>,
      );

      const root = screen.getByRole('switch', { name: 'Alerts' });
      expect(root.tagName).toBe('SPAN');
      expect(root).toHaveClass('tk-toggle');
      expect(root).not.toHaveAttribute('type');
      expect(root).toHaveAttribute('aria-disabled', 'true');
      expect(root).toHaveAttribute('tabindex', '-1');
    });

    it('forwards refs to the root button and the indicator span', () => {
      const rootRef = createRef<HTMLButtonElement>();
      const indicatorRef = createRef<HTMLSpanElement>();

      render(
        <Switch aria-label="Alerts" ref={rootRef}>
          <Switch.Indicator ref={indicatorRef} />
        </Switch>,
      );

      const root = screen.getByRole('switch');
      expect(rootRef.current).toBe(root);
      expect(indicatorRef.current).toBe(indicatorOf(root));
    });

    it('spreads extra Switch.Indicator props onto the indicator span', () => {
      render(
        <Switch aria-label="Alerts">
          <Switch.Indicator title="Track" />
        </Switch>,
      );

      expect(indicatorOf(screen.getByRole('switch'))).toHaveAttribute('title', 'Track');
    });
  });

  describe('classNames and slotProps', () => {
    it('merges className, classNames and the indicator className onto their owner nodes', () => {
      render(
        <Switch aria-label="Alerts" className="instance-root" classNames={{ root: 'extra-root', indicator: 'extra-indicator', thumb: 'extra-thumb' }}>
          <Switch.Indicator className="own-indicator" />
        </Switch>,
      );

      const root = screen.getByRole('switch');
      expect(root).toHaveClass('tk-toggle', 'instance-root', 'extra-root');
      expect(root).not.toHaveClass('extra-indicator', 'extra-thumb');

      const indicator = indicatorOf(root);
      expect(indicator).toHaveClass('tk-toggle-input-container', 'own-indicator', 'extra-indicator');
      expect(indicator).not.toHaveClass('extra-root', 'extra-thumb');

      const thumb = thumbOf(root);
      expect(thumb).toHaveClass('tk-toggle-thumb', 'extra-thumb');
      expect(thumb).not.toHaveClass('extra-indicator', 'own-indicator');
    });

    it('lands slotProps on the matching slot and keeps the canonical slot hooks', () => {
      render(
        <Switch aria-label="Alerts" slotProps={{ root: { title: 'root-title' }, indicator: { title: 'indicator-title' }, thumb: { title: 'thumb-title' } }}>
          <Switch.Indicator />
        </Switch>,
      );

      const root = screen.getByRole('switch');
      expect(root).toHaveAttribute('title', 'root-title');
      expect(root).toHaveAttribute('data-slot', 'root');

      const indicator = indicatorOf(root);
      expect(indicator).toHaveAttribute('title', 'indicator-title');
      expect(indicator).toHaveClass('tk-toggle-input-container');

      const thumb = thumbOf(root);
      expect(thumb).toHaveAttribute('title', 'thumb-title');
      expect(thumb).toHaveClass('tk-toggle-thumb');
    });

    it('applies provider theme layers beneath instance props', () => {
      render(
        <TakeoffSparProvider
          components={{
            Switch: {
              defaultProps: { size: 'small', variant: 'success' },
              className: 'theme-root',
              classNames: { indicator: 'theme-indicator', thumb: 'theme-thumb' },
              slotProps: { root: { title: 'theme-root' }, thumb: { title: 'theme-thumb' } },
            },
          }}
        >
          <Switch aria-label="Alerts" size="large" classNames={{ thumb: 'instance-thumb' }} slotProps={{ root: { title: 'instance-root' } }}>
            <Switch.Indicator />
          </Switch>
        </TakeoffSparProvider>,
      );

      const root = screen.getByRole('switch');
      expect(root).toHaveClass('tk-toggle', 'theme-root');
      // The instance size beats the theme default; the theme variant fills the gap.
      expect(root).toHaveAttribute('data-size', 'large');
      expect(root).toHaveAttribute('data-variant', 'success');
      expect(root).toHaveAttribute('title', 'instance-root');

      expect(indicatorOf(root)).toHaveClass('tk-toggle-input-container', 'theme-indicator');

      const thumb = thumbOf(root);
      expect(thumb).toHaveClass('tk-toggle-thumb', 'theme-thumb', 'instance-thumb');
      expect(thumb).toHaveAttribute('title', 'theme-thumb');
    });
  });

  describe('checked state', () => {
    it('starts from defaultChecked and toggles internally when uncontrolled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Switch aria-label="Alerts" defaultChecked onChange={handleChange}>
          <Switch.Indicator />
        </Switch>,
      );

      const control = screen.getByRole('switch');
      expect(control).toHaveAttribute('aria-checked', 'true');
      expect(control).toHaveAttribute('data-state', 'checked');
      expect(control).toHaveAttribute('data-checked', '');

      await user.click(control);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenLastCalledWith(false);
      expect(control).toHaveAttribute('aria-checked', 'false');
      expect(control).toHaveAttribute('data-state', 'unchecked');
      expect(control).not.toHaveAttribute('data-checked');

      await user.click(control);
      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange).toHaveBeenLastCalledWith(true);
      expect(control).toHaveAttribute('aria-checked', 'true');
    });

    it('keeps a controlled value until the parent updates checked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { rerender } = render(
        <Switch aria-label="Alerts" checked={false} onChange={handleChange}>
          <Switch.Indicator />
        </Switch>,
      );

      const control = screen.getByRole('switch');
      await user.click(control);
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(control).toHaveAttribute('aria-checked', 'false');
      expect(control).toHaveAttribute('data-state', 'unchecked');

      rerender(
        <Switch aria-label="Alerts" checked onChange={handleChange}>
          <Switch.Indicator />
        </Switch>,
      );
      expect(control).toHaveAttribute('aria-checked', 'true');
      expect(control).toHaveAttribute('data-state', 'checked');
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('follows parent state when controlled through onChange', async () => {
      const user = userEvent.setup();

      const ControlledSwitch = () => {
        const [enabled, setEnabled] = useState(true);
        return (
          <>
            <Switch aria-label="Notifications" checked={enabled} onChange={setEnabled}>
              <Switch.Indicator />
            </Switch>
            <output>{enabled ? 'on' : 'off'}</output>
          </>
        );
      };

      render(<ControlledSwitch />);

      const control = screen.getByRole('switch');
      expect(control).toHaveAttribute('aria-checked', 'true');

      await user.click(control);
      expect(control).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByRole('status')).toHaveTextContent('off');

      await user.click(control);
      expect(control).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('status')).toHaveTextContent('on');
    });
  });

  describe('keyboard interaction', () => {
    it('is reachable with Tab and toggles with Space and Enter', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Switch aria-label="Alerts" onChange={handleChange}>
          <Switch.Indicator />
        </Switch>,
      );

      const control = screen.getByRole('switch');
      await user.tab();
      expect(control).toHaveFocus();

      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenLastCalledWith(true);
      expect(control).toHaveAttribute('aria-checked', 'true');

      await user.keyboard('{Enter}');
      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange).toHaveBeenLastCalledWith(false);
      expect(control).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('state props', () => {
    it('removes a disabled switch from the tab order and blocks toggling', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <>
          <Switch aria-label="Alerts" disabled onChange={handleChange}>
            <Switch.Indicator />
          </Switch>
          <button type="button">After</button>
        </>,
      );

      const control = screen.getByRole('switch');
      expect(control).toBeDisabled();
      expect(control).toHaveAttribute('data-disabled', '');
      expect(control).toHaveAttribute('tabindex', '-1');

      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();

      await user.click(control);
      expect(handleChange).not.toHaveBeenCalled();
      expect(control).toHaveAttribute('aria-checked', 'false');
    });

    it('keeps a read-only switch focusable but ignores clicks and key presses', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Switch aria-label="Alerts" readOnly defaultChecked onChange={handleChange}>
          <Switch.Indicator />
        </Switch>,
      );

      const control = screen.getByRole('switch');
      expect(control).toHaveAttribute('aria-readonly', 'true');
      expect(control).toHaveAttribute('data-readonly', '');
      expect(control).toBeEnabled();

      await user.tab();
      expect(control).toHaveFocus();

      await user.keyboard(' ');
      await user.keyboard('{Enter}');
      await user.click(control);
      expect(handleChange).not.toHaveBeenCalled();
      expect(control).toHaveAttribute('aria-checked', 'true');
    });

    it('exposes required and invalid through ARIA and data hooks', () => {
      render(
        <Switch aria-label="Terms" required invalid>
          <Switch.Indicator />
        </Switch>,
      );

      const control = screen.getByRole('switch');
      expect(control).toHaveAttribute('aria-required', 'true');
      expect(control).toHaveAttribute('data-required', '');
      expect(control).toHaveAttribute('aria-invalid', 'true');
      expect(control).toHaveAttribute('data-invalid', '');
    });
  });

  describe('Switch.Indicator children', () => {
    it('replaces the default thumb with ReactNode children', () => {
      render(
        <Switch aria-label="Alerts">
          <Switch.Indicator>
            <span>Custom thumb</span>
          </Switch.Indicator>
        </Switch>,
      );

      const root = screen.getByRole('switch');
      const indicator = indicatorOf(root) as HTMLElement;
      expect(within(indicator).getByText('Custom thumb')).toBeInTheDocument();
      expect(thumbOf(root)).toBeNull();
    });

    it('passes { checked, disabled, readOnly } to function children and re-renders on toggle', async () => {
      const user = userEvent.setup();
      const renderIndicator = vi.fn(({ checked }: SwitchIndicatorRenderProps) => <span>{checked ? 'On' : 'Off'}</span>);

      render(
        <Switch aria-label="Alerts">
          <Switch.Indicator>{renderIndicator}</Switch.Indicator>
        </Switch>,
      );

      const root = screen.getByRole('switch');
      expect(renderIndicator).toHaveBeenLastCalledWith({ checked: false, disabled: false, readOnly: false });
      expect(indicatorOf(root)).toHaveTextContent('Off');
      expect(thumbOf(root)).toBeNull();

      await user.click(root);
      expect(renderIndicator).toHaveBeenLastCalledWith({ checked: true, disabled: false, readOnly: false });
      expect(indicatorOf(root)).toHaveTextContent('On');
    });

    it('reports the resolved (Field-inherited) disabled and readOnly state to function children', () => {
      const renderIndicator = vi.fn((_state: SwitchIndicatorRenderProps) => null);

      render(
        <Field disabled>
          <Field.Label>Alerts</Field.Label>
          <Switch readOnly defaultChecked>
            <Switch.Indicator>{renderIndicator}</Switch.Indicator>
          </Switch>
        </Field>,
      );

      expect(renderIndicator).toHaveBeenLastCalledWith({ checked: true, disabled: true, readOnly: true });
    });
  });

  describe('root render prop', () => {
    it('exposes Spar state to function children while still providing compound context', async () => {
      const user = userEvent.setup();
      const renderRoot = vi.fn((state: SwitchRenderProps) => (
        <>
          <Switch.Indicator />
          <span>{state.checked ? 'On' : 'Off'}</span>
        </>
      ));

      render(
        <Switch aria-label="Alerts" required>
          {renderRoot}
        </Switch>,
      );

      const root = screen.getByRole('switch');
      expect(renderRoot).toHaveBeenLastCalledWith(
        expect.objectContaining({ checked: false, disabled: false, readOnly: false, required: true, invalid: false, setChecked: expect.any(Function) }),
      );
      expect(thumbOf(root)?.parentElement).toBe(indicatorOf(root));
      expect(root).toHaveTextContent('Off');

      await user.click(root);
      expect(renderRoot).toHaveBeenLastCalledWith(expect.objectContaining({ checked: true }));
      expect(root).toHaveTextContent('On');
    });
  });

  describe('form integration', () => {
    it('submits the value through a synchronized hidden checkbox when name is set', async () => {
      const user = userEvent.setup();

      render(
        <form aria-label="Preferences">
          <Switch aria-label="Email" name="email" value="enabled" defaultChecked>
            <Switch.Indicator />
          </Switch>
        </form>,
      );

      const form = screen.getByRole('form', { name: 'Preferences' }) as HTMLFormElement;
      const hiddenInput = within(form).getByRole('checkbox', { hidden: true });
      expect(hiddenInput).toHaveAttribute('name', 'email');
      expect(hiddenInput).toHaveAttribute('aria-hidden', 'true');
      expect(hiddenInput).toHaveAttribute('tabindex', '-1');
      expect(new FormData(form).get('email')).toBe('enabled');

      await user.click(screen.getByRole('switch', { name: 'Email' }));
      expect(new FormData(form).get('email')).toBeNull();

      await user.click(screen.getByRole('switch', { name: 'Email' }));
      expect(new FormData(form).get('email')).toBe('enabled');
    });

    it('submits "on" by default and renders no hidden input without a name', () => {
      render(
        <>
          <form aria-label="Named">
            <Switch aria-label="SMS" name="sms" defaultChecked>
              <Switch.Indicator />
            </Switch>
          </form>
          <form aria-label="Unnamed">
            <Switch aria-label="Push" defaultChecked>
              <Switch.Indicator />
            </Switch>
          </form>
        </>,
      );

      expect(new FormData(screen.getByRole('form', { name: 'Named' }) as HTMLFormElement).get('sms')).toBe('on');
      expect(within(screen.getByRole('form', { name: 'Unnamed' })).queryByRole('checkbox', { hidden: true })).toBeNull();
    });
  });

  describe('Field error wiring', () => {
    it('points aria-describedby at Field.ErrorMessage while invalid and back at Field.Description once valid', () => {
      const renderField = (invalid: boolean) => (
        <Field id="push" invalid={invalid}>
          <Field.Label>Push notifications</Field.Label>
          <Switch>
            <Switch.Indicator />
          </Switch>
          <Field.Description>Sent to this device only.</Field.Description>
          <Field.ErrorMessage>Enable browser notifications to turn this on.</Field.ErrorMessage>
        </Field>
      );

      const { rerender } = render(renderField(true));

      const control = screen.getByRole('switch', { name: 'Push notifications' });
      expect(control).toHaveAttribute('aria-invalid', 'true');
      expect(control).toHaveAttribute('aria-describedby', 'push-error');
      expect(control).toHaveAccessibleDescription('Enable browser notifications to turn this on.');

      rerender(renderField(false));

      expect(control).not.toHaveAttribute('aria-invalid');
      expect(control).not.toHaveAttribute('data-invalid');
      expect(control).toHaveAttribute('aria-describedby', 'push-description');
      expect(control).toHaveAccessibleDescription('Sent to this device only.');
    });
  });

  describe('non-button rendering', () => {
    it('stays focusable and toggles with Space and Enter when rendered as a span', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Switch as="span" aria-label="Alerts" onChange={handleChange}>
          <Switch.Indicator />
        </Switch>,
      );

      const control = screen.getByRole('switch', { name: 'Alerts' });
      expect(control).toHaveAttribute('tabindex', '0');
      expect(control).not.toHaveAttribute('aria-disabled');

      await user.tab();
      expect(control).toHaveFocus();

      await user.keyboard(' ');
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenLastCalledWith(true);
      expect(control).toHaveAttribute('aria-checked', 'true');

      await user.keyboard('{Enter}');
      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange).toHaveBeenLastCalledWith(false);
      expect(control).toHaveAttribute('aria-checked', 'false');
    });

    it('ignores Space and Enter on a disabled span switch even when it holds focus', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Switch as="span" aria-label="Alerts" disabled onChange={handleChange}>
          <Switch.Indicator />
        </Switch>,
      );

      const control = screen.getByRole('switch');
      await user.click(control);
      await user.keyboard(' ');
      await user.keyboard('{Enter}');
      expect(handleChange).not.toHaveBeenCalled();
      expect(control).toHaveAttribute('aria-checked', 'false');
      expect(control).not.toHaveAttribute('data-checked');
    });
  });

  describe('autoFocus', () => {
    it('moves focus to the switch after mount only when autoFocus is set', async () => {
      render(
        <>
          <Switch aria-label="Plain">
            <Switch.Indicator />
          </Switch>
          <Switch aria-label="Focused" autoFocus>
            <Switch.Indicator />
          </Switch>
        </>,
      );

      await waitFor(() => expect(screen.getByRole('switch', { name: 'Focused' })).toHaveFocus());
      expect(screen.getByRole('switch', { name: 'Plain' })).not.toHaveFocus();
    });
  });

  describe('root layering', () => {
    it('merges theme and instance classes on the root and keeps data-* hooks above slotProps.root', () => {
      const rootOverrides = { 'data-size': 'xlarge', 'data-variant': 'success', 'data-slot': 'hijacked' } as Record<string, string>;

      render(
        <TakeoffSparProvider components={{ Switch: { className: 'theme-root' } }}>
          <Switch aria-label="Alerts" className="instance-root" classNames={{ root: 'instance-root-slot' }} slotProps={{ root: rootOverrides }}>
            <Switch.Indicator />
          </Switch>
        </TakeoffSparProvider>,
      );

      const root = screen.getByRole('switch');
      expect(root).toHaveClass('tk-toggle', 'theme-root', 'instance-root', 'instance-root-slot');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-variant', 'info');
      expect(root).toHaveAttribute('data-slot', 'root');
    });
  });

  describe('external form association', () => {
    it('forwards the form prop to the hidden input so a form elsewhere in the document receives the value', () => {
      render(
        <>
          <form id="preferences" aria-label="Preferences" />
          <Switch aria-label="Email" name="email" form="preferences" defaultChecked>
            <Switch.Indicator />
          </Switch>
        </>,
      );

      const hiddenInput = screen.getByRole('checkbox', { hidden: true });
      expect(hiddenInput).toHaveAttribute('form', 'preferences');
      expect(new FormData(screen.getByRole('form', { name: 'Preferences' }) as HTMLFormElement).get('email')).toBe('on');
    });
  });

  describe('context boundaries', () => {
    it('throws a descriptive error when Switch.Indicator renders outside Switch', () => {
      expect(() => render(<Switch.Indicator />)).toThrow(/Switch\.Indicator must be used within SwitchProvider/);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations inside a Field with a label and description', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Flight status alerts</Field.Label>
          <Field.Description>We will let you know about delays, gate changes, and cancellations.</Field.Description>
          <Switch defaultChecked>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for labelled standalone switches across sizes, variants and states', async () => {
      const { container } = render(
        <>
          <Switch aria-label="Unchecked" size="xsmall">
            <Switch.Indicator />
          </Switch>
          <Switch aria-label="Checked success" variant="success" size="xlarge" defaultChecked>
            <Switch.Indicator />
          </Switch>
          <Switch aria-label="Disabled" disabled>
            <Switch.Indicator />
          </Switch>
          <Switch aria-label="Read-only" readOnly required invalid>
            <Switch.Indicator />
          </Switch>
          <Switch aria-label="Custom indicator">
            <Switch.Indicator>
              {({ checked }) => (
                <span data-slot="thumb" className="tk-toggle-thumb">
                  {checked ? 'on' : 'off'}
                </span>
              )}
            </Switch.Indicator>
          </Switch>
        </>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
