import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { useState } from 'react';

import { Checkbox } from './Checkbox';
import type { CheckboxValue } from './types';
import { SparReactProvider } from '../../provider';

describe('Checkbox (compound)', () => {
  describe('rendering', () => {
    it('renders with tk-checkbox root class and data-slot="root"', () => {
      const { container } = render(
        <Checkbox aria-label="Accept terms">
          <Checkbox.Indicator>
            <Checkbox.Icon />
          </Checkbox.Indicator>
          <Checkbox.Content>
            <Checkbox.Label>Accept terms</Checkbox.Label>
          </Checkbox.Content>
        </Checkbox>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toBeInTheDocument();
      expect(root!.className).toContain('tk-checkbox');
      expect(root).toHaveAttribute('role', 'checkbox');
    });

    it('stamps canonical data-size and data-type on the root', () => {
      const { container } = render(
        <Checkbox aria-label="x">
          <Checkbox.Indicator>
            <Checkbox.Icon />
          </Checkbox.Indicator>
        </Checkbox>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-type', 'default');
    });

    it('renders indicator, icon, label, and description slots', () => {
      const { container } = render(
        <Checkbox aria-label="Accept">
          <Checkbox.Indicator>
            <Checkbox.Icon />
          </Checkbox.Indicator>
          <Checkbox.Content>
            <Checkbox.Label>Accept</Checkbox.Label>
            <Checkbox.Description>Agree to the policy</Checkbox.Description>
          </Checkbox.Content>
        </Checkbox>,
      );
      expect(container.querySelector('[data-slot="indicator"]')!.className).toContain('tk-checkbox-indicator');
      expect(container.querySelector('[data-slot="icon"]')!.className).toContain('tk-checkbox-icon');
      expect(container.querySelector('[data-slot="content"]')!.className).toContain('tk-checkbox-content');
      expect(container.querySelector('[data-slot="label"]')!.textContent).toBe('Accept');
      expect(container.querySelector('[data-slot="description"]')!.textContent).toBe('Agree to the policy');
    });

    it('renders indicator with default Checkbox.Icon when no children provided', () => {
      const { container } = render(
        <Checkbox aria-label="x">
          <Checkbox.Indicator />
        </Checkbox>,
      );
      expect(container.querySelector('[data-slot="icon"]')).toBeInTheDocument();
    });

    it('merges custom className with canonical root class', () => {
      const { container } = render(
        <Checkbox aria-label="x" className="custom-root">
          <Checkbox.Indicator />
        </Checkbox>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root!.className).toContain('tk-checkbox');
      expect(root!.className).toContain('custom-root');
    });
  });

  describe('value and indeterminate', () => {
    it('reflects controlled checked value via aria-checked', () => {
      const { container } = render(
        <Checkbox aria-label="x" value>
          <Checkbox.Indicator />
        </Checkbox>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('aria-checked', 'true');
      expect(root).toHaveAttribute('data-checked');
    });

    it('reflects indeterminate via aria-checked="mixed"', () => {
      const { container } = render(
        <Checkbox aria-label="x" value={null}>
          <Checkbox.Indicator />
        </Checkbox>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('aria-checked', 'mixed');
      expect(root).toHaveAttribute('data-indeterminate');
    });

    it('treats the indeterminate prop as sugar for value=null', () => {
      const { container } = render(
        <Checkbox aria-label="x" value indeterminate>
          <Checkbox.Indicator />
        </Checkbox>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('aria-checked', 'mixed');
    });

    it('uses defaultValue in uncontrolled mode and toggles on space', async () => {
      const user = userEvent.setup();
      render(
        <Checkbox aria-label="x" defaultValue={false}>
          <Checkbox.Indicator />
        </Checkbox>,
      );
      const root = screen.getByRole('checkbox');
      expect(root).toHaveAttribute('aria-checked', 'false');
      root.focus();
      await user.keyboard(' ');
      expect(root).toHaveAttribute('aria-checked', 'true');
    });

    it('respects controlled value and calls onChange', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      function Harness() {
        const [value, setValue] = useState<CheckboxValue>(false);
        return (
          <Checkbox
            aria-label="x"
            value={value}
            onChange={next => {
              onChange(next);
              setValue(next);
            }}
          >
            <Checkbox.Indicator />
          </Checkbox>
        );
      }
      render(<Harness />);
      const root = screen.getByRole('checkbox');
      await user.click(root);
      expect(onChange).toHaveBeenLastCalledWith(true);
      expect(root).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('state data attributes', () => {
    it('sets data-disabled when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <Checkbox aria-label="x" disabled onChange={onChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-disabled');
      await user.click(root!);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('sets data-invalid when invalid is true', () => {
      const { container } = render(
        <Checkbox aria-label="x" invalid>
          <Checkbox.Indicator />
        </Checkbox>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-invalid');
    });
  });

  describe('variants and sizes', () => {
    it('sets data-type="card" when type="card"', () => {
      const { container } = render(
        <Checkbox aria-label="x" type="card">
          <Checkbox.Indicator />
        </Checkbox>,
      );
      expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-type', 'card');
    });

    it('sets data-size="small"', () => {
      const { container } = render(
        <Checkbox aria-label="x" size="small">
          <Checkbox.Indicator />
        </Checkbox>,
      );
      expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-size', 'small');
    });
  });

  describe('form integration', () => {
    it('renders a hidden form input when name is set', () => {
      const { container } = render(
        <Checkbox aria-label="x" name="agree" formValue="yes" value>
          <Checkbox.Indicator />
        </Checkbox>,
      );
      const hidden = container.querySelector('input[name="agree"]') as HTMLInputElement | null;
      expect(hidden).not.toBeNull();
      expect(hidden!.type).toBe('checkbox');
      expect(hidden!.value).toBe('yes');
      expect(hidden!.checked).toBe(true);
    });
  });

  describe('classNames prop', () => {
    it('merges instance classNames with canonical slot classes', () => {
      const { container } = render(
        <Checkbox
          aria-label="x"
          classNames={{
            root: 'custom-root',
            indicator: 'custom-indicator',
            icon: 'custom-icon',
            content: 'custom-content',
            label: 'custom-label',
            description: 'custom-description',
          }}
        >
          <Checkbox.Indicator>
            <Checkbox.Icon />
          </Checkbox.Indicator>
          <Checkbox.Content>
            <Checkbox.Label>x</Checkbox.Label>
            <Checkbox.Description>helper</Checkbox.Description>
          </Checkbox.Content>
        </Checkbox>,
      );
      expect(container.querySelector('[data-slot="root"]')!.className).toContain('custom-root');
      expect(container.querySelector('[data-slot="indicator"]')!.className).toContain('custom-indicator');
      expect(container.querySelector('[data-slot="icon"]')!.className).toContain('custom-icon');
      expect(container.querySelector('[data-slot="content"]')!.className).toContain('custom-content');
      expect(container.querySelector('[data-slot="label"]')!.className).toContain('custom-label');
      expect(container.querySelector('[data-slot="description"]')!.className).toContain('custom-description');
    });
  });

  describe('render overrides via Checkbox.Icon children', () => {
    it('accepts a function-as-child that receives state', () => {
      const { container } = render(
        <Checkbox aria-label="x" value>
          <Checkbox.Indicator>
            <Checkbox.Icon>{({ checked, indeterminate }) => <span data-testid="custom-icon" data-checked={String(checked)} data-indet={String(indeterminate)} />}</Checkbox.Icon>
          </Checkbox.Indicator>
        </Checkbox>,
      );
      const iconOwner = container.querySelector('[data-slot="icon"]');
      expect(iconOwner).toBeInTheDocument();
      expect(iconOwner!.className).toContain('tk-checkbox-icon');
      expect(screen.getByTestId('custom-icon')).toHaveAttribute('data-checked', 'true');
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations for a default labeled checkbox', async () => {
      const { container } = render(
        <Checkbox aria-label="Accept terms">
          <Checkbox.Indicator>
            <Checkbox.Icon />
          </Checkbox.Indicator>
          <Checkbox.Content>
            <Checkbox.Label>Accept terms</Checkbox.Label>
          </Checkbox.Content>
        </Checkbox>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for the indeterminate state', async () => {
      const { container } = render(
        <Checkbox aria-label="Select all" indeterminate>
          <Checkbox.Indicator>
            <Checkbox.Icon />
          </Checkbox.Indicator>
          <Checkbox.Content>
            <Checkbox.Label>Select all</Checkbox.Label>
          </Checkbox.Content>
        </Checkbox>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('theme-level customization', () => {
    it('applies theme-level defaultProps', () => {
      const { container } = render(
        <SparReactProvider components={{ Checkbox: { defaultProps: { size: 'small' } } }}>
          <Checkbox aria-label="x">
            <Checkbox.Indicator />
          </Checkbox>
        </SparReactProvider>,
      );
      expect(container.querySelector('[data-slot="root"]')).toHaveAttribute('data-size', 'small');
    });
  });
});
