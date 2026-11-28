import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { toCssRgba } from './color';
import { ColorPickerPreviewBase } from './base';
import { useColorPickerContext } from './context';
import { swatchStyle } from './helpers';
import type { ColorPickerPreviewProps } from './types';

export const ColorPickerPreview = (props: ColorPickerPreviewProps) => {
  const theme = useComponentTheme('ColorPickerPreview');
  const ctx = useColorPickerContext('ColorPicker.Preview');
  const { rootAttrs, rest } = composeRootAttrs(ColorPickerPreviewBase, props, theme);
  const { ref, style, ...nativeProps } = rest;

  // Decorative: the value is announced by the field and the controls.
  return <div aria-hidden="true" {...nativeProps} {...rootAttrs} style={{ ...style, ...swatchStyle(toCssRgba(ctx.hsva)) }} ref={ref} />;
};

ColorPickerPreview.displayName = 'ColorPicker.Preview';
