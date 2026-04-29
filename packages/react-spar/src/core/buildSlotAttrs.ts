import { clsx } from 'clsx';

import type { ClassNamesMap, SlotPropsMap } from './types';

export interface BuildSlotAttrsLayers<TSlot extends string> {
  themeSlotProps?: SlotPropsMap<TSlot>;
  themeClassNames?: ClassNamesMap<TSlot>;
  /** Provider shorthand for `theme.classNames.root`. */
  themeClassName?: string;
  instanceSlotProps?: SlotPropsMap<TSlot>;
  instanceClassNames?: ClassNamesMap<TSlot>;
}

/**
 * Compose the wrapper's canonical attrs with the provider theme and instance
 * overrides into a single attrs object. Precedence (low → high):
 *
 *   theme slotProps → instance slotProps → wrapper canonical attrs
 *   className: canonical → theme → instance (concatenated)
 *
 * Canonical attrs always win on conflict so `data-slot` and `tk-*` classes
 * survive any override.
 */
export const buildSlotAttrs = <TSlot extends string, TAttrs extends { className?: string | undefined }>(
  canonicalAttrs: TAttrs,
  slotKey: TSlot,
  layers: BuildSlotAttrsLayers<TSlot> = {},
): TAttrs => {
  const { themeSlotProps, themeClassNames, themeClassName, instanceSlotProps, instanceClassNames } = layers;
  const themeForSlot = themeSlotProps?.[slotKey];
  const instanceForSlot = instanceSlotProps?.[slotKey];

  // The provider's `className` shortcut is documented as an alias for
  // `classNames.root`, so it only kicks in on the root slot.
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
