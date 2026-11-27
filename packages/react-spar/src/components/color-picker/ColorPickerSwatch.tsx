import type { MouseEvent } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel } from '../../utils';

import { parseColor, sameColor, toCssRgba } from './color';
import { ColorPickerSwatchBase } from './base';
import { useColorPickerContext } from './context';
import { swatchStyle } from './helpers';
import type { ColorPickerSwatchProps } from './types';

export const ColorPickerSwatch = (props: ColorPickerSwatchProps) => {
  const theme = useComponentTheme('ColorPickerSwatch');
  const ctx = useColorPickerContext('ColorPicker.Swatch');
  const { rootAttrs, rest } = composeRootAttrs(ColorPickerSwatchBase, props, theme);
  const { value, onClick, style, disabled, ref, ...nativeProps } = rest;

  const parsed = parseColor(value);
  const selected = !!parsed && ctx.value !== '' && sameColor(parsed, ctx.hsva, ctx.format);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) ctx.commitText(value);
  };

  return (
    <button
      type="button"
      aria-label={formatLabel(ctx.labels.swatch, { value })}
      aria-pressed={selected}
      {...nativeProps}
      {...rootAttrs}
      data-selected={selected ? '' : undefined}
      disabled={disabled ?? (ctx.disabled || ctx.readOnly || !parsed)}
      style={{ ...style, ...(parsed ? swatchStyle(toCssRgba(parsed)) : undefined) }}
      ref={ref}
      onClick={handleClick}
    />
  );
};

ColorPickerSwatch.displayName = 'ColorPicker.Swatch';
