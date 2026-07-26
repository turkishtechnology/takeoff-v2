import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { isDevelopment } from '../../utils';

import { SliderTicksBase } from './base';
import { useSliderContext } from './context';
import { MAX_TICKS } from './defaults';
import { offsetStyle, tickPercents } from './helpers';
import type { SliderTicksProps } from './types';

// Dev-only: dedupes the too-dense warning by a *stable* key (not the
// interpolated message) so a slider re-rendering on every drag frame neither
// floods the console nor grows this set with each distinct grid.
const warnedGrids = new Set<string>();

// Test-only: clears the module-level dedup set so suites stay isolated across
// cases. Cleared in the test `beforeEach`; not re-exported from the barrel.
export const resetSliderTicksDevWarnings = (): void => warnedGrids.clear();

export const SliderTicks = (props: SliderTicksProps) => {
  const theme = useComponentTheme('SliderTicks');
  const { bounds, orientation } = useSliderContext('Slider.Ticks');

  const { rootAttrs, rest } = composeRootAttrs(SliderTicksBase, props, theme);
  const { ref, ...nativeProps } = rest;

  // One node per step, so a fine step over a wide range would otherwise put
  // thousands of elements in the tree. Past the cap the marks are dropped
  // rather than silently hanging the page.
  const percents = tickPercents(bounds, MAX_TICKS);

  if (percents === null) {
    if (isDevelopment()) {
      const message = `[Slider.Ticks] needs at most ${MAX_TICKS} marks, but min ${bounds.min} / max ${bounds.max} / step ${bounds.step} produces more; the ticks are not rendered.`;
      if (!warnedGrids.has('ticks-too-dense')) {
        warnedGrids.add('ticks-too-dense');
        // eslint-disable-next-line no-console
        console.warn(message);
      }
    }
    return null;
  }

  const tickAttrs = buildSlotAttrs(SliderTicksBase.getSlotProps('tick'), 'tick', {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  // Decorative: the scale is already conveyed by each thumb's aria-valuemin /
  // aria-valuemax, so the marks are hidden from assistive tech.
  return (
    <div {...nativeProps} {...rootAttrs} aria-hidden="true" ref={ref as never}>
      {percents.map((percent, index) => (
        <span key={index} {...tickAttrs} style={offsetStyle(percent, orientation)} />
      ))}
    </div>
  );
};

SliderTicks.displayName = 'Slider.Ticks';
