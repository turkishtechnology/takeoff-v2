import { useCallback, useMemo, type ElementType } from 'react';
import { Carousel as SparCarousel } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel, resolveLabels } from '../../utils';

import { CarouselBase } from './base';
import { CarouselOwnProvider } from './context';
import { DEFAULT_CONTROLS_PLACEMENT, DEFAULT_CONTROLS_POSITION, DEFAULT_LABELS } from './defaults';
import type { CarouselProps } from './types';

export const Carousel = <T extends ElementType = 'div'>(props: CarouselProps<T>) => {
  const theme = useComponentTheme('Carousel');

  // `labels` is merged per key, not taken from the shallow props merge, so a
  // provider-level translation survives an instance overriding one string.
  const themeLabels = theme?.defaultProps?.labels;
  const labels = useMemo(() => resolveLabels(DEFAULT_LABELS, themeLabels, props.labels), [themeLabels, props.labels]);

  const { rootAttrs, rest } = composeRootAttrs(CarouselBase, props as CarouselProps<'div'>, theme, {
    stateAttrs: ({ controlsPlacement = DEFAULT_CONTROLS_PLACEMENT, controlsPosition = DEFAULT_CONTROLS_POSITION }) => ({
      'data-controls-placement': controlsPlacement,
      'data-controls-position': controlsPosition,
    }),
  });

  const { controlsPlacement: _placement, controlsPosition: _position, labels: _labels, children, ref, ...sparProps } = rest;

  const getSlideLabel = useCallback((index: number, count: number) => formatLabel(labels.slide, { index: index + 1, count }), [labels.slide]);
  const ownContext = useMemo(() => ({ labels }), [labels]);

  return (
    <CarouselOwnProvider value={ownContext}>
      <SparCarousel aria-roledescription={labels.roleDescription} {...sparProps} {...rootAttrs} getSlideLabel={getSlideLabel} ref={ref}>
        {children}
      </SparCarousel>
    </CarouselOwnProvider>
  );
};

Carousel.displayName = 'Carousel';
