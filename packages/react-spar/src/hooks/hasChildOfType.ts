import { Children, isValidElement, type ComponentType, type ReactNode } from 'react';

/**
 * Reports whether `children` contains at least one direct child rendered
 * by the given component type. Used to detect compound-part children
 * (e.g. `Trigger.Title`) so root components can decide between an atomic
 * shortcut prop and a consumer-supplied compound part.
 *
 * Only direct children are inspected; nested descendants are intentionally
 * out of scope to keep the contract narrow.
 */
export const hasChildOfType = (children: ReactNode, componentType: ComponentType<never>): boolean =>
  Children.toArray(children).some(child => isValidElement(child) && child.type === componentType);
