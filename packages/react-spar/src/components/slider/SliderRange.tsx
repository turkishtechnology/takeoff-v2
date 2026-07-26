import type { CSSProperties } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { SliderRangeBase } from './base';
import { useSliderContext } from './context';
import { bandStyle, toPercent } from './helpers';
import type { SliderRangeProps } from './types';

export const SliderRange = (props: SliderRangeProps) => {
  const theme = useComponentTheme('SliderRange');
  const { values, bounds, range, orientation } = useSliderContext('Slider.Range');

  // A single slider fills from the rail's start; a range fills between its
  // outermost thumbs, so a 3+ handle range still spans the whole selection. Both
  // read the same percent helper the thumbs use, so the fill edge and the handle
  // centre cannot drift apart. `track="inverted"` / `"none"` do NOT change this
  // geometry — the recipe recolours the band (inverted: the rail carries the
  // fill and the band carries the rail colour, so the complement reads as
  // filled) or hides it (none) off the root's `data-track`, so any thumb count
  // inverts the same way.
  const start = range ? toPercent(values[0], bounds) : 0;
  const end = toPercent(range ? values[values.length - 1] : values[0], bounds);

  const { rootAttrs, rest } = composeRootAttrs(SliderRangeBase, props, theme);
  const { ref, style, ...nativeProps } = rest;
  const { style: slotStyle, ...slotAttrs } = rootAttrs as Record<string, unknown> & { style?: CSSProperties };

  // The decorative role and the geometry are the design-system invariants the
  // recipe relies on; both are layered after the spreads so neither instance
  // nor slot props can override them. Written inline because a continuous
  // value is not a data-* hook (data-attribute-vocabulary rule 9) and a
  // presentation attribute would lose to any stylesheet rule.
  return <span {...nativeProps} {...slotAttrs} aria-hidden="true" style={{ ...style, ...slotStyle, ...bandStyle(start, end, orientation) }} ref={ref as never} />;
};

SliderRange.displayName = 'Slider.Range';
