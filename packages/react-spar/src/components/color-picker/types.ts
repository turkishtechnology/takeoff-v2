import type { ButtonHTMLAttributes, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';
import type { PopoverContentProps } from '../popover';

/** Notation the value is written in. Typed input is parsed in any of the three. */
export type ColorPickerFormat = 'hex' | 'rgb' | 'hsl';

/**
 * Panel layout, after Core's two layouts. `vertical` stacks the area above the
 * controls; `horizontal` puts upright sliders beside the area.
 */
export type ColorPickerOrientation = 'vertical' | 'horizontal';

/** Scale of the trigger field. The panel's own controls are always small. */
export type ColorPickerSize = 'small' | 'base' | 'large';

/**
 * Every user-facing string. `{saturation}`, `{brightness}` and `{value}` are
 * placeholders the component fills in, so a translation can move them.
 */
export interface ColorPickerLabels {
  /** Panel group name when no `Field.Label` names it. */
  panel: string;
  /** Chevron button that opens the panel. */
  trigger: string;
  /** Saturation/brightness area. */
  area: string;
  /** `aria-roledescription` of the area. */
  areaRoleDescription: string;
  /** `aria-valuetext` of the area. Placeholders: `{saturation}`, `{brightness}`. */
  areaValue: string;
  /** Hue slider and the H channel field. */
  hue: string;
  /** Alpha slider and alpha field. */
  alpha: string;
  hex: string;
  red: string;
  green: string;
  blue: string;
  saturation: string;
  lightness: string;
  /** Format select. */
  format: string;
  /** Eyedropper button. */
  eyeDropper: string;
  /** Swatch group. */
  swatches: string;
  /** Each swatch button. Placeholder: `{value}`. */
  swatch: string;
}

export type ColorPickerSlot = 'root';
export type ColorPickerInputSlot = 'root' | 'preview';
export type ColorPickerContentSlot = 'root';
export type ColorPickerPanelSlot = 'root' | 'controls' | 'sliders' | 'fields';
export type ColorPickerAreaSlot = 'root' | 'thumb';
export type ColorPickerHueSliderSlot = 'root';
export type ColorPickerAlphaSliderSlot = 'root';
export type ColorPickerEyeDropperSlot = 'root';
export type ColorPickerPreviewSlot = 'root';
export type ColorPickerFormatSelectSlot = 'root';
export type ColorPickerChannelFieldsSlot = 'root' | 'field';
export type ColorPickerSwatchesSlot = 'root';
export type ColorPickerSwatchSlot = 'root';

export interface ColorPickerOwnProps {
  /**
   * Controlled value: a CSS color in the active `format`. `''` means no color —
   * the field shows its placeholder and the panel starts from black.
   */
  value?: string;
  /**
   * Uncontrolled initial value.
   * @defaultValue ''
   */
  defaultValue?: string;
  /**
   * Fires on every change, including each frame of a drag, with the value
   * serialized in the active `format`.
   */
  onValueChange?: (value: string) => void;
  /**
   * Fires once per settled change: pointer release, a key press, a committed
   * field, a swatch, the eyedropper, a format switch, or Escape restoring the
   * value the panel opened with.
   */
  onValueChangeEnd?: (value: string) => void;
  /** Controlled format. */
  format?: ColorPickerFormat;
  /**
   * Uncontrolled initial format.
   * @defaultValue 'hex'
   */
  defaultFormat?: ColorPickerFormat;
  /** Fires when the format select changes the notation. The value is re-serialized in it. */
  onFormatChange?: (format: ColorPickerFormat) => void;
  /**
   * Shows the alpha slider and field. `false` forces alpha to 1.
   * @defaultValue true
   */
  alpha?: boolean;
  /**
   * Preset colors for `ColorPicker.Swatches`. Pass `[]` to render none.
   * @defaultValue Core's 11 presets
   */
  swatches?: string[];
  /**
   * Panel layout.
   * @defaultValue 'vertical'
   */
  orientation?: ColorPickerOrientation;
  /**
   * Trigger field size.
   * @defaultValue 'base'
   */
  size?: ColorPickerSize;
  /** Controlled open state of the popover panel. */
  open?: boolean;
  /**
   * Uncontrolled initial open state.
   * @defaultValue false
   */
  defaultOpen?: boolean;
  /** Fires when the popover panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Disables every control and closes the panel. Inherited from a surrounding `Field`. */
  disabled?: boolean;
  /** Shows the value but blocks changes; the panel cannot open. Inherited from a surrounding `Field`. */
  readOnly?: boolean;
  /** Invalid styling and `aria-invalid` on the field. Inherited from a surrounding `Field`. */
  invalid?: boolean;
  /** `aria-required` on the field. Inherited from a surrounding `Field`. */
  required?: boolean;
  /** Submits the value under this name through a hidden input. */
  name?: string;
  /** `id` of the form the hidden input belongs to. */
  form?: string;
  /** Trigger field placeholder while the value is empty. */
  placeholder?: string;
  /** Overrides for the user-facing strings; blank entries fall back to the English defaults. */
  labels?: Partial<ColorPickerLabels>;
  /**
   * Anatomy override. When omitted, the root renders `ColorPicker.Input` and a
   * `ColorPicker.Content` holding the default `ColorPicker.Panel`. Render only a
   * `ColorPicker.Panel` for the inline picker.
   */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ColorPickerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ColorPickerSlot>;
}

/** Public props for the ColorPicker root — the value owner and layout wrapper. */
export type ColorPickerProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ColorPickerOwnProps>;

type PartProps<TElement extends HTMLElement, TSlot extends string, TOmit extends string = never> = Omit<HTMLAttributes<TElement>, 'children' | TOmit> & {
  ref?: Ref<TElement>;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TSlot>;
};

/**
 * Public props for `ColorPicker.Input` — the typable trigger field. Enter or
 * blur commits parsed text, Escape restores it, ArrowDown and a click open the
 * panel, and the chevron button toggles it.
 */
export type ColorPickerInputProps = PartProps<HTMLDivElement, ColorPickerInputSlot>;

/**
 * Public props for `ColorPicker.Content` — the floating panel surface
 * (`Popover.Content`). Renders the default `ColorPicker.Panel` when childless.
 */
export type ColorPickerContentProps<T extends ElementType = 'div'> = PopoverContentProps<T>;

/**
 * Public props for `ColorPicker.Panel` — the `role="group"` that lays the
 * controls out for `orientation`. Renders the default anatomy when childless;
 * placed without `ColorPicker.Content` it is the inline picker.
 */
export type ColorPickerPanelProps = PartProps<HTMLDivElement, ColorPickerPanelSlot> & { children?: ReactNode };

/** Public props for `ColorPicker.Area` — the saturation × brightness plane with one `role="slider"` thumb. */
export type ColorPickerAreaProps = PartProps<HTMLDivElement, ColorPickerAreaSlot>;

/** Public props for `ColorPicker.HueSlider` — a Takeoff `Slider` over 0–360. */
export type ColorPickerHueSliderProps = PartProps<HTMLDivElement, ColorPickerHueSliderSlot, 'defaultValue' | 'onChange'>;

/** Public props for `ColorPicker.AlphaSlider` — a Takeoff `Slider` over 0–100 %. Renders nothing when `alpha` is off. */
export type ColorPickerAlphaSliderProps = PartProps<HTMLDivElement, ColorPickerAlphaSliderSlot, 'defaultValue' | 'onChange'>;

/** Public props for `ColorPicker.EyeDropper` — renders nothing where the EyeDropper API is missing. */
export type ColorPickerEyeDropperProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  ref?: Ref<HTMLButtonElement>;
  /** Button content. @defaultValue the eyedropper glyph */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ColorPickerEyeDropperSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ColorPickerEyeDropperSlot>;
};

