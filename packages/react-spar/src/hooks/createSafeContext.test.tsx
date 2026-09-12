import { render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSafeContext } from './createSafeContext';

interface CounterValue {
  count: number;
}

const [CounterProvider, useCounter] = createSafeContext<CounterValue>('CounterProvider');

const withCounter =
  (value: CounterValue) =>
  ({ children }: { children: ReactNode }) => <CounterProvider value={value}>{children}</CounterProvider>;

const CounterReadout = () => <output>{useCounter('Counter.Readout').count}</output>;

describe('createSafeContext', () => {
  describe('provider and hook', () => {
    it('hands the provided value to the paired hook', () => {
      const value = { count: 3 };
      const { result } = renderHook(() => useCounter('Counter.Readout'), { wrapper: withCounter(value) });

      expect(result.current).toBe(value);
    });

    it('renders its children without adding DOM of its own', () => {
      const { container } = render(
        <CounterProvider value={{ count: 1 }}>
          <CounterReadout />
        </CounterProvider>,
      );

      expect(container.childElementCount).toBe(1);
      expect(container.firstElementChild).toBe(screen.getByRole('status'));
      expect(screen.getByRole('status')).toHaveTextContent('1');
    });

    it('re-renders consumers when the provided value changes', () => {
      const { rerender } = render(
        <CounterProvider value={{ count: 1 }}>
          <CounterReadout />
        </CounterProvider>,
      );

      rerender(
        <CounterProvider value={{ count: 2 }}>
          <CounterReadout />
        </CounterProvider>,
      );

      expect(screen.getByRole('status')).toHaveTextContent('2');
    });

    it('lets the nearest provider win when providers nest', () => {
      render(
        <CounterProvider value={{ count: 1 }}>
          <CounterProvider value={{ count: 2 }}>
            <CounterReadout />
          </CounterProvider>
        </CounterProvider>,
      );

      expect(screen.getByRole('status')).toHaveTextContent('2');
    });

    it('accepts falsy values — only null is reserved as the missing-provider sentinel', () => {
      const [FlagProvider, useFlag] = createSafeContext<boolean>('FlagProvider');
      const [IndexProvider, useIndex] = createSafeContext<number>('IndexProvider');
      const [LabelProvider, useLabel] = createSafeContext<string>('LabelProvider');

      const { result } = renderHook(() => [useFlag(), useIndex(), useLabel()], {
        wrapper: ({ children }: { children: ReactNode }) => (
          <FlagProvider value={false}>
            <IndexProvider value={0}>
              <LabelProvider value="">{children}</LabelProvider>
            </IndexProvider>
          </FlagProvider>
        ),
      });

      expect(result.current).toEqual([false, 0, '']);
    });

    it('labels the provider for React DevTools', () => {
      expect((CounterProvider as { displayName?: string }).displayName).toBe('CounterProvider.Provider');
    });
  });

  describe('context boundary', () => {
    // React reports a render error through console.error before rethrowing; keep the run output clean.
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('throws a descriptive error naming the consumer and the provider', () => {
      expect(() => render(<CounterReadout />)).toThrow(/^Counter\.Readout must be used within CounterProvider$/);
    });

    it('falls back to a generic consumer name when none is given', () => {
      expect(() => renderHook(() => useCounter())).toThrow(/^Hook must be used within CounterProvider$/);
    });

    it('does not reach a consumer rendered beside the provider rather than inside it', () => {
      expect(() =>
        render(
          <>
            <CounterProvider value={{ count: 1 }}>
              <span>inside</span>
            </CounterProvider>
            <CounterReadout />
          </>,
        ),
      ).toThrow(/^Counter\.Readout must be used within CounterProvider$/);
    });

    it('is not satisfied by a different safe context, even one with the same display name', () => {
      const [LookalikeProvider] = createSafeContext<CounterValue>('CounterProvider');

      expect(() =>
        render(
          <LookalikeProvider value={{ count: 1 }}>
            <CounterReadout />
          </LookalikeProvider>,
        ),
      ).toThrow(/^Counter\.Readout must be used within CounterProvider$/);
    });
  });
});
