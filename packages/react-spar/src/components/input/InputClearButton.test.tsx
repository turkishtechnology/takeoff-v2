import userEvent from '@testing-library/user-event';
import { createRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProvider as render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { Input } from './index';

const queryClearButton = () => screen.queryByRole('button', { name: 'Clear input' });
const getClearButton = () => screen.getByRole('button', { name: 'Clear input' });
const getSearchField = () => screen.getByRole('textbox', { name: 'Search' });

describe('Input.ClearButton', () => {
  describe('conditional rendering', () => {
    it('is skipped while the field is empty', () => {
      render(
        <Input>
          <Input.Field aria-label="Search" />
          <Input.ClearButton />
        </Input>,
      );

      expect(queryClearButton()).not.toBeInTheDocument();
    });

    it('renders inside the Input root for a field with a default value', () => {
      const { container } = render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton />
        </Input>,
      );

      const button = getClearButton();
      expect(button).toHaveClass('tk-button', 'tk-input-clear-button');
      expect(button).toHaveAttribute('data-slot', 'root');
      expect(button).toHaveAttribute('type', 'button');
      expect(container.querySelector('.tk-input')).toContainElement(button);
    });

    it('appears as the user types and is skipped again once the text is deleted', async () => {
      const user = userEvent.setup();
      render(
        <Input>
          <Input.Field aria-label="Search" />
          <Input.ClearButton />
        </Input>,
      );

      await user.type(getSearchField(), 'I');
      expect(queryClearButton()).toBeInTheDocument();

      await user.type(getSearchField(), '{Backspace}');
      expect(queryClearButton()).not.toBeInTheDocument();
    });

    it('follows a controlled value changed from outside', () => {
      const noop = () => undefined;
      const { rerender } = render(
        <Input>
          <Input.Field aria-label="Search" value="" onChange={noop} />
          <Input.ClearButton />
        </Input>,
      );
      expect(queryClearButton()).not.toBeInTheDocument();

      rerender(
        <Input>
          <Input.Field aria-label="Search" value="IST" onChange={noop} />
          <Input.ClearButton />
        </Input>,
      );
      expect(queryClearButton()).toBeInTheDocument();

      rerender(
        <Input>
          <Input.Field aria-label="Search" value="" onChange={noop} />
          <Input.ClearButton />
        </Input>,
      );
      expect(queryClearButton()).not.toBeInTheDocument();
    });

    it.each([{ disabled: true }, { readOnly: true }])('is skipped for a filled field when the Input is %o', stateProps => {
      render(
        <Input {...stateProps}>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton />
        </Input>,
      );

      expect(getSearchField()).toHaveValue('TK1928');
      expect(queryClearButton()).not.toBeInTheDocument();
    });

    it('is skipped when a wrapping Field is disabled', () => {
      render(
        <Field disabled>
          <Field.Label>Search</Field.Label>
          <Input>
            <Input.Field defaultValue="TK1928" />
            <Input.ClearButton />
          </Input>
        </Field>,
      );

      expect(queryClearButton()).not.toBeInTheDocument();
    });
  });

  describe('clearing', () => {
    it('clears the field on click, fires onClear and onChange once and returns focus to the field', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      const onChange = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>();
      render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" onChange={onChange} />
          <Input.ClearButton onClear={onClear} />
        </Input>,
      );

      await user.click(getClearButton());

      const field = getSearchField();
      expect(field).toHaveValue('');
      expect(field).toHaveFocus();
      expect(onClear).toHaveBeenCalledTimes(1);
      expect(onClear).toHaveBeenCalledWith();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.lastCall?.[0].target).toBe(field);
      expect(queryClearButton()).not.toBeInTheDocument();
    });

    it('calls onClear only once the field value is already empty', async () => {
      const user = userEvent.setup();
      let valueSeenByOnClear: string | undefined;
      render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton
            onClear={() => {
              valueSeenByOnClear = (getSearchField() as HTMLInputElement).value;
            }}
          />
        </Input>,
      );

      await user.click(getClearButton());

      expect(valueSeenByOnClear).toBe('');
    });

    it('never submits an enclosing form, even when given type="submit"', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
      render(
        <form aria-label="Search flights" onSubmit={onSubmit}>
          <Input>
            <Input.Field aria-label="Search" defaultValue="TK1928" />
            <Input.ClearButton type="submit" />
          </Input>
        </form>,
      );

      expect(getClearButton()).toHaveAttribute('type', 'button');

      await user.click(getClearButton());

      expect(getSearchField()).toHaveValue('');
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('clears a controlled field through its onChange', async () => {
      const user = userEvent.setup();
      const ControlledSearch = () => {
        const [value, setValue] = useState('IST');
        return (
          <>
            <Input>
              <Input.Field aria-label="Search" value={value} onChange={event => setValue(event.target.value)} />
              <Input.ClearButton />
            </Input>
            <span data-testid="mirror">{value}</span>
          </>
        );
      };
      render(<ControlledSearch />);

      await user.click(getClearButton());

      expect(getSearchField()).toHaveValue('');
      expect(screen.getByTestId('mirror')).toBeEmptyDOMElement();
      expect(queryClearButton()).not.toBeInTheDocument();
    });

    it('clears a textarea field', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Input>
          <Input.Field as="textarea" aria-label="Notes" defaultValue="Window seat" onChange={onChange} />
          <Input.ClearButton />
        </Input>,
      );

      await user.click(getClearButton());

      const field = screen.getByRole('textbox', { name: 'Notes' });
      expect(field).toHaveValue('');
      expect(field).toHaveFocus();
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(queryClearButton()).not.toBeInTheDocument();
    });

    it('clears when Escape is pressed on the button', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton onClear={onClear} />
        </Input>,
      );

      await user.click(getSearchField());
      await user.tab();
      expect(getClearButton()).toHaveFocus();

      await user.keyboard('{Escape}');

      expect(getSearchField()).toHaveValue('');
      expect(getSearchField()).toHaveFocus();
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('ignores other keys pressed on the button', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton onClear={onClear} />
        </Input>,
      );

      await user.click(getSearchField());
      await user.tab();
      await user.keyboard('{ArrowDown}x');

      expect(getSearchField()).toHaveValue('TK1928');
      expect(getClearButton()).toHaveFocus();
      expect(onClear).not.toHaveBeenCalled();
    });

    it('runs the consumer onClick, then slotProps.root.onClick, then clears', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const slotOnClick = vi.fn();
      const onClear = vi.fn();
      render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton onClick={onClick} onClear={onClear} slotProps={{ root: { onClick: slotOnClick } }} />
        </Input>,
      );

      await user.click(getClearButton());

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(slotOnClick).toHaveBeenCalledTimes(1);
      expect(onClick.mock.invocationCallOrder[0]).toBeLessThan(slotOnClick.mock.invocationCallOrder[0]);
      expect(slotOnClick.mock.invocationCallOrder[0]).toBeLessThan(onClear.mock.invocationCallOrder[0]);
      expect(getSearchField()).toHaveValue('');
    });

    it('does not clear when the consumer onClick prevents default', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton onClear={onClear} onClick={event => event.preventDefault()} />
        </Input>,
      );

      await user.click(getClearButton());

      expect(getSearchField()).toHaveValue('TK1928');
      expect(onClear).not.toHaveBeenCalled();
      expect(getClearButton()).toBeInTheDocument();
    });

    it('does not clear when slotProps.root.onClick prevents default', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton onClear={onClear} slotProps={{ root: { onClick: event => event.preventDefault() } }} />
        </Input>,
      );

      await user.click(getClearButton());

      expect(getSearchField()).toHaveValue('TK1928');
      expect(onClear).not.toHaveBeenCalled();
    });

    it('runs consumer and slotProps.root onKeyDown handlers and skips the Escape clear when one prevents default', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();
      const onKeyDown = vi.fn();
      const slotOnKeyDown = vi.fn();
      const { rerender } = render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton onClear={onClear} onKeyDown={onKeyDown} slotProps={{ root: { onKeyDown: event => event.preventDefault() } }} />
        </Input>,
      );

      await user.click(getSearchField());
      await user.tab();
      await user.keyboard('{Escape}');

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(getSearchField()).toHaveValue('TK1928');
      expect(onClear).not.toHaveBeenCalled();

      rerender(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton onClear={onClear} onKeyDown={event => event.preventDefault()} slotProps={{ root: { onKeyDown: slotOnKeyDown } }} />
        </Input>,
      );
      await user.keyboard('{Escape}');

      expect(slotOnKeyDown).toHaveBeenCalledTimes(1);
      expect(getSearchField()).toHaveValue('TK1928');
      expect(onClear).not.toHaveBeenCalled();
    });
  });

  describe('customization', () => {
    it('renders a default icon, or custom children with an accessible name override', () => {
      const { rerender } = render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton />
        </Input>,
      );
      expect(getClearButton().querySelector('svg')).toBeInTheDocument();

      rerender(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton aria-label="Clear search">
            <span data-testid="custom-icon" />
          </Input.ClearButton>
        </Input>,
      );

      const button = screen.getByRole('button', { name: 'Clear search' });
      expect(within(button).getByTestId('custom-icon')).toBeInTheDocument();
      expect(button.querySelector('svg')).not.toBeInTheDocument();
    });

    it('cascades the Input size and lands className, classNames and slotProps on the button', () => {
      const { container } = render(
        <Input size="large">
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton className="instance-class" classNames={{ root: 'slot-class' }} slotProps={{ root: { title: 'Clear the search' } }} />
        </Input>,
      );

      const button = getClearButton();
      expect(button).toHaveAttribute('data-size', 'large');
      expect(button).toHaveClass('tk-input-clear-button', 'instance-class', 'slot-class');
      expect(button).toHaveAttribute('title', 'Clear the search');
      expect(container.querySelector('.tk-input')).not.toHaveClass('slot-class');
    });

    it('forwards the ref to the button element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <Input>
          <Input.Field aria-label="Search" defaultValue="TK1928" />
          <Input.ClearButton ref={ref} />
        </Input>,
      );

      expect(ref.current).toBe(getClearButton());
    });
  });

  describe('accessibility', () => {
    it('has no axe violations while visible', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Search booking</Field.Label>
          <Input>
            <Input.Field defaultValue="TK1928" />
            <Input.ClearButton />
          </Input>
        </Field>,
      );

      expect(getClearButton()).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
