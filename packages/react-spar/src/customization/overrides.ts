import type { HTMLAttributes } from 'react';

/**
 * Per-slot class name overrides. Keys are component slot names; values are
 * additional CSS classes concatenated with the canonical `tk-*` slot classes.
 * Canonical classes are never replaced.
 */
export type ClassNamesOverride<TSlot extends string> = Partial<Record<TSlot, string>>;

/**
 * Per-slot HTML attribute overrides. `className` values within `slotProps`
 * are concatenated with the canonical slot class, not replaced. Components
 * narrow this generic with their own `XxxSlotProps` interface to retain
 * element-specific attribute typing (e.g. Button's root is
 * `ButtonHTMLAttributes | AnchorHTMLAttributes`).
 */
export type SlotPropsOverride<TSlot extends string> = Partial<Record<TSlot, HTMLAttributes<HTMLElement>>>;
