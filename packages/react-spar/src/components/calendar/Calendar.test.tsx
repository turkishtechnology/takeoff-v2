import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

import { TakeoffSparProvider } from '../../provider';
import { render, screen, within } from '../../test-utils';

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
      expect(root).toHaveAttribute('data-header-type', 'basic');
      expect(root).toHaveAttribute('data-view', 'day');
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

    // The value and the displayed month are separate state: the engine reads
    // the month once, at mount, and only navigation moves it afterwards. A
    // preset that lands outside the visible month therefore has to move both —
    // the pattern the docs' preset row demonstrates.
    it('follows a preset into another month through the controlled `month`', async () => {
      const user = userEvent.setup();
      const SEPTEMBER_1 = new Date(2026, 8, 1);

      const Presets = () => {
        const [value, setValue] = useState<Date | undefined>();
        const [month, setMonth] = useState(AUGUST_2026);

        return (
          <Calendar
            value={value}
            onValueChange={setValue}
            month={month}
            onMonthChange={setMonth}
            footer={
              <button
                type="button"
                onClick={() => {
                  setValue(SEPTEMBER_1);
                  setMonth(SEPTEMBER_1);
                }}
              >
                Tomorrow
              </button>
            }
          />
        );
      };

      const { container } = render(<Presets />);
      expect(screen.getByRole('grid')).toHaveAccessibleName('August 2026');

      await user.click(screen.getByRole('button', { name: 'Tomorrow' }));

      expect(screen.getByRole('grid')).toHaveAccessibleName('September 2026');
      expect(dayCell(container, '2026-09-01')).toHaveAttribute('data-selected', 'true');

      // A controlled month still pages from the header, because the engine
      // reports the move through `onMonthChange`.
      await user.click(container.querySelector('.tk-calendar-nav-next-month') as HTMLElement);
      expect(screen.getByRole('grid')).toHaveAccessibleName('October 2026');
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

    // A theme default is a fallback, not a way to force controlled mode: the
    // merged props are what the wrapper reads for everything else, so asking
    // them about controlled-ness would strand every instance under the theme
    // with no handler to advance it.
    it('treats a provider default for `value` / `view` as a fallback, not as control', async () => {
      const user = userEvent.setup();
      const theme = { Calendar: { defaultProps: { view: 'month' as const, value: new Date(2026, 7, 15) } } };

      const { container } = render(
        <TakeoffSparProvider components={theme}>
          <Calendar defaultMonth={AUGUST_2026} />
        </TakeoffSparProvider>,
      );

      // The default chose the opening board and the initial value…
      expect(screen.getByRole('grid')).toHaveAccessibleName('Choose the Month, 2026');

      // …and neither is stuck there.
      await user.click(screen.getByRole('gridcell', { name: 'September 2026' }));
      expect(screen.getByRole('grid')).toHaveAccessibleName('September 2026');

      await user.click(dayCell(container, '2026-09-03').querySelector('button') as HTMLElement);
      expect(dayCell(container, '2026-09-03')).toHaveAttribute('data-selected', 'true');
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

  describe('month and year panels', () => {
    const openPanel = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
      await user.click(screen.getByRole('button', { name: new RegExp(name) }));
      return screen.getByRole('grid');
    };

    it('swaps the day grid for a month board and drills back down to days', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={AUGUST_2026} />);

      const grid = await openPanel(user, 'Choose the Month');
      expect(grid).toHaveAccessibleName('Choose the Month, 2026');
      expect(within(grid).getAllByRole('gridcell')).toHaveLength(12);
      expect(within(grid).getByRole('gridcell', { name: 'August 2026' })).toHaveAttribute('aria-selected', 'true');

      await user.click(within(grid).getByRole('gridcell', { name: 'March 2026' }));

      expect(screen.getByRole('grid')).toHaveAccessibleName('March 2026');
      expect(screen.getByRole('button', { name: /Choose the Month/ })).toHaveTextContent('March');
    });

    it('pages years twelve at a time and drills a picked year into its months', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={AUGUST_2026} />);

      const grid = await openPanel(user, 'Choose the Year');
      expect(grid).toHaveAccessibleName('Choose the Year, 2016–2027');

      await user.click(within(grid).getByRole('gridcell', { name: '2019' }));

      expect(screen.getByRole('grid')).toHaveAccessibleName('Choose the Month, 2019');
    });

    it('gives the board one tab stop and moves focus with the arrow keys', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={AUGUST_2026} />);

      const grid = await openPanel(user, 'Choose the Month');
      const cells = within(grid).getAllByRole('gridcell');

      // The board opens focused on the displayed month, and it is the only stop.
      expect(cells.filter(cell => cell.getAttribute('tabindex') === '0')).toEqual([cells[7]]);
      cells[7].focus();

      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(cells[8]);

      // Four columns, so a vertical step is four cells.
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(cells[4]);

      await user.keyboard('{Home}');
      expect(document.activeElement).toBe(cells[4]);

      await user.keyboard('{End}');
      expect(document.activeElement).toBe(cells[7]);

      // Not past the edges.
      await user.keyboard('{ArrowRight}{ArrowRight}');
      expect(document.activeElement).toBe(cells[9]);
    });

    it('hands focus back to the trigger once a month is picked', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={AUGUST_2026} />);

      const grid = await openPanel(user, 'Choose the Month');
      await user.click(within(grid).getByRole('gridcell', { name: 'May 2026' }));

      expect(document.activeElement).toBe(screen.getByRole('button', { name: /Choose the Month/ }));
    });

    // A board that was never opened by a click has no trigger recorded, so the
    // one it belongs to has to be found rather than remembered.
    it('hands focus to the caption for a board it did not open itself', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={AUGUST_2026} defaultView="month" />);

      await user.click(screen.getByRole('gridcell', { name: 'September 2026' }));

      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'September, Choose the Month' }));
    });

    it('disables the cells outside minDate and maxDate', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={AUGUST_2026} minDate={new Date(2026, 5, 1)} maxDate={new Date(2026, 8, 30)} />);

      const grid = await openPanel(user, 'Choose the Month');

      expect(within(grid).getByRole('gridcell', { name: 'June 2026' })).toBeEnabled();
      expect(within(grid).getByRole('gridcell', { name: 'May 2026' })).toBeDisabled();
      expect(within(grid).getByRole('gridcell', { name: 'October 2026' })).toBeDisabled();
    });

    // `focus()` on a disabled button does nothing, so a key that aims at one
    // would leave the board looking stuck and eat the keypress on the way.
    it('steps arrow and Home/End over the cells that cannot take focus', async () => {
      const user = userEvent.setup();
      const keydown = vi.fn<(defaultPrevented: boolean) => void>();
      render(
        <div onKeyDown={event => keydown(event.defaultPrevented)}>
          <Calendar defaultMonth={AUGUST_2026} minDate={new Date(2026, 5, 1)} maxDate={new Date(2026, 8, 30)} defaultView="month" />
        </div>,
      );

      const cells = within(screen.getByRole('grid')).getAllByRole('gridcell');
      cells[7].focus();

      // The row starts at May, which is out of bounds — Home lands on June.
      await user.keyboard('{Home}');
      expect(document.activeElement).toBe(cells[5]);

      // Nothing above June can be focused, so the board stays put and leaves
      // the key to the page instead of swallowing it.
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(cells[5]);
      expect(keydown).toHaveBeenLastCalledWith(false);
    });

    // The wrapper writes labels the engine has no formatter for, and they have
    // to read like the caption the engine writes right next to them.
    it('formats its own labels through the engine, not a bare Intl', () => {
      const { rerender } = render(<Calendar defaultMonth={AUGUST_2026} numerals="arab" formatters={{ formatMonthDropdown: () => 'AY' }} />);

      expect(screen.getByRole('button', { name: 'AY, Choose the Month' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '٢٠٢٦, Choose the Year' })).toBeInTheDocument();

      // `Intl` reads `ar-SA` as the Hijri calendar and would name a month the
      // Gregorian grid underneath is not showing.
      rerender(<Calendar defaultMonth={AUGUST_2026} locale={{ code: 'ar-SA' }} />);

      expect(screen.getByRole('button', { name: 'August, Choose the Month' })).toBeInTheDocument();
    });

    // `view` is not `value`: a board is always one of three, so an optional
    // prop forwarded on as `undefined` must read as "not controlled" rather
    // than as "controlled, on no board".
    it('treats `view={undefined}` as uncontrolled', async () => {
      const user = userEvent.setup();
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} view={undefined} />);

      expect(container.querySelector('.tk-calendar')).toHaveAttribute('data-view', 'day');
      expect(screen.getByRole('grid')).toHaveAccessibleName('August 2026');

      await user.click(screen.getByRole('button', { name: /Choose the Month/ }));

      expect(screen.getByRole('grid')).toHaveAccessibleName('Choose the Month, 2026');
    });

    // Picking a cell is navigation, so a board under `disableNavigation` must
    // not offer cells that quietly do nothing — nor a tab stop on one, nor a
    // trigger that opens another such board.
    it('disables the board cells under `disableNavigation`', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={AUGUST_2026} disableNavigation defaultView="month" />);

      const cells = within(screen.getByRole('grid')).getAllByRole('gridcell');

      expect(cells.every(cell => cell.hasAttribute('disabled'))).toBe(true);
      expect(cells.some(cell => cell.getAttribute('tabindex') === '0')).toBe(false);

      // No way in…
      const year = screen.getByRole('button', { name: /Choose the Year/ });
      expect(year).toHaveAttribute('aria-disabled', 'true');
      await user.click(year);
      expect(screen.getByRole('grid')).toHaveAccessibleName('Choose the Month, 2026');

      // …but the board this one opened on stays closable, or it traps the body.
      const month = screen.getByRole('button', { name: /Choose the Month/ });
      expect(month).not.toHaveAttribute('aria-disabled');
      await user.click(month);
      expect(screen.getByRole('grid')).toHaveAccessibleName('August 2026');
    });

    // `reverseMonths` reverses the engine's month array, but `goToMonth` still
    // moves the chronologically first month — which is the one the board is.
    it('anchors the board on the first month even under `reverseMonths`', () => {
      render(<Calendar defaultMonth={AUGUST_2026} numberOfMonths={2} reverseMonths />);

      expect(screen.getByRole('button', { name: 'August, Choose the Month' })).toBeInTheDocument();
      expect(screen.getByText('September 2026')).toBeInTheDocument();
    });

    // The engine renders the arrows itself in this layout and never asks for
    // `Nav`, so the board stepping has to be grafted onto its own buttons.
    it('steps the year board from the arrows `navLayout="around"` renders itself', async () => {
      const user = userEvent.setup();
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} navLayout="around" defaultView="year" />);

      const previous = container.querySelector('.tk-calendar-nav-previous-month') as HTMLElement;
      expect(previous).toHaveAttribute('aria-label', '2025');

      await user.click(previous);

      expect(
        within(screen.getByRole('grid'))
          .getAllByRole('gridcell')
          .find(cell => cell.getAttribute('aria-selected') === 'true'),
      ).toHaveTextContent('2025');
    });

    // The year pair borrowed the month pair's slot attrs while it rendered
    // through `components.PreviousMonthButton`.
    it('keeps each arrow on its own slotProps', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} slotProps={{ previousMonthButton: { title: 'a month back' } }} />);

      expect(container.querySelector('.tk-calendar-nav-previous-month')).toHaveAttribute('title', 'a month back');
      expect(container.querySelector('.tk-calendar-nav-previous-year')).not.toHaveAttribute('title');
    });

    // Drilling down hands the board to the month trigger, so the focus that
    // comes back on the way out belongs to it too.
    it('returns focus to the month trigger after drilling down from a year', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={AUGUST_2026} />);

      // Opened from the year trigger, so that is what was recorded — and the
      // drill-down is what has to hand the board over.
      await user.click(screen.getByRole('button', { name: /Choose the Year/ }));
      await user.click(screen.getByRole('gridcell', { name: '2025' }));
      await user.click(screen.getByRole('gridcell', { name: 'May 2025' }));

      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'May, Choose the Month' }));
    });

    it('closes a board on Escape and hands its trigger the focus back', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={AUGUST_2026} />);

      await user.click(screen.getByRole('button', { name: /Choose the Month/ }));
      await user.keyboard('{Escape}');

      expect(screen.getByRole('grid')).toHaveAccessibleName('August 2026');
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /Choose the Month/ }));
    });

    it('opens on the board `defaultView` names', () => {
      render(<Calendar defaultMonth={AUGUST_2026} defaultView="year" />);

      expect(screen.getByRole('grid')).toHaveAccessibleName('Choose the Year, 2016–2027');
    });

    it('reports every board change and follows a controlled `view`', async () => {
      const user = userEvent.setup();
      const onViewChange = vi.fn();
      const { rerender } = render(<Calendar defaultMonth={AUGUST_2026} view="day" onViewChange={onViewChange} />);

      await user.click(screen.getByRole('button', { name: /Choose the Month/ }));

      // Controlled: the parent decides, so the body has not moved yet.
      expect(onViewChange).toHaveBeenCalledWith('month');
      expect(screen.getByRole('grid')).toHaveAccessibleName('August 2026');

      rerender(<Calendar defaultMonth={AUGUST_2026} view="month" onViewChange={onViewChange} />);

      expect(screen.getByRole('grid')).toHaveAccessibleName('Choose the Month, 2026');
    });

    it('renders one board no matter how many months are displayed', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} numberOfMonths={2} defaultView="month" />);

      expect(container.querySelectorAll('[data-slot="month-year-grid"]')).toHaveLength(1);
      expect(screen.getAllByRole('grid')).toHaveLength(1);
    });

    // One board, so one caption can open it: the trailing months keep the
    // engine's label — of their own month, not a repeat of the first.
    it('gives every displayed month its own caption and the triggers to the first', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} numberOfMonths={2} />);

      expect(screen.getByRole('button', { name: 'August, Choose the Month' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2026, Choose the Year' })).toBeInTheDocument();
      expect(container.querySelectorAll('[data-slot="caption-trigger"]')).toHaveLength(2);

      expect(screen.getByText('September 2026')).toBeInTheDocument();
    });

    it('takes its accessible names from the engine labels, so they translate', async () => {
      const user = userEvent.setup();
      render(<Calendar defaultMonth={AUGUST_2026} labels={{ labelMonthDropdown: () => 'Ay seçin' }} />);

      const grid = await openPanel(user, 'Ay seçin');

      expect(grid).toHaveAccessibleName('Ay seçin, 2026');
    });

    it('pages the year with the double chevrons', async () => {
      const user = userEvent.setup();
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} />);

      await user.click(container.querySelector('.tk-calendar-nav-next-year') as HTMLElement);

      expect(screen.getByRole('button', { name: /Choose the Year/ })).toHaveTextContent('2027');
      expect(screen.getByRole('button', { name: /Choose the Month/ })).toHaveTextContent('August');
    });

    it('steps the year board a year at a time, and a whole page with the double chevrons', async () => {
      const user = userEvent.setup();
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} defaultView="year" />);

      const selected = () =>
        within(screen.getByRole('grid'))
          .getAllByRole('gridcell')
          .find(cell => cell.getAttribute('aria-selected') === 'true');

      await user.click(container.querySelector('.tk-calendar-nav-next-month') as HTMLElement);
      expect(selected()).toHaveTextContent('2027');

      await user.click(container.querySelector('.tk-calendar-nav-previous-month') as HTMLElement);
      expect(selected()).toHaveTextContent('2026');

      await user.click(container.querySelector('.tk-calendar-nav-next-year') as HTMLElement);
      expect(screen.getByRole('grid')).toHaveAccessibleName('Choose the Year, 2028–2039');
    });

    // The engine renders the nav inside a month under `after` and `around`, so
    // a board must not take the extra months down with it.
    it('keeps the navigation while a board is open, however many months are displayed', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} numberOfMonths={2} navLayout="after" defaultView="month" />);

      expect(container.querySelector('[data-slot="nav"]')).toBeInTheDocument();
      expect(container.querySelector('.tk-calendar-nav-next-month')).toBeInTheDocument();
      expect(container.querySelectorAll('[data-slot="month"]')).toHaveLength(1);
    });

    // Every arrow is named after what it lands on, and is live while anything
    // it would land on is in range — `goToMonth` clamps the rest.
    it('names and bounds each arrow by what it steps', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} minDate={new Date(2015, 5, 1)} defaultView="year" />);

      const previousYear = container.querySelector('.tk-calendar-nav-previous-month') as HTMLElement;
      const previousPage = container.querySelector('.tk-calendar-nav-previous-year') as HTMLElement;

      // On the year board the single arrows step a year, not a month.
      expect(previousYear).toHaveAttribute('aria-label', '2025');
      expect(previousPage).toHaveAttribute('aria-label', '2004–2015');

      // June 2015 onwards is in range, so the page holding 2015 is reachable
      // even though the month the arrow steps to (August 2014) is not.
      expect(previousPage).not.toHaveAttribute('aria-disabled');
    });

    it('marks the wrapper-owned arrows disabled under `disableNavigation`', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} disableNavigation />);

      expect(container.querySelector('.tk-calendar-nav-previous-year')).toHaveAttribute('aria-disabled', 'true');
      expect(container.querySelector('.tk-calendar-nav-previous-month')).toHaveAttribute('aria-disabled', 'true');
    });

    it('leaves the caption and the year arrows to the engine under a dropdown layout, but still shows the boards', () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} captionLayout="dropdown" defaultView="month" />);

      expect(screen.queryByRole('button', { name: /Choose the Month/ })).not.toBeInTheDocument();
      expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
      expect(screen.getByRole('grid')).toHaveAccessibleName('Choose the Month, 2026');
      // The year `<select>` already navigates years, so the double chevrons go.
      expect(container.querySelector('.tk-calendar-nav-next-year')).not.toBeInTheDocument();
      expect(container.querySelector('.tk-calendar-nav-next-month')).toBeInTheDocument();
    });

    it('has no a11y violations while a board is open', async () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} defaultView="month" />);

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('accessibility', () => {
    it('has no a11y violations', async () => {
      const { container } = render(<Calendar defaultMonth={AUGUST_2026} defaultValue={new Date(2026, 7, 15)} />);

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
