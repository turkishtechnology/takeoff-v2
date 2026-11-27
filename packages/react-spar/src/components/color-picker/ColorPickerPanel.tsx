import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ColorPickerAlphaSlider } from './ColorPickerAlphaSlider';
import { ColorPickerArea } from './ColorPickerArea';
import { ColorPickerChannelFields } from './ColorPickerChannelFields';
import { ColorPickerEyeDropper } from './ColorPickerEyeDropper';
import { ColorPickerFormatSelect } from './ColorPickerFormatSelect';
import { ColorPickerHueSlider } from './ColorPickerHueSlider';
import { ColorPickerPreview } from './ColorPickerPreview';
import { ColorPickerSwatches } from './ColorPickerSwatches';
import { ColorPickerPanelBase } from './base';
import { useColorPickerContext } from './context';
import { slotAttrs } from './helpers';
import type { ColorPickerPanelProps } from './types';

export const ColorPickerPanel = (props: ColorPickerPanelProps) => {
  const theme = useComponentTheme('ColorPickerPanel');
  const ctx = useColorPickerContext('ColorPicker.Panel');
  const { rootAttrs, rest } = composeRootAttrs(ColorPickerPanelBase, props, theme, {
    stateAttrs: () => ({ 'data-layout': ctx.orientation }),
  });
  const { children, ref, ...nativeProps } = rest;
  const controls = slotAttrs(ColorPickerPanelBase, 'controls', theme, props);
  const sliders = slotAttrs(ColorPickerPanelBase, 'sliders', theme, props);
  const fields = slotAttrs(ColorPickerPanelBase, 'fields', theme, props);

  const native = nativeProps as { 'aria-label'?: string; 'aria-labelledby'?: string };
  // Named by the surrounding Field label when there is one, else by the panel label.
  const naming = native['aria-labelledby'] || native['aria-label'] ? {} : ctx.labelId ? { 'aria-labelledby': ctx.labelId } : { 'aria-label': ctx.labels.panel };

  // Core's two layouts. Vertical: the area on top, then eyedropper · sliders ·
  // preview, then the format and channel fields. Horizontal: preview, upright
  // sliders and eyedropper in a column beside the area.
  const defaultAnatomy =
    ctx.orientation === 'horizontal' ? (
      <>
        <div {...controls}>
          <ColorPickerPreview />
          <div {...sliders}>
            <ColorPickerHueSlider />
            <ColorPickerAlphaSlider />
          </div>
          <ColorPickerEyeDropper />
        </div>
        <ColorPickerArea />
        <div {...fields}>
          <ColorPickerFormatSelect />
          <ColorPickerChannelFields />
        </div>
        <ColorPickerSwatches />
      </>
    ) : (
      <>
        <ColorPickerArea />
        <div {...controls}>
          <ColorPickerEyeDropper />
          <div {...sliders}>
            <ColorPickerHueSlider />
            <ColorPickerAlphaSlider />
          </div>
          <ColorPickerPreview />
        </div>
        <div {...fields}>
          <ColorPickerFormatSelect />
          <ColorPickerChannelFields />
        </div>
        <ColorPickerSwatches />
      </>
    );

  return (
    <div role="group" {...naming} {...nativeProps} {...rootAttrs} ref={ref}>
      {children ?? defaultAnatomy}
    </div>
  );
};

ColorPickerPanel.displayName = 'ColorPicker.Panel';
