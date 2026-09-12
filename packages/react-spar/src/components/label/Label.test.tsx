import userEvent from '@testing-library/user-event';
import { createRef, type MouseEvent as ReactMouseEvent } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';
import { Checkbox } from '../checkbox';
import { Input } from '../input';
import { Switch } from '../switch';

import { Label } from './Label';

describe('Label', () => {
  it('renders a label element by default', () => {
    render(<Label htmlFor="username">Username</Label>);

    const label = screen.getByText('Username');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'username');
    expect(label).toHaveClass('tk-label');
  });

  it('renders as a custom element', () => {
    render(<Label as="span">Email</Label>);

    expect(screen.getByText('Email').tagName).toBe('SPAN');
  });

  it('renders semantic headings through the as prop', () => {
    render(<Label as="h2">Billing Address</Label>);

    expect(screen.getByRole('heading', { level: 2, name: 'Billing Address' })).toHaveClass('tk-label');
  });

  it('keeps htmlFor on non-label elements so Spar can associate custom controls', () => {
    render(
      <Label as="span" htmlFor="section-title">
        Payment Method
      </Label>,
    );

    const label = screen.getByText('Payment Method');
    expect(label.tagName).toBe('SPAN');
    expect(label).toHaveAttribute('for', 'section-title');
  });

  it('applies state data attributes only when state props are truthy', () => {
    const { rerender } = render(
      <Label required optional disabled readOnly invalid>
        Field
      </Label>,
    );

    const label = screen.getByText('Field');
    expect(label).toHaveAttribute('data-required');
    expect(label).toHaveAttribute('data-optional');
    expect(label).toHaveAttribute('data-disabled');
    expect(label).toHaveAttribute('data-readonly');
    expect(label).toHaveAttribute('data-invalid');

    rerender(<Label>Field</Label>);

    expect(label).not.toHaveAttribute('data-required');
    expect(label).not.toHaveAttribute('data-optional');
    expect(label).not.toHaveAttribute('data-disabled');
    expect(label).not.toHaveAttribute('data-readonly');
    expect(label).not.toHaveAttribute('data-invalid');
  });

  it('delegates clicks to a custom associated control', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <>
        <Label as="span" htmlFor="custom-toggle">
          Toggle
        </Label>
        <button id="custom-toggle" type="button" onClick={onClick}>
          Control
        </button>
      </>,
    );

    await user.click(screen.getByText('Toggle'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Control')).toHaveFocus();
  });

  it('focuses a Takeoff Input.Field through the Input root id convention', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label id="booking-reference-label" htmlFor="booking-reference-field">
          Booking reference
        </Label>
        <Input id="booking-reference">
          <Input.Field />
        </Input>
      </div>,
    );

    await user.click(screen.getByText('Booking reference'));

    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'booking-reference-field');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-labelledby', 'booking-reference-label');
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  describe('slot contract and styling hooks', () => {
    it('stamps data-slot="root" alongside the canonical class', () => {
      render(<Label>Username</Label>);

      const label = screen.getByText('Username');
      expect(label).toHaveAttribute('data-slot', 'root');
      expect(label).toHaveClass('tk-label');
    });

    it('merges className and classNames.root with the canonical class', () => {
      render(
        <Label className="instance-label" classNames={{ root: 'extra-label' }}>
          Username
        </Label>,
      );

      expect(screen.getByText('Username')).toHaveClass('tk-label', 'instance-label', 'extra-label');
    });

    it('lands slotProps.root attributes on the label and keeps the canonical hooks', () => {
      render(<Label slotProps={{ root: { title: 'Account name', id: 'account-label' } }}>Username</Label>);

      const label = screen.getByText('Username');
      expect(label).toHaveAttribute('title', 'Account name');
      expect(label).toHaveAttribute('id', 'account-label');
      expect(label).toHaveAttribute('data-slot', 'root');
      expect(label).toHaveClass('tk-label');
    });

    it('applies provider theme layers beneath instance props', () => {
      render(
        <TakeoffSparProvider components={{ Label: { className: 'theme-label', defaultProps: { required: true }, slotProps: { root: { title: 'theme-title' } } } }}>
          <Label className="instance-label">Themed</Label>
          <Label required={false} slotProps={{ root: { title: 'instance-title' } }}>
            Override
          </Label>
        </TakeoffSparProvider>,
      );

      const themed = screen.getByText('Themed');
      expect(themed).toHaveClass('tk-label', 'theme-label', 'instance-label');
      expect(themed).toHaveAttribute('data-required', '');
      expect(themed).toHaveAttribute('title', 'theme-title');

      const override = screen.getByText('Override');
      expect(override).toHaveClass('tk-label', 'theme-label');
      expect(override).not.toHaveAttribute('data-required');
      expect(override).toHaveAttribute('title', 'instance-title');
    });

    it('forwards ref to the rendered element', () => {
      const ref = createRef<HTMLLabelElement>();

      render(<Label ref={ref}>Username</Label>);

      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
      expect(ref.current).toBe(screen.getByText('Username'));
    });
  });

  describe('association', () => {
    it('names and focuses a native control through htmlFor', async () => {
      const user = userEvent.setup();

      render(
        <>
          <Label htmlFor="pnr">PNR</Label>
          <input id="pnr" />
        </>,
      );

      const input = screen.getByRole('textbox', { name: 'PNR' });
      await user.click(screen.getByText('PNR'));
      expect(input).toHaveFocus();
    });

    it('does not mirror its styling-only state flags onto the associated control', () => {
      render(
        <>
          <Label htmlFor="email" required disabled readOnly invalid>
            Email
          </Label>
          <input id="email" />
        </>,
      );

      const input = screen.getByRole('textbox', { name: 'Email' });
      expect(input).not.toBeRequired();
      expect(input).toBeEnabled();
      expect(input).not.toHaveAttribute('readonly');
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('does not activate an associated custom control that is aria-disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <>
          <Label as="span" htmlFor="locked-control">
            Locked
          </Label>
          <div id="locked-control" role="button" tabIndex={0} aria-disabled="true" onClick={onClick}>
            Control
          </div>
        </>,
      );

      await user.click(screen.getByText('Locked'));

      expect(onClick).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Control' })).not.toHaveFocus();
    });

    it('runs the consumer onClick and skips delegation when it prevents default', async () => {
      const user = userEvent.setup();
      const controlClick = vi.fn();
      const labelClick = vi.fn((event: ReactMouseEvent<HTMLElement>) => event.preventDefault());

      render(
        <>
          <Label as="span" htmlFor="guarded-control" onClick={labelClick}>
            Guarded
          </Label>
          <button id="guarded-control" type="button" onClick={controlClick}>
            Control
          </button>
        </>,
      );

      await user.click(screen.getByText('Guarded'));

      expect(labelClick).toHaveBeenCalledTimes(1);
      expect(controlClick).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Control' })).not.toHaveFocus();
    });

    it('does not re-dispatch a click that already landed on the associated control', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <Label as="div" htmlFor="nested-control">
          Nested{' '}
          <button id="nested-control" type="button" onClick={onClick}>
            Inner
          </button>
        </Label>,
      );

      await user.click(screen.getByRole('button', { name: 'Inner' }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Takeoff toggle controls', () => {
    it('toggles and focuses a Checkbox referenced by htmlFor exactly once per click', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <>
          <Label htmlFor="terms-checkbox">Accept terms</Label>
          <Checkbox id="terms-checkbox" onChange={handleChange}>
            <Checkbox.Indicator />
          </Checkbox>
        </>,
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(screen.getByText('Accept terms'));
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenLastCalledWith(true);
      expect(checkbox).toHaveAttribute('aria-checked', 'true');
      expect(checkbox).toHaveFocus();

      await user.click(screen.getByText('Accept terms'));
      expect(handleChange).toHaveBeenCalledTimes(2);
      expect(handleChange).toHaveBeenLastCalledWith(false);
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('leaves a disabled Checkbox untouched', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <>
          <Label htmlFor="locked-checkbox" disabled>
            Locked terms
          </Label>
          <Checkbox id="locked-checkbox" disabled onChange={handleChange}>
            <Checkbox.Indicator />
          </Checkbox>
        </>,
      );

      await user.click(screen.getByText('Locked terms'));
      expect(handleChange).not.toHaveBeenCalled();
      expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByRole('checkbox')).not.toHaveFocus();
    });

    it('names a Switch button natively and toggles it once without a duplicate delegated click', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <>
          <Label htmlFor="alerts-switch">Flight alerts</Label>
          <Switch id="alerts-switch" onChange={handleChange}>
            <Switch.Indicator />
          </Switch>
        </>,
      );

      const control = screen.getByRole('switch', { name: 'Flight alerts' });
      await user.click(screen.getByText('Flight alerts'));
      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenLastCalledWith(true);
      expect(control).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations when labelling a native control', async () => {
      const { container } = render(
        <>
          <Label htmlFor="passenger-name">Passenger name</Label>
          <input id="passenger-name" />
        </>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations across state flags and polymorphic rendering', async () => {
      const { container } = render(
        <>
          <Label as="span">Payment Method</Label>
          <Label htmlFor="required-email" required>
            Required label
          </Label>
          <input id="required-email" required />
          <Label htmlFor="optional-phone" optional>
            Optional label
          </Label>
          <input id="optional-phone" />
          <Label htmlFor="locked-field" disabled>
            Disabled label
          </Label>
          <input id="locked-field" disabled />
          <Label htmlFor="reference" readOnly>
            Read-only label
          </Label>
          <input id="reference" readOnly defaultValue="TK-1928" />
          <Label htmlFor="bad-code" invalid>
            Invalid label
          </Label>
          <input id="bad-code" aria-invalid="true" />
        </>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
