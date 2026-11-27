import { ColorPicker as ColorPickerRoot } from './ColorPicker';
import { ColorPickerAlphaSlider } from './ColorPickerAlphaSlider';
import { ColorPickerArea } from './ColorPickerArea';
import { ColorPickerChannelFields } from './ColorPickerChannelFields';
import { ColorPickerContent } from './ColorPickerContent';
import { ColorPickerEyeDropper } from './ColorPickerEyeDropper';
import { ColorPickerFormatSelect } from './ColorPickerFormatSelect';
import { ColorPickerHueSlider } from './ColorPickerHueSlider';
import { ColorPickerInput } from './ColorPickerInput';
import { ColorPickerPanel } from './ColorPickerPanel';
import { ColorPickerPreview } from './ColorPickerPreview';
import { ColorPickerSwatch } from './ColorPickerSwatch';
import { ColorPickerSwatches } from './ColorPickerSwatches';

const ColorPicker = Object.assign(ColorPickerRoot, {
  Input: ColorPickerInput,
  Content: ColorPickerContent,
  Panel: ColorPickerPanel,
  Area: ColorPickerArea,
  HueSlider: ColorPickerHueSlider,
  AlphaSlider: ColorPickerAlphaSlider,
  EyeDropper: ColorPickerEyeDropper,
  Preview: ColorPickerPreview,
  FormatSelect: ColorPickerFormatSelect,
  ChannelFields: ColorPickerChannelFields,
  Swatches: ColorPickerSwatches,
  Swatch: ColorPickerSwatch,
});

export { ColorPicker };

export type {
  ColorPickerAlphaSliderProps,
  ColorPickerAreaProps,
  ColorPickerChannelFieldsProps,
  ColorPickerContentProps,
  ColorPickerEyeDropperProps,
  ColorPickerFormat,
  ColorPickerFormatSelectProps,
  ColorPickerHueSliderProps,
  ColorPickerInputProps,
  ColorPickerLabels,
  ColorPickerOrientation,
  ColorPickerPanelProps,
  ColorPickerPreviewProps,
  ColorPickerProps,
  ColorPickerSize,
  ColorPickerSlot,
  ColorPickerSwatchesProps,
  ColorPickerSwatchProps,
} from './types';
