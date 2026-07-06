import { Progress as ProgressRoot } from './Progress';
import { ProgressIndicator } from './ProgressIndicator';

const Progress = Object.assign(ProgressRoot, {
  Indicator: ProgressIndicator,
});

export { Progress };

export type {
  ProgressAppearance,
  ProgressIndicatorProps,
  ProgressIndicatorSlot,
  ProgressProps,
  ProgressSize,
  ProgressSlot,
  ProgressVariant,
} from './types';
