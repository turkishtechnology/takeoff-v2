import type { HTMLAttributes } from 'react';

/** Per-slot class map declared by a component base. Every slot is required. */
export type SlotClassNames<TSlot extends string> = Record<TSlot, string>;

/** Per-slot className override map. Consumers only fill the slots they extend. */
export type ClassNamesMap<TSlot extends string> = Partial<Record<TSlot, string>>;

/**
 * Per-slot HTML-attribute override map. Defaults to a generic `HTMLAttributes`
 * shape; components with element-specific slots may narrow `TAttrs`.
 */
export type SlotPropsMap<TSlot extends string, TAttrs extends object = HTMLAttributes<HTMLElement>> = Partial<Record<TSlot, TAttrs>>;
