import { act, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { Calendar } from '../components/calendar';
import { Field } from '../components/field';
import { Input } from '../components/input';
import { Popover } from '../components/popover';
import { render, screen } from '../test-utils';

import { useDatePicker } from './useDatePicker';

const AUGUST_15 = new Date(2026, 7, 15);

/** What `Input.Field` reports once a `date` mask completes. */
const completed = (iso: string) => ({ completed: true, iso });

describe('useDatePicker', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useDatePicker());

    expect(result.current.value).toBeUndefined();
    expect(result.current.text).toBe('');
    expect(result.current.open).toBe(false);
  });

  it('renders defaultValue into the field', () => {
    const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15 }));

    expect(result.current.value).toBe(AUGUST_15);
    expect(result.current.text).toBe('15/08/2026');
  });

  it('derives the mask bounds from the same dates as the grid', () => {
    const min = new Date(2026, 7, 10);
    const max = new Date(2026, 7, 20);
    const { result } = renderHook(() => useDatePicker({ min, max }));

    // Both halves, one pair of dates: the grid takes Dates, the mask ISO.
    expect(result.current.inputProps.mask).toMatchObject({ date: true, delimiter: '/', dateMin: '2026-08-10', dateMax: '2026-08-20' });
    expect(result.current.calendarProps.minDate).toBe(min);
    expect(result.current.calendarProps.maxDate).toBe(max);
  });

  it('turns a completed typed date into a Date', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useDatePicker({ onValueChange }));

    act(() => result.current.inputProps.onValueChange('15/08/2026', completed('2026-08-15')));

    expect(result.current.value?.toDateString()).toBe(AUGUST_15.toDateString());
    expect(result.current.text).toBe('15/08/2026');
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('holds the value at undefined while a date is half-typed', () => {
    const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15 }));

    act(() => result.current.inputProps.onValueChange('15/08', { completed: false }));

    // The text is whatever the user is typing; the value waits for a whole date.
    expect(result.current.text).toBe('15/08');
    expect(result.current.value).toBeUndefined();
  });

  it('clears the value when the field is emptied', () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15, onValueChange }));

    act(() => result.current.inputProps.onValueChange('', { completed: false }));

    expect(result.current.value).toBeUndefined();
    expect(result.current.text).toBe('');
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it('writes a picked day back into the field and closes the panel', () => {
    const { result } = renderHook(() => useDatePicker());

    act(() => result.current.popoverProps.onOpenChange(true));
    expect(result.current.open).toBe(true);

    act(() => result.current.calendarProps.onValueChange(AUGUST_15));

    expect(result.current.text).toBe('15/08/2026');
    expect(result.current.value).toBe(AUGUST_15);
    expect(result.current.open).toBe(false);
  });

  it('opens the panel on ArrowDown and leaves other keys alone', () => {
    const { result } = renderHook(() => useDatePicker());

    const arrowDown = { key: 'ArrowDown', preventDefault: vi.fn() };
    act(() => result.current.inputProps.onKeyDown(arrowDown as never));

    expect(arrowDown.preventDefault).toHaveBeenCalled();
    expect(result.current.open).toBe(true);

    act(() => result.current.popoverProps.onOpenChange(false));

    const other = { key: 'a', preventDefault: vi.fn() };
    act(() => result.current.inputProps.onKeyDown(other as never));

    expect(other.preventDefault).not.toHaveBeenCalled();
    expect(result.current.open).toBe(false);
  });

  it('sets the value from outside, field text included', () => {
    const { result } = renderHook(() => useDatePicker());

    // What a preset button does — one call, both halves in step.
    act(() => result.current.setValue(AUGUST_15));

    expect(result.current.value).toBe(AUGUST_15);
    expect(result.current.text).toBe('15/08/2026');
  });

  it('honours a custom delimiter in both the mask and the field text', () => {
    const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15, delimiter: '.' }));

    expect(result.current.text).toBe('15.08.2026');
    expect(result.current.inputProps.mask).toMatchObject({ delimiter: '.' });
  });

  it('honours a custom formatter', () => {
    // Local-time parts, not `toISOString()`: that reads the date in UTC, which
    // is the previous day for every timezone east of Greenwich.
    const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15, format: value => `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()}` }));

    expect(result.current.text).toBe('2026-8-15');
  });

  describe('bounds', () => {
    it('gives the mask only the bound that was passed', () => {
      const min = new Date(2026, 7, 10);
      const max = new Date(2026, 7, 20);

      const { result: minOnly } = renderHook(() => useDatePicker({ min }));
      expect(minOnly.current.inputProps.mask).toHaveProperty('dateMin', '2026-08-10');
      expect(minOnly.current.inputProps.mask).not.toHaveProperty('dateMax');
      expect(minOnly.current.calendarProps.maxDate).toBeUndefined();

      const { result: maxOnly } = renderHook(() => useDatePicker({ max }));
      expect(maxOnly.current.inputProps.mask).toHaveProperty('dateMax', '2026-08-20');
      expect(maxOnly.current.inputProps.mask).not.toHaveProperty('dateMin');
      expect(maxOnly.current.calendarProps.minDate).toBeUndefined();
    });

    it('leaves the mask and the grid unbounded without min and max', () => {
      const { result } = renderHook(() => useDatePicker());

      expect(result.current.inputProps.mask).toStrictEqual({ date: true, delimiter: '/' });
      expect(result.current.calendarProps.minDate).toBeUndefined();
      expect(result.current.calendarProps.maxDate).toBeUndefined();
    });

    it('pads single-digit days and months in the field text and the mask bounds', () => {
      const januaryFifth = new Date(2026, 0, 5);
      const { result } = renderHook(() => useDatePicker({ defaultValue: januaryFifth, min: januaryFifth, max: new Date(2026, 8, 9) }));

      expect(result.current.text).toBe('05/01/2026');
      expect(result.current.inputProps.mask).toMatchObject({ dateMin: '2026-01-05', dateMax: '2026-09-09' });
    });
  });

  describe('typed input', () => {
    it('reports a completed date as a local Date carrying the typed parts', () => {
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { result } = renderHook(() => useDatePicker({ onValueChange }));

      act(() => result.current.inputProps.onValueChange('05/01/2026', completed('2026-01-05')));

      const reported = onValueChange.mock.lastCall?.[0];
      expect(reported).toBeInstanceOf(Date);
      expect([reported?.getFullYear(), reported?.getMonth(), reported?.getDate(), reported?.getHours()]).toEqual([2026, 0, 5, 0]);
      expect(result.current.value).toBe(reported);
    });

    it('holds the value at undefined when the mask completes without an iso date', () => {
      const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15 }));

      act(() => result.current.inputProps.onValueChange('15/08/2026', { completed: true }));

      expect(result.current.text).toBe('15/08/2026');
      expect(result.current.value).toBeUndefined();
    });

    it('reports undefined once when a whole date is edited back to half-typed', () => {
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15, onValueChange }));

      act(() => result.current.inputProps.onValueChange('15/08/202', { completed: false }));
      act(() => result.current.inputProps.onValueChange('15/08/20', { completed: false }));

      // A bound form has to drop the stale Date as soon as the date breaks, and
      // hear about it once rather than on every keystroke after that.
      expect(result.current.value).toBeUndefined();
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(undefined);
    });

    it('reports undefined when the mask completes without an iso date after a whole one', () => {
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15, onValueChange }));

      act(() => result.current.inputProps.onValueChange('15/08/2026', { completed: true }));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(undefined);
    });

    it('stays silent while a picker with no value is half-typed or emptied again', () => {
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { result } = renderHook(() => useDatePicker({ onValueChange }));

      act(() => result.current.inputProps.onValueChange('15/08', { completed: false }));
      act(() => result.current.inputProps.onValueChange('', { completed: false }));

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('treats an unparseable iso date as no value and reports the change', () => {
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15, onValueChange }));

      act(() => result.current.inputProps.onValueChange('15/08/2026', completed('2026-00-15')));

      expect(result.current.text).toBe('15/08/2026');
      expect(result.current.value).toBeUndefined();
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('picking and setting', () => {
    it('reports a picked day with the very Date the grid handed over', () => {
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { result } = renderHook(() => useDatePicker({ onValueChange }));

      act(() => result.current.calendarProps.onValueChange(AUGUST_15));

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange.mock.lastCall?.[0]).toBe(AUGUST_15);
    });

    it('clears both halves and closes the panel when the grid deselects the day', () => {
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15, onValueChange }));

      act(() => result.current.popoverProps.onOpenChange(true));
      act(() => result.current.calendarProps.onValueChange(undefined));

      expect(result.current.value).toBeUndefined();
      expect(result.current.text).toBe('');
      expect(result.current.open).toBe(false);
      expect(onValueChange).toHaveBeenLastCalledWith(undefined);
    });

    it('resets both halves through setValue(undefined) and reports it', () => {
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { result } = renderHook(() => useDatePicker({ defaultValue: AUGUST_15, onValueChange }));

      act(() => result.current.setValue(undefined));

      expect(result.current.value).toBeUndefined();
      expect(result.current.text).toBe('');
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenCalledWith(undefined);
    });

    it('leaves the panel open when the value is set from a preset inside it', () => {
      const onValueChange = vi.fn<(value: Date | undefined) => void>();
      const { result } = renderHook(() => useDatePicker({ onValueChange }));

      act(() => result.current.popoverProps.onOpenChange(true));
      act(() => result.current.setValue(AUGUST_15));

      expect(result.current.open).toBe(true);
      expect(onValueChange).toHaveBeenCalledWith(AUGUST_15);
    });

    it('writes picked and set dates through a custom formatter and delimiter', () => {
      const { result: formatted } = renderHook(() => useDatePicker({ format: value => `${value.getDate()} of ${value.getMonth() + 1}` }));

      act(() => formatted.current.calendarProps.onValueChange(AUGUST_15));
      expect(formatted.current.text).toBe('15 of 8');

      act(() => formatted.current.setValue(new Date(2026, 7, 16)));
      expect(formatted.current.text).toBe('16 of 8');

      const { result: dashed } = renderHook(() => useDatePicker({ delimiter: '-' }));

      act(() => dashed.current.calendarProps.onValueChange(AUGUST_15));
      expect(dashed.current.text).toBe('15-08-2026');
    });
  });

  describe('prop groups', () => {
    it('keeps the spreadable groups in step with the picker state', () => {
      const { result } = renderHook(() => useDatePicker());

      act(() => result.current.popoverProps.onOpenChange(true));
      act(() => result.current.setValue(AUGUST_15));

      expect(result.current.popoverProps.open).toBe(result.current.open);
      expect(result.current.popoverProps.open).toBe(true);
      expect(result.current.inputProps.value).toBe('15/08/2026');
      expect(result.current.calendarProps.value).toBe(AUGUST_15);
    });
  });

  describe('option changes after mount', () => {
    it('treats defaultValue as the initial value only', () => {
      const { result, rerender } = renderHook((props: { defaultValue?: Date }) => useDatePicker(props), { initialProps: { defaultValue: AUGUST_15 } });

      rerender({ defaultValue: new Date(2026, 7, 16) });

      expect(result.current.value).toBe(AUGUST_15);
      expect(result.current.text).toBe('15/08/2026');
    });

    it('re-derives the mask and the grid bounds when min or max changes', () => {
      const nextMin = new Date(2026, 7, 12);
      const nextMax = new Date(2026, 8, 1);
      const initialBounds: { min?: Date; max?: Date } = { min: new Date(2026, 7, 10) };
      const { result, rerender } = renderHook((props: { min?: Date; max?: Date }) => useDatePicker(props), { initialProps: initialBounds });

      rerender({ min: nextMin, max: nextMax });

      expect(result.current.inputProps.mask).toStrictEqual({ date: true, delimiter: '/', dateMin: '2026-08-12', dateMax: '2026-09-01' });
      expect(result.current.calendarProps.minDate).toBe(nextMin);
      expect(result.current.calendarProps.maxDate).toBe(nextMax);
    });

    it('uses a delimiter changed after mount for the mask and later commits', () => {
      const { result, rerender } = renderHook((props: { delimiter?: string }) => useDatePicker(props), { initialProps: { delimiter: '/' } });

      rerender({ delimiter: '.' });
      act(() => result.current.setValue(AUGUST_15));

      expect(result.current.inputProps.mask).toMatchObject({ delimiter: '.' });
      expect(result.current.text).toBe('15.08.2026');
    });

    it('reports every half through the latest onValueChange', () => {
      const first = vi.fn<(value: Date | undefined) => void>();
      const next = vi.fn<(value: Date | undefined) => void>();
      const { result, rerender } = renderHook((props: { onValueChange: (value: Date | undefined) => void }) => useDatePicker(props), {
        initialProps: { onValueChange: first },
      });

      rerender({ onValueChange: next });
      act(() => result.current.inputProps.onValueChange('15/08/2026', completed('2026-08-15')));
      act(() => result.current.calendarProps.onValueChange(AUGUST_15));
      act(() => result.current.setValue(undefined));

      expect(first).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(3);
      expect(next.mock.calls[0]?.[0]?.toDateString()).toBe(AUGUST_15.toDateString());
      expect(next.mock.calls[1]?.[0]).toBe(AUGUST_15);
      expect(next.mock.calls[2]?.[0]).toBeUndefined();
    });
  });
});

