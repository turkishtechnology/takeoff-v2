import { clsx } from 'clsx';

import type { ClassNamesMap, SlotPropsMap } from './types';

export interface BuildSlotAttrsLayers<TSlot extends string> {
  themeSlotProps?: SlotPropsMap<TSlot>;
  themeClassNames?: ClassNamesMap<TSlot>;
  /** Provider shorthand for `theme.classNames.root`. */
  themeClassName?: string;
  instanceSlotProps?: SlotPropsMap<TSlot>;
  instanceClassNames?: ClassNamesMap<TSlot>;
  /** The instance's own `className` for the element this slot renders. */
  instanceClassName?: string;
  /**
   * Props the instance passes straight to the element this slot renders. The
   * element spreads them before these attrs, so a theme `slotProps` key the
   * instance also sets is left out — otherwise the theme would win.
   */
  instanceProps?: object;
}

/** Theme slot attrs minus the keys the instance sets itself. Classes add up and styles merge key by key with the instance on top, so neither is dropped. */
const belowInstance = (themeAttrs: object | undefined, instanceProps: object | undefined): { className?: string } | undefined => {
  if (!themeAttrs || !instanceProps) return themeAttrs;
  const own = instanceProps as Record<string, unknown>;
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(themeAttrs)) {
    if (key === 'className') kept[key] = value;
    else if (key === 'style' && own.style) kept[key] = { ...(value as object), ...(own.style as object) };
    else if (own[key] === undefined) kept[key] = value;
  }
  return kept;
};

/**
 * Compose the wrapper's canonical attrs with the provider theme and instance
 * overrides into a single attrs object. Precedence on the rendered element
 * (low → high), which spreads the instance props before these attrs:
 *
 *   theme slotProps → instance props → instance slotProps → wrapper canonical attrs
 *   className: canonical → theme → instance (concatenated; each layer's
 *   `slotProps` className follows its `classNames` entry)
 *   style: a theme slotProps style merges key by key under the instance's own style
 *
 * Canonical attrs always win on conflict so `data-slot` and `tk-*` classes
 * survive any override.
 */
export const buildSlotAttrs = <TSlot extends string, TAttrs extends { className?: string | undefined }>(
  canonicalAttrs: TAttrs,
  slotKey: TSlot,
  layers: BuildSlotAttrsLayers<TSlot> = {},
): TAttrs => {
  const { themeSlotProps, themeClassNames, themeClassName, instanceSlotProps, instanceClassNames, instanceClassName, instanceProps } = layers;
  const themeForSlot = belowInstance(themeSlotProps?.[slotKey], instanceProps);
  const instanceForSlot = instanceSlotProps?.[slotKey];

  // The provider's `className` shortcut is documented as an alias for
  // `classNames.root`, so it only kicks in on the root slot.
  const resolvedThemeClass = themeClassNames?.[slotKey] ?? (slotKey === ('root' as TSlot) ? themeClassName : undefined);
  const resolvedInstanceClass = instanceClassNames?.[slotKey];

  const composedClassName =
    clsx(canonicalAttrs.className, resolvedThemeClass, themeForSlot?.className, instanceClassName, resolvedInstanceClass, instanceForSlot?.className) || undefined;

  return {
    ...themeForSlot,
    ...instanceForSlot,
    ...canonicalAttrs,
    className: composedClassName,
  } as TAttrs;
};
