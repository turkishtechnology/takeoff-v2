import { Switch as SwitchRoot } from './Switch';
import { SwitchControl } from './SwitchControl';
import { SwitchThumb } from './SwitchThumb';
import { SwitchTrack } from './SwitchTrack';

const Switch = Object.assign(SwitchRoot, {
  Control: SwitchControl,
  Track: SwitchTrack,
  Thumb: SwitchThumb,
});

export { Switch };

export type { SwitchControlProps, SwitchProps, SwitchRenderProps, SwitchSize, SwitchSlot, SwitchThumbProps, SwitchTrackProps, SwitchVariant } from './types';