describe('useDatePicker composed with Input.Field, Popover and Calendar', () => {
  const AUGUST_10 = new Date(2026, 7, 10);
  const AUGUST_20 = new Date(2026, 7, 20);

  const getPanel = () => document.querySelector<HTMLElement>('.tk-popover-content');

  /** Days are addressed through the grid's documented `data-day` ISO anchor. */
  const dayCell = (container: HTMLElement, iso: string): HTMLElement => {
    const cell = container.querySelector<HTMLElement>(`[data-day="${iso}"]`);
    if (!cell) throw new Error(`No day cell for ${iso}`);
    return cell;
  };

  interface DepartureFieldProps {
    defaultValue?: Date;
    onValueChange?: (value: Date | undefined) => void;
  }

  /** The masked-field composition from the docs, with a decorative stand-in icon. */
  const DepartureField = ({ defaultValue, onValueChange }: DepartureFieldProps) => {
    const picker = useDatePicker({ min: AUGUST_10, max: AUGUST_20, defaultValue, onValueChange });

    return (
      <Field>
        <Field.Label>Departure</Field.Label>
        <Popover {...picker.popoverProps}>
          <Input>
            <Input.Field placeholder="dd/mm/yyyy" {...picker.inputProps} />
            <Popover.Trigger aria-label="Select date" classNames={{ root: 'tk-input-action' }}>
              <svg aria-hidden="true" width={20} height={20} />
            </Popover.Trigger>
          </Input>
          <Popover.Content align="end" classNames={{ root: 'tk-datepicker-panel' }}>
            <Calendar {...picker.calendarProps} />
          </Popover.Content>
        </Popover>
      </Field>
    );
  };

  const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: 'Select date' }));
    return waitFor(() => {
      const panel = getPanel();
      expect(panel).not.toBeNull();
      return panel as HTMLElement;
    });
  };

  it('turns typed digits into the masked text and a Date', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: Date | undefined) => void>();
    render(<DepartureField onValueChange={onValueChange} />);

    const field = screen.getByRole('textbox', { name: 'Departure' });
    await user.type(field, '15082026');

    expect(field).toHaveValue('15/08/2026');
    expect(onValueChange.mock.lastCall?.[0]?.toDateString()).toBe(AUGUST_15.toDateString());
  });

  it('opens the calendar from the field with ArrowDown', async () => {
    const user = userEvent.setup();
    render(<DepartureField defaultValue={AUGUST_15} />);

    await user.click(screen.getByRole('textbox', { name: 'Departure' }));
    await user.keyboard('{ArrowDown}');

    expect(await screen.findByRole('grid')).toHaveAccessibleName('August 2026');
    expect(screen.getByRole('button', { name: 'Select date' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('writes a clicked day back into the field and closes the panel', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: Date | undefined) => void>();
    render(<DepartureField defaultValue={AUGUST_15} onValueChange={onValueChange} />);

    const panel = await openPanel(user);
    const dayButton = dayCell(panel, '2026-08-12').querySelector('button');
    expect(dayButton).not.toBeNull();
    await user.click(dayButton as HTMLButtonElement);

    expect(screen.getByRole('textbox', { name: 'Departure' })).toHaveValue('12/08/2026');
    expect(onValueChange.mock.lastCall?.[0]?.toDateString()).toBe(new Date(2026, 7, 12).toDateString());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Select date' })).toHaveAttribute('aria-expanded', 'false'));
  });

  it('bounds the grid with the same dates as the mask', async () => {
    const user = userEvent.setup();
    render(<DepartureField defaultValue={AUGUST_15} />);

    const panel = await openPanel(user);
    const inRange = dayCell(panel, '2026-08-12').querySelector('button');
    const outOfRange = dayCell(panel, '2026-08-25').querySelector('button');

    expect(inRange).toBeEnabled();
    expect(outOfRange === null || outOfRange.disabled).toBe(true);
    expect(outOfRange).toBeDisabled();
    expect(dayCell(panel, '2026-08-25')).toHaveAttribute('data-disabled', 'true');
    expect(dayCell(panel, '2026-08-12')).not.toHaveAttribute('data-disabled');
  });

  it('marks a typed date as the selected day when the panel opens', async () => {
    const user = userEvent.setup();
    render(<DepartureField />);

    await user.type(screen.getByRole('textbox', { name: 'Departure' }), '12082026');
    await openPanel(user);

    const selected = await screen.findByRole('gridcell', { selected: true });
    expect(selected).toHaveAttribute('data-day', '2026-08-12');
    expect(screen.getAllByRole('gridcell', { selected: true })).toHaveLength(1);
  });

  it('keeps a typed date inside the bounds, with the field and the value in step', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: Date | undefined) => void>();
    render(<DepartureField onValueChange={onValueChange} />);

    const field = screen.getByRole('textbox', { name: 'Departure' });
    await user.type(field, '25082026');

    // The 25th is past `max`, so it must never reach the form.
    expect(field).not.toHaveValue('25/08/2026');
    const reported = onValueChange.mock.calls.map(([value]) => value).filter((value): value is Date => value instanceof Date);
    expect(reported).not.toHaveLength(0);
    for (const date of reported) {
      expect(date.getTime()).toBeGreaterThanOrEqual(AUGUST_10.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(AUGUST_20.getTime());
    }

    const last = reported[reported.length - 1] as Date;
    const pad = (part: number) => String(part).padStart(2, '0');
    expect(field).toHaveValue(`${pad(last.getDate())}/${pad(last.getMonth() + 1)}/${last.getFullYear()}`);
  });

  it('reports undefined once when the user clears a filled field', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: Date | undefined) => void>();
    render(<DepartureField defaultValue={AUGUST_15} onValueChange={onValueChange} />);

    const field = screen.getByRole('textbox', { name: 'Departure' });
    expect(field).toHaveValue('15/08/2026');

    await user.clear(field);

    expect(field).toHaveValue('');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  it('reports undefined once when the user breaks a filled date with Backspace', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<(value: Date | undefined) => void>();
    render(<DepartureField defaultValue={AUGUST_15} onValueChange={onValueChange} />);

    const field = screen.getByRole('textbox', { name: 'Departure' });
    await user.click(field);
    await user.keyboard('{End}{Backspace}{Backspace}');

    expect(field).toHaveValue('15/08/20');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });

  it('has no a11y violations with the panel open', async () => {
    const user = userEvent.setup();
    const { container } = render(<DepartureField defaultValue={AUGUST_15} />);

    const panel = await openPanel(user);
    await screen.findByRole('grid');

    // The panel is portalled out of the container, so each tree is checked on its own.
    expect(await axe(container)).toHaveNoViolations();
    expect(await axe(panel)).toHaveNoViolations();
  });
});
