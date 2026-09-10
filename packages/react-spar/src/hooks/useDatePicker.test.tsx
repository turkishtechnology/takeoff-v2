import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
});
