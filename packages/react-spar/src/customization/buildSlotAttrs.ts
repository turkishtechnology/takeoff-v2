import { clsx } from 'clsx';

import type { SlotPropsMap } from '../types';

/**
 * Compose canonical slot attrs with provider-level customization.
 *
 * Inputs (lowest → highest priority for non-className keys):
 *
 * 1. `themeSlotProps[slotKey]` — provider customization, shallow-merged.
 * 2. `canonicalAttrs` — the result of `Base.getSlotProps(slot, { className })`,
 *    which already encodes the canonical `tk-*` class plus the instance
 *    `className`. Carries the canonical `data-slot` that styling depends on.
 *
 * className composition is **canonical → theme**, with the canonical class
 * (which already includes the instance className) coming first so that
 * authoring intent reads left-to-right.
 *
 * Per the contract model's customization-precedence rule:
 *
 * - Canonical `data-*` always wins on conflict (we spread canonicalAttrs last).
 * - Instance `slotProps`/`className` override theme counterparts (the instance
 *   className is already inside `canonicalAttrs.className`; theme is appended).
 * - Theme `slotProps` for unrelated keys (`style`, `aria-label`) survive
 *   verbatim because canonical does not specify them.
 */
export const buildSlotAttrs = <TSlot extends string, TAttrs extends { className?: string | undefined }>(
  canonicalAttrs: TAttrs,
  themeSlotProps: SlotPropsMap<TSlot> | undefined,
  slotKey: TSlot,
  themeClassNameForSlot: string | undefined,
): TAttrs => {
  const themeForSlot = themeSlotProps?.[slotKey];
  const composedClassName = clsx(canonicalAttrs.className, themeClassNameForSlot) || undefined;
  return {
    ...themeForSlot,
    ...canonicalAttrs,
    className: composedClassName,
  } as TAttrs;
};
