import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';

import { render, renderWithProvider, screen } from '../../test-utils';
import { TakeoffSparProvider } from '../../provider';
import { Field } from '../field';

import { Input } from './index';

describe('Input', () => {
  it('renders the bordered row on the root without Input.Container', () => {
    const { container } = renderWithProvider(
      <Field>
        <Field.Label>Passenger name</Field.Label>
        <Input>
          <Input.Field placeholder="Ada Lovelace" />
        </Input>
      </Field>,
    );

    const root = container.querySelector('.tk-input');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('data-slot', 'root');
    expect(root).toHaveAttribute('data-size', 'base');
    expect(container.querySelector('.tk-input-container')).not.toBeInTheDocument();
  });

  it('passes native numeric attributes through Input.Field type="number"', async () => {
    const user = userEvent.setup();
    const onInput = vi.fn();
    const onChange = vi.fn();

    renderWithProvider(
      <Input>
        <Input.Field type="number" min={1} max={9} step={1} inputMode="numeric" defaultValue={2} aria-label="Passengers" onInput={onInput} onChange={onChange} />
      </Input>,
    );

    const field = screen.getByLabelText('Passengers');
    expect(field).toHaveAttribute('type', 'number');
    expect(field).toHaveAttribute('min', '1');
    expect(field).toHaveAttribute('max', '9');
    expect(field).toHaveAttribute('step', '1');
    expect(field).toHaveAttribute('inputmode', 'numeric');
    expect(field).toHaveValue(2);

    await user.clear(field);
    await user.type(field, '7');

    expect(field).toHaveValue(7);
    expect(onInput).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });

  it('increments and decrements uncontrolled number fields with native stepping', async () => {
    const user = userEvent.setup();

    renderWithProvider(
      <Input>
        <Input.Field type="number" min={1} max={9} step={1} defaultValue={2} aria-label="Passengers" />
        <Input.Stepper>
          <Input.Decrement />
          <Input.Increment />
        </Input.Stepper>
      </Input>,
    );

    const field = screen.getByLabelText('Passengers');
    const decrement = screen.getByRole('button', { name: 'Decrement value' });
    const increment = screen.getByRole('button', { name: 'Increment value' });

    await user.click(increment);

    expect(field).toHaveValue(3);
    expect(field).toHaveFocus();

    await user.click(decrement);

    expect(field).toHaveValue(2);
    expect(field).toHaveFocus();
  });

  it('dispatches input and change events for controlled stepper fields', async () => {
    const user = userEvent.setup();
    const onInput = vi.fn();
    const onChange = vi.fn();

    const ControlledInput = () => {
      const [value, setValue] = useState('2');
      return (
        <Input>
          <Input.Field
            type="number"
            min={1}
            max={9}
            step={1}
            value={value}
            aria-label="Passengers"
            onInput={onInput}
            onChange={event => {
              onChange(event);
              setValue(event.currentTarget.value);
            }}
          />
          <Input.Stepper>
            <Input.Decrement />
            <Input.Increment />
          </Input.Stepper>
        </Input>
      );
    };

    renderWithProvider(<ControlledInput />);

    await user.click(screen.getByRole('button', { name: 'Increment value' }));

    expect(screen.getByLabelText('Passengers')).toHaveValue(3);
    expect(onInput).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });

  it('preserves native min and max behavior for stepper actions', async () => {
    const user = userEvent.setup();
    const renderNumberInput = (defaultValue: number) => (
      <Input key={defaultValue}>
        <Input.Field type="number" min={1} max={3} step={1} defaultValue={defaultValue} aria-label="Passengers" />
        <Input.Stepper>
          <Input.Decrement />
          <Input.Increment />
        </Input.Stepper>
      </Input>
    );

    const { rerender } = renderWithProvider(renderNumberInput(3));

    await user.click(screen.getByRole('button', { name: 'Increment value' }));
    expect(screen.getByLabelText('Passengers')).toHaveValue(3);

    rerender(renderNumberInput(1));

    await user.click(screen.getByRole('button', { name: 'Decrement value' }));
    expect(screen.getByLabelText('Passengers')).toHaveValue(1);
  });

  it('disables stepper buttons from disabled and readOnly input state', () => {
    const { rerender } = renderWithProvider(
      <Input disabled>
        <Input.Field type="number" defaultValue={2} />
        <Input.Stepper>
          <Input.Decrement />
          <Input.Increment />
        </Input.Stepper>
      </Input>,
    );

    expect(screen.getByRole('button', { name: 'Decrement value' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increment value' })).toBeDisabled();

    rerender(
      <Input readOnly>
        <Input.Field type="number" defaultValue={2} />
        <Input.Stepper>
          <Input.Decrement />
          <Input.Increment />
        </Input.Stepper>
      </Input>,
    );

    expect(screen.getByRole('button', { name: 'Decrement value' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increment value' })).toBeDisabled();
  });

  it('renders stepper parts with slot classes, data-slot, classNames, and slotProps', () => {
    const { container } = renderWithProvider(
      <Input>
        <Input.Field type="number" />
        <Input.Stepper classNames={{ root: 'stepper-extra' }} slotProps={{ root: { id: 'stepper' } }}>
          <Input.Decrement classNames={{ root: 'decrement-extra' }} slotProps={{ root: { id: 'decrement' } }} aria-label="Less">
            -
          </Input.Decrement>
          <Input.Increment classNames={{ root: 'increment-extra' }} slotProps={{ root: { id: 'increment' } }} aria-label="More">
            +
          </Input.Increment>
        </Input.Stepper>
      </Input>,
    );

    expect(container.querySelector('#stepper')).toHaveClass('tk-input-stepper', 'stepper-extra');
    expect(container.querySelector('#stepper')).toHaveAttribute('data-slot', 'root');
    expect(container.querySelector('#decrement')).toHaveClass('tk-input-decrement', 'decrement-extra');
    expect(container.querySelector('#decrement')).toHaveAttribute('data-slot', 'root');
    expect(container.querySelector('#increment')).toHaveClass('tk-input-increment', 'increment-extra');
    expect(container.querySelector('#increment')).toHaveAttribute('data-slot', 'root');
    expect(screen.getByRole('button', { name: 'Less' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
  });

  it('renders Input.Field as a textarea without a type attribute and syncs the typed value', async () => {
    const user = userEvent.setup();

    renderWithProvider(
      <Input>
        <Input.Field as="textarea" rows={3} aria-label="Special assistance note" />
      </Input>,
    );

    const field = screen.getByLabelText('Special assistance note');
    expect(field.tagName).toBe('TEXTAREA');
    expect(field).not.toHaveAttribute('type');
    expect(field).toHaveAttribute('rows', '3');

    await user.type(field, 'Aisle seat please');
    expect(field).toHaveValue('Aisle seat please');
  });

  it('renders leading and trailing icon owner nodes with default aria-hidden and customization attrs', () => {
    const { container } = renderWithProvider(
      <Input>
        <Input.LeadingIcon classNames={{ root: 'leading-extra' }} slotProps={{ root: { id: 'leading' } }}>
          L
        </Input.LeadingIcon>
        <Input.Field />
        <Input.TrailingIcon classNames={{ root: 'trailing-extra' }} slotProps={{ root: { id: 'trailing' } }}>
          T
        </Input.TrailingIcon>
      </Input>,
    );

    expect(container.querySelector('#leading')).toHaveClass('tk-input-leading-icon', 'leading-extra');
    expect(container.querySelector('#leading')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('#trailing')).toHaveClass('tk-input-trailing-icon', 'trailing-extra');
    expect(container.querySelector('#trailing')).toHaveAttribute('aria-hidden', 'true');
  });

  it('switches password field type through RevealButton', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <Input>
        <Input.Field type="password" placeholder="Password" />
        <Input.RevealButton />
      </Input>,
    );

    const field = screen.getByPlaceholderText('Password');
    const reveal = screen.getByRole('button', { name: 'Toggle password visibility' });

    expect(field).toHaveAttribute('type', 'password');
    expect(reveal).toHaveAttribute('type', 'button');
    expect(reveal).toHaveAttribute('aria-label', 'Toggle password visibility');
    expect(reveal).toHaveAttribute('aria-pressed', 'false');
    expect(reveal.querySelector('[data-placeholder-icon="eye"]')).toBeInTheDocument();

    await user.click(reveal);

    expect(field).toHaveAttribute('type', 'text');
    expect(reveal).toHaveAttribute('aria-label', 'Toggle password visibility');
    expect(reveal).toHaveAttribute('aria-pressed', 'true');
    expect(reveal.querySelector('[data-placeholder-icon="eye-off"]')).toBeInTheDocument();
    expect(field).toHaveFocus();
  });

  it('disables RevealButton from disabled and readOnly input state', () => {
    const { rerender } = renderWithProvider(
      <Input disabled>
        <Input.Field type="password" />
        <Input.RevealButton />
      </Input>,
    );

    expect(screen.getByRole('button', { name: 'Toggle password visibility' })).toBeDisabled();

    rerender(
      <Input readOnly>
        <Input.Field type="password" />
        <Input.RevealButton />
      </Input>,
    );

    expect(screen.getByRole('button', { name: 'Toggle password visibility' })).toBeDisabled();
  });

  it('resets revealed password state on form submit', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <form onSubmit={event => event.preventDefault()}>
        <Input>
          <Input.Field type="password" placeholder="Password" />
          <Input.RevealButton />
        </Input>
        <button type="submit">Submit</button>
      </form>,
    );

    const field = screen.getByPlaceholderText('Password');
    const reveal = screen.getByRole('button', { name: 'Toggle password visibility' });

    await user.click(reveal);
    expect(field).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(field).toHaveAttribute('type', 'password');
    expect(reveal).toHaveAttribute('aria-pressed', 'false');
  });

  it('clears uncontrolled field values by click and returns focus to the field', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    renderWithProvider(
      <Input>
        <Input.Field defaultValue="TK1928" aria-label="Booking code" />
        <Input.ClearButton onClear={onClear} />
      </Input>,
    );

    const field = screen.getByLabelText('Booking code');
    const clear = await screen.findByRole('button', { name: 'Clear input' });

    expect(clear.querySelector('[data-placeholder-icon="close"]')).toBeInTheDocument();
    expect(clear.querySelector('[data-placeholder-icon="close"]')).toHaveAttribute('aria-hidden', 'true');

    await user.click(clear);

    expect(field).toHaveValue('');
    expect(field).toHaveFocus();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('clears uncontrolled field values with Escape', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <Input>
        <Input.Field defaultValue="TK1928" aria-label="Booking code" />
        <Input.ClearButton />
      </Input>,
    );

    const field = screen.getByLabelText('Booking code');
    const clear = await screen.findByRole('button', { name: 'Clear input' });

    clear.focus();
    await user.keyboard('{Escape}');

    expect(field).toHaveValue('');
    expect(field).toHaveFocus();
  });

  it('dispatches input and change events for controlled ClearButton fields', async () => {
    const user = userEvent.setup();
    const onInput = vi.fn();
    const onChange = vi.fn();

    const ControlledInput = () => {
      const [value, setValue] = useState('TK1928');
      return (
        <Input>
          <Input.Field
            aria-label="Booking code"
            value={value}
            onInput={onInput}
            onChange={event => {
              onChange(event);
              setValue(event.currentTarget.value);
            }}
          />
          <Input.ClearButton />
        </Input>
      );
    };

    renderWithProvider(<ControlledInput />);

    await user.click(await screen.findByRole('button', { name: 'Clear input' }));

    expect(screen.getByLabelText('Booking code')).toHaveValue('');
    expect(onInput).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalled();
  });

  it('does not render ClearButton for disabled, readOnly, or empty fields', () => {
    const { rerender } = renderWithProvider(
      <Input disabled>
        <Input.Field defaultValue="TK1928" />
        <Input.ClearButton />
      </Input>,
    );

    expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();

    rerender(
      <Input readOnly>
        <Input.Field defaultValue="TK1928" />
        <Input.ClearButton />
      </Input>,
    );

    expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();

    rerender(
      <Input key="empty">
        <Input.Field />
        <Input.ClearButton />
      </Input>,
    );

    expect(screen.queryByRole('button', { name: 'Clear input' })).not.toBeInTheDocument();
  });

  it('renders Spinner with default aria-hidden and default spinner child', () => {
    const { container } = renderWithProvider(
      <Input>
        <Input.Field />
        <Input.Spinner />
      </Input>,
    );

    const spinner = container.querySelector('.tk-input-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(spinner?.querySelector('.tk-input-default-spinner')).toBeInTheDocument();
  });

  it('grades the field value through the strength meter and hoists it below the row', () => {
    const { container } = renderWithProvider(
      <Input>
        <Input.Field type="password" defaultValue="Abcd1234!" />
        <Input.Strength />
      </Input>,
    );

    const meter = container.querySelector('.tk-input-strength');
    expect(meter).toBeInTheDocument();
    // The meter is a sibling of the bordered row, not a descendant of it.
    expect(container.querySelector('.tk-input')?.contains(meter)).toBe(false);

    const segments = container.querySelectorAll('.tk-input-strength-segment');
    expect(segments).toHaveLength(4);
    // length≥8 + upper + lower + digit + symbol → max strength, all segments strong.
    segments.forEach(segment => expect(segment).toHaveAttribute('data-level', 'strong'));
  });

  it('fills only the leading segment for a weak value', () => {
    const { container } = renderWithProvider(
      <Input>
        <Input.Field type="password" defaultValue="abc" />
        <Input.Strength />
      </Input>,
    );

    const segments = container.querySelectorAll('.tk-input-strength-segment');
    expect(segments[0]).toHaveAttribute('data-level', 'weak');
    expect(segments[1]).not.toHaveAttribute('data-level');
    expect(segments[2]).not.toHaveAttribute('data-level');
    expect(segments[3]).not.toHaveAttribute('data-level');
  });

  it('renders helper text icons with slot customization hooks', () => {
    const { container } = renderWithProvider(
      <>
        <Field>
          <Field.Label>Booking code</Field.Label>
          <Input>
            <Input.Field defaultValue="TK1928" />
          </Input>
          <Field.Description classNames={{ icon: 'description-icon-extra' }} slotProps={{ icon: { id: 'description-icon' } }}>
            Use the code from your confirmation email.
          </Field.Description>
        </Field>
        <Field invalid>
          <Field.Label>Phone number</Field.Label>
          <Input>
            <Input.Field defaultValue="not-a-phone" />
          </Input>
          <Field.ErrorMessage classNames={{ icon: 'error-icon-extra' }} slotProps={{ icon: { id: 'error-icon' } }}>
            Enter a valid phone number.
          </Field.ErrorMessage>
        </Field>
      </>,
    );

    const descriptionIcon = container.querySelector('#description-icon');
    expect(descriptionIcon).toHaveClass('tk-field-description-icon', 'description-icon-extra');
    expect(descriptionIcon).toHaveAttribute('aria-hidden', 'true');
    expect(descriptionIcon?.querySelector('[data-placeholder-icon="info"]')).toBeInTheDocument();

    const errorIcon = container.querySelector('#error-icon');
    expect(errorIcon).toHaveClass('tk-field-error-message-icon', 'error-icon-extra');
    expect(errorIcon).toHaveAttribute('aria-hidden', 'true');
    expect(errorIcon?.querySelector('[data-placeholder-icon="error"]')).toBeInTheDocument();
  });

  it('commits a tag on Enter and clears the field (uncontrolled chips)', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProvider(
      <Input>
        <Input.Chips defaultValue={['alpha']} />
        <Input.Field aria-label="Tags" />
      </Input>,
    );

    const field = screen.getByLabelText('Tags');
    await user.type(field, 'beta{Enter}');

    expect(container.querySelectorAll('.tk-input-chip')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Remove alpha' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove beta' })).toBeInTheDocument();
    expect(field).toHaveValue('');
  });

  it('reports the next array through onValueChange (controlled chips)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    const ControlledChips = () => {
      const [tags, setTags] = useState<string[]>(['alpha']);
      return (
        <Input>
          <Input.Chips
            value={tags}
            onValueChange={next => {
              onValueChange(next);
              setTags(next);
            }}
          />
          <Input.Field aria-label="Tags" />
        </Input>
      );
    };

    renderWithProvider(<ControlledChips />);

    await user.type(screen.getByLabelText('Tags'), 'beta{Enter}');

    expect(onValueChange).toHaveBeenCalledWith(['alpha', 'beta']);
  });

  it('removes the last tag on Backspace when the field is empty', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProvider(
      <Input>
        <Input.Chips defaultValue={['alpha', 'beta']} />
        <Input.Field aria-label="Tags" />
      </Input>,
    );

    const field = screen.getByLabelText('Tags');
    field.focus();
    await user.keyboard('{Backspace}');

    expect(container.querySelectorAll('.tk-input-chip')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Remove alpha' })).toBeInTheDocument();
  });

  it('ignores commits once max is reached', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProvider(
      <Input>
        <Input.Chips defaultValue={['alpha', 'beta']} max={2} />
        <Input.Field aria-label="Tags" />
      </Input>,
    );

    await user.type(screen.getByLabelText('Tags'), 'gamma{Enter}');

    expect(container.querySelectorAll('.tk-input-chip')).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Remove gamma' })).not.toBeInTheDocument();
  });

  it('rejects duplicate tags by default', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProvider(
      <Input>
        <Input.Chips defaultValue={['alpha']} />
        <Input.Field aria-label="Tags" />
      </Input>,
    );

    await user.type(screen.getByLabelText('Tags'), 'alpha{Enter}');

    expect(container.querySelectorAll('.tk-input-chip')).toHaveLength(1);
  });

  it('commits a tag when the separator key is pressed', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProvider(
      <Input>
        <Input.Chips separator="," />
        <Input.Field aria-label="Tags" />
      </Input>,
    );

    const field = screen.getByLabelText('Tags');
    await user.type(field, 'beta,');

    expect(container.querySelectorAll('.tk-input-chip')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Remove beta' })).toBeInTheDocument();
    expect(field).toHaveValue('');
  });

  it('removes a tag through its remove button', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = renderWithProvider(
      <Input>
        <Input.Chips defaultValue={['alpha']} onValueChange={onValueChange} />
        <Input.Field aria-label="Tags" />
      </Input>,
    );

    await user.click(screen.getByRole('button', { name: 'Remove alpha' }));

    expect(container.querySelectorAll('.tk-input-chip')).toHaveLength(0);
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it('renders chips without remove buttons when the input is disabled', () => {
    const { container } = renderWithProvider(
      <Input disabled>
        <Input.Chips defaultValue={['alpha']} />
        <Input.Field aria-label="Tags" />
      </Input>,
    );

    expect(container.querySelectorAll('.tk-input-chip')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Remove alpha' })).not.toBeInTheDocument();
  });

  it('renders counter Decrement and Increment as direct children flanking the field', () => {
    const { container } = renderWithProvider(
      <Input>
        <Input.Decrement aria-label="Decrease">−</Input.Decrement>
        <Input.Field type="number" defaultValue={1} aria-label="Count" />
        <Input.Increment aria-label="Increase">+</Input.Increment>
      </Input>,
    );

    const root = container.querySelector('.tk-input');
    expect(container.querySelector('.tk-input-decrement')?.parentElement).toBe(root);
    expect(container.querySelector('.tk-input-increment')?.parentElement).toBe(root);
    expect(container.querySelector('.tk-input-stepper')).not.toBeInTheDocument();
  });

  it('cascades the provider size default onto the root data-size', () => {
    const { container } = render(
      <TakeoffSparProvider components={{ Input: { defaultProps: { size: 'large' } } }}>
        <Input>
          <Input.Field />
        </Input>
      </TakeoffSparProvider>,
    );

    expect(container.querySelector('.tk-input')).toHaveAttribute('data-size', 'large');
  });

  it('has no accessibility violations for a chips input', async () => {
    const { container } = renderWithProvider(
      <Field>
        <Field.Label>Tags</Field.Label>
        <Input>
          <Input.Chips defaultValue={['alpha', 'beta']} />
          <Input.Field />
        </Input>
      </Field>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('throws when compound parts are used outside Input', () => {
    const parts = [
      <Input.Field key="field" />,
      <Input.Prefix key="prefix" />,
      <Input.Suffix key="suffix" />,
      <Input.LeadingIcon key="leading" />,
      <Input.TrailingIcon key="trailing" />,
      <Input.ClearButton key="clear" />,
      <Input.Spinner key="spinner" />,
      <Input.RevealButton key="reveal" />,
      <Input.Strength key="strength" />,
      <Input.Stepper key="stepper" />,
      <Input.Decrement key="decrement" />,
      <Input.Increment key="increment" />,
      <Input.Chips key="chips" />,
      <Input.Chip key="chip" />,
    ];

    for (const part of parts) {
      expect(() => renderWithProvider(part)).toThrow();
    }
  });

  it('has no accessibility violations for the happy path', async () => {
    const { container } = renderWithProvider(
      <Field required>
        <Field.Label>Booking code</Field.Label>
        <Input>
          <Input.Prefix>PNR</Input.Prefix>
          <Input.Field type="number" min={1} max={9} step={1} defaultValue={2} />
          <Input.Stepper>
            <Input.Decrement />
            <Input.Increment />
          </Input.Stepper>
        </Input>
        <Field.Description>Use the code from your confirmation email.</Field.Description>
      </Field>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
