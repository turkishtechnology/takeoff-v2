import { Carousel as CarouselRoot } from './Carousel';
import { CarouselAutoplayTrigger } from './CarouselAutoplayTrigger';
import { CarouselControls } from './CarouselControls';
import { CarouselIndicators } from './CarouselIndicators';
import { CarouselSlide } from './CarouselSlide';
import { CarouselNextTrigger, CarouselPrevTrigger } from './CarouselTriggers';
import { CarouselViewport } from './CarouselViewport';

const Carousel = Object.assign(CarouselRoot, {
  Viewport: CarouselViewport,
  Slide: CarouselSlide,
  Controls: CarouselControls,
  PrevTrigger: CarouselPrevTrigger,
  NextTrigger: CarouselNextTrigger,
  Indicators: CarouselIndicators,
  AutoplayTrigger: CarouselAutoplayTrigger,
});

export { Carousel };

export type {
  CarouselAutoplayTriggerProps,
  CarouselAutoplayTriggerRenderProps,
  CarouselAutoplayTriggerSlot,
  CarouselControlsPlacement,
  CarouselControlsPosition,
  CarouselControlsProps,
  CarouselControlsSlot,
  CarouselIndicatorsProps,
  CarouselIndicatorsSlot,
  CarouselLabels,
  CarouselProps,
  CarouselSlideProps,
  CarouselSlideRenderProps,
  CarouselSlideSlot,
  CarouselSlot,
  CarouselTriggerProps,
  CarouselTriggerSlot,
  CarouselViewportProps,
  CarouselViewportSlot,
} from './types';
