import { createSafeContext } from '../../hooks';

import type { ProgressAppearance } from './types';

export interface ProgressContextValue {
  /** Current value, clamped to `[min, max]`. */
  value: number;
  /** Resolved minimum. */
  min: number;
  /** Resolved maximum (always > `min`). */
  max: number;
  /** Resolved appearance so the indicator renders the matching DOM. */
  appearance: ProgressAppearance;
}

export const [ProgressProvider, useProgressContext] = createSafeContext<ProgressContextValue>('ProgressProvider');
