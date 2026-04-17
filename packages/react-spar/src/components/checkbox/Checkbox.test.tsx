import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { useState } from 'react';

import { Checkbox } from './Checkbox';
import type { CheckboxValue } from './types';
import { SparReactProvider } from '../../provider';

describe('Checkbox', () => {
  describe('rendering', () => {
    it('renders with tk-checkbox root class and data-slot="root"', () => {
      const { container } = render(<Checkbox label="Accept terms" />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toBeInTheDocument();
      expect(root!.className).toContain('tk-checkbox');
      expect(root).toHaveAttribute('role', 'checkbox');
    });

    it('stamps canonical data-size and data-type on the root', () => {
      const { container } = render(<Checkbox label="x" />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-type', 'default');
    });

    it('renders indicator, icon, label, and description slots', () => {
      const { container } = render(<Checkbox label="Accept" description="Agree to the policy" />);
      expect(container.querySelector('[data-slot="indicator"]')!.className).toContain('tk-checkbox-indicator');
      expect(container.querySelector('[data-slot="icon"]')!.className).toContain('tk-checkbox-icon');
      expect(container.querySelector('[data-slot="label"]')!.textContent).toBe('Accept');
      expect(container.querySelector('[data-slot="description"]')!.textContent).toBe('Agree to the policy');
    });

    it('omits text wrapper when there is no label or description', () => {
      const { container } = render(<Checkbox aria-label="Agree" />);
      expect(container.querySelector('[data-slot="text"]')).toBeNull();
      expect(container.querySelector('[data-slot="label"]')).toBeNull();
      expect(container.querySelector('[data-slot="description"]')).toBeNull();
    });

    it('merges custom className with canonical root class', () => {
      const { container } = render(<Checkbox label="x" className="custom-root" />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root!.className).toContain('tk-checkbox');
      expect(root!.className).toContain('custom-root');
    });
  });

  describe('value and indeterminate', () => {
    it('reflects controlled checked value via aria-checked and data-checked', () => {
      const { container } = render(<Checkbox label="x" value />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('aria-checked', 'true');
      expect(root).toHaveAttribute('data-checked');
    });

    it('reflects indeterminate via aria-checked="mixed" and data-indeterminate', () => {
      const { container } = render(<Checkbox label="x" value={null} />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('aria-checked', 'mixed');
      expect(root).toHaveAttribute('data-indeterminate');
    });

    it('treats the indeterminate prop as sugar for value=null and wins over value', () => {
      const { container } = render(<Checkbox label="x" value indeterminate />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('aria-checked', 'mixed');
    });

    it('uses defaultValue in uncontrolled mode and toggles on space', async () => {
      const user = userEvent.setup();
      render(<Checkbox aria-label="x" defaultValue={false} />);
      const root = screen.getByRole('checkbox');
      expect(root).toHaveAttribute('aria-checked', 'false');
      root.focus();
      await user.keyboard(' ');
      expect(root).toHaveAttribute('aria-checked', 'true');
    });

    it('respects controlled value and calls onChange with the new tri-state value', async () => {
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
          />
        );
      }
      render(<Harness />);
      const root = screen.getByRole('checkbox');
      await user.click(root);
      expect(onChange).toHaveBeenLastCalledWith(true);
      expect(root).toHaveAttribute('aria-checked', 'true');
    });

    it('advances indeterminate → true on toggle (spec behavior)', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Checkbox aria-label="x" value={null} onChange={onChange} />);
      await user.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenLastCalledWith(true);
    });
  });

  describe('state data attributes', () => {
    it('sets data-disabled and locks interaction when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Checkbox aria-label="x" disabled onChange={onChange} />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-disabled');
      await user.click(root!);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('sets data-readonly and prevents state changes when readOnly', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Checkbox aria-label="x" readOnly onChange={onChange} />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-readonly');
      await user.click(root!);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('exposes data-invalid on the root when invalid is true', () => {
      const { container } = render(<Checkbox aria-label="x" invalid />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-invalid');
    });
  });

  describe('variants and sizes', () => {
    it('sets data-type="card" when type="card"', () => {
      const { container } = render(<Checkbox aria-label="x" type="card" />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-type', 'card');
    });

    it('sets data-size="small"', () => {
      const { container } = render(<Checkbox aria-label="x" size="small" />);
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-size', 'small');
    });
  });

  describe('form integration', () => {
    it('renders a hidden form input when name is set', () => {
      const { container } = render(<Checkbox aria-label="x" name="agree" formValue="yes" value />);
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
          label="x"
          description="helper"
          classNames={{
            root: 'custom-root',
            indicator: 'custom-indicator',
            icon: 'custom-icon',
            text: 'custom-text',
            label: 'custom-label',
            description: 'custom-description',
          }}
        />,
      );
      expect(container.querySelector('[data-slot="root"]')!.className).toContain('custom-root');
      expect(container.querySelector('[data-slot="indicator"]')!.className).toContain('custom-indicator');
      expect(container.querySelector('[data-slot="icon"]')!.className).toContain('custom-icon');
      expect(container.querySelector('[data-slot="text"]')!.className).toContain('custom-text');
      expect(container.querySelector('[data-slot="label"]')!.className).toContain('custom-label');
      expect(container.querySelector('[data-slot="description"]')!.className).toContain('custom-description');
    });
  });

  describe('slotProps prop', () => {
    it('forwards slotProps.indicator attributes to the indicator span', () => {
      const { container } = render(<Checkbox aria-label="x" slotProps={{ indicator: { title: 'box' } }} />);
      const indicator = container.querySelector('[data-slot="indicator"]');
      expect(indicator).toHaveAttribute('title', 'box');
    });

    it('concatenates slotProps.label.className with canonical class', () => {
      const { container } = render(<Checkbox label="x" slotProps={{ label: { className: 'slot-label' } }} />);
      const labelSlot = container.querySelector('[data-slot="label"]');
      expect(labelSlot!.className).toContain('tk-checkbox-label');
      expect(labelSlot!.className).toContain('slot-label');
    });
  });

  describe('theme-level customization', () => {
    it('applies theme-level defaultProps', () => {
      const { container } = render(
        <SparReactProvider components={{ Checkbox: { defaultProps: { size: 'small' } } }}>
          <Checkbox aria-label="x" />
        </SparReactProvider>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-size', 'small');
    });

    it('allows instance props to override theme defaultProps', () => {
      const { container } = render(
        <SparReactProvider components={{ Checkbox: { defaultProps: { size: 'small' } } }}>
          <Checkbox aria-label="x" size="base" />
        </SparReactProvider>,
      );
      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveAttribute('data-size', 'base');
    });

    it('merges theme-level classNames with instance classNames on indicator', () => {
      const { container } = render(
        <SparReactProvider components={{ Checkbox: { classNames: { indicator: 'theme-indicator' } } }}>
          <Checkbox aria-label="x" classNames={{ indicator: 'instance-indicator' }} />
        </SparReactProvider>,
      );
      const indicator = container.querySelector('[data-slot="indicator"]');
      expect(indicator!.className).toContain('tk-checkbox-indicator');
      expect(indicator!.className).toContain('theme-indicator');
      expect(indicator!.className).toContain('instance-indicator');
    });
  });

  describe('render overrides', () => {
    it('replaces the icon glyph content via renderIcon while preserving the icon owner', () => {
      const renderIcon = vi.fn((state: { checked: boolean; indeterminate: boolean }) => (
        <span data-testid="custom-icon" data-icon-state={state.checked ? 'checked' : state.indeterminate ? 'indeterminate' : 'unchecked'}>
          *
        </span>
      ));
      const { container } = render(<Checkbox aria-label="x" value renderIcon={renderIcon} />);
      const iconOwner = container.querySelector('[data-slot="icon"]');
      expect(iconOwner).toBeInTheDocument();
      expect(iconOwner!.className).toContain('tk-checkbox-icon');
      expect(screen.getByTestId('custom-icon')).toHaveAttribute('data-icon-state', 'checked');
    });

    it('passes the indeterminate flag to renderIcon', () => {
      render(
        <Checkbox
          aria-label="x"
          indeterminate
          renderIcon={({ checked, indeterminate }) => <span data-testid="custom-icon" data-indet={String(indeterminate)} data-checked={String(checked)} />}
        />,
      );
      const marker = screen.getByTestId('custom-icon');
      expect(marker).toHaveAttribute('data-indet', 'true');
      expect(marker).toHaveAttribute('data-checked', 'false');
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations for a default labeled checkbox', async () => {
      const { container } = render(<Checkbox label="Accept terms" />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for invalid + required state', async () => {
      const { container } = render(<Checkbox label="Accept terms" required invalid />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no a11y violations for the indeterminate state', async () => {
      const { container } = render(<Checkbox label="Select all" indeterminate />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
