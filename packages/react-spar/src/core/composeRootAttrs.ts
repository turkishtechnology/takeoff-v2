import { buildSlotAttrs } from './buildSlotAttrs';
import type { ComponentBase } from './createComponentBase';
import type { ComponentThemeConfig } from './theme';
import type { ClassNamesMap, SlotPropsMap } from './types';

interface RootSlotShape<TSlot extends string = 'root'> {
  className?: string;
  classNames?: ClassNamesMap<TSlot>;
  slotProps?: SlotPropsMap<TSlot>;
}

type RootAttrs = { 'data-slot': 'root'; 'className': string | undefined } & Record<string, unknown>;

export interface RootAttrsResult<TProps> {
  /** Final root-element attrs: canonical class + `data-slot`, theme/instance overrides shallow-merged underneath. */
  rootAttrs: RootAttrs;
  /** Resolved props with the layering keys (`className`, `classNames`, `slotProps`) already stripped. */
  rest: Omit<TProps, 'className' | 'classNames' | 'slotProps'>;
}

export interface ComposeRootOptions<TProps> {
  /**
   * Canonical state-driven `data-*` attributes (variant, size, disabled, …).
   * Receives the **post-merge** props (`author defaults → theme defaults →
   * instance props`) so theme-level `defaultProps` flow through correctly —
   * a literal object cannot reference merged values and silently bypasses
   * theme defaults.
   *
   * Layered **on top** of `slotProps.root` so design-system invariants
   * survive theme/instance overrides. Entries whose value is `undefined`
   * are dropped, which mirrors the boolean-presence convention in
   * `docs/data-attribute-vocabulary.md` — pass `''` for "present",
   * `undefined` for "absent".
   *
   * Authors who do not need merged values can ignore the argument:
   * `stateAttrs: () => ({ 'data-foo': contextValue })`.
   */
  stateAttrs?: (merged: TProps) => Record<string, string | undefined>;
}

const dropUndefined = (attrs: Record<string, string | undefined>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const key in attrs) {
    const value = attrs[key];
    if (value !== undefined) out[key] = value;
  }
  return out;
};

/**
 * Compose the canonical attrs for the **root slot only**, even when the base
 * declares additional slots. Resolves `(author defaults → theme defaults →
 * instance props)` in one pass and returns the resulting attrs plus the
 * leftover props with `className`, `classNames`, and `slotProps` already
 * stripped so callers destructure component-specific fields directly.
 *
 * The `TSlot` generic exists so multi-slot bases (e.g. `'root' | 'icon' |
 * 'title' | 'arrow'`) can be passed in without a type error — but the
 * function still composes only the `'root'` slot. Non-root slots are
 * conditional and live at the consumer's render site; compose them there
 * with `buildSlotAttrs` directly.
 *
 * Single-slot components: this is usually the only composition call needed.
 * Multi-slot components: call this for `'root'`, then `buildSlotAttrs` per
 * additional slot at its own render site.
 *
 * Pass `options.stateAttrs` to layer canonical `data-*` styling hooks on top
 * of `slotProps.root` — consumer `slotProps` cannot override them.
 */
export const composeRootAttrs = <TProps extends RootSlotShape<TSlot>, TSlot extends string = 'root'>(
  base: ComponentBase<TProps, TSlot>,
  props: TProps,
  theme: ComponentThemeConfig<TProps, TSlot> | undefined,
  options?: ComposeRootOptions<TProps>,
): RootAttrsResult<TProps> => {
  const merged = base.resolveProps(props, theme?.defaultProps);
  const { className, classNames, slotProps, ...rest } = merged;

  const rootSlot = 'root' as TSlot;
  const rootAttrs = buildSlotAttrs(base.getSlotProps(rootSlot, { className }), rootSlot, {
    themeSlotProps: theme?.slotProps as SlotPropsMap<TSlot> | undefined,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  const stateAttrs = options?.stateAttrs ? dropUndefined(options.stateAttrs(merged)) : undefined;
  const composed = stateAttrs ? { ...rootAttrs, ...stateAttrs } : rootAttrs;

  return {
    rootAttrs: composed as RootAttrs,
    rest: rest as Omit<TProps, 'className' | 'classNames' | 'slotProps'>,
  };
};
