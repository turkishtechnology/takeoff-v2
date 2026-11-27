import type { CSSProperties } from 'react';
import { FieldReset } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Slider } from '../slider';

import { hsvaToRgb } from './color';
import { ColorPickerAlphaSliderBase } from './base';
import { useColorPickerContext } from './context';
import type { ColorPickerAlphaSliderProps } from './types';

const formatPercent = (value: number) => `${value}%`;

export const ColorPickerAlphaSlider = (props: ColorPickerAlphaSliderProps) => {
  const theme = useComponentTheme('ColorPickerAlphaSlider');
  const ctx = useColorPickerContext('ColorPicker.AlphaSlider');
  const { rootAttrs, rest } = composeRootAttrs(ColorPickerAlphaSliderBase, props, theme);

  if (!ctx.alpha) return null;

  const { r, g, b } = hsvaToRgb(ctx.hsva);

  return (
    <FieldReset>
      <Slider
        {...rest}
        {...rootAttrs}
        // The rail fades from transparent to the opaque color; the recipe
        // paints the checkerboard under it.
        style={{ ...rest.style, '--tk-color-picker-opaque': `rgb(${r}, ${g}, ${b})` } as CSSProperties}
        min={0}
        max={100}
        step={1}
        value={Math.round(ctx.hsva.a * 100)}
        onValueChange={percent => ctx.patch({ a: percent / 100 })}
        onValueChangeEnd={ctx.settle}
        orientation={ctx.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
        size="small"
        track="none"
        tooltip="never"
        disabled={ctx.disabled}
        readOnly={ctx.readOnly}
        formatValue={formatPercent}
        aria-label={ctx.labels.alpha}
      />
    </FieldReset>
  );
};

ColorPickerAlphaSlider.displayName = 'ColorPicker.AlphaSlider';
