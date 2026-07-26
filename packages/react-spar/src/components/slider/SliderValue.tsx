import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SliderValueBase } from './base';
import { useSliderContext } from './context';
import { RANGE_VALUE_SEPARATOR } from './defaults';
import { formatValueText } from './helpers';
import type { SliderValueProps, SliderValueRenderProps } from './types';

export const SliderValue = (props: SliderValueProps) => {
  const theme = useComponentTheme('SliderValue');
  const { values, range, formatValue } = useSliderContext('Slider.Value');

  const { rootAttrs, rest } = composeRootAttrs(SliderValueBase, props, theme);
  const { children, ref, ...nativeProps } = rest;

  // Formatting runs through the root's `formatValue` so the readout, the drag
  // tooltip, and `aria-valuetext` can never disagree.
  const formatted = values.map(value => formatValueText(value, formatValue));
  const state: SliderValueRenderProps = { values, formatted, range };

  // Decorative: every value is already announced through its thumb's
  // `aria-valuenow` / `aria-valuetext`, so repeating it here would double the
  // announcement. The readout exists for sighted users — and for uncontrolled
  // sliders, where it is the only way to surface the value without lifting
  // state out of the component.
  return (
    <span {...nativeProps} {...rootAttrs} aria-hidden="true" ref={ref as never}>
      {typeof children === 'function' ? children(state) : (children ?? formatted.join(RANGE_VALUE_SEPARATOR))}
    </span>
  );
};

SliderValue.displayName = 'Slider.Value';
