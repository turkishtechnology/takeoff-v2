import { clsx } from 'clsx';
import type { SlotClassNames } from '../types';

type ClassValue = string | false | null | undefined;

export interface ComponentBaseConfig<TProps extends object, TSlot extends string> {
  name: string;
  slots: readonly TSlot[];
  classNames: SlotClassNames<TSlot>;
  defaultProps?: Partial<TProps>;
}

export interface SlotProps {
  'className': string;
  'data-slot': string;
  [key: string]: unknown;
}

export interface ComponentBase<TProps extends object, TSlot extends string> {
  name: string;
  slots: readonly TSlot[];
  classes: Readonly<SlotClassNames<TSlot>>;
  defaultProps: Readonly<Partial<TProps>>;
  cx: (slot: TSlot, ...classNames: ClassValue[]) => string;
  getSlotProps: (slot: TSlot, extra?: { className?: ClassValue; [key: string]: unknown }) => SlotProps;
  resolveProps: <TIncoming extends Partial<TProps>>(props: TIncoming) => TIncoming & Partial<TProps>;
}

const mergeDefaultProps = <TProps extends object>(props: Partial<TProps>, defaultProps: Partial<TProps>): Partial<TProps> => {
  const mergedProps = { ...props };

  for (const key of Object.keys(defaultProps) as Array<keyof TProps>) {
    if (mergedProps[key] === undefined) {
      mergedProps[key] = defaultProps[key];
    }
  }

  return mergedProps;
};

export const createComponentBase = <TProps extends object, TSlot extends string>({
  name,
  slots,
  classNames,
  defaultProps = {},
}: ComponentBaseConfig<TProps, TSlot>): ComponentBase<TProps, TSlot> => {
  const classes = Object.freeze({ ...classNames }) as Readonly<SlotClassNames<TSlot>>;
  const resolvedDefaultProps = Object.freeze({ ...defaultProps }) as Readonly<Partial<TProps>>;

  return {
    name,
    slots: Object.freeze([...slots]) as readonly TSlot[],
    classes,
    defaultProps: resolvedDefaultProps,
    cx: (slot, ...dynamicClassNames) => clsx(classes[slot], ...dynamicClassNames),
    getSlotProps: (slot, extra = {}) => {
      const { className: extraClassName, ...rest } = extra;
      const dataSlot = slot.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
      return {
        'className': clsx(classes[slot], extraClassName),
        'data-slot': dataSlot,
        ...rest,
      };
    },
    resolveProps: props => mergeDefaultProps(props, resolvedDefaultProps) as typeof props & Partial<TProps>,
  };
};
