import type { ClassNamesMap, SlotPropsMap } from '../../core';
import { createSafeContext } from '../../hooks';

import type { SwitchSlot } from './types';

export interface SwitchOwnContextValue {
  classNames?: ClassNamesMap<SwitchSlot>;
  slotProps?: SlotPropsMap<SwitchSlot>;
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
}

export const [SwitchProvider, useSwitchOwnContext] = createSafeContext<SwitchOwnContextValue>('SwitchProvider');
