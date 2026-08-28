import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { Calendar, type CalendarRange } from './index';

/** August 2026 — a fixed month so day lookups never depend on "today". */
const AUGUST_2026 = new Date(2026, 7, 1);

/**
 * Days are addressed through the engine's own `data-day` ISO anchor rather than
 * by visible text: `15` appears in the leading/trailing weeks of neighbouring
 * months too, and the ISO value is the documented stable hook.
 */
const dayCell = (container: HTMLElement, iso: string): HTMLElement => {
  const cell = container.querySelector<HTMLElement>(`[data-day="${iso}"]`);
  if (!cell) throw new Error(`No day cell for ${iso}`);
  return cell;
};

const dayButton = (container: HTMLElement, iso: string): HTMLElement => {
  const button = dayCell(container, iso).querySelector<HTMLElement>('button');
  if (!button) throw new Error(`Day ${iso} has no button (disabled or hidden)`);
  return button;
};

describe('Calendar', () => {
  describe('rendering', () => {
    it('renders a month grid with the canonical root contract', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} />);

      const root = container.querySelector('.tk-calendar');
      expect(root).toBeInTheDocument();
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-size', 'base');
      // Engine-owned; asserted to prove it is not being mirrored by the wrapper.
      expect(root).toHaveAttribute('data-mode', 'single');
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('anchors every anatomy node with its data-slot', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} showWeekNumber footer="pick a day" />);

      for (const slot of [
        'root',
        'months',
        'month',
        'nav',
        'month-caption',
        'caption-label',
        'month-grid',
        'weekdays',
        'weekday',
        'weeks',
        'week',
        'week-number',
        'week-number-header',
        'day',
        'day-button',
        'footer',
      ]) {
        expect(container.querySelector(`[data-slot="${slot}"]`), `missing data-slot="${slot}"`).toBeInTheDocument();
      }
    });

    // The docs page ships these combinations as live demos, and each one moves
    // a node the `components` override map is responsible for (the nav out of
    // Months, the caption into a `<select>`, the grid into RTL order).
    it('renders the layout combinations the docs page demonstrates', () => {
      const { container } = render(
        <Calendar defaultMonth={AUGUST_2026} numberOfMonths={2} navLayout="after" captionLayout="dropdown" fixedWeeks showOutsideDays showWeekNumber dir="rtl" numerals="arab" />,
      );

      expect(container.querySelectorAll('[data-slot="month"]')).toHaveLength(2);
      expect(container.querySelector('[data-slot="nav"]')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="dropdown"]')).toBeInTheDocument();
      expect(container.querySelector('[data-slot="dropdowns"]')).toBeInTheDocument();
      expect(container.querySelectorAll('[class*="rdp-"]')).toHaveLength(0);
    });

    it('emits no engine class names — every rendered class is tk-owned', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} showWeekNumber captionLayout="dropdown" footer="f" />);

      expect(container.querySelectorAll('[class*="rdp-"]')).toHaveLength(0);
      expect(container.querySelector('.tk-calendar-day-button')).toBeInTheDocument();
    });

    it('renders the takeoff chevron glyphs in the nav buttons', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} />);

      const previous = container.querySelector('[data-slot="previous-month-button"]');
      expect(previous).toBeInTheDocument();
      expect(previous?.querySelector('[data-slot="chevron"]')).toHaveAttribute('aria-hidden', 'true');
    });

    // The docs page ships a preset row through `footer`, so the footer has to
    // take an interactive node — not just the status text the engine designed it
    // for — and drive the controlled value from it.
    it('takes interactive content in the footer', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: Date | undefined) => void>();

      const Presets = () => {
        const [value, setValue] = useState<Date | undefined>();

        return (
          <Calendar
            defaultMonth={AUGUST_2026}
            value={value}
            onValueChange={next => {
              setValue(next);
              onValueChange(next);
            }}
            footer={
              <button type="button" onClick={() => setValue(new Date(2026, 7, 25))}>
                In 2 weeks
              </button>
            }
          />
        );
      };

      const { container } = render(<Presets />);

      await user.click(screen.getByRole('button', { name: 'In 2 weeks' }));

      expect(dayCell(container, '2026-08-25')).toHaveAttribute('data-selected', 'true');
      // The preset drove the value directly, so the calendar's own callback
      // stays silent — it reports grid interaction, not every value change.
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('single mode', () => {
    it('selects a day and reports it (uncontrolled)', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} onValueChange={onValueChange} />);

      await user.click(dayButton(container, '2026-08-15'));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.lastCall?.[0]?.toDateString()).toBe(new Date(2026, 7, 15).toDateString());
      expect(dayCell(container, '2026-08-15')).toHaveAttribute('data-selected', 'true');
    });

    it('honours defaultValue and keeps the selection after a re-select', async () => {
      const user = userEvent.setup();
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} defaultValue={new Date(2026, 7, 3)} />);

      expect(dayCell(container, '2026-08-03')).toHaveAttribute('data-selected', 'true');

      await user.click(dayButton(container, '2026-08-20'));

      expect(dayCell(container, '2026-08-03')).not.toHaveAttribute('data-selected');
      expect(dayCell(container, '2026-08-20')).toHaveAttribute('data-selected', 'true');
    });

    // The regression this pins: a date picker's controlled value is `undefined`
    // until something is picked, so deciding controlled-ness from the value
    // (rather than from `value` being passed) makes the most common call site
    // silently uncontrolled — and every parent-driven change after mount is
    // dropped.
    it('follows a parent that sets the value after mounting empty', async () => {
      const user = userEvent.setup();

      const Controlled = () => {
        const [value, setValue] = useState<Date | undefined>();

        return (
          <>
            <button type="button" onClick={() => setValue(new Date(2026, 7, 9))}>
              Set from outside
            </button>
            <Calendar defaultMonth={AUGUST_2026} value={value} onValueChange={setValue} />
          </>
        );
      };

      const { container } = render(<Controlled />);

      await user.click(screen.getByRole('button', { name: 'Set from outside' }));

      expect(dayCell(container, '2026-08-09')).toHaveAttribute('data-selected', 'true');
    });

    it('does not move the selection on its own when controlled', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} value={new Date(2026, 7, 3)} onValueChange={onValueChange} />);

      await user.click(dayButton(container, '2026-08-20'));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(dayCell(container, '2026-08-03')).toHaveAttribute('data-selected', 'true');
      expect(dayCell(container, '2026-08-20')).not.toHaveAttribute('data-selected');
    });
  });

  describe('multiple mode', () => {
    it('accumulates dates', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: Date[] | undefined) => void>();
      const { container } = render(<Calendar mode="multiple" defaultMonth={AUGUST_2026} onValueChange={onValueChange} />);

      await user.click(dayButton(container, '2026-08-04'));
      await user.click(dayButton(container, '2026-08-06'));

      expect(onValueChange.mock.lastCall?.[0]).toHaveLength(2);
      expect(dayCell(container, '2026-08-04')).toHaveAttribute('data-selected', 'true');
      expect(dayCell(container, '2026-08-06')).toHaveAttribute('data-selected', 'true');
    });
  });

  describe('range mode', () => {
    it('builds a range and marks its edges with the range classes', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn<(value: CalendarRange | undefined) => void>();
      const { container } = render(<Calendar mode="range" defaultMonth={AUGUST_2026} onValueChange={onValueChange} />);

      await user.click(dayButton(container, '2026-08-10'));
      await user.click(dayButton(container, '2026-08-12'));

      const range = onValueChange.mock.lastCall?.[0];
      expect(range?.from?.getDate()).toBe(10);
      expect(range?.to?.getDate()).toBe(12);
      // Range position is the one selection state with no engine `data-*`, so
      // the wrapper's class is the styling hook.
      expect(dayCell(container, '2026-08-10').className).toContain('tk-calendar-day-range-start');
      expect(dayCell(container, '2026-08-11').className).toContain('tk-calendar-day-range-middle');
      expect(dayCell(container, '2026-08-12').className).toContain('tk-calendar-day-range-end');
    });
  });

  describe('Core restriction vocabulary', () => {
    it('disables everything before minDate and after maxDate', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} minDate={new Date(2026, 7, 10)} maxDate={new Date(2026, 7, 20)} />);

      expect(dayCell(container, '2026-08-09')).toHaveAttribute('data-disabled', 'true');
      expect(dayCell(container, '2026-08-10')).not.toHaveAttribute('data-disabled');
      expect(dayCell(container, '2026-08-20')).not.toHaveAttribute('data-disabled');
      expect(dayCell(container, '2026-08-21')).toHaveAttribute('data-disabled', 'true');
    });

    it('disables listed dates and weekdays', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} disabledDates={[new Date(2026, 7, 5)]} disabledWeekDays={[0]} />);

      expect(dayCell(container, '2026-08-05')).toHaveAttribute('data-disabled', 'true');
      // 2026-08-02 is a Sunday.
      expect(dayCell(container, '2026-08-02')).toHaveAttribute('data-disabled', 'true');
      expect(dayCell(container, '2026-08-04')).not.toHaveAttribute('data-disabled');
    });

    it('treats a non-empty allowedDates as a whitelist and an empty one as no restriction', () => {
      const whitelisted = render(<Calendar defaultMonth={AUGUST_2026} allowedDates={[new Date(2026, 7, 7)]} />);

      expect(dayCell(whitelisted.container, '2026-08-07')).not.toHaveAttribute('data-disabled');
      expect(dayCell(whitelisted.container, '2026-08-08')).toHaveAttribute('data-disabled', 'true');

      const unrestricted = render(<Calendar defaultMonth={AUGUST_2026} allowedDates={[]} />);

      expect(dayCell(unrestricted.container, '2026-08-08')).not.toHaveAttribute('data-disabled');
    });

    it('maps firstDayOfWeekIndex onto the first weekday column', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} firstDayOfWeekIndex={1} />);

      const firstWeekday = container.querySelectorAll('[data-slot="weekday"]')[0];
      expect(firstWeekday?.getAttribute('aria-label')).toBe('Monday');
    });

    it('bounds navigation with minDate/maxDate', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} minDate={AUGUST_2026} maxDate={new Date(2026, 7, 31)} />);

      expect(container.querySelector('[data-slot="previous-month-button"]')).toHaveAttribute('aria-disabled', 'true');
      expect(container.querySelector('[data-slot="next-month-button"]')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('customization surfaces', () => {
    it('lands classNames and slotProps on their own slot owner nodes', () => {
      const { container } = render(
        <Calendar
          defaultMonth={AUGUST_2026}
          className="root-extra"
          classNames={{ day: 'day-extra', monthGrid: 'grid-extra' }}
          slotProps={{ monthGrid: { 'aria-describedby': 'hint' }, day: { title: 'cell' } }}
        />,
      );

      const root = container.querySelector('[data-slot="root"]');
      expect(root).toHaveClass('tk-calendar', 'root-extra');

      const grid = container.querySelector('[data-slot="month-grid"]');
      expect(grid).toHaveClass('tk-calendar-month-grid', 'grid-extra');
      expect(grid).toHaveAttribute('aria-describedby', 'hint');

      const cell = dayCell(container, '2026-08-15');
      expect(cell).toHaveClass('tk-calendar-day', 'day-extra');
      expect(cell).toHaveAttribute('title', 'cell');
      // Engine wiring survives a slotProps neighbour.
      expect(cell).toHaveAttribute('data-day', '2026-08-15');
    });

    it('applies provider defaultProps below instance props', () => {
      const theme = { Calendar: { defaultProps: { size: 'small' as const }, classNames: { day: 'theme-day' } } };

      const inherited = render(
        <TakeoffSparProvider components={theme}>
          <Calendar defaultMonth={AUGUST_2026} />
        </TakeoffSparProvider>,
      );
      expect(inherited.container.querySelector('[data-slot="root"]')).toHaveAttribute('data-size', 'small');
      expect(dayCell(inherited.container, '2026-08-15')).toHaveClass('tk-calendar-day', 'theme-day');

      const overridden = render(
        <TakeoffSparProvider components={theme}>
          <Calendar defaultMonth={AUGUST_2026} size="base" />
        </TakeoffSparProvider>,
      );
      expect(overridden.container.querySelector('[data-slot="root"]')).toHaveAttribute('data-size', 'base');
    });

    it('keeps the day grid mounted across re-renders', async () => {
      const user = userEvent.setup();
      // Inline `classNames` / `slotProps` object literals change identity on
      // every render. The engine receives `components` as element *types*, so an
      // unstable map would remount the grid and drop focus mid-keyboard-nav.
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} classNames={{ day: 'day-extra' }} />);

      const before = dayButton(container, '2026-08-15');
      before.focus();
      await user.keyboard('{ArrowRight}');

      expect(dayButton(container, '2026-08-15')).toBe(before);
      expect(document.activeElement).toBe(dayButton(container, '2026-08-16'));
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations', async () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} defaultValue={new Date(2026, 7, 15)} />);

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
