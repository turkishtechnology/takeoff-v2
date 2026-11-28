import { createContext, useContext } from 'react';
import type { CarouselContextValue } from '../types';

export const CarouselContext = createContext<CarouselContextValue | null>(null);

/**
 * Hook to access the Carousel context. Must be used within a Carousel.
 *
 * @returns CarouselContextValue with the index, page model and navigation actions
 * @throws Error if used outside of a Carousel
 */
export const useCarouselContext = (): CarouselContextValue => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('Carousel components must be used within a Carousel');
  }
  return context;
};
