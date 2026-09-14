import { describe, expect, it, vi } from 'vitest';

import { blockDismiss } from './blockDismiss';

describe('blockDismiss', () => {
  it('prevents the dismiss when no consumer handler is given', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });

    blockDismiss<KeyboardEvent>()(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('still invokes the consumer handler exactly once with the original event', () => {
    const handler = vi.fn();
    const event = new Event('pointerdown', { cancelable: true });

    blockDismiss(handler)(event);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0]).toBe(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('prevents the default before the consumer handler runs', () => {
    const observed: boolean[] = [];
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });

    blockDismiss((received: KeyboardEvent) => {
      observed.push(received.defaultPrevented);
    })(event);

    expect(observed).toEqual([true]);
  });

  it('cancels a real DOM dispatch while the consumer handler still observes it', () => {
    const target = document.createElement('div');
    const handler = vi.fn();
    target.addEventListener('keydown', blockDismiss(handler));

    const notCancelled = target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true, bubbles: true }));

    expect(notCancelled).toBe(false);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('has already blocked the dismiss when the consumer handler throws, and does not swallow the error', () => {
    const event = new Event('pointerdown', { cancelable: true });
    const failingHandler = () => {
      throw new Error('consumer failure');
    };

    expect(() => blockDismiss(failingHandler)(event)).toThrow('consumer failure');
    expect(event.defaultPrevented).toBe(true);
  });

  it('blocks on every invocation of the same wrapped handler', () => {
    const preventDefault = vi.fn();
    const handler = vi.fn();
    const onInteractOutside = blockDismiss(handler);

    onInteractOutside({ preventDefault });
    onInteractOutside({ preventDefault });

    expect(preventDefault).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
