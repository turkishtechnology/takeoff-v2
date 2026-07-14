import { Progress as ProgressRoot } from './Progress';
import { ProgressIndicator } from './ProgressIndicator';
import { ProgressTrack } from './ProgressTrack';
import { ProgressValue } from './ProgressValue';

const Progress = Object.assign(ProgressRoot, {
  Track: ProgressTrack,
  Indicator: ProgressIndicator,
  Value: ProgressValue,
});

export { Progress };

export type {
  ProgressAppearance,
  ProgressIndicatorProps,
  ProgressIndicatorSlot,
  ProgressProps,
  ProgressSize,
  ProgressSlot,
  ProgressTrackProps,
  ProgressTrackSlot,
  ProgressValueProps,
  ProgressValueSlot,
  ProgressVariant,
} from './types';
