import { Carousel as CarouselRoot } from './Carousel';
import { CarouselViewport } from './CarouselViewport';
import { CarouselSlide } from './CarouselSlide';
import { CarouselPrevTrigger, CarouselNextTrigger, CarouselIndicator, CarouselAutoplayTrigger } from './CarouselTriggers';
export { useCarouselContext } from './hooks';

const Carousel = CarouselRoot as typeof CarouselRoot & {
  Root: typeof CarouselRoot;
  Viewport: typeof CarouselViewport;
  Slide: typeof CarouselSlide;
  PrevTrigger: typeof CarouselPrevTrigger;
  NextTrigger: typeof CarouselNextTrigger;
  Indicator: typeof CarouselIndicator;
  AutoplayTrigger: typeof CarouselAutoplayTrigger;
};

Carousel.Root = CarouselRoot;
Carousel.Viewport = CarouselViewport;
Carousel.Slide = CarouselSlide;
Carousel.PrevTrigger = CarouselPrevTrigger;
Carousel.NextTrigger = CarouselNextTrigger;
Carousel.Indicator = CarouselIndicator;
Carousel.AutoplayTrigger = CarouselAutoplayTrigger;

export { Carousel, CarouselRoot, CarouselViewport, CarouselSlide, CarouselPrevTrigger, CarouselNextTrigger, CarouselIndicator, CarouselAutoplayTrigger };

export type {
  CarouselProps,
  CarouselViewportProps,
  CarouselSlideProps,
  CarouselSlideRenderProps,
  CarouselTriggerProps,
  CarouselIndicatorProps,
  CarouselAutoplayTriggerProps,
  CarouselAutoplayTriggerRenderProps,
  CarouselContextValue,
} from './types';
