import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { waitFor } from '@testing-library/dom';

import { renderWithProvider as render, screen, within } from '../../test-utils';

import { Field } from '../field';

import { TimePicker } from './index';
import { resetTimePickerDevWarnings } from './TimePicker';
import type { TimePickerProps } from './types';

// Every case pins the emitted day so an assertion reads the time alone; the
// component only ever rewrites the hour/minute/second of the day it was given.
const DAY = new Date(2026, 8, 1);
const at = (hour: number, minute: number, second = 0) => new Date(2026, 8, 1, hour, minute, second);

/** The composed toggle placement: the part lives in the header, as the design has it. */
const TogglePanel = (props: TimePickerProps) => (
  <TimePicker referenceDate={DAY} timeFormat="12" meridiem="toggle" aria-label="Timer" {...props}>
    <TimePicker.Header>
      <TimePicker.Meridiem />
    </TimePicker.Header>
    <TimePicker.Body />
  </TimePicker>
);

const Panel = (props: TimePickerProps) => (
  <TimePicker referenceDate={DAY} aria-label="Timer" {...props}>
    <TimePicker.Header>
      <h5>Timer</h5>
    </TimePicker.Header>
    <TimePicker.Body />
    <TimePicker.Footer>
      <button type="button">Continue</button>
    </TimePicker.Footer>
  </TimePicker>
);

// The missing-toggle warning dedupes through a module-level flag, so one case
// would otherwise silence the next.
beforeEach(resetTimePickerDevWarnings);

const column = (unit: string) => screen.getByRole('spinbutton', { name: unit });

const cells = (unit: string) => Array.from(column(unit).querySelectorAll<HTMLElement>('[data-slot="value"]'));

/** The middle cell of a column — the one the selection band sits behind. */
const selectedCell = (unit: string) => column(unit).querySelector('[data-slot="value"][data-selected]');

