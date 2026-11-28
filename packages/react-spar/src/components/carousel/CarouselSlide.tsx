import type { ElementType } from 'react';
import { CarouselSlide as SparCarouselSlide } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CarouselSlideBase } from './base';
import { useCarouselOwnContext } from './context';
import type { CarouselSlideProps } from './types';

export const CarouselSlide = <T extends ElementType = 'div'>(props: CarouselSlideProps<T>) => {
  const theme = useComponentTheme('CarouselSlide');
  const { labels } = useCarouselOwnContext('Carousel.Slide');

  const { rootAttrs, rest } = composeRootAttrs(CarouselSlideBase, props as CarouselSlideProps<'div'>, theme);
  const { children, ref, ...sparProps } = rest;

  return (
    <SparCarouselSlide aria-roledescription={labels.slideRoleDescription} {...sparProps} {...rootAttrs} ref={ref}>
      {children}
    </SparCarouselSlide>
  );
};

CarouselSlide.displayName = 'Carousel.Slide';
