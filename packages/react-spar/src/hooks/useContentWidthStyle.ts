import { useEffect, useMemo, useState, type CSSProperties, type RefObject } from 'react';

/**
 * Width contract shared by portalled overlay panels (Select, Dropdown).
 *
 * - `'content'`: no width style — the panel shrink-wraps its content.
 * - `'trigger'`: the panel matches the trigger's measured width.
 * - `number`: an explicit pixel width.
 * - `string`: any CSS width value (`'20rem'`, `'min(40ch, 100%)'`, …).
 */
export type ContentWidthMode = 'content' | 'trigger' | number | string;

// Resolve a static contentWidth value into a CSS width string. Returns
// `undefined` for `'trigger'` and `'content'` — those are handled by the hook
// (trigger needs a measured value, content keeps its natural width).
const resolveStaticWidth = (mode: ContentWidthMode): string | undefined => {
  if (mode === 'trigger' || mode === 'content') return undefined;
  return typeof mode === 'number' ? `${mode}px` : mode;
};

/**
 * Compute the `style` a portalled panel needs to honor a `contentWidth`
 * contract. Extracted from Select/Dropdown so both share one implementation.
 *
 * In `'trigger'` mode the trigger is measured at open time and kept in sync via
 * a ResizeObserver. Every read — the initial one and every observer callback —
 * goes through the same `getBoundingClientRect().width` (border-box) path, so
 * the panel does not jump between the first paint and the first resize. Observer
 * callbacks are coalesced into a single animation frame, so a burst of resize
 * events (font load, container reflow, drag) triggers at most one state update
 * per frame instead of one per event.
 */
export const useContentWidthStyle = (mode: ContentWidthMode, triggerRef: RefObject<HTMLElement | null>): CSSProperties | undefined => {
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  useEffect(() => {
    if (mode !== 'trigger') return;
    const node = triggerRef.current;
    if (!node) return;

    const measure = () => setTriggerWidth(Math.round(node.getBoundingClientRect().width));
    measure();

    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(node);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [mode, triggerRef]);

  return useMemo<CSSProperties | undefined>(() => {
    if (mode === 'trigger') {
      return triggerWidth != null ? { width: triggerWidth } : undefined;
    }
    const staticWidth = resolveStaticWidth(mode);
    return staticWidth != null ? { width: staticWidth } : undefined;
  }, [mode, triggerWidth]);
};
