import type { ClassNamesMap, SlotPropsMap } from '../../core';
import { createSafeContext } from '../../hooks';

import type { CheckboxSlot } from './types';

export interface CheckboxOwnContextValue {
  classNames?: ClassNamesMap<CheckboxSlot>;
  slotProps?: SlotPropsMap<CheckboxSlot>;
  required: boolean;
  disabled: boolean;
  readOnly: boolean;
  checked: boolean;
  indeterminate: boolean;
}

export const [CheckboxProvider, useCheckboxOwnContext] = createSafeContext<CheckboxOwnContextValue>('CheckboxProvider');
