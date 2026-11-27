import { createComponentBase } from '../../core';

import type {
  CarouselAutoplayTriggerProps,
  CarouselControlsProps,
  CarouselIndicatorsProps,
  CarouselProps,
  CarouselSlideProps,
  CarouselTriggerProps,
  CarouselViewportProps,
} from './types';

// Spar's Carousel owns the index, page model, keyboard, autoplay and ARIA; the
// takeoff layer owns the `tk-carousel*` classes, the CSS track position and
// the navigation layout.
export const CarouselBase = createComponentBase<CarouselProps, 'root'>({
  name: 'Carousel',
  slots: ['root'] as const,
  classes: { root: 'tk-carousel' },
});

export const CarouselViewportBase = createComponentBase<CarouselViewportProps, 'root' | 'track'>({
  name: 'CarouselViewport',
  slots: ['root', 'track'] as const,
  classes: { root: 'tk-carousel-viewport', track: 'tk-carousel-track' },
});

export const CarouselSlideBase = createComponentBase<CarouselSlideProps, 'root'>({
  name: 'CarouselSlide',
  slots: ['root'] as const,
  classes: { root: 'tk-carousel-slide' },
});

export const CarouselControlsBase = createComponentBase<CarouselControlsProps, 'root'>({
  name: 'CarouselControls',
  slots: ['root'] as const,
  classes: { root: 'tk-carousel-controls' },
});

export const CarouselPrevTriggerBase = createComponentBase<CarouselTriggerProps, 'root'>({
  name: 'CarouselPrevTrigger',
  slots: ['root'] as const,
  classes: { root: 'tk-carousel-prev' },
});

export const CarouselNextTriggerBase = createComponentBase<CarouselTriggerProps, 'root'>({
  name: 'CarouselNextTrigger',
  slots: ['root'] as const,
  classes: { root: 'tk-carousel-next' },
});

export const CarouselIndicatorsBase = createComponentBase<CarouselIndicatorsProps, 'root' | 'indicator' | 'indicatorDot'>({
  name: 'CarouselIndicators',
  slots: ['root', 'indicator', 'indicatorDot'] as const,
  classes: { root: 'tk-carousel-indicators', indicator: 'tk-carousel-indicator', indicatorDot: 'tk-carousel-indicator-dot' },
});

export const CarouselAutoplayTriggerBase = createComponentBase<CarouselAutoplayTriggerProps, 'root'>({
  name: 'CarouselAutoplayTrigger',
  slots: ['root'] as const,
  classes: { root: 'tk-carousel-autoplay' },
});
