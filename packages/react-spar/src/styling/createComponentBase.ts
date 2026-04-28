import { clsx, type ClassValue } from 'clsx';

import type { SlotClassNames } from '../types';

export interface CreateComponentBaseConfig<TProps, TSlot extends string> {
  /** Stable identifier used for debugging and `displayName` correlation. */
  name: string;
  /** Slot key tuple, declared once. Order is meaningful for documentation only. */
  slots: readonly TSlot[];
  /** Canonical `tk-*` class for every slot. Empty strings are allowed. */
  classes: SlotClassNames<TSlot>;
  /** Component-author defaults. Theme defaults from the provider override these. */
  defaultProps?: Partial<TProps>;
}

export interface SlotAttrsOutput<TSlot extends string, TAttrs> {
  'className': string | undefined;
  'data-slot': TSlot;
  'attrs': TAttrs;
}

export interface ComponentBase<TProps, TSlot extends string> {
  readonly name: string;
  readonly slots: readonly TSlot[];
  readonly classes: SlotClassNames<TSlot>;
  readonly defaultProps: Partial<TProps>;

  /** Pure passthrough to `clsx` so component code never reaches for it directly. */
  cx(...inputs: ClassValue[]): string;

  /**
   * Compose the canonical slot attrs (`data-slot` + class) with locally-passed
   * attrs (instance className + any HTML attributes). Returns a single object
   * suitable for `<X {...result}>` or further composition with `buildSlotAttrs`.
   */
  getSlotProps<TAttrs extends { className?: string }>(slot: TSlot, attrs?: TAttrs): Omit<TAttrs, 'className'> & { 'data-slot': TSlot; 'className': string | undefined };

  /**
   * Apply default-prop precedence:
   *   author defaults  →  provider/theme defaults  →  instance props.
   * Instance always wins; theme wins over author defaults.
   */
  resolveProps<P extends Partial<TProps>>(props: P, themeDefaults?: Partial<TProps>): P;
}

/**
 * Single factory that every component's `*Base.ts` calls to mint a tiny,
 * typed kit of helpers. Centralizes class composition, slot tagging, and
 * default-prop precedence so the component code stays a thin adapter.
 */
export const createComponentBase = <TProps, TSlot extends string>(config: CreateComponentBaseConfig<TProps, TSlot>): ComponentBase<TProps, TSlot> => {
  const { name, slots, classes, defaultProps = {} as Partial<TProps> } = config;

  const cx = (...inputs: ClassValue[]): string => clsx(...inputs);

  const getSlotProps = <TAttrs extends { className?: string }>(
    slot: TSlot,
    attrs?: TAttrs,
  ): Omit<TAttrs, 'className'> & { 'data-slot': TSlot; 'className': string | undefined } => {
    const { className: instanceClassName, ...rest } = (attrs ?? {}) as TAttrs;
    const composed = cx(classes[slot], instanceClassName);
    return {
      ...(rest as Omit<TAttrs, 'className'>),
      'data-slot': slot,
      'className': composed || undefined,
    };
  };

  const resolveProps = <P extends Partial<TProps>>(props: P, themeDefaults?: Partial<TProps>): P =>
    ({
      ...defaultProps,
      ...themeDefaults,
      ...props,
    }) as P;

  return {
    name,
    slots,
    classes,
    defaultProps: defaultProps as Partial<TProps>,
    cx,
    getSlotProps,
    resolveProps,
  };
};
