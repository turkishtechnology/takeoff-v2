import { createSafeContext } from '../../hooks';

import type { CarouselLabels } from './types';

export interface CarouselOwnContextValue {
  labels: CarouselLabels;
}

export const [CarouselOwnProvider, useCarouselOwnContext] = createSafeContext<CarouselOwnContextValue>('Carousel');
