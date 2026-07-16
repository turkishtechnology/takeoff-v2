import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../test-utils';
import { Field } from '../field';

import { Switch } from './index';

describe('Switch', () => {
  it('renders a switch role by default', () => {
    render(
      <Switch>
        <Switch.Indicator />
      </Switch>,
    );

    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  describe('Field context inheritance', () => {
    // Regression: the wrapper used to apply an eager `invalid = false` default
    // and forward it unconditionally, overriding Spar's
    // `invalid ?? fieldCtx?.invalid` chain — a `<Field invalid>` switch never
    // showed the invalid state. `disabled`/`readOnly`/`required` already
    // passed through; these tests lock in the full set.

    it('inherits invalid from a wrapping Field (no explicit prop)', () => {
      render(
        <Field invalid>
          <Field.Label>Alerts</Field.Label>
          <Switch>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      expect(screen.getByRole('switch')).toHaveAttribute('data-invalid', '');
    });

    it('inherits disabled from a wrapping Field', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Field disabled>
          <Field.Label>Alerts</Field.Label>
          <Switch onChange={handleChange}>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      const control = screen.getByRole('switch');
      expect(control).toHaveAttribute('data-disabled', '');

      await user.click(control);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('lets an explicit invalid prop override the Field value', () => {
      render(
        <Field invalid>
          <Field.Label>Alerts</Field.Label>
          <Switch invalid={false}>
            <Switch.Indicator />
          </Switch>
        </Field>,
      );

      expect(screen.getByRole('switch')).not.toHaveAttribute('data-invalid');
    });
  });

  describe('Standalone behavior', () => {
    it('marks itself invalid when the prop is passed directly', () => {
      render(
        <Switch invalid>
          <Switch.Indicator />
        </Switch>,
      );

      expect(screen.getByRole('switch')).toHaveAttribute('data-invalid', '');
    });

    it('toggles on click when enabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Switch onChange={handleChange}>
          <Switch.Indicator />
        </Switch>,
      );

      await user.click(screen.getByRole('switch'));
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });
});
