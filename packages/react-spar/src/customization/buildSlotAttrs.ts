import { clsx } from 'clsx';

import type { ClassNamesMap, SlotPropsMap } from '../types';

/**
 * Per-call layer inputs for {@link buildSlotAttrs}. Theme entries come from
 * `SparReactProvider.components[name]`; instance entries come from the
 * component's own `classNames` / `slotProps` props.
 */
export interface BuildSlotAttrsLayers<TSlot extends string> {
  themeSlotProps?: SlotPropsMap<TSlot>;
  themeClassNames?: ClassNamesMap<TSlot>;
  /** Provider shorthand for `theme.classNames.root`. */
  themeClassName?: string;
  instanceSlotProps?: SlotPropsMap<TSlot>;
  instanceClassNames?: ClassNamesMap<TSlot>;
}

/**
 * Compose canonical slot attrs with theme-level and instance-level
 * customization in a single shallow-merge.
 *
 * Precedence (lowest → highest), matching `docs/contract-model.md`
 * § "Customization surfaces":
 *
 * 1. Wrapper canonical attrs (`tk-*` class, `data-slot`, ARIA the wrapper sets).
 * 2. Theme `slotProps[slotKey]`.
 * 3. Theme `classNames[slotKey]` (concatenated, never replaces canonical).
 * 4. Instance `slotProps[slotKey]`.
 * 5. Instance `classNames[slotKey]` (concatenated, never replaces canonical).
 *
 * For `className` the layers are concatenated in declaration order so consumer
 * intent reads left-to-right and the canonical `tk-*` class is never dropped.
 *
 * For all other attribute keys the merge order is `theme → instance →
 * canonical`. Canonical `data-*` and any other attribute the wrapper sets in
 * `canonicalAttrs` always win on conflict — that is the Spar-delegation
 * invariant from ADR-0003 and is what consumer styling pins to.
 */
export const buildSlotAttrs = <TSlot extends string, TAttrs extends { className?: string | undefined }>(
  canonicalAttrs: TAttrs,
  slotKey: TSlot,
  layers: BuildSlotAttrsLayers<TSlot> = {},
): TAttrs => {
  const { themeSlotProps, themeClassNames, themeClassName, instanceSlotProps, instanceClassNames } = layers;
  const themeForSlot = themeSlotProps?.[slotKey];
  const instanceForSlot = instanceSlotProps?.[slotKey];

  // Provider shorthand `themeClassName` only applies to the root slot —
  // matching ComponentThemeConfig's documented `className` shortcut.
  const resolvedThemeClass = themeClassNames?.[slotKey] ?? (slotKey === ('root' as TSlot) ? themeClassName : undefined);
  const resolvedInstanceClass = instanceClassNames?.[slotKey];

  const composedClassName = clsx(canonicalAttrs.className, resolvedThemeClass, resolvedInstanceClass) || undefined;

  return {
    ...themeForSlot,
    ...instanceForSlot,
    ...canonicalAttrs,
    className: composedClassName,
  } as TAttrs;
};
