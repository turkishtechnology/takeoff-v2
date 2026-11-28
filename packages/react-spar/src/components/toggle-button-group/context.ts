import { createSafeContext } from '../../hooks';

import type { ToggleButtonGroupAppearance, ToggleButtonGroupSize, ToggleButtonGroupVariant } from './types';

export interface ToggleButtonGroupContextValue {
  size: ToggleButtonGroupSize;
  variant: ToggleButtonGroupVariant;
  appearance: ToggleButtonGroupAppearance;
}

export const [ToggleButtonGroupProvider, useToggleButtonGroupOwnContext] = createSafeContext<ToggleButtonGroupContextValue>('ToggleButtonGroupProvider');
