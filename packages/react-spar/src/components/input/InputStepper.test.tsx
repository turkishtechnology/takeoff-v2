import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProvider as render, screen } from '../../test-utils';
import { Field } from '../field';

import { Input } from './index';

interface StepButtonCase {
  name: string;
  Part: typeof Input.Increment;
  label: string;
  className: string;
  /** Value after one step from 5. */
  stepped: number;
}

const stepButtons: StepButtonCase[] = [
  { name: 'Input.Decrement', Part: Input.Decrement, label: 'Decrement value', className: 'tk-input-decrement', stepped: 4 },
  { name: 'Input.Increment', Part: Input.Increment, label: 'Increment value', className: 'tk-input-increment', stepped: 6 },
];

const getBagsField = () => screen.getByRole('spinbutton', { name: 'Bags' });

describe('Input.Stepper actions', () => {
  describe.each(stepButtons)('$name', ({ Part, label, className, stepped }) => {
    const getButton = () => screen.getByRole('button', { name: label });

    it('renders a labelled icon button with the canonical class', () => {
      render(
        <Input>
          <Input.Field aria-label="Bags" type="number" defaultValue={5} />
          <Part />
        </Input>,
      );

      const button = getButton();
      expect(button).toHaveClass('tk-button', className);
      expect(button).toHaveAttribute('data-slot', 'root');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toBeEnabled();
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('steps the number field, fires onChange once and focuses the field', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Input>
          <Input.Field aria-label="Bags" type="number" defaultValue={5} onChange={onChange} />
          <Part />
        </Input>,
      );

      await user.click(getButton());

      expect(getBagsField()).toHaveValue(stepped);
      expect(getBagsField()).toHaveFocus();
      expect(onChange).toHaveBeenCalledTimes(1);
      const [event] = onChange.mock.lastCall ?? [];
      expect(event?.target).toBe(getBagsField());
      expect(event?.target.value).toBe(String(stepped));
    });

    it('accepts a custom accessible name and content', () => {
      render(
        <Input data-layout="counter">
          <Input.Field aria-label="Passengers" type="number" defaultValue={2} />
          <Part aria-label="Change passengers">±</Part>
        </Input>,
      );

      const button = screen.getByRole('button', { name: 'Change passengers' });
      expect(button).toHaveTextContent('±');
      expect(button.querySelector('svg')).not.toBeInTheDocument();
    });

    it('cascades the Input size and lands className, classNames and slotProps on the button', () => {
      render(
        <Input size="small">
          <Input.Field aria-label="Bags" type="number" defaultValue={5} />
          <Part className="instance-class" classNames={{ root: 'slot-class' }} slotProps={{ root: { title: 'Step' } }} />
        </Input>,
      );

      const button = getButton();
      expect(button).toHaveAttribute('data-size', 'small');
      expect(button).toHaveClass(className, 'instance-class', 'slot-class');
      expect(button).toHaveAttribute('title', 'Step');
    });

    it('forwards the ref to the button element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <Input>
          <Input.Field aria-label="Bags" type="number" defaultValue={5} />
          <Part ref={ref} />
        </Input>,
      );

      expect(ref.current).toBe(getButton());
    });

    it('runs the consumer onClick, then slotProps.root.onClick, then steps', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const slotOnClick = vi.fn();
      render(
        <Input>
          <Input.Field aria-label="Bags" type="number" defaultValue={5} />
          <Part onClick={onClick} slotProps={{ root: { onClick: slotOnClick } }} />
        </Input>,
      );

      await user.click(getButton());

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(slotOnClick).toHaveBeenCalledTimes(1);
      expect(onClick.mock.invocationCallOrder[0]).toBeLessThan(slotOnClick.mock.invocationCallOrder[0]);
      expect(getBagsField()).toHaveValue(stepped);
    });

    it('does not step when the consumer onClick prevents default', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Field aria-label="Bags" type="number" defaultValue={5} />
          <Part onClick={event => event.preventDefault()} />
        </Input>,
      );

      await user.click(getButton());

      expect(getBagsField()).toHaveValue(5);
    });

    it('does not step when slotProps.root.onClick prevents default', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Field aria-label="Bags" type="number" defaultValue={5} />
          <Part slotProps={{ root: { onClick: event => event.preventDefault() } }} />
        </Input>,
      );

      await user.click(getButton());

      expect(getBagsField()).toHaveValue(5);
    });

    it('is a no-op on a non-steppable text field', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Input>
          <Input.Field aria-label="Code" defaultValue="abc" onChange={onChange} />
          <Part />
        </Input>,
      );

      await user.click(getButton());

      const field = screen.getByRole('textbox', { name: 'Code' });
      expect(field).toHaveValue('abc');
      expect(field).not.toHaveFocus();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('is a no-op on a textarea field', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Field as="textarea" aria-label="Notes" defaultValue="5" />
          <Part />
        </Input>,
      );

      await user.click(getButton());

      expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('5');
    });

    it.each([{ disabled: true }, { readOnly: true }])('is disabled when the Input is %o', async stateProps => {
      const user = userEvent.setup();
      render(
        <Input {...stateProps}>
          <Input.Field aria-label="Bags" type="number" defaultValue={5} />
          <Part />
        </Input>,
      );

      expect(getButton()).toBeDisabled();

      await user.click(getButton());

      expect(getBagsField()).toHaveValue(5);
    });
  });

  describe('native stepping bounds', () => {
    const BoundedBags = (props: { defaultValue: number; min?: number; max?: number; step?: number }) => (
      <Input>
        <Input.Field aria-label="Bags" type="number" {...props} />
        <Input.Stepper>
          <Input.Decrement />
          <Input.Increment />
        </Input.Stepper>
      </Input>
    );

    it('keeps the value at max instead of stepping past it', async () => {
      const user = userEvent.setup();
      render(<BoundedBags defaultValue={9} min={0} max={10} />);

      await user.click(screen.getByRole('button', { name: 'Increment value' }));
      await user.click(screen.getByRole('button', { name: 'Increment value' }));

      expect(getBagsField()).toHaveValue(10);
    });

    it('keeps the value at min instead of stepping past it', async () => {
      const user = userEvent.setup();
      render(<BoundedBags defaultValue={1} min={0} max={10} />);

      await user.click(screen.getByRole('button', { name: 'Decrement value' }));
      await user.click(screen.getByRole('button', { name: 'Decrement value' }));

      expect(getBagsField()).toHaveValue(0);
    });

    it('honours a custom step', async () => {
      const user = userEvent.setup();
      render(<BoundedBags defaultValue={10} step={5} />);

      await user.click(screen.getByRole('button', { name: 'Increment value' }));
      expect(getBagsField()).toHaveValue(15);

      await user.click(screen.getByRole('button', { name: 'Decrement value' }));
      await user.click(screen.getByRole('button', { name: 'Decrement value' }));
      expect(getBagsField()).toHaveValue(5);
    });
  });

  describe('controlled field', () => {
    it('keeps a controlled number field in sync through onChange', async () => {
      const user = userEvent.setup();
      const ControlledBags = () => {
        const [value, setValue] = useState('1');
        return (
          <>
            <Input>
              <Input.Field aria-label="Bags" type="number" value={value} onChange={event => setValue(event.target.value)} />
              <Input.Stepper>
                <Input.Decrement />
                <Input.Increment />
              </Input.Stepper>
            </Input>
            <span data-testid="mirror">{value}</span>
          </>
        );
      };
      render(<ControlledBags />);

      await user.click(screen.getByRole('button', { name: 'Increment value' }));
      await user.click(screen.getByRole('button', { name: 'Increment value' }));
      expect(screen.getByTestId('mirror')).toHaveTextContent('3');
      expect(getBagsField()).toHaveValue(3);

      await user.click(screen.getByRole('button', { name: 'Decrement value' }));
      expect(screen.getByTestId('mirror')).toHaveTextContent('2');
      expect(getBagsField()).toHaveValue(2);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for a stepper and a counter layout', async () => {
      const { container } = render(
        <>
          <Field>
            <Field.Label>Checked bags</Field.Label>
            <Input>
              <Input.Field type="number" defaultValue={1} inputMode="numeric" />
              <Input.Stepper>
                <Input.Decrement />
                <Input.Increment />
              </Input.Stepper>
            </Input>
          </Field>
          <Field>
            <Field.Label>Passengers</Field.Label>
            <Input data-layout="counter">
              <Input.Decrement aria-label="Remove passenger">−</Input.Decrement>
              <Input.Field type="number" defaultValue={2} inputMode="numeric" />
              <Input.Increment aria-label="Add passenger">+</Input.Increment>
            </Input>
          </Field>
        </>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
