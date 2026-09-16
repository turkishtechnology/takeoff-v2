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
 * In `'trigger'` mode the trigger is measured when the hook mounts and again
 * every time `open` flips (the panel's Spar part stays mounted while closed, so
 * this is what guarantees a fresh value at open time), and kept in sync in
 * between via a ResizeObserver watching the trigger's **border box**. Every
 * read — mount, open, and every observer callback — goes through the same
 * `getBoundingClientRect().width` (border-box) path, so a padding or border
 * change re-measures just like a content change and the panel does not jump
 * between the first paint and the first resize. Observer callbacks are
 * coalesced into a single animation frame, so a burst of resize events (font
 * load, container reflow, drag) triggers at most one state update per frame
 * instead of one per event.
 *
 * @param open - The owning overlay's open state; a rising edge re-measures.
 */
export const useContentWidthStyle = (mode: ContentWidthMode, triggerRef: RefObject<HTMLElement | null>, open: boolean): CSSProperties | undefined => {
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
    // Border box, to match the `getBoundingClientRect` read above — the default
    // content box would miss padding/border changes.
    observer.observe(node, { box: 'border-box' });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
    // `open` is a deliberate dependency: re-running on every open/close is what
    // re-measures at open time.
  }, [mode, triggerRef, open]);

  return useMemo<CSSProperties | undefined>(() => {
    if (mode === 'trigger') {
      return triggerWidth != null ? { width: triggerWidth } : undefined;
    }
    const staticWidth = resolveStaticWidth(mode);
    return staticWidth != null ? { width: staticWidth } : undefined;
  }, [mode, triggerWidth]);
};
