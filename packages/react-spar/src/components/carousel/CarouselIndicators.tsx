import type { ElementType } from 'react';
import { CarouselIndicator as SparCarouselIndicator, useCarouselContext } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel } from '../../utils';

import { CarouselIndicatorsBase } from './base';
import { useCarouselOwnContext } from './context';
import type { CarouselIndicatorsProps, CarouselIndicatorsSlot } from './types';

/**
 * One dot button per page (`slideCount - slidesPerView + 1`, Core's count).
 * Renders nothing when every slide already fits. Children are placed before
 * the dots, as Core places its play/pause control.
 */
export const CarouselIndicators = <T extends ElementType = 'div'>(props: CarouselIndicatorsProps<T>) => {
  const theme = useComponentTheme('CarouselIndicators');
  const { labels } = useCarouselOwnContext('Carousel.Indicators');
  const { pageCount, slideCount, slidesPerView } = useCarouselContext();

  const { rootAttrs, rest } = composeRootAttrs<CarouselIndicatorsProps, CarouselIndicatorsSlot>(CarouselIndicatorsBase, props as CarouselIndicatorsProps<'div'>, theme);
  const { as, children, ref, ...divProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  if (slideCount <= slidesPerView) return null;

  const layers = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  };
  const indicatorAttrs = buildSlotAttrs(CarouselIndicatorsBase.getSlotProps('indicator'), 'indicator' as CarouselIndicatorsSlot, layers);
  const dotAttrs = buildSlotAttrs(CarouselIndicatorsBase.getSlotProps('indicatorDot'), 'indicatorDot' as CarouselIndicatorsSlot, layers);

  return (
    <Component {...divProps} {...rootAttrs} ref={ref}>
      {children}
      {Array.from({ length: pageCount }, (_, index) => (
        <SparCarouselIndicator key={index} index={index} aria-label={formatLabel(labels.indicator, { index: index + 1 })} {...indicatorAttrs}>
          <span aria-hidden="true" {...dotAttrs} />
        </SparCarouselIndicator>
      ))}
    </Component>
  );
};

CarouselIndicators.displayName = 'Carousel.Indicators';
