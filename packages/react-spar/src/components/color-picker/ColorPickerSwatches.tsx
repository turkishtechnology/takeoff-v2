import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ColorPickerSwatchesBase } from './base';
import { ColorPickerSwatch } from './ColorPickerSwatch';
import { useColorPickerContext } from './context';
import type { ColorPickerSwatchesProps } from './types';

export const ColorPickerSwatches = (props: ColorPickerSwatchesProps) => {
  const theme = useComponentTheme('ColorPickerSwatches');
  const ctx = useColorPickerContext('ColorPicker.Swatches');
  const { rootAttrs, rest } = composeRootAttrs(ColorPickerSwatchesBase, props, theme);
  const { children, ref, ...nativeProps } = rest;

  // An empty preset list renders no empty group.
  if (children === undefined && ctx.swatches.length === 0) return null;

  return (
    <div role="group" aria-label={ctx.labels.swatches} {...nativeProps} {...rootAttrs} ref={ref}>
      {children ?? ctx.swatches.map(color => <ColorPickerSwatch key={color} value={color} />)}
    </div>
  );
};

ColorPickerSwatches.displayName = 'ColorPicker.Swatches';
