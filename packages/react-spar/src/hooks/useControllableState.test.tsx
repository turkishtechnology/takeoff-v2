import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useControllableState } from './useControllableState';

interface HookProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

const renderControllable = <T,>(initialProps: HookProps<T>) =>
  renderHook((props: HookProps<T>) => useControllableState<T>(props.value, props.defaultValue, props.onChange), { initialProps });

describe('useControllableState', () => {
  describe('uncontrolled', () => {
    it('starts from defaultValue and reports uncontrolled mode', () => {
      const { result } = renderControllable<string>({ defaultValue: 'economy' });
      const [value, , isControlled] = result.current;

      expect(value).toBe('economy');
      expect(isControlled).toBe(false);
    });

    it('commits a change internally and reports it through onChange', () => {
      const onChange = vi.fn<(value: string) => void>();
      const { result } = renderControllable<string>({ defaultValue: 'economy', onChange });

      act(() => result.current[1]('business'));

      expect(result.current[0]).toBe('business');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('business');
    });

    it('reports each commit exactly once, in order', () => {
      const onChange = vi.fn<(value: string) => void>();
      const { result } = renderControllable<string>({ defaultValue: 'economy', onChange });

      act(() => result.current[1]('business'));
      act(() => result.current[1]('first'));

      expect(result.current[0]).toBe('first');
      expect(onChange.mock.calls).toEqual([['business'], ['first']]);
    });

    it('commits without an onChange callback', () => {
      const { result } = renderControllable<string>({ defaultValue: 'economy' });

      act(() => result.current[1]('business'));

      expect(result.current[0]).toBe('business');
    });

    it('starts undefined when neither value nor defaultValue is given', () => {
      const { result } = renderControllable<string>({});

      expect(result.current[0]).toBeUndefined();
      expect(result.current[2]).toBe(false);

      act(() => result.current[1]('first'));

      expect(result.current[0]).toBe('first');
    });

    it('treats defaultValue as the initial value only', () => {
      const { result, rerender } = renderControllable<string>({ defaultValue: 'economy' });

      rerender({ defaultValue: 'first' });

      expect(result.current[0]).toBe('economy');
    });
  });

  describe('controlled', () => {
    it('reads the value from the parent and reports controlled mode', () => {
      const { result } = renderControllable<string>({ value: 'business', defaultValue: 'economy' });

      expect(result.current[0]).toBe('business');
      expect(result.current[2]).toBe(true);
    });

    it('reports a change without committing it — the parent may decline', () => {
      const onChange = vi.fn<(value: string) => void>();
      const { result } = renderControllable<string>({ value: 'business', onChange });

      act(() => result.current[1]('first'));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('first');
      expect(result.current[0]).toBe('business');
    });

    it('follows the parent when it accepts the change', () => {
      const { result, rerender } = renderControllable<string>({ value: 'business' });

      rerender({ value: 'first' });

      expect(result.current[0]).toBe('first');
    });

    it('treats a falsy but defined value as controlled', () => {
      const { result } = renderControllable<number>({ value: 0, defaultValue: 5 });

      expect(result.current[0]).toBe(0);
      expect(result.current[2]).toBe(true);
    });
  });

  describe('latched mode', () => {
    it('stays uncontrolled when a value arrives after mounting uncontrolled', () => {
      const { result, rerender } = renderControllable<string>({ defaultValue: 'economy' });

      act(() => result.current[1]('business'));
      rerender({ value: 'first', defaultValue: 'economy' });

      // The internal state is not silently dropped for the late value.
      expect(result.current[0]).toBe('business');
      expect(result.current[2]).toBe(false);
    });

    it('stays controlled when the value later becomes undefined', () => {
      const onChange = vi.fn<(value: string) => void>();
      const { result, rerender } = renderControllable<string>({ value: 'business', defaultValue: 'economy', onChange });

      rerender({ defaultValue: 'economy', onChange });

      // No fallback to defaultValue, and a commit is still only reported.
      expect(result.current[0]).toBeUndefined();
      expect(result.current[2]).toBe(true);

      act(() => result.current[1]('first'));

      expect(result.current[0]).toBeUndefined();
      expect(onChange).toHaveBeenCalledWith('first');
    });
  });

  describe('setter', () => {
    it('keeps its identity across renders while onChange is stable', () => {
      const onChange = vi.fn<(value: string) => void>();
      const { result, rerender } = renderControllable<string>({ defaultValue: 'economy', onChange });
      const firstSetter = result.current[1];

      act(() => firstSetter('business'));
      rerender({ defaultValue: 'economy', onChange });

      expect(result.current[1]).toBe(firstSetter);
    });

    it('reports through the latest onChange after the callback changes', () => {
      const first = vi.fn<(value: string) => void>();
      const next = vi.fn<(value: string) => void>();
      const { result, rerender } = renderControllable<string>({ defaultValue: 'economy', onChange: first });

      rerender({ defaultValue: 'economy', onChange: next });
      act(() => result.current[1]('business'));

      expect(next).toHaveBeenCalledWith('business');
      expect(first).not.toHaveBeenCalled();
    });
  });
});
