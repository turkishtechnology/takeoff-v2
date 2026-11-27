import type { CarouselControlsPlacement, CarouselControlsPosition, CarouselLabels } from './types';

export const DEFAULT_CONTROLS_PLACEMENT: CarouselControlsPlacement = 'inside';
export const DEFAULT_CONTROLS_POSITION: CarouselControlsPosition = 'distributed';

// Every user-facing string Carousel renders, visible or for assistive
// technology. Localizable per carousel through the root's `labels` prop (or
// app-wide through provider `defaultProps`).
export const DEFAULT_LABELS: CarouselLabels = {
  previous: 'Previous slide',
  next: 'Next slide',
  play: 'Start automatic slide show',
  pause: 'Stop automatic slide show',
  indicator: 'Go to slide {index}',
  slide: '{index} of {count}',
  roleDescription: 'carousel',
  slideRoleDescription: 'slide',
};
