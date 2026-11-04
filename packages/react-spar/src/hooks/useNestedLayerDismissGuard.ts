import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react';

import { blockDismiss } from '../core';

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
 *
 * TODO(spar#196): turkishtechnology/spar#196 fixes this in Spar's
 * `useInteractOutside` itself. Once a Spar release containing it is pinned,
 * remove this hook and its use in `Dialog.Panel` / `Drawer.Panel`.
 */
export const useNestedLayerDismissGuard = <E extends HTMLElement = HTMLElement>(onPointerDownCapture?: (event: ReactPointerEvent<E>) => void) => {
  const insideEvents = useRef<WeakSet<Event> | null>(null);
  const getInsideEvents = () => (insideEvents.current ??= new WeakSet());

  const handlePointerDownCapture = useCallback(
    (event: ReactPointerEvent<E>) => {
      getInsideEvents().add(event.nativeEvent);
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
        if (getInsideEvents().has(event)) {
          event.preventDefault();
          return;
        }
        handler?.(event);
      },
    [],
  );

  return { onPointerDownCapture: handlePointerDownCapture, guardOutside };
};

type Handler<E> = ((event: E) => void) | undefined;

export interface NestedLayerDismissOptions {
  /** `false` blocks every dismiss (Escape and genuine outside presses). */
  dismissible: boolean;
  /** The panel's instance props as forwarded to Spar's `DialogContent`. */
  instanceProps: {
    onEscapeKeyDown?: Handler<KeyboardEvent>;
    onPointerDownOutside?: Handler<PointerEvent>;
    onInteractOutside?: Handler<PointerEvent>;
    onPointerDownCapture?: Handler<ReactPointerEvent<HTMLDivElement>>;
  };
  /** The theme / `slotProps.root` attrs, spread after the instance props. */
  rootAttrs: Record<string, unknown>;
}

/**
 * The full set of dismiss-related props for `Dialog.Panel` / `Drawer.Panel`,
 * so both panels stay in sync: the nested-layer guard, `blockDismiss` when
 * not dismissible, and the consumer's `onPointerDownCapture` (taken from
 * `rootAttrs` first, since that is spread last and wins for the same key).
 * Spread the result after the instance props and `rootAttrs`.
 *
 * TODO(spar#196): remove together with `useNestedLayerDismissGuard`.
 */
export const useNestedLayerDismissHandlers = ({ dismissible, instanceProps, rootAttrs }: NestedLayerDismissOptions) => {
  const consumerPointerDownCapture = (rootAttrs.onPointerDownCapture ?? instanceProps.onPointerDownCapture) as Handler<ReactPointerEvent<HTMLDivElement>>;
  const { onPointerDownCapture, guardOutside } = useNestedLayerDismissGuard(consumerPointerDownCapture);

  const outside = <E extends Event>(handler: Handler<E>) => guardOutside(dismissible ? handler : blockDismiss(handler));

  return {
    ...(!dismissible && { onEscapeKeyDown: blockDismiss(instanceProps.onEscapeKeyDown) }),
    onPointerDownOutside: outside(instanceProps.onPointerDownOutside),
    onInteractOutside: outside(instanceProps.onInteractOutside),
    onPointerDownCapture,
  };
};
