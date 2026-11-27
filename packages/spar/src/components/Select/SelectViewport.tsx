import type { ElementType } from 'react';
import type { SelectViewportProps } from './types';
import { useSelectCollectionContext, useSelectContext } from './hooks';

/**
 * Scrollable region that wraps the select options so long lists can scroll
 * within a bounded area instead of overflowing the viewport.
 *
 * Headless: renders a plain element with no visual opinions. Apply a `max-height`
 * and `overflow` (e.g. `overflow-y: auto`) via `className`/`style` to enable
 * scrolling. Defaults to `role="presentation"` so it stays transparent in the
 * accessibility tree, preserving the `listbox` → `option` structure.
 *
 * With a `SelectSearch` present it becomes the `listbox` instead (the content
 * then also holds a text field, which a listbox may not own), so a search needs
 * its items inside a Viewport.
 *
 * Purely presentational otherwise: keeping the highlighted option visible during keyboard
 * navigation and typeahead is handled by `SelectItem` (each option scrolls itself
 * into its nearest scrollable ancestor), so it works whether or not the options
 * are wrapped in a `Viewport`.
 */
export const SelectViewport = <T extends ElementType = 'div'>({ as, role = 'presentation', ref, ...props }: SelectViewportProps<T>) => {
  const Component = as || 'div';
  // A Viewport only makes sense inside a Content; enforce that composition contract.
  const collection = useSelectCollectionContext();
  const context = useSelectContext();

  // With a SelectSearch in the content, the viewport is the listbox: the
  // content also holds the text field, which a listbox may not own.
  if (collection.hasSearch) {
    return <Component {...props} ref={ref} id={collection.listboxId} role="listbox" aria-labelledby={context.triggerId} />;
  }

  return <Component {...props} ref={ref} role={role} />;
};

SelectViewport.displayName = 'SelectViewport';
