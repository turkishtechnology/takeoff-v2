import type { HTMLAttributes } from 'react';

/**
 * Class-name map for a component base, with ALL slot classes required. This
 * differs from `ClassNamesMap`, which makes every slot optional because
 * customization consumers only override specific slots.
 */
export type SlotClassNames<TSlot extends string> = Record<TSlot, string>;

/**
 * Customization-side per-slot className map. Every slot is optional; only the
 * slots a consumer wants to extend appear.
 */
export type ClassNamesMap<TSlot extends string> = Partial<Record<TSlot, string>>;

/**
 * Customization-side per-slot HTML-attribute map. The default attribute shape
 * is `HTMLAttributes<HTMLElement>`; per-component overrides may narrow this
 * (e.g. `HTMLButtonElement` for a `Button.Spinner` slot).
 */
export type SlotPropsMap<TSlot extends string, TAttrs extends object = HTMLAttributes<HTMLElement>> = Partial<Record<TSlot, TAttrs>>;
