import type { ColorPickerFormat, ColorPickerLabels, ColorPickerOrientation, ColorPickerSize } from './types';

export const DEFAULT_FORMAT: ColorPickerFormat = 'hex';
export const DEFAULT_ORIENTATION: ColorPickerOrientation = 'vertical';
export const DEFAULT_SIZE: ColorPickerSize = 'base';

/** Core `tk-color-picker`'s preset row, in its order. */
export const DEFAULT_SWATCHES: readonly string[] = ['#326FD1', '#C79807', '#A45E3C', '#119C8D', '#EDBBA3', '#ABC9FB', '#D0E1FD', '#FF6259', '#717784', '#85B2F9', '#EAD6FD'];

export const FORMATS: readonly { value: ColorPickerFormat; label: string }[] = [
  { value: 'hex', label: 'HEX' },
  { value: 'rgb', label: 'RGB' },
  { value: 'hsl', label: 'HSL' },
];

export const DEFAULT_LABELS: ColorPickerLabels = {
  panel: 'Color picker',
  trigger: 'Open color picker',
  area: 'Color',
  areaRoleDescription: '2D slider',
  areaValue: 'Saturation {saturation}%, Brightness {brightness}%',
  hue: 'Hue',
  alpha: 'Opacity',
  hex: 'Hex',
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
  saturation: 'Saturation',
  lightness: 'Lightness',
  format: 'Color format',
  eyeDropper: 'Pick a color from the screen',
  swatches: 'Preset colors',
  swatch: 'Select color {value}',
};

/** Arrow-key step on the area, in percent; Shift and PageUp/PageDown move by `AREA_PAGE_STEP`. */
export const AREA_STEP = 1;
export const AREA_PAGE_STEP = 10;
