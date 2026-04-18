import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { useState } from 'react';
import { Input } from './Input';
import { SparReactProvider } from '../../provider';

describe('Input (compound)', () => {
  describe('rendering', () => {
    it('renders with tk-input root class and data-slot="root"', () => {
      const { container } = render(
        <Input aria-label="Name">
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toBeInTheDocument();
      expect(root!.className).toContain('tk-input');
    });

    it('renders the canonical container slot with default size data', () => {
      const { container } = render(
        <Input aria-label="Name">
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      const wrapper = container.querySelector('[data-slot="container"]');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('data-size', 'base');
      expect(wrapper!.className).toContain('tk-input-container');
    });

    it('renders the native input as the field slot with default type="text"', () => {
      const { container } = render(
        <Input aria-label="Name">
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      const field = container.querySelector('[data-slot="field"]');
      expect(field).toBeInTheDocument();
      expect(field!.tagName).toBe('INPUT');
      expect(field).toHaveAttribute('type', 'text');
      expect(field!.className).toContain('tk-input-field');
    });

    it('merges custom className with canonical root class', () => {
      const { container } = render(
        <Input aria-label="Name" className="custom-root">
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root!.className).toContain('tk-input');
      expect(root!.className).toContain('custom-root');
    });
  });

  describe('label and required', () => {
    it('renders Input.Label as a label element', () => {
      const { container } = render(
        <Input>
          <Input.Label>Full name</Input.Label>
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      const label = container.querySelector('[data-slot="label"]');
      expect(label).toBeInTheDocument();
      expect(label!.tagName).toBe('LABEL');
      expect(label!.textContent).toContain('Full name');
    });

    it('renders Input.Asterisk only when required', () => {
      const { container: requiredContainer } = render(
        <Input required>
          <Input.Label>
            Email <Input.Asterisk />
          </Input.Label>
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      const asterisk = requiredContainer.querySelector('[data-slot="asterisk"]');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk!.textContent).toBe('*');

      const { container: notRequiredContainer } = render(
        <Input>
          <Input.Label>
            Email <Input.Asterisk />
          </Input.Label>
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      expect(notRequiredContainer.querySelector('[data-slot="asterisk"]')).toBeNull();
    });
  });

  describe('description and error', () => {
    it('renders Input.Description when not invalid', () => {
      const { container } = render(
        <Input>
          <Input.Label>Email</Input.Label>
          <Input.Container>
            <Input.Field />
          </Input.Container>
          <Input.Description>We will never share your email.</Input.Description>
        </Input>,
      );
      const description = container.querySelector('[data-slot="description"]');
      expect(description).toBeInTheDocument();
      expect(description!.textContent).toBe('We will never share your email.');
    });

    it('renders Input.ErrorMessage only when invalid and hides Input.Description', () => {
      const { container } = render(
        <Input invalid>
          <Input.Label>Email</Input.Label>
          <Input.Container>
            <Input.Field />
          </Input.Container>
          <Input.Description>hidden</Input.Description>
          <Input.ErrorMessage>Required</Input.ErrorMessage>
        </Input>,
      );
      const error = container.querySelector('[data-slot="error-message"]');
      expect(error).toBeInTheDocument();
      expect(error).toHaveAttribute('role', 'alert');
      expect(error!.textContent).toBe('Required');
      expect(container.querySelector('[data-slot="description"]')).toBeNull();
    });

    it('sets aria-invalid on the field when invalid', () => {
      const { container } = render(
        <Input invalid>
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      expect(container.querySelector('[data-slot="field"]')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('icon slots', () => {
    it('renders Input.LeadingIcon with canonical slot and class', () => {
      const { container } = render(
        <Input aria-label="Search">
          <Input.Container>
            <Input.LeadingIcon>search</Input.LeadingIcon>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      const leading = container.querySelector('[data-slot="leading-icon"]');
      expect(leading).toBeInTheDocument();
      expect(leading!.textContent).toBe('search');
      expect(leading!.className).toContain('tk-input-leading-icon');
    });

    it('renders Input.TrailingIcon with canonical slot and class', () => {
      const { container } = render(
        <Input aria-label="Search">
          <Input.Container>
            <Input.Field />
            <Input.TrailingIcon>
              <span data-testid="trail">T</span>
            </Input.TrailingIcon>
          </Input.Container>
        </Input>,
      );
      const trailing = container.querySelector('[data-slot="trailing-icon"]');
      expect(trailing).toBeInTheDocument();
      expect(screen.getByTestId('trail').parentElement).toBe(trailing);
    });
  });

  describe('prefix and suffix', () => {
    it('renders Input.Prefix slot', () => {
      const { container } = render(
        <Input aria-label="Amount">
          <Input.Container>
            <Input.Prefix>TRY</Input.Prefix>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      const prefix = container.querySelector('[data-slot="prefix"]');
      expect(prefix).toBeInTheDocument();
      expect(prefix!.textContent).toBe('TRY');
    });

    it('renders Input.Suffix slot', () => {
      const { container } = render(
        <Input aria-label="Domain">
          <Input.Container>
            <Input.Field />
            <Input.Suffix>.com</Input.Suffix>
          </Input.Container>
        </Input>,
      );
      const suffix = container.querySelector('[data-slot="suffix"]');
      expect(suffix).toBeInTheDocument();
      expect(suffix!.textContent).toBe('.com');
    });
  });

  describe('loading state', () => {
    it('renders Input.Spinner with default indicator when loading', () => {
      const { container } = render(
        <Input aria-label="Name" loading>
          <Input.Container>
            <Input.Field />
            <Input.Spinner />
          </Input.Container>
        </Input>,
      );
      const spinner = container.querySelector('[data-slot="spinner"]');
      const indicator = container.querySelector('[data-slot="spinner-indicator"]');
      expect(spinner).toBeInTheDocument();
      expect(spinner!.className).toContain('tk-input-spinner');
      expect(indicator).toBeInTheDocument();
      expect(indicator!.className).toContain('tk-input-default-spinner');
    });

    it('does not render Input.Spinner when not loading', () => {
      const { container } = render(
        <Input aria-label="Name">
          <Input.Container>
            <Input.Field />
            <Input.Spinner />
          </Input.Container>
        </Input>,
      );
      expect(container.querySelector('[data-slot="spinner"]')).toBeNull();
    });
  });

  describe('clear button', () => {
    it('does not render Input.ClearButton when value is empty', () => {
      const { container } = render(
        <Input aria-label="Name" clearable defaultValue="">
          <Input.Container>
            <Input.Field />
            <Input.ClearButton />
          </Input.Container>
        </Input>,
      );
      expect(container.querySelector('[data-slot="clear-button"]')).toBeNull();
    });

    it('renders Input.ClearButton when value is non-empty', () => {
      const { container } = render(
        <Input aria-label="Name" clearable defaultValue="hi">
          <Input.Container>
            <Input.Field />
            <Input.ClearButton />
          </Input.Container>
        </Input>,
      );
      const clearButton = container.querySelector('[data-slot="clear-button"]');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton!.tagName).toBe('BUTTON');
    });

    it('resets value and calls onClearClick when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onClearClick = vi.fn();
      function Harness() {
        const [value, setValue] = useState('initial');
        return (
          <Input clearable value={value} onChange={event => setValue(event.target.value)} onClearClick={onClearClick}>
            <Input.Container>
              <Input.Field aria-label="Name" />
              <Input.ClearButton />
            </Input.Container>
          </Input>
        );
      }
      render(<Harness />);
      const field = screen.getByLabelText('Name') as HTMLInputElement;
      expect(field.value).toBe('initial');
      await user.click(screen.getByLabelText('Clear input'));
      expect(onClearClick).toHaveBeenCalledTimes(1);
      expect(field.value).toBe('');
    });
  });

  describe('controlled and uncontrolled value', () => {
    it('uses defaultValue in uncontrolled mode and updates on input', async () => {
      const user = userEvent.setup();
      render(
        <Input defaultValue="Ada">
          <Input.Container>
            <Input.Field aria-label="Name" />
          </Input.Container>
        </Input>,
      );
      const field = screen.getByLabelText('Name') as HTMLInputElement;
      expect(field.value).toBe('Ada');
      await user.clear(field);
      await user.type(field, 'Lin');
      expect(field.value).toBe('Lin');
    });

    it('respects controlled value and calls onChange', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      function Harness() {
        const [value, setValue] = useState('a');
        return (
          <Input
            value={value}
            onChange={event => {
              onChange(event.target.value);
              setValue(event.target.value);
            }}
          >
            <Input.Container>
              <Input.Field aria-label="Name" />
            </Input.Container>
          </Input>
        );
      }
      render(<Harness />);
      const field = screen.getByLabelText('Name') as HTMLInputElement;
      await user.type(field, 'b');
      expect(onChange).toHaveBeenLastCalledWith('ab');
      expect(field.value).toBe('ab');
    });
  });

  describe('disabled and readOnly', () => {
    it('forwards disabled to the field and sets data-disabled on container', () => {
      const { container } = render(
        <Input aria-label="Name" disabled>
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      expect(container.querySelector('[data-slot="field"]')).toBeDisabled();
      expect(container.querySelector('[data-slot="container"]')).toHaveAttribute('data-disabled', '');
    });
  });

  describe('type and size', () => {
    it('forwards type="email" to the native input', () => {
      const { container } = render(
        <Input aria-label="Email" type="email">
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      expect(container.querySelector('[data-slot="field"]')).toHaveAttribute('type', 'email');
    });

    it('sets data-size on root and container', () => {
      const { container } = render(
        <Input aria-label="Name" size="large">
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-size', 'large');
      expect(container.querySelector('[data-slot="container"]')).toHaveAttribute('data-size', 'large');
    });
  });

  describe('theme-level customization', () => {
    it('applies theme-level defaultProps', () => {
      const { container } = render(
        <SparReactProvider components={{ Input: { defaultProps: { size: 'large' } } }}>
          <Input aria-label="Name">
            <Input.Container>
              <Input.Field />
            </Input.Container>
          </Input>
        </SparReactProvider>,
      );
      expect(container.querySelector('[data-slot="container"]')).toHaveAttribute('data-size', 'large');
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations for a default labeled input', async () => {
      const { container } = render(
        <Input>
          <Input.Label>Full name</Input.Label>
          <Input.Container>
            <Input.Field />
          </Input.Container>
        </Input>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for invalid + error state', async () => {
      const { container } = render(
        <Input invalid>
          <Input.Label>Email</Input.Label>
          <Input.Container>
            <Input.Field />
          </Input.Container>
          <Input.ErrorMessage>Required</Input.ErrorMessage>
        </Input>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
