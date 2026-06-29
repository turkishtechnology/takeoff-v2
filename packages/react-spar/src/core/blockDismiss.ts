/**
 * Wrap a Spar dialog dismiss handler so it blocks the close while still
 * invoking the consumer's own handler (if any). Used by non-dismissible
 * `Dialog.Panel` / `Drawer.Panel` for `onEscapeKeyDown` /
 * `onPointerDownOutside` / `onInteractOutside`, so a passed handler is
 * preserved rather than silently overwritten. `preventDefault` is called
 * first so the consumer cannot accidentally re-enable the close.
 */
export const blockDismiss =
  <E extends { preventDefault: () => void }>(handler?: (event: E) => void) =>
  (event: E) => {
    event.preventDefault();
    handler?.(event);
  };