/** Public props for `ColorPicker.Preview` — a decorative (`aria-hidden`) swatch of the current color. */
export type ColorPickerPreviewProps = PartProps<HTMLDivElement, ColorPickerPreviewSlot>;

/** Public props for `ColorPicker.FormatSelect` — a small Takeoff `Select` of HEX / RGB / HSL. */
export interface ColorPickerFormatSelectProps {
  className?: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ColorPickerFormatSelectSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ColorPickerFormatSelectSlot>;
}

/** Public props for `ColorPicker.ChannelFields` — the typed fields of the active format plus alpha. */
export type ColorPickerChannelFieldsProps = PartProps<HTMLDivElement, ColorPickerChannelFieldsSlot>;

/**
 * Public props for `ColorPicker.Swatches` — a `role="group"` of preset colors.
 * Renders one `ColorPicker.Swatch` per root `swatches` entry when childless.
 */
export type ColorPickerSwatchesProps = PartProps<HTMLDivElement, ColorPickerSwatchesSlot> & { children?: ReactNode };

/** Public props for `ColorPicker.Swatch` — a button that selects `value`. */
export type ColorPickerSwatchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value'> & {
  ref?: Ref<HTMLButtonElement>;
  /** Color the swatch selects, in any notation `ColorPicker` parses. */
  value: string;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<ColorPickerSwatchSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<ColorPickerSwatchSlot>;
};

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    ColorPicker: import('../../core').ComponentThemeConfig<ColorPickerProps, ColorPickerSlot>;
    ColorPickerInput: import('../../core').ComponentThemeConfig<ColorPickerInputProps, ColorPickerInputSlot>;
    ColorPickerPanel: import('../../core').ComponentThemeConfig<ColorPickerPanelProps, ColorPickerPanelSlot>;
    ColorPickerArea: import('../../core').ComponentThemeConfig<ColorPickerAreaProps, ColorPickerAreaSlot>;
    ColorPickerHueSlider: import('../../core').ComponentThemeConfig<ColorPickerHueSliderProps, ColorPickerHueSliderSlot>;
    ColorPickerAlphaSlider: import('../../core').ComponentThemeConfig<ColorPickerAlphaSliderProps, ColorPickerAlphaSliderSlot>;
    ColorPickerEyeDropper: import('../../core').ComponentThemeConfig<ColorPickerEyeDropperProps, ColorPickerEyeDropperSlot>;
    ColorPickerPreview: import('../../core').ComponentThemeConfig<ColorPickerPreviewProps, ColorPickerPreviewSlot>;
    ColorPickerFormatSelect: import('../../core').ComponentThemeConfig<ColorPickerFormatSelectProps, ColorPickerFormatSelectSlot>;
    ColorPickerChannelFields: import('../../core').ComponentThemeConfig<ColorPickerChannelFieldsProps, ColorPickerChannelFieldsSlot>;
    ColorPickerSwatches: import('../../core').ComponentThemeConfig<ColorPickerSwatchesProps, ColorPickerSwatchesSlot>;
    ColorPickerSwatch: import('../../core').ComponentThemeConfig<ColorPickerSwatchProps, ColorPickerSwatchSlot>;
  }
}