describe('TimePicker (compound)', () => {
  describe('rendering', () => {
    it('renders the panel anatomy with its canonical slots', () => {
      const { container } = render(<Panel defaultValue={at(10, 45)} />);

      expect(container.querySelector('.tk-timepicker[data-slot="root"]')).toBeInTheDocument();
      expect(container.querySelector('.tk-timepicker-header[data-slot="root"]')).toBeInTheDocument();
      expect(container.querySelector('.tk-timepicker-body[data-slot="root"]')).toBeInTheDocument();
      expect(container.querySelector('.tk-timepicker-footer[data-slot="root"]')).toBeInTheDocument();
      expect(container.querySelector('.tk-timepicker-highlight[data-slot="highlight"]')).toBeInTheDocument();
    });

    it('emits the variant hooks and defaults to a 24-hour column body', () => {
      const { container } = render(<Panel defaultValue={at(10, 45)} />);
      const root = container.querySelector('.tk-timepicker') as HTMLElement;

      expect(root).toHaveAttribute('data-mode', 'columns');
      expect(root).toHaveAttribute('data-type', 'basic');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).toHaveAttribute('data-time-format', '24');
      expect(root).toHaveAttribute('role', 'group');
      expect(container.querySelector('.tk-timepicker-body')).toHaveAttribute('data-mode', 'columns');
    });

    it('reflects the panel treatment on the root', () => {
      const { container, rerender } = render(<Panel defaultValue={at(10, 45)} />);
      expect(container.querySelector('.tk-timepicker')).toHaveAttribute('data-type', 'basic');

      for (const type of ['divided', 'light', 'dark', 'primary'] as const) {
        rerender(<Panel defaultValue={at(10, 45)} type={type} />);
        expect(container.querySelector('.tk-timepicker')).toHaveAttribute('data-type', type);
      }
    });

    it('reflects the column scale on the root', () => {
      const { container } = render(<Panel defaultValue={at(10, 45)} size="small" />);
      expect(container.querySelector('.tk-timepicker')).toHaveAttribute('data-size', 'small');
    });

    it('shows one column per unit, hour and minute only by default', () => {
      render(<Panel defaultValue={at(10, 45)} />);

      expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
      expect(selectedCell('Hour')).toHaveTextContent('10');
      expect(selectedCell('Minute')).toHaveTextContent('45');
    });

    it('adds a seconds column on `showSeconds` and an AM/PM column on the 12-hour clock', () => {
      render(<Panel defaultValue={at(13, 45, 30)} showSeconds timeFormat="12" />);

      expect(screen.getAllByRole('spinbutton')).toHaveLength(4);
      // 13:45:30 reads as 01:45:30 PM on a twelve-hour clock.
      expect(selectedCell('Hour')).toHaveTextContent('01');
      expect(selectedCell('Second')).toHaveTextContent('30');
      expect(selectedCell('AM/PM')).toHaveTextContent('PM');
    });

    it('renders the value with its neighbours, blanking the cell past either end', () => {
      render(<Panel defaultValue={at(0, 45)} />);

      const hours = cells('Hour');
      expect(hours).toHaveLength(3);
      // Midnight is the first hour of a 24-hour column, so nothing sits above it.
      expect(hours[0]).toHaveAttribute('data-blank');
      expect(hours[1]).toHaveTextContent('00');
      expect(hours[2]).toHaveTextContent('01');
    });

    it('marks the root empty until something is picked', async () => {
      const user = userEvent.setup();
      const { container } = render(<Panel />);
      const root = container.querySelector('.tk-timepicker') as HTMLElement;

      expect(root).toHaveAttribute('data-empty');
      // The reference day's midnight is what an untouched panel shows.
      expect(selectedCell('Hour')).toHaveTextContent('00');

      await user.click(within(column('Hour')).getByText('01'));

      expect(root).not.toHaveAttribute('data-empty');
    });
  });

  describe('selection', () => {
    it('commits a neighbouring cell click on the reference day', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel defaultValue={at(10, 45)} onValueChange={onValueChange} />);

      await user.click(within(column('Hour')).getByText('11'));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(at(11, 45));
    });

    it('keeps the day of the value it was given', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel defaultValue={new Date(2031, 0, 20, 10, 45)} onValueChange={onValueChange} />);

      await user.click(within(column('Minute')).getByText('46'));

      expect(onValueChange).toHaveBeenCalledWith(new Date(2031, 0, 20, 10, 46));
    });

    it('steps with the arrows drawn above and below the column', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(<Panel defaultValue={at(10, 45)} onValueChange={onValueChange} />);

      const hourColumn = container.querySelector('[data-slot="column"][data-unit="hour"]') as HTMLElement;
      await user.click(hourColumn.querySelector('[data-slot="previous-trigger"]') as HTMLElement);

      expect(onValueChange).toHaveBeenLastCalledWith(at(9, 45));
    });

    it('tracks a controlled value and reports every change', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { rerender } = render(<Panel value={at(10, 45)} onValueChange={onValueChange} />);

      await user.click(within(column('Hour')).getByText('11'));

      // Controlled: the panel does not move itself.
      expect(selectedCell('Hour')).toHaveTextContent('10');
      expect(onValueChange).toHaveBeenCalledWith(at(11, 45));

      rerender(<Panel value={at(11, 45)} onValueChange={onValueChange} />);
      expect(selectedCell('Hour')).toHaveTextContent('11');
    });

    it('stays controlled when the value starts undefined', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel value={undefined} onValueChange={onValueChange} />);

      await user.click(within(column('Hour')).getByText('01'));

      expect(onValueChange).toHaveBeenCalledWith(at(1, 0));
      // A `value` prop that was passed — even as undefined — owns the state.
      expect(selectedCell('Hour')).toHaveTextContent('00');
    });

    it('moves the value on the twelve-hour clock without leaving the half-day', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel defaultValue={at(13, 45)} timeFormat="12" onValueChange={onValueChange} />);

      await user.click(within(column('Hour')).getByText('02'));
      expect(onValueChange).toHaveBeenLastCalledWith(at(14, 45));

      // Uncontrolled, so the panel is on 14:45 by now; the toggle keeps the
      // hour and swaps the half-day.
      await user.click(within(column('AM/PM')).getByText('AM'));
      expect(onValueChange).toHaveBeenLastCalledWith(at(2, 45));
    });
  });

  describe('keyboard', () => {
    it('selects the value drawn above with ArrowUp and below with ArrowDown', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel defaultValue={at(10, 45)} onValueChange={onValueChange} />);

      await user.tab();
      expect(column('Hour')).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(onValueChange).toHaveBeenLastCalledWith(at(9, 45));

      await user.keyboard('{ArrowDown}{ArrowDown}');
      expect(onValueChange).toHaveBeenLastCalledWith(at(11, 45));
    });

    it('jumps by five with PageUp / PageDown and to the ends with Home / End', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel defaultValue={at(10, 45)} onValueChange={onValueChange} />);

      await user.tab();
      await user.keyboard('{PageDown}');
      expect(onValueChange).toHaveBeenLastCalledWith(at(15, 45));

      await user.keyboard('{Home}');
      expect(onValueChange).toHaveBeenLastCalledWith(at(0, 45));

      await user.keyboard('{End}');
      expect(onValueChange).toHaveBeenLastCalledWith(at(23, 45));
    });

    it('gives each unit exactly one tab stop', async () => {
      const user = userEvent.setup();
      render(<Panel defaultValue={at(10, 45)} showSeconds />);

      await user.tab();
      expect(column('Hour')).toHaveFocus();
      await user.tab();
      expect(column('Minute')).toHaveFocus();
      await user.tab();
      expect(column('Second')).toHaveFocus();
    });
  });

  describe('steps and bounds', () => {
    it('offers only the values on the step grid', () => {
      render(<Panel defaultValue={at(10, 30)} minuteStep={15} />);

      const minutes = cells('Minute').map(cell => cell.textContent);
      expect(minutes).toEqual(['15', '30', '45']);
    });

    it('splices an off-grid value into the column that shows it', () => {
      render(<Panel defaultValue={at(10, 7)} minuteStep={15} />);

      // 07 is not on a fifteen-minute grid, but it is the value being shown, so
      // the column has a cell for it and its neighbours read from around it.
      expect(cells('Minute').map(cell => cell.textContent)).toEqual(['00', '07', '15']);
    });

    it('disables the cells the bounds forbid', () => {
      render(<Panel defaultValue={at(10, 45)} minTime={at(10, 0)} maxTime={at(11, 0)} />);

      const hours = cells('Hour');
      expect(hours[0]).toHaveTextContent('09');
      expect(hours[0]).toHaveAttribute('data-disabled');
      expect(hours[2]).toHaveTextContent('11');
      expect(hours[2]).not.toHaveAttribute('data-disabled');
    });

    it('judges an hour by whether any minute inside it is in bounds', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel defaultValue={at(10, 45)} maxTime={at(11, 15)} onValueChange={onValueChange} />);

      // 11:45 is past the ceiling, but the hour 11 is reachable — picking it
      // pulls the minutes down to the bound rather than blocking the move.
      await user.click(within(column('Hour')).getByText('11'));

      expect(onValueChange).toHaveBeenCalledWith(at(11, 15));
    });

    it('opens on the floor rather than on a time the bounds forbid', () => {
      render(<Panel minTime={at(9, 30)} />);

      expect(selectedCell('Hour')).toHaveTextContent('09');
      expect(selectedCell('Minute')).toHaveTextContent('30');
    });

    it('ignores the date part of a bound', () => {
      // A bound is a time of day: this one reads as 11:00 even though its date
      // is years away from the value's.
      render(<Panel defaultValue={at(10, 45)} maxTime={new Date(1999, 0, 1, 11, 0)} />);

      expect(cells('Hour')[2]).not.toHaveAttribute('data-disabled');
    });
  });

  describe('meridiem placement', () => {
    it('gives AM/PM a column by default', () => {
      render(<Panel defaultValue={at(13, 45)} timeFormat="12" />);

      expect(screen.getByRole('spinbutton', { name: 'AM/PM' })).toBeInTheDocument();
      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    });

    it('lifts it into a composed segmented control on `meridiem="toggle"`', () => {
      render(
        <TimePicker referenceDate={DAY} defaultValue={at(13, 45)} timeFormat="12" meridiem="toggle" aria-label="Timer">
          <TimePicker.Header>
            <TimePicker.Meridiem />
          </TimePicker.Header>
          <TimePicker.Body />
        </TimePicker>,
      );

      // The column is gone; the hours and minutes keep theirs.
      expect(screen.queryByRole('spinbutton', { name: 'AM/PM' })).not.toBeInTheDocument();
      expect(screen.getAllByRole('spinbutton')).toHaveLength(2);

      const group = screen.getByRole('radiogroup', { name: 'AM/PM' });
      expect(within(group).getByRole('radio', { name: 'PM' })).toBeChecked();
      expect(within(group).getByRole('radio', { name: 'AM' })).not.toBeChecked();
    });

    it('is one tab stop, landing on the chosen half-day', async () => {
      const user = userEvent.setup();
      render(<TogglePanel defaultValue={at(13, 45)} />);

      await user.tab();
      expect(screen.getByRole('radio', { name: 'PM' })).toHaveFocus();
      expect(screen.getByRole('radio', { name: 'AM' })).toHaveAttribute('tabindex', '-1');
    });

    it('switches the half-day from the arrows and from a click, keeping the hour', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<TogglePanel value={at(13, 45)} onValueChange={onValueChange} />);

      await user.tab();
      await user.keyboard('{ArrowLeft}');
      expect(onValueChange).toHaveBeenLastCalledWith(at(1, 45));

      await user.click(screen.getByRole('radio', { name: 'AM' }));
      expect(onValueChange).toHaveBeenLastCalledWith(at(1, 45));
    });

    it('renders nothing on a 24-hour clock, which has no meridiem to place', () => {
      render(<TogglePanel defaultValue={at(13, 45)} timeFormat="24" />);

      expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
      expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    });

    it('serves the dial body the same way', () => {
      const { container } = render(<TogglePanel mode="dial" defaultValue={at(13, 45)} />);

      expect(screen.getByRole('radiogroup', { name: 'AM/PM' })).toBeInTheDocument();
      expect(container.querySelectorAll('[data-slot="input"]')).toHaveLength(2);
    });

    it('warns when the toggle is asked for but never composed', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<Panel defaultValue={at(13, 45)} timeFormat="12" meridiem="toggle" />);

      // The check waits a task so a composed part has time to register.
      await waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringContaining('TimePicker.Meridiem')));
      warn.mockRestore();
    });

    it('stays quiet when the toggle is composed', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <TimePicker referenceDate={DAY} aria-label="Timer" defaultValue={at(13, 45)} timeFormat="12" meridiem="toggle">
          <TimePicker.Header>
            <TimePicker.Meridiem />
          </TimePicker.Header>
          <TimePicker.Body />
        </TimePicker>,
      );

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  describe('the step grid and the read-only group', () => {
    it('locks the dial marks the step does not offer', async () => {
      const user = userEvent.setup();
      const { container } = render(<Panel mode="dial" defaultValue={at(10, 45)} minuteStep={15} />);

      // The dial edits whichever field is active, so hand it the minutes.
      await user.click(screen.getByRole('spinbutton', { name: 'Minute' }));

      // The face still draws all twelve marks — it is a clock, not a grid — but
      // only 00/15/30/45 are on the step.
      const marks = [...container.querySelectorAll<HTMLButtonElement>('[data-slot="dial-number"]')];
      expect(marks).toHaveLength(12);
      expect(marks.filter(mark => !mark.disabled).map(mark => mark.textContent)).toEqual(['00', '15', '30', '45']);
    });

    it('keeps the read-only toggle in the tab order', async () => {
      const user = userEvent.setup();
      render(<TogglePanel defaultValue={at(13, 45)} readOnly />);

      const pm = screen.getByRole('radio', { name: 'PM' });
      // Read-only is not disabled: the value still has to be reachable and
      // announceable, it just cannot be changed.
      expect(pm).toBeEnabled();
      expect(pm).toHaveAttribute('tabindex', '0');

      pm.focus();
      await user.keyboard('{ArrowLeft}');
      expect(pm).toBeChecked();
    });

    it('moves focus with the selection inside the toggle', async () => {
      const user = userEvent.setup();
      render(<TogglePanel defaultValue={at(13, 45)} />);

      const am = screen.getByRole('radio', { name: 'AM' });
      screen.getByRole('radio', { name: 'PM' }).focus();
      await user.keyboard('{ArrowLeft}');

      // The tab stop roves to whichever radio is checked, so focus has to go
      // with it or the group's one stop sits on an element nobody is on.
      expect(am).toBeChecked();
      expect(am).toHaveFocus();
    });
  });

  describe('the twelve-hour clock reads chronologically', () => {
    it('runs its hour column from 12 rather than to it', () => {
      render(<Panel defaultValue={at(15, 0)} timeFormat="12" />);

      // Midnight and noon print as `12` but come first in the half-day, so the
      // column has to open on them — everything ordered reads it that way.
      expect(cells('Hour').map(cell => cell.textContent)).toEqual(['02', '03', '04']);
      expect(column('Hour')).toHaveAttribute('aria-valuemin', '12');
      expect(column('Hour')).toHaveAttribute('aria-valuemax', '11');
    });

    it('sends Home to noon and End to eleven', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel value={at(15, 0)} timeFormat="12" onValueChange={onValueChange} />);

      column('Hour').focus();
      await user.keyboard('{Home}');
      expect(onValueChange).toHaveBeenLastCalledWith(at(12, 0));

      await user.keyboard('{End}');
      expect(onValueChange).toHaveBeenLastCalledWith(at(23, 0));
    });

    it('steps the same hours a 24-hour clock steps', () => {
      const { rerender } = render(<Panel defaultValue={at(0, 0)} timeFormat="12" hourStep={3} />);
      expect(cells('Hour').map(cell => cell.textContent)).toEqual([null, '12', '03'].map(text => text ?? ''));

      // The same grid, printed the other way: 0, 3, 6, 9 either side of noon.
      rerender(<Panel defaultValue={at(0, 0)} timeFormat="24" hourStep={3} />);
      expect(cells('Hour').map(cell => cell.textContent)).toEqual(['', '00', '03']);
    });

    it('keeps both halves of the day reachable under a bound', () => {
      render(<TogglePanel defaultValue={at(10, 0)} minTime={at(10, 0)} />);

      // 10 and 11 AM are inside the bound, so the morning has to stay pickable.
      const am = screen.getByRole('radio', { name: 'AM' });
      expect(am).toBeEnabled();
    });
  });

  describe('form integration', () => {
    it('submits nothing without a name, and HH:mm with one', () => {
      const { container, rerender } = render(<Panel defaultValue={at(10, 45)} />);
      expect(container.querySelector('input[type="hidden"]')).not.toBeInTheDocument();

      rerender(<Panel defaultValue={at(10, 45)} name="departure" />);
      const field = container.querySelector('input[type="hidden"]') as HTMLInputElement;
      expect(field).toHaveAttribute('name', 'departure');
      expect(field.value).toBe('10:45');
    });

    it('adds the seconds to the submitted value only when they are shown', () => {
      const { container } = render(<Panel defaultValue={at(10, 45, 30)} name="departure" showSeconds />);
      expect(container.querySelector('input[type="hidden"]')).toHaveValue('10:45:30');
    });

    it('leaves the seconds off a body that never renders them', () => {
      // The dial has two fields and no seconds hand, so `showSeconds` renders
      // nothing there — submitting a frozen, uneditable `:30` would post a value
      // the picker never offered.
      const { container } = render(<Panel mode="dial" defaultValue={at(10, 45, 30)} name="departure" showSeconds />);
      expect(container.querySelector('input[type="hidden"]')).toHaveValue('10:45');
    });

    it('submits an empty value until something is picked', () => {
      const { container } = render(<Panel name="departure" />);
      expect(container.querySelector('input[type="hidden"]')).toHaveValue('');
    });
  });

  describe('unavailable times', () => {
    it('disables the cells the predicate rejects', () => {
      // A closed lunch half-hour: the hour 12 is still open, the minutes inside
      // the first half of it are not.
      const isTimeUnavailable = (time: Date, unit: string) => (unit === 'minute' ? time.getHours() === 12 && time.getMinutes() < 30 : false);

      render(<Panel defaultValue={at(12, 20)} isTimeUnavailable={isTimeUnavailable} />);

      expect(cells('Hour').find(cell => cell.textContent === '12')).not.toHaveAttribute('data-disabled');
      expect(cells('Minute').find(cell => cell.textContent === '21')).toHaveAttribute('data-disabled');
    });

    it('is asked once per cell with the time that cell would commit', () => {
      const isTimeUnavailable = vi.fn().mockReturnValue(false);
      render(<Panel defaultValue={at(10, 45)} isTimeUnavailable={isTimeUnavailable} />);

      const [time, unit] = isTimeUnavailable.mock.calls.find(([, u]) => u === 'hour') as [Date, string];
      expect(unit).toBe('hour');
      // The candidate carries the day the panel commits on, and the minutes it
      // is not being asked about.
      expect(time.getMinutes()).toBe(45);
      expect(time.getFullYear()).toBe(2026);
    });

    it('steps over an unavailable value from the keyboard', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel defaultValue={at(10, 45)} isTimeUnavailable={(time, unit) => unit === 'minute' && time.getMinutes() === 46} onValueChange={onValueChange} />);

      await user.tab();
      await user.tab();
      await user.keyboard('{ArrowDown}');

      // 46 is closed, so the arrow walks past it.
      expect(onValueChange).toHaveBeenLastCalledWith(at(10, 47));
    });
  });

  describe('dial mode', () => {
    it('renders two fields and the whole day on two rings', () => {
      const { container } = render(<Panel mode="dial" defaultValue={at(12, 15)} />);

      expect(container.querySelector('.tk-timepicker-body')).toHaveAttribute('data-mode', 'dial');
      expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
      expect(container.querySelector('[data-slot="input"][data-unit="hour"] input')).toHaveValue('12');

      // A 24-hour clock has no meridiem control, so every hour has to be on the
      // face: 00–11 outside, 12–23 inside.
      const marks = [...container.querySelectorAll('[data-slot="dial-number"]')];
      expect(marks).toHaveLength(24);
      expect(marks.filter(m => m.getAttribute('data-ring') === 'outer').map(m => m.textContent)).toEqual(['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']);
      expect(marks.filter(m => m.getAttribute('data-ring') === 'inner').map(m => m.textContent)).toEqual(['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']);
    });

    it('takes a typed number into the focused unit', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel mode="dial" value={at(10, 45)} onValueChange={onValueChange} />);

      const minute = screen.getByRole('spinbutton', { name: 'Minute' });
      minute.focus();

      // The first digit commits on its own, the second extends it — a spinbutton
      // has no caret to show a half-typed number in.
      await user.keyboard('0');
      expect(onValueChange).toHaveBeenLastCalledWith(at(10, 0));
      await user.keyboard('7');
      expect(onValueChange).toHaveBeenLastCalledWith(at(10, 7));
    });

    it('holds a typed pair that names no value, and reverts it on blur', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel mode="dial" value={at(10, 45)} onValueChange={onValueChange} />);

      const minute = screen.getByRole('spinbutton', { name: 'Minute' });
      await user.click(minute);
      await user.keyboard('99');

      // 99 is no minute. The mask lets it be typed — a field with a caret has to
      // — but nothing is committed, and leaving abandons it.
      expect(minute).toHaveValue('99');
      expect(onValueChange).toHaveBeenLastCalledWith(at(10, 9));
      await user.tab();
      expect(minute).toHaveValue('45');
    });

    it('takes the half-day from its initial', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Panel mode="dial" value={at(13, 45)} timeFormat="12" onValueChange={onValueChange} />);

      screen.getByRole('spinbutton', { name: 'AM/PM' }).focus();
      await user.keyboard('a');

      expect(onValueChange).toHaveBeenLastCalledWith(at(1, 45));
    });

    it('stacks the two half-days beside the fields rather than adding a third', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(<Panel mode="dial" value={at(13, 45)} timeFormat="12" onValueChange={onValueChange} />);

      // Two cells in one box, not a 112px number field — and no colon in front
      // of it, since it is not a third number.
      const stack = screen.getByRole('spinbutton', { name: 'AM/PM' });
      expect(stack).toHaveAttribute('data-slot', 'input-stack');
      const options = [...stack.querySelectorAll('[data-slot="input-option"]')];
      expect(options.map(option => option.textContent)).toEqual(['AM', 'PM']);
      expect(options[1]).toHaveAttribute('data-selected');
      expect(container.querySelectorAll('[data-slot="separator"]')).toHaveLength(1);

      await user.click(options[0]!);

      expect(onValueChange).toHaveBeenLastCalledWith(at(1, 45));
    });

    it('drops the columns for the same fields on a compact column body', () => {
      const { container } = render(<Panel defaultValue={at(10, 45)} compact />);

      expect(container.querySelector('[data-slot="columns"]')).not.toBeInTheDocument();
      expect(container.querySelectorAll('[data-slot="input"]')).toHaveLength(2);
      expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    });

    it('stacks the dial under its fields on `compact`', () => {
      const { container, rerender } = render(<Panel mode="dial" defaultValue={at(12, 15)} />);
      expect(container.querySelector('.tk-timepicker-body')).not.toHaveAttribute('data-compact');

      rerender(<Panel mode="dial" defaultValue={at(12, 15)} compact />);
      expect(container.querySelector('.tk-timepicker')).toHaveAttribute('data-compact');
      expect(container.querySelector('.tk-timepicker-body')).toHaveAttribute('data-compact');
    });

    it('keeps the twelve-hour face to one ring', () => {
      const { container } = render(<Panel mode="dial" defaultValue={at(13, 45)} timeFormat="12" meridiem="column" />);

      const marks = [...container.querySelectorAll('[data-slot="dial-number"]')];
      expect(marks).toHaveLength(12);
      expect(marks.every(m => m.getAttribute('data-ring') === 'outer')).toBe(true);
      expect(marks.map(m => m.textContent)).toEqual(['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']);
    });

    it('reaches the other half of a 24-hour day straight from the face', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(<Panel mode="dial" defaultValue={at(15, 30)} onValueChange={onValueChange} />);

      const marks = [...container.querySelectorAll<HTMLElement>('[data-slot="dial-number"]')];
      await user.click(marks.find(m => m.textContent === '09') as HTMLElement);

      // Nine in the morning, one click from three in the afternoon.
      expect(onValueChange).toHaveBeenLastCalledWith(at(9, 30));
    });

    it('hides the dial from assistive tech and keeps it out of the tab order', () => {
      const { container } = render(<Panel mode="dial" defaultValue={at(12, 15)} />);

      expect(container.querySelector('[data-slot="dial"]')).toHaveAttribute('aria-hidden', 'true');
      container.querySelectorAll('[data-slot="dial-number"]').forEach(mark => expect(mark).toHaveAttribute('tabindex', '-1'));
    });

    it('picks the hour off the dial and hands the turn to the minutes', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(<Panel mode="dial" defaultValue={at(12, 15)} onValueChange={onValueChange} />);

      const marks = () => Array.from(container.querySelectorAll<HTMLElement>('[data-slot="dial-number"]'));
      await user.click(marks().find(mark => mark.textContent === '15') as HTMLElement);

      // 12:15 is in the afternoon half, so the dial's third position is 15:00.
      expect(onValueChange).toHaveBeenLastCalledWith(at(15, 15));
      expect(container.querySelector('[data-slot="input"][data-active]')).toHaveAttribute('data-unit', 'minute');

      // The dial now offers minutes, one every five.
      expect(marks().map(mark => mark.textContent)).toEqual(['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']);
      await user.click(marks()[6]);
      expect(onValueChange).toHaveBeenLastCalledWith(at(15, 30));
    });

    it('points each hand at its own committed value', () => {
      const { container } = render(<Panel mode="dial" defaultValue={at(15, 30)} />);

      const hand = (unit: string) => container.querySelector(`[data-slot="dial-hand"][data-unit="${unit}"]`) as HTMLElement;
      expect(hand('hour').style.getPropertyValue('--tk-timepicker-dial-angle')).toBe('90deg');
      expect(hand('minute').style.getPropertyValue('--tk-timepicker-dial-angle')).toBe('180deg');
    });
  });

  describe('state', () => {
    it('commits nothing while read-only, and nothing while disabled', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { rerender } = render(<Panel defaultValue={at(10, 45)} readOnly onValueChange={onValueChange} />);

      await user.click(within(column('Hour')).getByText('11'));
      expect(onValueChange).not.toHaveBeenCalled();

      rerender(<Panel defaultValue={at(10, 45)} disabled onValueChange={onValueChange} />);
      await user.click(within(column('Hour')).getByText('11'));
      expect(onValueChange).not.toHaveBeenCalled();
      expect(column('Hour')).toHaveAttribute('tabindex', '-1');
    });

    it('inherits disabled, invalid and required from a surrounding Field', () => {
      const { container } = render(
        <Field invalid required disabled>
          <Field.Label>Departure</Field.Label>
          <Panel defaultValue={at(10, 45)} />
        </Field>,
      );

      const root = container.querySelector('.tk-timepicker') as HTMLElement;
      expect(root).toHaveAttribute('data-disabled');
      expect(root).toHaveAttribute('data-invalid');
      expect(root).toHaveAttribute('data-required');
      expect(column('Hour')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('customization', () => {
    it('lands classNames and slotProps on the owner node of each slot', () => {
      const { container } = render(
        <TimePicker referenceDate={DAY} defaultValue={at(10, 45)} classNames={{ root: 'extra-root' }}>
          <TimePicker.Body classNames={{ column: 'extra-column' }} slotProps={{ highlight: { id: 'band' } }} />
        </TimePicker>,
      );

      expect(container.querySelector('.tk-timepicker')).toHaveClass('extra-root');
      expect(container.querySelector('.tk-timepicker-column')).toHaveClass('extra-column');
      expect(container.querySelector('#band')).toHaveClass('tk-timepicker-highlight');
    });

    it('takes its unit names from `labels`', () => {
      render(<Panel defaultValue={at(10, 45)} labels={{ hour: 'Saat', minute: 'Dakika' }} />);

      expect(screen.getByRole('spinbutton', { name: 'Saat' })).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: 'Dakika' })).toBeInTheDocument();
    });

    it('raises the safe-context error for a part used outside its root', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TimePicker.Body />)).toThrow(/TimePickerProvider/);

      error.mockRestore();
    });
  });

  describe('accessibility', () => {
    it('names the panel from its own label, and each column after its unit', () => {
      render(<Panel defaultValue={at(10, 45)} />);

      expect(screen.getByRole('group', { name: 'Timer' })).toBeInTheDocument();

      const hour = column('Hour');
      expect(hour).toHaveAttribute('aria-valuenow', '10');
      expect(hour).toHaveAttribute('aria-valuemin', '0');
      expect(hour).toHaveAttribute('aria-valuemax', '23');
      expect(hour).toHaveAttribute('aria-valuetext', '10');
    });

    it('falls back to a surrounding Field label when the panel has no name of its own', () => {
      render(
        <Field>
          <Field.Label>Departure time</Field.Label>
          <TimePicker referenceDate={DAY} defaultValue={at(10, 45)}>
            <TimePicker.Body />
          </TimePicker>
        </Field>,
      );

      expect(screen.getByRole('group', { name: 'Departure time' })).toBeInTheDocument();
    });

    it('announces the meridiem in words', () => {
      render(<Panel defaultValue={at(13, 45)} timeFormat="12" />);

      expect(column('AM/PM')).toHaveAttribute('aria-valuetext', 'PM');
    });

    it('keeps a read-only panel readable and a disabled one out of the tab order', () => {
      const { rerender } = render(<Panel defaultValue={at(10, 45)} readOnly />);

      // Read-only still reaches the keyboard, so the value can be read.
      expect(column('Hour')).toHaveAttribute('tabindex', '0');
      expect(column('Hour')).toHaveAttribute('aria-readonly', 'true');

      rerender(<Panel defaultValue={at(10, 45)} disabled />);
      expect(column('Hour')).toHaveAttribute('tabindex', '-1');
      expect(column('Hour')).toHaveAttribute('aria-disabled', 'true');
    });

    it('has no a11y violations across the bodies, treatments and states', async () => {
      const cases = [
        <Panel key="basic" defaultValue={at(10, 45)} showSeconds timeFormat="12" />,
        <Panel key="dial" mode="dial" defaultValue={at(12, 15)} timeFormat="12" />,
        <Panel key="divided" defaultValue={at(10, 45)} type="divided" />,
        <Panel key="light" defaultValue={at(10, 45)} type="light" />,
        <Panel key="dark" defaultValue={at(10, 45)} type="dark" />,
        <Panel key="primary" defaultValue={at(10, 45)} type="primary" />,
        <Panel key="small" defaultValue={at(10, 45)} size="small" />,
        <TogglePanel key="toggle" defaultValue={at(13, 45)} />,
        <Panel key="disabled" defaultValue={at(10, 45)} disabled />,
        <Panel key="readonly" defaultValue={at(10, 45)} readOnly />,
        <Panel key="invalid" defaultValue={at(10, 45)} invalid required />,
        <Panel key="empty" />,
      ];

      for (const ui of cases) {
        const { container, unmount } = render(ui);
        expect(await axe(container)).toHaveNoViolations();
        unmount();
      }
    });
  });
});
