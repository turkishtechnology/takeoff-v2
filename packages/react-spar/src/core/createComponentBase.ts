import { clsx, type ClassValue } from 'clsx';

import type { SlotClassNames } from './types';

type KebabCase<S extends string> = S extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First>
    ? `${First}${KebabCase<Rest>}`
    : `-${Lowercase<First>}${KebabCase<Rest>}`
  : S;

export type DataSlotName<TSlot extends string> = KebabCase<TSlot>;

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
  /** Returns `{ 'data-slot', className }` plus attrs, with the canonical class concatenated. */
  getSlotProps<TAttrs extends { className?: string }>(
    slot: TSlot,
    attrs?: TAttrs,
  ): Omit<TAttrs, 'className'> & { 'data-slot': DataSlotName<TSlot>; 'className': string | undefined };
  /** Layer order: author defaults → theme defaults → instance props (instance wins). */
  resolveProps<P extends Partial<TProps>>(props: P, themeDefaults?: Partial<TProps>): P;
}

const toDataSlotName = (slot: string): string =>
  slot.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

/**
 * Mint the tiny kit each component uses for class composition, slot tagging
 * and default-prop merging. Keeps every wrapper thin over Spar.
 */
export const createComponentBase = <TProps, TSlot extends string>(
  config: CreateComponentBaseConfig<TProps, TSlot>,
): ComponentBase<TProps, TSlot> => {
  const { name, slots, classes, defaultProps = {} as Partial<TProps> } = config;

  const cx = (...inputs: ClassValue[]): string => clsx(...inputs);

  const getSlotProps = <TAttrs extends { className?: string }>(
    slot: TSlot,
    attrs?: TAttrs,
  ): Omit<TAttrs, 'className'> & { 'data-slot': DataSlotName<TSlot>; 'className': string | undefined } => {
    const { className: instanceClassName, ...rest } = (attrs ?? {}) as TAttrs;
    const composed = cx(classes[slot], instanceClassName);
    return {
      ...(rest as Omit<TAttrs, 'className'>),
      'data-slot': toDataSlotName(slot) as DataSlotName<TSlot>,
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
