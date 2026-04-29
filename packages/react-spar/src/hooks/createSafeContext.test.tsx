import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { createSafeContext } from './createSafeContext';

interface TestValue {
  message: string;
}

describe('createSafeContext', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('provides value to consumers rendered inside the Provider', () => {
    const [Provider, useValue] = createSafeContext<TestValue>('Test');
    const Consumer = () => <span>{useValue('Consumer').message}</span>;

    render(
      <Provider value={{ message: 'hello' }}>
        <Consumer />
      </Provider>,
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('throws a descriptive error when used outside the Provider', () => {
    const [, useValue] = createSafeContext<TestValue>('Test');
    const Consumer = () => <span>{useValue('Consumer').message}</span>;

    expect(() => render(<Consumer />)).toThrow('Consumer must be used within Test');
  });

  it('uses "Hook" as the default consumer label in the error message', () => {
    const [, useValue] = createSafeContext<TestValue>('Test');
    const Consumer = () => <span>{useValue().message}</span>;

    expect(() => render(<Consumer />)).toThrow('Hook must be used within Test');
  });

  it('sets displayName on the returned Provider for devtools', () => {
    const [Provider] = createSafeContext<TestValue>('MyFeature');
    expect((Provider as { displayName?: string }).displayName).toBe('MyFeature.Provider');
  });
});
