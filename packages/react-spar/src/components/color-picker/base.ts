import { createComponentBase } from '../../core';

import type {
  ColorPickerAlphaSliderProps,
  ColorPickerAreaProps,
  ColorPickerChannelFieldsProps,
  ColorPickerContentProps,
  ColorPickerEyeDropperProps,
  ColorPickerFormatSelectProps,
  ColorPickerHueSliderProps,
  ColorPickerInputProps,
  ColorPickerPanelProps,
  ColorPickerPreviewProps,
  ColorPickerProps,
  ColorPickerSwatchesProps,
  ColorPickerSwatchProps,
} from './types';

// @archetype react-enhancement — Spar ships no slider, 2D area or color
// primitive (the same no-upstream situation as Slider). The wrapper owns the
// value model (HSVA internally, so hue survives greys and black), color
// parsing and serialization (`color.ts`), the area's pointer and keyboard
// surface and the typed-field commit rules. Disclosure, positioning, dismissal
// and focus return are Spar Popover's; the hue/alpha sliders are Takeoff
// Slider; the fields are Takeoff Input and Select. If Spar grows a slider or
// area primitive, the area and channel sliders must migrate to it.
//
// The root emits `data-layout` (`vertical` | `horizontal`, the `orientation`
// prop — Chat's attribute, not `data-orientation`, because the Slider recipe
// reads `[data-orientation]` from any ancestor and would turn the hue/alpha
// rails upright), `data-format` (the active notation — one-off, rule 10: the
// recipe widens the alpha field under `rgb` / `hsl`) and the Field-inherited
// `data-disabled` / `data-readonly` / `data-invalid` presence hooks.
export const ColorPickerBase = createComponentBase<ColorPickerProps, 'root'>({
  name: 'ColorPicker',
  slots: ['root'] as const,
  classes: { root: 'tk-color-picker' },
});

// @archetype react-enhancement — Takeoff Input composed as the trigger field:
// the preview dot leads, the chevron `Popover.Trigger` trails.
export const ColorPickerInputBase = createComponentBase<ColorPickerInputProps, 'root' | 'preview'>({
  name: 'ColorPickerInput',
  slots: ['root', 'preview'] as const,
  classes: { root: 'tk-color-picker-input', preview: 'tk-color-picker-input-preview' },
});

// @archetype inherited — Popover.Content; this class only resizes the bubble
// into a panel surface.
export const ColorPickerContentBase = createComponentBase<ColorPickerContentProps, 'root'>({
  name: 'ColorPickerContent',
  slots: ['root'] as const,
  classes: { root: 'tk-color-picker-content' },
});

// @archetype react-enhancement — the `role="group"` layout owner. `controls`,
// `sliders` and `fields` are the default anatomy's internal rows.
export const ColorPickerPanelBase = createComponentBase<ColorPickerPanelProps, 'root' | 'controls' | 'sliders' | 'fields'>({
  name: 'ColorPickerPanel',
  slots: ['root', 'controls', 'sliders', 'fields'] as const,
  classes: {
    root: 'tk-color-picker-panel',
    controls: 'tk-color-picker-controls',
    sliders: 'tk-color-picker-sliders',
    fields: 'tk-color-picker-fields',
  },
});

// @archetype react-enhancement — the saturation × brightness plane. The thumb
// is the a11y owner (`role="slider"`) and emits `data-dragging` / `data-focus`
// like Slider's thumb.
export const ColorPickerAreaBase = createComponentBase<ColorPickerAreaProps, 'root' | 'thumb'>({
  name: 'ColorPickerArea',
  slots: ['root', 'thumb'] as const,
  classes: { root: 'tk-color-picker-area', thumb: 'tk-color-picker-area-thumb' },
});

// @archetype react-enhancement — Takeoff Slider with a hue rail.
export const ColorPickerHueSliderBase = createComponentBase<ColorPickerHueSliderProps, 'root'>({
  name: 'ColorPickerHueSlider',
  slots: ['root'] as const,
  classes: { root: 'tk-color-picker-hue' },
});

// @archetype react-enhancement — Takeoff Slider with a checkerboard → color rail.
export const ColorPickerAlphaSliderBase = createComponentBase<ColorPickerAlphaSliderProps, 'root'>({
  name: 'ColorPickerAlphaSlider',
  slots: ['root'] as const,
  classes: { root: 'tk-color-picker-alpha' },
});

// @archetype react-enhancement — Takeoff Button over the EyeDropper API.
export const ColorPickerEyeDropperBase = createComponentBase<ColorPickerEyeDropperProps, 'root'>({
  name: 'ColorPickerEyeDropper',
  slots: ['root'] as const,
  classes: { root: 'tk-color-picker-eye-dropper' },
});

// @archetype react-enhancement — decorative current-color swatch.
export const ColorPickerPreviewBase = createComponentBase<ColorPickerPreviewProps, 'root'>({
  name: 'ColorPickerPreview',
  slots: ['root'] as const,
  classes: { root: 'tk-color-picker-preview' },
});

// @archetype react-enhancement — Takeoff Select of the three formats.
export const ColorPickerFormatSelectBase = createComponentBase<ColorPickerFormatSelectProps, 'root'>({
  name: 'ColorPickerFormatSelect',
  slots: ['root'] as const,
  classes: { root: 'tk-color-picker-format' },
});

// @archetype react-enhancement — Takeoff Inputs for the active format's
// channels plus alpha; `field` is each Input root.
export const ColorPickerChannelFieldsBase = createComponentBase<ColorPickerChannelFieldsProps, 'root' | 'field'>({
  name: 'ColorPickerChannelFields',
  slots: ['root', 'field'] as const,
  classes: { root: 'tk-color-picker-channels', field: 'tk-color-picker-channel' },
});

// @archetype react-enhancement — `role="group"` of preset swatches.
export const ColorPickerSwatchesBase = createComponentBase<ColorPickerSwatchesProps, 'root'>({
  name: 'ColorPickerSwatches',
  slots: ['root'] as const,
  classes: { root: 'tk-color-picker-swatches' },
});

// @archetype react-enhancement — a preset button; `aria-pressed` and
// `data-selected` mark the swatch matching the current value.
export const ColorPickerSwatchBase = createComponentBase<ColorPickerSwatchProps, 'root'>({
  name: 'ColorPickerSwatch',
  slots: ['root'] as const,
  classes: { root: 'tk-color-picker-swatch' },
});
