import { act, renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useContentWidthStyle, type ContentWidthMode } from './useContentWidthStyle';

/**
 * jsdom has no ResizeObserver. This stand-in records what the hook observes and
 * lets a test report a resize on demand.
 */
class ResizeObserverStub {
  static instances: ResizeObserverStub[] = [];

  readonly observed: Element[] = [];
  disconnected = false;
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverStub.instances.push(this);
  }

  observe(target: Element) {
    this.observed.push(target);
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true;
  }

  /** What the browser does when the observed box changes size. */
  resize() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

/** Animation frames queue up until a test flushes them, so frame timing is explicit. */
const frames = new Map<number, FrameRequestCallback>();
let lastFrameId = 0;

const flushFrames = () =>
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback(0));
  });

const observer = () => {
  const [instance] = ResizeObserverStub.instances;
  if (!instance) throw new Error('No ResizeObserver was created');
  return instance;
};

/** A trigger whose border-box width the test controls (jsdom lays nothing out). */
const createTrigger = (initialWidth: number) => {
  const trigger = document.createElement('button');
  let width = initialWidth;
  const measure = vi
    .spyOn(trigger, 'getBoundingClientRect')
    .mockImplementation(() => ({ width, height: 32, top: 0, left: 0, right: width, bottom: 32, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect);
  const ref = createRef<HTMLElement>();
  ref.current = trigger;

  return {
    trigger,
    ref,
    measure,
    setWidth: (next: number) => {
      width = next;
    },
  };
};

beforeEach(() => {
  ResizeObserverStub.instances = [];
  frames.clear();
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    lastFrameId += 1;
    frames.set(lastFrameId, callback);
    return lastFrameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useContentWidthStyle', () => {
  describe('static modes', () => {
    it('sets no width in content mode so the panel shrink-wraps its content', () => {
      const { ref, measure } = createTrigger(120);
      const { result } = renderHook(() => useContentWidthStyle('content', ref));

      expect(result.current).toBeUndefined();
      expect(measure).not.toHaveBeenCalled();
      expect(ResizeObserverStub.instances).toHaveLength(0);
    });

    it('turns a number into an explicit pixel width', () => {
      const { ref, measure } = createTrigger(120);
      const { result } = renderHook(() => useContentWidthStyle(280, ref));

      expect(result.current).toEqual({ width: '280px' });
      expect(measure).not.toHaveBeenCalled();
      expect(ResizeObserverStub.instances).toHaveLength(0);
    });

    it('keeps a zero pixel width rather than dropping it as falsy', () => {
      const { ref } = createTrigger(120);
      const { result } = renderHook(() => useContentWidthStyle(0, ref));

      expect(result.current).toEqual({ width: '0px' });
    });

    it('passes any CSS width string through unchanged', () => {
      const { ref } = createTrigger(120);
      const { result } = renderHook(() => useContentWidthStyle('min(20rem, 90vw)', ref));

      expect(result.current).toEqual({ width: 'min(20rem, 90vw)' });
      expect(ResizeObserverStub.instances).toHaveLength(0);
    });
  });

  describe('trigger mode', () => {
    it("matches the trigger's measured border-box width, rounded", () => {
      const { ref, measure } = createTrigger(120.6);
      const { result } = renderHook(() => useContentWidthStyle('trigger', ref));

      expect(measure).toHaveBeenCalledTimes(1);
      expect(result.current).toEqual({ width: 121 });
    });

    it('observes the trigger for size changes', () => {
      const { ref, trigger } = createTrigger(120);
      renderHook(() => useContentWidthStyle('trigger', ref));

      expect(ResizeObserverStub.instances).toHaveLength(1);
      expect(observer().observed).toEqual([trigger]);
    });

    it('sets no width while the trigger is not mounted', () => {
      const ref = createRef<HTMLElement>();
      const { result } = renderHook(() => useContentWidthStyle('trigger', ref));

      expect(result.current).toBeUndefined();
      expect(ResizeObserverStub.instances).toHaveLength(0);
    });

    it('applies a resize on the next animation frame through the same rounded measurement', () => {
      const { ref, setWidth } = createTrigger(120);
      const { result } = renderHook(() => useContentWidthStyle('trigger', ref));

      setWidth(200.2);
      act(() => observer().resize());

      expect(result.current).toEqual({ width: 120 });

      flushFrames();

      expect(result.current).toEqual({ width: 200 });
    });

    it('coalesces a burst of resize callbacks into one measurement per frame', () => {
      const { ref, measure, setWidth } = createTrigger(120);
      const { result } = renderHook(() => useContentWidthStyle('trigger', ref));
      measure.mockClear();

      setWidth(180);
      act(() => {
        observer().resize();
        observer().resize();
        observer().resize();
      });
      flushFrames();

      expect(measure).toHaveBeenCalledTimes(1);
      expect(result.current).toEqual({ width: 180 });
    });

    it('stops observing and drops a pending measurement on unmount', () => {
      const { ref, measure } = createTrigger(120);
      const { unmount } = renderHook(() => useContentWidthStyle('trigger', ref));
      const instance = observer();

      act(() => instance.resize());
      measure.mockClear();
      unmount();

      expect(instance.disconnected).toBe(true);
      expect(frames.size).toBe(0);

      flushFrames();

      expect(measure).not.toHaveBeenCalled();
    });
  });

  describe('mode changes', () => {
    const renderWithMode = (mode: ContentWidthMode, ref: ReturnType<typeof createTrigger>['ref']) =>
      renderHook((props: { mode: ContentWidthMode }) => useContentWidthStyle(props.mode, ref), { initialProps: { mode } });

    it('disconnects the observer and applies the static width when leaving trigger mode', () => {
      const { ref } = createTrigger(120);
      const { result, rerender } = renderWithMode('trigger', ref);
      const instance = observer();

      rerender({ mode: 320 });

      expect(instance.disconnected).toBe(true);
      expect(result.current).toEqual({ width: '320px' });
    });

    it('drops a pending measurement when leaving trigger mode', () => {
      const { ref, measure, setWidth } = createTrigger(120);
      const { result, rerender } = renderWithMode('trigger', ref);

      setWidth(240);
      act(() => observer().resize());
      measure.mockClear();

      rerender({ mode: 320 });

      expect(frames.size).toBe(0);
      flushFrames();
      expect(measure).not.toHaveBeenCalled();
      expect(result.current).toEqual({ width: '320px' });
    });

    it('drops the measured width when switching to content mode', () => {
      const { ref } = createTrigger(120);
      const { result, rerender } = renderWithMode('trigger', ref);

      expect(result.current).toEqual({ width: 120 });

      rerender({ mode: 'content' });

      expect(result.current).toBeUndefined();
    });

    it('starts measuring when switching into trigger mode', () => {
      const { ref } = createTrigger(150);
      const { result, rerender } = renderWithMode('content', ref);

      expect(result.current).toBeUndefined();

      rerender({ mode: 'trigger' });

      expect(result.current).toEqual({ width: 150 });
      expect(ResizeObserverStub.instances).toHaveLength(1);
    });
  });
});
