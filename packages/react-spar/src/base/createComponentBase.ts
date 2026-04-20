import { clsx } from 'clsx';

import type { SlotClassNames } from '../types';

type ClassValue = string | false | null | undefined;

export interface SlotProps {
  'className': string;
  'data-slot': string;
  [key: string]: unknown;
}

export interface ComponentBase<TSlot extends string> {
  classes: SlotClassNames<TSlot>;
  getSlotProps: (slot: TSlot, extra?: { className?: ClassValue; [key: string]: unknown }) => SlotProps;
}

/**
 * Carries the canonical slot→class map for a component and a helper that
 * produces `{ className, 'data-slot', ...extras }` for any slot. Wrappers use
 * `classes` directly when they inline their DOM; `getSlotProps` is retained
 * as an optional shortcut.
 */
export const createComponentBase = <TSlot extends string>(classNames: SlotClassNames<TSlot>): ComponentBase<TSlot> => ({
  classes: classNames,
  getSlotProps: (slot, extra = {}) => {
    const { className: extraClassName, ...rest } = extra;
    return {
      'className': clsx(classNames[slot], extraClassName),
      'data-slot': slot.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`),
      ...rest,
    };
  },
});
