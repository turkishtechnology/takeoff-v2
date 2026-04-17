import { clsx } from 'clsx';

import type { SlotProps } from '../base/createComponentBase';
import type { ClassNamesOverride } from './overrides';

/**
 * Internal structural shape used while iterating over slot-props maps.
 *
 * Component-facing types (e.g. `ButtonSlotProps`) stay precise through the
 * public generic parameters of `mergeSlotProps` / `buildSlotAttrs`; this
 * looser shape is only reached via one internal cast inside the helpers so
 * that variance mismatches between `HTMLAttributes<HTMLElement>` and
 * element-specific attribute types don't force callers to cast at every site.
 * The single internal cast is the only escape hatch the customization
 * contract deliberately allows.
 */
type InternalSlotBag = Record<string, { className?: string; [key: string]: unknown } | undefined>;

/**
 * Applies provider-level `defaultProps` underneath instance props, so unset
 * instance props fall back to the theme defaults. Instance props always win
 * on conflicts.
 *
 * The return type mirrors the instance props type, because defaulting only
 * fills unset fields and never changes the public shape of what the component
 * receives.
 *
 * Note: an explicit `instance.foo = undefined` still wins over a theme default.
 * This is the native behavior of object spread (`{ ...defaults, ...instance }`
 * copies the `undefined` own-property), and we keep it deliberately so that a
 * consumer can always blank a default by passing `undefined` — for example to
 * opt out of a provider-level `icon` without threading a sentinel through the
 * component.
 */
export const applyThemeDefaults = <TProps extends object>(defaults: Partial<TProps> | undefined, instanceProps: TProps): TProps => {
  if (!defaults) {
    return instanceProps;
  }
  return { ...defaults, ...instanceProps };
};

/**
 * Concatenates two `classNames` overrides. When both sides target the same
 * slot, values join with a space. Either side may be `undefined`; returns
 * `undefined` only when both sides are.
 */
export const mergeClassNames = <TSlot extends string>(
  themeClassNames: ClassNamesOverride<TSlot> | undefined,
  instanceClassNames: ClassNamesOverride<TSlot> | undefined,
): ClassNamesOverride<TSlot> | undefined => {
  if (!themeClassNames && !instanceClassNames) {
    return undefined;
  }

  if (!themeClassNames) {
    return instanceClassNames;
  }

  if (!instanceClassNames) {
    return themeClassNames;
  }

  const allSlots = new Set([...Object.keys(themeClassNames), ...Object.keys(instanceClassNames)]) as Set<TSlot>;
  const merged = {} as ClassNamesOverride<TSlot>;

  for (const slot of allSlots) {
    const combined = clsx(themeClassNames[slot], instanceClassNames[slot]);
    if (combined) {
      merged[slot] = combined;
    }
  }

  return merged;
};

/**
 * Shallow-merges two slot-props maps. Instance attributes win over theme
 * attributes; `className` values from both sides concatenate.
 *
 * Generic over the full slot-props shape so component-specific types like
 * `ButtonSlotProps` — whose `root` may be `ButtonHTMLAttributes |
 * AnchorHTMLAttributes` — round-trip exactly. Callers do not need casts at
 * their call sites because the generic collapses to the caller's type.
 */
export const mergeSlotProps = <TSlotProps>(themeSlotProps: TSlotProps | undefined, instanceSlotProps: TSlotProps | undefined): TSlotProps | undefined => {
  if (!themeSlotProps && !instanceSlotProps) {
    return undefined;
  }

  if (!themeSlotProps) {
    return instanceSlotProps;
  }

  if (!instanceSlotProps) {
    return themeSlotProps;
  }

  const theme = themeSlotProps as unknown as InternalSlotBag;
  const instance = instanceSlotProps as unknown as InternalSlotBag;
  const allSlots = new Set([...Object.keys(theme), ...Object.keys(instance)]);
  const merged: InternalSlotBag = {};

  for (const slot of allSlots) {
    const themeProps = theme[slot];
    const instanceProps = instance[slot];

    if (!themeProps) {
      if (instanceProps) {
        merged[slot] = instanceProps;
      }
    } else if (!instanceProps) {
      merged[slot] = themeProps;
    } else {
      merged[slot] = {
        ...themeProps,
        ...instanceProps,
        className: clsx(themeProps.className, instanceProps.className) || undefined,
      };
    }
  }

  return merged as unknown as TSlotProps;
};

/**
 * Builds the final attribute set for a slot by layering three sources:
 *
 * 1. `baseSlotProps` from `ComponentBase.getSlotProps(slot, extras)` — carries
 *    the canonical `tk-*` class, the `data-slot` anchor, and any wrapper-
 *    supplied extras (e.g. `aria-hidden` on an icon slot).
 * 2. `resolvedSlotProps[slot]` — merged theme + instance `slotProps`.
 * 3. `classNamesOverride` — merged theme + instance `classNames` for the slot.
 *
 * Precedence policy:
 *
 * - **Class name order** — canonical base → `slotProps.className` →
 *   `classNames` override. This lets consumers both append and, via a more-
 *   specific selector, override canonical styling.
 * - **Other attributes** — the wrapper's canonical attributes (everything
 *   `baseSlotProps` sets, including `data-slot` and any wrapper extras)
 *   **always win**. Consumer `slotProps` win only on keys the wrapper did
 *   not set. This is deliberate: it protects accessibility invariants the
 *   component establishes (for example, `aria-hidden: "true"` on decorative
 *   icon slots) from being silently stripped by a consumer slot-prop bag.
 *   Consumers wanting to reshape a canonical attribute should use a render
 *   override instead of `slotProps`.
 *
 * `resolvedSlotProps` is typed as `unknown` on purpose: every public slot-
 * props shape fits this contract structurally, and requiring a specific
 * generic here would push casts back out to every component call site.
 */
export const buildSlotAttrs = (baseSlotProps: SlotProps, resolvedSlotProps: unknown, slot: string, classNamesOverride: string | undefined): Record<string, unknown> => {
  const bag = resolvedSlotProps as InternalSlotBag | undefined;
  const slotAttrs = bag?.[slot];
  const { className: baseClassName, ...baseRest } = baseSlotProps;
  const finalClassName = clsx(baseClassName, slotAttrs?.className, classNamesOverride) || baseClassName;

  if (!slotAttrs) {
    return { ...baseRest, className: finalClassName };
  }

  const { className: _slotClassName, ...slotRest } = slotAttrs;
  return { ...slotRest, ...baseRest, className: finalClassName };
};
