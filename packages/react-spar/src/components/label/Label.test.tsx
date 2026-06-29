import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../test-utils';
import { Input } from '../input';

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
});
