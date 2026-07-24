import { Slider as SliderRoot } from './Slider';
import { SliderRange } from './SliderRange';
import { SliderThumb } from './SliderThumb';
import { SliderTicks } from './SliderTicks';
import { SliderTrack } from './SliderTrack';
// Aliased: the component is reached as `Slider.Value`, while `SliderValue` is
// the committed-value type re-exported below.
import { SliderValue as SliderValuePart } from './SliderValue';

const Slider = Object.assign(SliderRoot, {
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
  Ticks: SliderTicks,
  Value: SliderValuePart,
});

export { Slider };

export type {
  SliderOrientation,
  SliderProps,
  SliderRangeProps,
  SliderRangeValueProps,
  SliderSingleValueProps,
  SliderSize,
  SliderSlot,
  SliderThumbProps,
  SliderThumbRenderProps,
  SliderTicksProps,
  SliderTooltip,
  SliderTrackMode,
  SliderTrackProps,
  SliderValue,
  SliderValueProps,
  SliderValueRenderProps,
  SliderVariant,
} from './types';
