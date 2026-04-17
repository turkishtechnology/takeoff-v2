import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { useState } from 'react';
import { Input } from './Input';
import { SparReactProvider } from '../../provider';

describe('Input', () => {
  describe('rendering', () => {
    it('renders with tk-input root class and data-slot="root"', () => {
      const { container } = render(<Input aria-label="Name" />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toBeInTheDocument();
      expect(root!.className).toContain('tk-input');
    });

    it('renders the canonical container slot with default size data', () => {
      const { container } = render(<Input aria-label="Name" />);
      const wrapper = container.querySelector('[data-slot="container"]');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute('data-size', 'base');
      expect(wrapper!.className).toContain('tk-input-container');
    });

    it('renders the native input as the field slot with default type="text"', () => {
      const { container } = render(<Input aria-label="Name" />);
      const field = container.querySelector('[data-slot="field"]');
      expect(field).toBeInTheDocument();
      expect(field!.tagName).toBe('INPUT');
      expect(field).toHaveAttribute('type', 'text');
      expect(field!.className).toContain('tk-input-field');
    });

    it('merges custom className with canonical root class', () => {
      const { container } = render(<Input aria-label="Name" className="custom-root" />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root!.className).toContain('tk-input');
      expect(root!.className).toContain('custom-root');
    });
  });

  describe('label and required', () => {
    it('renders label when provided and wires htmlFor to the field id', () => {
      const { container } = render(<Input label="Full name" />);
      const label = container.querySelector('[data-slot="label"]');
      const field = container.querySelector('[data-slot="field"]') as HTMLInputElement;
      expect(label).toBeInTheDocument();
      expect(label!.tagName).toBe('LABEL');
      expect(label).toHaveAttribute('for', field.id);
      expect(label!.textContent).toContain('Full name');
    });

    it('renders the asterisk slot when required and label is present', () => {
      const { container } = render(<Input label="Email" required />);
      const asterisk = container.querySelector('[data-slot="asterisk"]');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk!.textContent).toBe('*');
      expect(asterisk).toHaveAttribute('aria-hidden', 'true');
    });

    it('skips the asterisk when required is false', () => {
      const { container } = render(<Input label="Email" />);
      expect(container.querySelector('[data-slot="asterisk"]')).toBeNull();
    });
  });

  describe('description and error', () => {
    it('renders description when provided and invalid is false', () => {
      const { container } = render(<Input label="Email" description="We will never share your email." />);
      const description = container.querySelector('[data-slot="description"]');
      expect(description).toBeInTheDocument();
      expect(description!.textContent).toBe('We will never share your email.');
    });

    it('renders error with role="alert" when invalid and hides description', () => {
      const { container } = render(<Input label="Email" description="hidden" invalid error="Required" />);
      const error = container.querySelector('[data-slot="error-message"]');
      expect(error).toBeInTheDocument();
      expect(error).toHaveAttribute('role', 'alert');
      expect(error!.textContent).toBe('Required');
      expect(container.querySelector('[data-slot="description"]')).toBeNull();
    });

    it('sets aria-invalid on the field when invalid', () => {
      const { container } = render(<Input label="Email" invalid error="Bad" />);
      const field = container.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('icon slots', () => {
    it('places shared icon prop on the leading side by default', () => {
      const { container } = render(<Input aria-label="Search" icon="search" />);
      const leading = container.querySelector('[data-slot="leading-icon"]');
      const trailing = container.querySelector('[data-slot="trailing-icon"]');
      expect(leading).toBeInTheDocument();
      expect(trailing).toBeNull();
      expect(leading!.textContent).toBe('search');
    });

    it('places shared icon on the trailing side when iconPosition="right"', () => {
      const { container } = render(<Input aria-label="Search" icon="search" iconPosition="right" />);
      const leading = container.querySelector('[data-slot="leading-icon"]');
      const trailing = container.querySelector('[data-slot="trailing-icon"]');
      expect(leading).toBeNull();
      expect(trailing).toBeInTheDocument();
    });

    it('allows explicit leadingIcon and trailingIcon ReactNode content', () => {
      render(<Input aria-label="Amount" leadingIcon={<span data-testid="lead">L</span>} trailingIcon={<span data-testid="trail">T</span>} />);
      expect(screen.getByTestId('lead').parentElement).toHaveAttribute('data-slot', 'leading-icon');
      expect(screen.getByTestId('trail').parentElement).toHaveAttribute('data-slot', 'trailing-icon');
    });
  });

  describe('prefix and suffix', () => {
    it('renders the prefix slot before the field', () => {
      const { container } = render(<Input aria-label="Amount" prefix="TRY" />);
      const prefix = container.querySelector('[data-slot="prefix"]');
      expect(prefix).toBeInTheDocument();
      expect(prefix!.textContent).toBe('TRY');
    });

    it('renders the suffix slot', () => {
      const { container } = render(<Input aria-label="Domain" suffix=".com" />);
      const suffix = container.querySelector('[data-slot="suffix"]');
      expect(suffix).toBeInTheDocument();
      expect(suffix!.textContent).toBe('.com');
    });
  });

  describe('loading state', () => {
    it('renders the spinner slot with the default indicator when loading', () => {
      const { container } = render(<Input aria-label="Name" loading />);
      const spinner = container.querySelector('[data-slot="spinner"]');
      const indicator = container.querySelector('[data-slot="spinner-indicator"]');
      expect(spinner).toBeInTheDocument();
      expect(spinner!.className).toContain('tk-input-spinner');
      expect(indicator).toBeInTheDocument();
      expect(indicator!.className).toContain('tk-input-default-spinner');
    });

    it('passes the default spinner node to renderSpinner override', () => {
      const renderSpinner = vi.fn(node => <span data-testid="wrapped">{node}</span>);
      render(<Input aria-label="Name" loading renderSpinner={renderSpinner} />);
      expect(renderSpinner).toHaveBeenCalled();
      expect(screen.getByTestId('wrapped')).toBeInTheDocument();
    });

    it('sets data-loading on the container when loading without clearable', () => {
      const { container } = render(<Input aria-label="Name" loading />);
      const wrapper = container.querySelector('[data-slot="container"]');
      expect(wrapper).toHaveAttribute('data-loading', '');
    });
  });

  describe('clear button', () => {
    it('does not render the clear button when value is empty', () => {
      const { container } = render(<Input aria-label="Name" clearable defaultValue="" />);
      expect(container.querySelector('[data-slot="clear-button"]')).toBeNull();
    });

    it('renders the clear button with canonical class when value is non-empty', () => {
      const { container } = render(<Input aria-label="Name" clearable defaultValue="hi" />);
      const clearButton = container.querySelector('[data-slot="clear-button"]');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton!.tagName).toBe('BUTTON');
      expect(clearButton!.className).toContain('tk-input-clear-button');
    });

    it('preserves the clear-button owner when renderClearIcon overrides content', () => {
      const { container } = render(<Input aria-label="Name" clearable defaultValue="hi" renderClearIcon={() => <span data-testid="custom-clear">X</span>} />);
      const clearButton = container.querySelector('[data-slot="clear-button"]');
      expect(clearButton).toBeInTheDocument();
      expect(clearButton!.className).toContain('tk-input-clear-button');
      expect(screen.getByTestId('custom-clear')).toBeInTheDocument();
    });

    it('resets the value and calls onClearClick when the clear button is clicked', async () => {
      const user = userEvent.setup();
      const onClearClick = vi.fn();
      function Harness() {
        const [value, setValue] = useState('initial');
        return <Input aria-label="Name" clearable value={value} onChange={event => setValue(event.target.value)} onClearClick={onClearClick} />;
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
      render(<Input aria-label="Name" defaultValue="Ada" />);
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
            aria-label="Name"
            value={value}
            onChange={event => {
              onChange(event.target.value);
              setValue(event.target.value);
            }}
          />
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
      const { container } = render(<Input aria-label="Name" disabled />);
      const field = container.querySelector('[data-slot="field"]') as HTMLInputElement;
      expect(field).toBeDisabled();
      const wrapper = container.querySelector('[data-slot="container"]');
      expect(wrapper).toHaveAttribute('data-disabled', '');
    });

    it('forwards readOnly and sets data-readonly on container', () => {
      const { container } = render(<Input aria-label="Name" readOnly defaultValue="hi" />);
      const field = container.querySelector('[data-slot="field"]') as HTMLInputElement;
      expect(field).toHaveAttribute('readonly');
      const wrapper = container.querySelector('[data-slot="container"]');
      expect(wrapper).toHaveAttribute('data-readonly', '');
    });

    it('hides the clear button when disabled or readOnly even if clearable is true', () => {
      const { container: disabledContainer } = render(<Input aria-label="Name" clearable defaultValue="x" disabled />);
      expect(disabledContainer.querySelector('[data-slot="clear-button"]')).toBeNull();

      const { container: readonlyContainer } = render(<Input aria-label="Name" clearable defaultValue="x" readOnly />);
      expect(readonlyContainer.querySelector('[data-slot="clear-button"]')).toBeNull();
    });
  });

  describe('type and size', () => {
    it('forwards type="email" to the native input', () => {
      const { container } = render(<Input aria-label="Email" type="email" />);
      const field = container.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute('type', 'email');
    });

    it('forwards type="password"', () => {
      const { container } = render(<Input aria-label="Password" type="password" />);
      const field = container.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute('type', 'password');
    });

    it('sets data-size on root and container', () => {
      const { container } = render(<Input aria-label="Name" size="large" />);
      const root = container.querySelector('[data-slot="root"]');
      const wrapper = container.querySelector('[data-slot="container"]');
      expect(root).toHaveAttribute('data-size', 'large');
      expect(wrapper).toHaveAttribute('data-size', 'large');
    });
  });

  describe('classNames prop', () => {
    it('merges instance classNames with canonical slot classes', () => {
      const { container } = render(
        <Input
          aria-label="Name"
          label="Label"
          description="Helper"
          classNames={{
            root: 'custom-root',
            label: 'custom-label',
            container: 'custom-container',
            field: 'custom-field',
            description: 'custom-description',
          }}
        />,
      );
      expect(container.querySelector('[data-slot="root"]')!.className).toContain('custom-root');
      expect(container.querySelector('[data-slot="label"]')!.className).toContain('custom-label');
      expect(container.querySelector('[data-slot="container"]')!.className).toContain('custom-container');
      expect(container.querySelector('[data-slot="field"]')!.className).toContain('custom-field');
      expect(container.querySelector('[data-slot="description"]')!.className).toContain('custom-description');
    });
  });

  describe('slotProps prop', () => {
    it('forwards slotProps.field attributes to the native input', () => {
      const { container } = render(<Input aria-label="Name" slotProps={{ field: { autoComplete: 'off', maxLength: 32 } }} />);
      const field = container.querySelector('[data-slot="field"]');
      expect(field).toHaveAttribute('autocomplete', 'off');
      expect(field).toHaveAttribute('maxlength', '32');
    });

    it('concatenates slotProps.container.className with canonical class', () => {
      const { container } = render(<Input aria-label="Name" slotProps={{ container: { className: 'slot-wrapper' } }} />);
      const wrapper = container.querySelector('[data-slot="container"]');
      expect(wrapper!.className).toContain('tk-input-container');
      expect(wrapper!.className).toContain('slot-wrapper');
    });
  });

  describe('theme-level customization', () => {
    it('applies theme-level defaultProps', () => {
      const { container } = render(
        <SparReactProvider components={{ Input: { defaultProps: { size: 'large' } } }}>
          <Input aria-label="Name" />
        </SparReactProvider>,
      );
      const wrapper = container.querySelector('[data-slot="container"]');
      expect(wrapper).toHaveAttribute('data-size', 'large');
    });

    it('allows instance props to override theme defaultProps', () => {
      const { container } = render(
        <SparReactProvider components={{ Input: { defaultProps: { size: 'large' } } }}>
          <Input aria-label="Name" size="small" />
        </SparReactProvider>,
      );
      const wrapper = container.querySelector('[data-slot="container"]');
      expect(wrapper).toHaveAttribute('data-size', 'small');
    });

    it('merges theme-level classNames with instance classNames on root', () => {
      const { container } = render(
        <SparReactProvider components={{ Input: { classNames: { root: 'theme-root' } } }}>
          <Input aria-label="Name" classNames={{ root: 'instance-root' }} />
        </SparReactProvider>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root!.className).toContain('theme-root');
      expect(root!.className).toContain('instance-root');
      expect(root!.className).toContain('tk-input');
    });

    it('merges theme-level slotProps with instance slotProps on a non-root slot', () => {
      const { container } = render(
        <SparReactProvider components={{ Input: { slotProps: { container: { 'aria-label': 'theme' } } } }}>
          <Input aria-label="Name" slotProps={{ container: { title: 'instance' } }} />
        </SparReactProvider>,
      );
      const wrapper = container.querySelector('[data-slot="container"]');
      expect(wrapper).toHaveAttribute('aria-label', 'theme');
      expect(wrapper).toHaveAttribute('title', 'instance');
    });
  });

  describe('render overrides', () => {
    it('replaces leading icon content via renderLeadingIcon while preserving slot owner', () => {
      const { container } = render(<Input aria-label="Search" icon="search" renderLeadingIcon={() => <span data-testid="lead-custom">*</span>} />);
      const slot = container.querySelector('[data-slot="leading-icon"]');
      expect(slot).toBeInTheDocument();
      expect(slot!.className).toContain('tk-input-leading-icon');
      expect(screen.getByTestId('lead-custom')).toBeInTheDocument();
    });

    it('replaces trailing icon content via renderTrailingIcon', () => {
      const { container } = render(<Input aria-label="Search" icon="search" iconPosition="right" renderTrailingIcon={() => <span data-testid="trail-custom">*</span>} />);
      const slot = container.querySelector('[data-slot="trailing-icon"]');
      expect(slot).toBeInTheDocument();
      expect(screen.getByTestId('trail-custom')).toBeInTheDocument();
    });
  });

  describe('compound parts', () => {
    it('exposes Input.Label, Input.Description, Input.ErrorMessage as compound parts', () => {
      expect(typeof Input.Label).toBe('function');
      expect(typeof Input.Description).toBe('function');
      expect(typeof Input.ErrorMessage).toBe('function');
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations for the default labeled input', async () => {
      const { container } = render(<Input label="Full name" />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for invalid + error state', async () => {
      const { container } = render(<Input label="Email" invalid error="Required" />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for aria-labeled input without visible label', async () => {
      const { container } = render(<Input aria-label="Search" icon="search" />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
