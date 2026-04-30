import { buildSlotAttrs } from './buildSlotAttrs';
import type { ComponentBase } from './createComponentBase';
import type { ComponentThemeConfig } from './theme';
import type { ClassNamesMap, SlotPropsMap } from './types';

interface RootSlotShape {
  className?: string;
  classNames?: ClassNamesMap<'root'>;
  slotProps?: SlotPropsMap<'root'>;
}

type RootAttrs = { 'data-slot': 'root'; 'className': string | undefined } & Record<string, unknown>;

export interface RootAttrsResult<TProps extends RootSlotShape> {
  /** Final root-element attrs: canonical class + `data-slot`, theme/instance overrides shallow-merged underneath. */
  rootAttrs: RootAttrs;
  /** Resolved props with the layering keys (`className`, `classNames`, `slotProps`) already stripped. */
  rest: Omit<TProps, 'className' | 'classNames' | 'slotProps'>;
}

/**
 * Resolve `(author defaults → theme defaults → instance props)` and build the
 * canonical root-slot attrs in one step. Returns the attrs plus the leftover
 * props with `className`, `classNames`, and `slotProps` already stripped so
 * callers destructure component-specific fields directly.
 */
export const composeRootAttrs = <TProps extends RootSlotShape>(
  base: ComponentBase<TProps, 'root'>,
  props: TProps,
  theme: ComponentThemeConfig<TProps> | undefined,
): RootAttrsResult<TProps> => {
  const merged = base.resolveProps(props, theme?.defaultProps);
  const { className, classNames, slotProps, ...rest } = merged;

  const rootAttrs = buildSlotAttrs(base.getSlotProps('root', { className }), 'root', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    themeClassName: theme?.className,
    instanceSlotProps: slotProps,
    instanceClassNames: classNames,
  });

  return {
    rootAttrs: rootAttrs as RootAttrs,
    rest: rest as Omit<TProps, 'className' | 'classNames' | 'slotProps'>,
  };
};
