import { Switch as SwitchRoot } from './Switch';
import { SwitchControl } from './SwitchControl';
import { SwitchHint } from './SwitchHint';
import { SwitchLabel } from './SwitchLabel';
import { SwitchThumb } from './SwitchThumb';
import { SwitchTrack } from './SwitchTrack';

const Switch = Object.assign(SwitchRoot, {
  Control: SwitchControl,
  Track: SwitchTrack,
  Thumb: SwitchThumb,
  Label: SwitchLabel,
  Hint: SwitchHint,
});

export { Switch };

export type {
  SwitchControlProps,
  SwitchHintProps,
  SwitchLabelProps,
  SwitchProps,
  SwitchRenderProps,
  SwitchSize,
  SwitchSlot,
  SwitchThumbProps,
  SwitchTrackProps,
  SwitchVariant,
} from './types';
