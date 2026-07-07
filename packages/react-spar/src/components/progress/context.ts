import { createSafeContext } from '../../hooks';

import type { ProgressAppearance } from './types';

export interface ProgressContextValue {
  /** Current value, clamped to `[min, max]` (`min` when none was given). The indicator ignores it while `indeterminate` is set. */
  value: number;
  /** Resolved minimum. */
  min: number;
  /** Resolved maximum (always > `min`). */
  max: number;
  /** Resolved appearance so the indicator renders the matching DOM. */
  appearance: ProgressAppearance;
  /** Mirrors the root's `indeterminate` prop — the indicator animates a looping sweep instead of writing a fill. */
  indeterminate: boolean;
}

export const [ProgressProvider, useProgressContext] = createSafeContext<ProgressContextValue>('ProgressProvider');
