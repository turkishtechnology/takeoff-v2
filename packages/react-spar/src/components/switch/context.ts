import type { ClassNamesMap, SlotPropsMap } from '../../core';
import { createSafeContext } from '../../hooks';

import type { SwitchSlot } from './types';

export interface SwitchOwnContextValue {
  classNames?: ClassNamesMap<SwitchSlot>;
  slotProps?: SlotPropsMap<SwitchSlot>;
}

export const [SwitchProvider, useSwitchOwnContext] = createSafeContext<SwitchOwnContextValue>('SwitchProvider');
