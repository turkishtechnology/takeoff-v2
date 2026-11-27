import { FieldReset } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Slider } from '../slider';

import { ColorPickerHueSliderBase } from './base';
import { useColorPickerContext } from './context';
import type { ColorPickerHueSliderProps } from './types';

const formatHue = (value: number) => `${value}°`;

export const ColorPickerHueSlider = (props: ColorPickerHueSliderProps) => {
  const theme = useComponentTheme('ColorPickerHueSlider');
  const ctx = useColorPickerContext('ColorPicker.HueSlider');
  const { rootAttrs, rest } = composeRootAttrs(ColorPickerHueSliderBase, props, theme);

  return (
    // The slider would otherwise take the surrounding Field's label and id.
    <FieldReset>
      <Slider
        {...rest}
        {...rootAttrs}
        min={0}
        max={360}
        step={1}
        value={Math.round(ctx.hsva.h)}
        onValueChange={hue => ctx.patch({ h: hue })}
        onValueChangeEnd={ctx.settle}
        // Upright beside the area in the horizontal layout.
        orientation={ctx.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
        size="small"
        track="none"
        tooltip="never"
        disabled={ctx.disabled}
        readOnly={ctx.readOnly}
        formatValue={formatHue}
        aria-label={ctx.labels.hue}
      />
    </FieldReset>
  );
};

ColorPickerHueSlider.displayName = 'ColorPicker.HueSlider';
