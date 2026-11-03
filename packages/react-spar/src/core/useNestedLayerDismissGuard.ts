import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';

/**
 * Keeps a dismissable layer (Dialog / Drawer panel) open when the user
 * interacts with a floating layer that is rendered *inside* it in the React
 * tree but portaled elsewhere in the DOM, e.g. `Select.Content`,
 * `Popover.Content`, `Dropdown.Content` or a date-picker popover.
 *
 * Spar's outside-interaction check only asks whether the `pointerdown` target
 * is a DOM descendant of the panel. Portaled children never are, so picking a
 * Select option inside a modal Dialog was treated as an outside press and
 * closed the dialog.
 *
 * React synthetic events, however, propagate through portals along the React
 * tree. A capture-phase `onPointerDownCapture` on the panel therefore sees
 * every `pointerdown` that starts in one of its (portaled) descendants, and it
 * runs before Spar's bubble-phase `document` listener. We remember those
 * native events and veto the outside dismiss for exactly them.
 */
export const useNestedLayerDismissGuard = <E extends HTMLElement = HTMLElement>(onPointerDownCapture?: (event: ReactPointerEvent<E>) => void) => {
  const insideEvents = useRef<WeakSet<Event>>(new WeakSet());

  const handlePointerDownCapture = useCallback(
    (event: ReactPointerEvent<E>) => {
      insideEvents.current.add(event.nativeEvent);
      onPointerDownCapture?.(event);
    },
    [onPointerDownCapture],
  );

  /**
   * Wrap an outside-dismiss handler: events that started inside the panel's
   * React tree are prevented and not forwarded, since they are not outside
   * interactions from the consumer's point of view.
   */
  const guardOutside = useCallback(
    <T extends Event>(handler?: (event: T) => void) =>
      (event: T) => {
        if (insideEvents.current.has(event)) {
          event.preventDefault();
          return;
        }
        handler?.(event);
      },
    [],
  );

  return { onPointerDownCapture: handlePointerDownCapture, guardOutside };
};
