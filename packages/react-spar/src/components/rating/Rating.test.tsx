import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';
import { Field } from '../field';

import { Rating, type RatingFill } from './index';

const fills = () => screen.getAllByRole('radio').map(item => item.getAttribute('data-fill') as RatingFill);

describe('Rating', () => {
  describe('anatomy', () => {
    it('renders a radiogroup with max default items', () => {
      const { container } = render(<Rating aria-label="Score" />);
      const root = screen.getByRole('radiogroup', { name: 'Score' });
      expect(root).toHaveClass('tk-rating');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-type', 'star');
      expect(root).toHaveAttribute('data-orientation', 'horizontal');

      const items = screen.getAllByRole('radio');
      expect(items).toHaveLength(5);
      expect(items[0]).toHaveClass('tk-rating-item');
      expect(items[0]).toHaveAccessibleName('1 of 5');
      expect(items[0]!.querySelector('.tk-rating-icon svg')).not.toBeNull();
      expect(items[0]!.querySelector('.tk-rating-icon')).toHaveAttribute('data-slot', 'icon');
      expect(container.querySelector('.tk-rating-value')).toBeNull();
    });

    it('honours max and falls back to 5 for an invalid one', () => {
      const { rerender } = render(<Rating aria-label="Score" max={10} />);
      expect(screen.getAllByRole('radio')).toHaveLength(10);
      expect(screen.getAllByRole('radio')[9]).toHaveAccessibleName('10 of 10');

      rerender(<Rating aria-label="Score" max={0} />);
      expect(screen.getAllByRole('radio')).toHaveLength(5);
    });

    it.each(['star', 'heart', 'dot'] as const)('draws the %s glyph', type => {
      const { container } = render(<Rating aria-label="Score" type={type} />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-type', type);
      expect(container.querySelectorAll('.tk-rating-icon svg')).toHaveLength(5);
    });

    it('prints the zero-padded score with showValue', () => {
      const { container } = render(<Rating aria-label="Score" showValue max={10} />);
      const values = [...container.querySelectorAll('.tk-rating-value')].map(node => node.textContent);
      expect(values[0]).toBe('01');
      expect(values[9]).toBe('10');
      expect(container.querySelector('.tk-rating-value')).toHaveAttribute('data-slot', 'value');
    });

    it('renders numbered boxes with a colour level for type="number"', () => {
      const { container } = render(<Rating aria-label="Score" type="number" showValue max={10} />);
      const items = screen.getAllByRole('radio');
      expect(items[0]).toHaveTextContent('01');
      expect(items[0]!.querySelector('svg')).toBeNull();
      expect(items.map(item => item.getAttribute('data-level'))).toEqual(['1', '1', '2', '2', '3', '3', '4', '4', '5', '5']);
      // Number items already show their score.
      expect(container.querySelector('.tk-rating-value')).toBeNull();
    });

    it('omits data-level for glyph types', () => {
      render(<Rating aria-label="Score" />);
      expect(screen.getAllByRole('radio')[0]).not.toHaveAttribute('data-level');
    });
  });

  describe('fill', () => {
    it('fills up to the value', () => {
      render(<Rating aria-label="Score" defaultValue={3} />);
      expect(fills()).toEqual(['full', 'full', 'full', 'empty', 'empty']);
      expect(screen.getAllByRole('radio')[2]).toHaveAttribute('aria-checked', 'true');
    });

    it('draws a half fill for a fractional value without checking an item', () => {
      render(<Rating aria-label="Score" value={3.5} readOnly />);
      expect(fills()).toEqual(['full', 'full', 'full', 'half', 'empty']);
      for (const item of screen.getAllByRole('radio')) {
        expect(item).toHaveAttribute('aria-checked', 'false');
      }
    });

    it('rounds a fraction under .5 down', () => {
      render(<Rating aria-label="Score" value={2.3} readOnly />);
      expect(fills()).toEqual(['full', 'full', 'empty', 'empty', 'empty']);
    });

    it('is empty without a value', () => {
      render(<Rating aria-label="Score" />);
      expect(fills()).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
    });
  });

  describe('state', () => {
    it('picks a score uncontrolled and reports it as a number', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Rating aria-label="Score" onValueChange={onValueChange} />);

      await user.click(screen.getAllByRole('radio')[3]!);
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(4);
      expect(fills()).toEqual(['full', 'full', 'full', 'full', 'empty']);
    });

    it('follows a controlled value', async () => {
      const user = userEvent.setup();
      const Controlled = () => {
        const [score, setScore] = useState(2);
        return (
          <>
            <Rating aria-label="Score" value={score} onValueChange={setScore} />
            <output>{score}</output>
          </>
        );
      };
      render(<Controlled />);

      await user.click(screen.getAllByRole('radio')[4]!);
      expect(screen.getByRole('status')).toHaveTextContent('5');
      expect(fills()).toEqual(['full', 'full', 'full', 'full', 'full']);
    });

    it('stays put when controlled without a handler', async () => {
      const user = userEvent.setup();
      render(<Rating aria-label="Score" value={2} />);
      await user.click(screen.getAllByRole('radio')[4]!);
      expect(fills()).toEqual(['full', 'full', 'empty', 'empty', 'empty']);
    });

    it('does not report the score that is already picked', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Rating aria-label="Score" defaultValue={2} onValueChange={onValueChange} />);
      await user.click(screen.getAllByRole('radio')[1]!);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('ignores a native onChange instead of handing it to Spar', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Rating aria-label="Score" onChange={() => {}} onValueChange={onValueChange} />);
      await user.click(screen.getAllByRole('radio')[0]!);
      expect(onValueChange).toHaveBeenCalledWith(1);
    });

    it('blocks picking while disabled or read-only', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { rerender } = render(<Rating aria-label="Score" disabled onValueChange={onValueChange} />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled', '');
      await user.click(screen.getAllByRole('radio')[2]!);

      rerender(<Rating aria-label="Score" readOnly onValueChange={onValueChange} />);
      expect(screen.getByRole('radiogroup')).toHaveAttribute('data-readonly', '');
      await user.click(screen.getAllByRole('radio')[2]!);
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard', () => {
    it('moves and picks with the arrow keys, Home and End', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Rating aria-label="Score" defaultValue={2} onValueChange={onValueChange} />);

      await user.tab();
      expect(screen.getAllByRole('radio')[1]).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(onValueChange).toHaveBeenLastCalledWith(3);
      await user.keyboard('{ArrowLeft}{ArrowLeft}');
      expect(onValueChange).toHaveBeenLastCalledWith(1);
      await user.keyboard('{End}');
      expect(onValueChange).toHaveBeenLastCalledWith(5);
      await user.keyboard('{Home}');
      expect(onValueChange).toHaveBeenLastCalledWith(1);
      expect(screen.getAllByRole('radio')[0]).toHaveFocus();
    });

    it('makes the first item the tab stop for a fractional value', async () => {
      const user = userEvent.setup();
      render(<Rating aria-label="Score" value={3.5} readOnly />);
      await user.tab();
      expect(screen.getAllByRole('radio')[0]).toHaveFocus();
    });
  });

  describe('forms and Field', () => {
    it('submits the picked score under its name', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <form>
          <Rating aria-label="Score" name="score" defaultValue={4} />
        </form>,
      );
      const form = container.querySelector('form') as HTMLFormElement;
      expect(new FormData(form).get('score')).toBe('4');

      await user.click(screen.getAllByRole('radio')[1]!);
      expect(new FormData(form).get('score')).toBe('2');
    });

    it('submits nothing for a fractional value', () => {
      const { container } = render(
        <form>
          <Rating aria-label="Score" name="score" value={3.5} readOnly />
        </form>,
      );
      expect(new FormData(container.querySelector('form') as HTMLFormElement).get('score')).toBeNull();
    });

    it('inherits label, disabled and invalid from a Field', () => {
      render(
        <Field disabled invalid required>
          <Field.Label>Rate your flight</Field.Label>
          <Rating />
        </Field>,
      );
      const root = screen.getByRole('radiogroup', { name: 'Rate your flight' });
      expect(root).toHaveAttribute('data-disabled', '');
      expect(root).toHaveAttribute('aria-invalid', 'true');
      expect(root).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('labels', () => {
    it('fills a custom item label template', () => {
      render(<Rating aria-label="Score" itemLabel="{value} stars out of {max}" />);
      expect(screen.getAllByRole('radio')[1]).toHaveAccessibleName('2 stars out of 5');
    });

    it('falls back to the default for a blank template', () => {
      render(<Rating aria-label="Score" itemLabel="" />);
      expect(screen.getAllByRole('radio')[0]).toHaveAccessibleName('1 of 5');
    });

    it('lets an item aria-label win', () => {
      render(
        <Rating aria-label="Score">
          <Rating.Item value={1} aria-label="Poor" />
        </Rating>,
      );
      expect(screen.getByRole('radio')).toHaveAccessibleName('Poor');
    });
  });

  describe('custom items', () => {
    it('hands the fill state to a render-prop child', () => {
      render(
        <Rating aria-label="Score" defaultValue={2}>
          {[1, 2, 3].map(value => (
            <Rating.Item key={value} value={value}>
              {({ fill, isChecked, value: score }) => <span data-testid={`custom-${score}`}>{`${fill}:${isChecked}`}</span>}
            </Rating.Item>
          ))}
        </Rating>,
      );
      expect(screen.getByTestId('custom-1')).toHaveTextContent('full:false');
      expect(screen.getByTestId('custom-2')).toHaveTextContent('full:true');
      expect(screen.getByTestId('custom-3')).toHaveTextContent('empty:false');
    });

    it('renders plain children in place of the glyph', () => {
      const { container } = render(
        <Rating aria-label="Score">
          <Rating.Item value={1}>
            <b>A</b>
          </Rating.Item>
        </Rating>,
      );
      expect(screen.getByRole('radio')).toHaveTextContent('A');
      expect(container.querySelector('.tk-rating-icon')).toBeNull();
    });

    it('disables a single item', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Rating aria-label="Score" onValueChange={onValueChange}>
          <Rating.Item value={1} disabled />
          <Rating.Item value={2} />
        </Rating>,
      );
      expect(screen.getAllByRole('radio')[0]).toHaveAttribute('aria-disabled', 'true');
      await user.click(screen.getAllByRole('radio')[0]!);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('throws outside a Rating', () => {
      expect(() => render(<Rating.Item value={1} />)).toThrow(/Rating\.Item must be used within RatingProvider/);
    });
  });

  describe('customization', () => {
    it('merges theme and instance class names and slot props', () => {
      render(
        <TakeoffSparProvider
          components={{
            Rating: { className: 'theme-root', defaultProps: { type: 'heart', showValue: true } },
            RatingItem: { classNames: { icon: 'theme-icon' }, slotProps: { value: { title: 'theme-value' } } },
          }}
        >
          <Rating aria-label="Score" className="instance-root">
            <Rating.Item value={1} classNames={{ root: 'instance-item', value: 'instance-value' }} slotProps={{ icon: { title: 'instance-icon' } }} />
          </Rating>
        </TakeoffSparProvider>,
      );
      const root = screen.getByRole('radiogroup');
      expect(root).toHaveClass('tk-rating', 'theme-root', 'instance-root');
      expect(root).toHaveAttribute('data-type', 'heart');

      const item = screen.getByRole('radio');
      expect(item).toHaveClass('tk-rating-item', 'instance-item');
      const icon = item.querySelector('.tk-rating-icon');
      expect(icon).toHaveClass('theme-icon');
      expect(icon).toHaveAttribute('title', 'instance-icon');
      const value = item.querySelector('.tk-rating-value');
      expect(value).toHaveClass('instance-value');
      expect(value).toHaveAttribute('title', 'theme-value');
    });

    it('forwards ref to the radiogroup', () => {
      let node: HTMLElement | null = null;
      render(<Rating aria-label="Score" ref={(element: HTMLDivElement | null) => void (node = element)} />);
      expect(node).toBe(screen.getByRole('radiogroup'));
    });
  });

  describe('accessibility', () => {
    it.each([
      ['default', <Rating key="a" aria-label="Score" defaultValue={3} showValue />],
      ['number', <Rating key="b" aria-label="Score" type="number" defaultValue={2} />],
      ['read-only half', <Rating key="c" aria-label="Score" value={3.5} readOnly />],
    ])('has no axe violations (%s)', async (_, element) => {
      const { container } = render(element);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
