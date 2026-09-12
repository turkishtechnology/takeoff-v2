import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';

import { renderWithProvider as render, screen } from '../../test-utils';
import { Field } from '../field';

import { Input } from './index';

const segmentLevels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.tk-input-strength > .tk-input-strength-segment')).map(segment => segment.getAttribute('data-level'));

const renderPassword = (defaultValue?: string) =>
  render(
    <Input>
      <Input.Field aria-label="Password" type="password" defaultValue={defaultValue} />
      <Input.Strength />
    </Input>,
  );

describe('Input.Strength', () => {
  describe('rendering', () => {
    it('renders four segments inside the meter root', () => {
      const { container } = renderPassword();

      const meter = container.querySelector('.tk-input-strength');
      expect(meter).toHaveAttribute('data-slot', 'root');
      expect(meter?.querySelectorAll('.tk-input-strength-segment')).toHaveLength(4);
    });

    it('leaves every segment unfilled for an empty value', () => {
      const { container } = renderPassword();

      expect(segmentLevels(container)).toEqual([null, null, null, null]);
    });
  });

  describe('grading (data-level on filled segments)', () => {
    it.each([
      // One point each for: length >= 8, uppercase, lowercase, digit, symbol.
      ['abc', ['weak', null, null, null]],
      ['!!!', ['weak', null, null, null]],
      ['abcdefgh', ['weak', 'weak', null, null]],
      ['Abc1', ['medium', 'medium', 'medium', null]],
      ['Abcdefg1', ['strong', 'strong', 'strong', 'strong']],
      // Five points, capped to the four available segments.
      ['Abcdefg1!', ['strong', 'strong', 'strong', 'strong']],
    ])('grades %j', (value, expected) => {
      const { container } = renderPassword(value);

      expect(segmentLevels(container)).toEqual(expected);
    });

    it('re-grades live as the user types and clears', async () => {
      const user = userEvent.setup();
      const { container } = renderPassword();
      const field = screen.getByLabelText('Password');

      await user.type(field, 'abc');
      expect(segmentLevels(container)).toEqual(['weak', null, null, null]);

      await user.type(field, 'D1');
      expect(segmentLevels(container)).toEqual(['medium', 'medium', 'medium', null]);

      await user.type(field, '!xyz');
      expect(segmentLevels(container)).toEqual(['strong', 'strong', 'strong', 'strong']);

      await user.clear(field);
      expect(segmentLevels(container)).toEqual([null, null, null, null]);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations inside a labelled password field', async () => {
      const { container } = render(
        <Field required>
          <Field.Label>Password</Field.Label>
          <Input>
            <Input.Field type="password" defaultValue="Abc1" />
            <Input.RevealButton />
            <Input.Strength />
          </Input>
          <Field.Description>Use 8+ characters.</Field.Description>
        </Field>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
