import { clsx, type ClassValue } from 'clsx';

import type { SlotClassNames } from './types';

export interface CreateComponentBaseConfig<TProps, TSlot extends string> {
  name: string;
  slots: readonly TSlot[];
  /** Canonical `tk-*` class for each slot. Empty strings are allowed. */
  classes: SlotClassNames<TSlot>;
  /** Author-side defaults. Provider theme defaults override these. */
  defaultProps?: Partial<TProps>;
}

export interface ComponentBase<TProps, TSlot extends string> {
  readonly name: string;
  readonly slots: readonly TSlot[];
  readonly classes: SlotClassNames<TSlot>;
  readonly defaultProps: Partial<TProps>;
  cx(...inputs: ClassValue[]): string;
  /** Returns `{ 'data-slot', className }` plus the rest of the passed attrs, with the canonical class concatenated. */
  getSlotProps<TAttrs extends { className?: string }>(slot: TSlot, attrs?: TAttrs): Omit<TAttrs, 'className'> & { 'data-slot': TSlot; 'className': string | undefined };
  /** Layer order: author defaults → theme defaults → instance props (instance wins). */
  resolveProps<P extends Partial<TProps>>(props: P, themeDefaults?: Partial<TProps>): P;
}

/**
 * Mint the tiny kit each component uses for class composition, slot tagging
 * and default-prop merging. Keeps every wrapper a thin adapter over Spar.
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
