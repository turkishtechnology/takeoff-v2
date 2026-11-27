import type { CSSProperties, ElementType } from 'react';
import { CarouselViewport as SparCarouselViewport, useCarouselContext } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CarouselViewportBase } from './base';
import { useCarouselOwnContext } from './context';
import type { CarouselViewportProps, CarouselViewportSlot } from './types';

/**
 * Clips the slides and positions the track. The position is pure CSS: the
 * recipe translates the track by `--tk-carousel-index` slide widths, each
 * `(100% - (n - 1) * gap) / n` wide with `n = --tk-carousel-per-view`, so no
 * layout is measured.
 */
export const CarouselViewport = <T extends ElementType = 'div'>(props: CarouselViewportProps<T>) => {
  const theme = useComponentTheme('CarouselViewport');
  useCarouselOwnContext('Carousel.Viewport');
  const { value, slidesPerView } = useCarouselContext();

  const { rootAttrs, rest } = composeRootAttrs<CarouselViewportProps, CarouselViewportSlot>(CarouselViewportBase, props as CarouselViewportProps<'div'>, theme);
  const { children, ref, style, ...sparProps } = rest;

  const trackAttrs = buildSlotAttrs(CarouselViewportBase.getSlotProps('track'), 'track' as CarouselViewportSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  const positionStyle = { '--tk-carousel-index': value, '--tk-carousel-per-view': slidesPerView } as CSSProperties;

  return (
    <SparCarouselViewport {...sparProps} {...rootAttrs} style={{ ...(rootAttrs.style as CSSProperties | undefined), ...style, ...positionStyle }} ref={ref}>
      <div {...trackAttrs}>{children}</div>
    </SparCarouselViewport>
  );
};

CarouselViewport.displayName = 'Carousel.Viewport';
