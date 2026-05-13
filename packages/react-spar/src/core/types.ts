import type { ComponentPropsWithoutRef, ElementType, HTMLAttributes } from 'react';

/** Per-slot class map declared by a component base. Every slot is required. */
export type SlotClassNames<TSlot extends string> = Record<TSlot, string>;

/** Per-slot className override map. Consumers only fill the slots they extend. */
export type ClassNamesMap<TSlot extends string> = Partial<Record<TSlot, string>>;

/**
 * Per-slot HTML-attribute override map. Defaults to a generic `HTMLAttributes`
 * shape; components with element-specific slots may narrow `TAttrs`.
 */
export type SlotPropsMap<TSlot extends string, TAttrs extends object = HTMLAttributes<HTMLElement>> = Partial<Record<TSlot, TAttrs>>;

/**
 * Native HTML props that every takeoff-v2 wrapper owns — the wrapper-typed
 * versions (`classNames`, `slotProps`) always replace the native names. Apply
 * via {@link TakeoffHTMLProps} as the base for wrapper Props interfaces.
 *
 * Component-specific extra omits (e.g. native `defaultValue`/`onChange` when
 * a headless prop owns the same name) are added at the call site.
 */
export type TakeoffSlotOverrides = 'classNames' | 'slotProps';

/**
 * Native props of `T` minus the props takeoff-v2 always owns. The shared base
 * for wrapper Props interfaces — pairs with `Pick<SparXxxProps, ...>` to form
 * the public boundary.
 */
export type TakeoffHTMLProps<T extends ElementType> = Omit<ComponentPropsWithoutRef<T>, TakeoffSlotOverrides>;
