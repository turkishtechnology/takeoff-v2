import { renderHook } from '@testing-library/react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useNestedLayerDismissGuard, useNestedLayerDismissHandlers } from './useNestedLayerDismissGuard';

const pointerDown = () => new Event('pointerdown', { cancelable: true }) as PointerEvent;
const reactEventFor = (nativeEvent: Event) => ({ nativeEvent }) as unknown as ReactPointerEvent<HTMLDivElement>;

describe('useNestedLayerDismissGuard', () => {
  it('vetoes and swallows an outside event that started inside the React tree', () => {
    const { result } = renderHook(() => useNestedLayerDismissGuard());
    const handler = vi.fn();
    const event = pointerDown();

    result.current.onPointerDownCapture(reactEventFor(event));
    result.current.guardOutside(handler)(event);

    expect(event.defaultPrevented).toBe(true);
    expect(handler).not.toHaveBeenCalled();
  });

  it('forwards a genuine outside event untouched', () => {
    const { result } = renderHook(() => useNestedLayerDismissGuard());
    const handler = vi.fn();
    const event = pointerDown();

    result.current.guardOutside(handler)(event);

    expect(event.defaultPrevented).toBe(false);
    expect(handler).toHaveBeenCalledExactlyOnceWith(event);
  });

  it('calls the consumer capture handler', () => {
    const consumer = vi.fn();
    const { result } = renderHook(() => useNestedLayerDismissGuard(consumer));
    const reactEvent = reactEventFor(pointerDown());

    result.current.onPointerDownCapture(reactEvent);

    expect(consumer).toHaveBeenCalledExactlyOnceWith(reactEvent);
  });
});

describe('useNestedLayerDismissHandlers', () => {
  it('leaves genuine outside presses to the consumer when dismissible', () => {
    const onPointerDownOutside = vi.fn();
    const { result } = renderHook(() => useNestedLayerDismissHandlers({ dismissible: true, instanceProps: { onPointerDownOutside }, rootAttrs: {} }));
    const event = pointerDown();

    result.current.onPointerDownOutside(event);

    expect(onPointerDownOutside).toHaveBeenCalledExactlyOnceWith(event);
    expect(event.defaultPrevented).toBe(false);
    expect(result.current).not.toHaveProperty('onEscapeKeyDown');
  });

  it('blocks genuine outside presses and Escape when not dismissible, still calling the consumer', () => {
    const onPointerDownOutside = vi.fn();
    const onEscapeKeyDown = vi.fn();
    const { result } = renderHook(() => useNestedLayerDismissHandlers({ dismissible: false, instanceProps: { onPointerDownOutside, onEscapeKeyDown }, rootAttrs: {} }));
    const pointer = pointerDown();
    const escape = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });

    result.current.onPointerDownOutside(pointer);
    result.current.onEscapeKeyDown?.(escape);

    expect(pointer.defaultPrevented).toBe(true);
    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(escape.defaultPrevented).toBe(true);
    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
  });

  it('prefers the rootAttrs capture handler over the instance one, like the spread order', () => {
    const fromInstance = vi.fn();
    const fromRoot = vi.fn();
    const { result } = renderHook(() =>
      useNestedLayerDismissHandlers({ dismissible: true, instanceProps: { onPointerDownCapture: fromInstance }, rootAttrs: { onPointerDownCapture: fromRoot } }),
    );

    result.current.onPointerDownCapture(reactEventFor(pointerDown()));

    expect(fromRoot).toHaveBeenCalledTimes(1);
    expect(fromInstance).not.toHaveBeenCalled();
  });

  it('guards nested-layer presses on both outside handlers', () => {
    const onPointerDownOutside = vi.fn();
    const onInteractOutside = vi.fn();
    const { result } = renderHook(() => useNestedLayerDismissHandlers({ dismissible: true, instanceProps: { onPointerDownOutside, onInteractOutside }, rootAttrs: {} }));
    const event = pointerDown();

    result.current.onPointerDownCapture(reactEventFor(event));
    result.current.onPointerDownOutside(event);
    result.current.onInteractOutside(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onPointerDownOutside).not.toHaveBeenCalled();
    expect(onInteractOutside).not.toHaveBeenCalled();
  });
});
