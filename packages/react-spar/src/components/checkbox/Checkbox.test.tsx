import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../test-utils';
import { Field } from '../field';

import { Checkbox } from './index';

describe('Checkbox', () => {
  it('renders a checkbox role by default', () => {
    render(
      <Checkbox>
        <Checkbox.Indicator />
      </Checkbox>,
    );

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  describe('Field context inheritance', () => {
    // Regression: the wrapper used to apply an eager `disabled = false`
    // default and forward it unconditionally, which overrode Spar's
    // `disabled ?? fieldCtx?.disabled` chain — a `<Field disabled>` checkbox
    // stayed interactive. These tests lock the pass-through behavior in.

    it('inherits disabled from a wrapping Field (no explicit prop)', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field disabled>
          <Field.Label>Disabled option</Field.Label>
          <Checkbox onChange={handleChange}>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-disabled', 'true');
      expect(checkbox).toHaveAttribute('data-disabled', '');

      await user.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
      expect(checkbox).toHaveAttribute('aria-checked', 'false');
    });

    it('inherits invalid from a wrapping Field', () => {
      render(
        <Field invalid>
          <Field.Label>Terms</Field.Label>
          <Checkbox>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      expect(screen.getByRole('checkbox')).toHaveAttribute('data-invalid', '');
    });

    it('inherits required from a wrapping Field', () => {
      render(
        <Field required>
          <Field.Label>Booking updates</Field.Label>
          <Checkbox>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      expect(screen.getByRole('checkbox')).toHaveAttribute('data-required', '');
    });

    it('inherits readOnly from a wrapping Field', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field readOnly>
          <Field.Label>Read-only selection</Field.Label>
          <Checkbox onChange={handleChange}>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('data-readonly', '');

      await user.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('lets an explicit prop override the Field value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field disabled>
          <Field.Label>Override</Field.Label>
          <Checkbox disabled={false} onChange={handleChange}>
            <Checkbox.Indicator />
          </Checkbox>
        </Field>,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toHaveAttribute('data-disabled');

      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Standalone behavior', () => {
    it('does not respond to clicks when disabled directly', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox disabled onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('toggles on click when enabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Checkbox onChange={handleChange}>
          <Checkbox.Indicator />
        </Checkbox>,
      );

      await user.click(screen.getByRole('checkbox'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });
});
