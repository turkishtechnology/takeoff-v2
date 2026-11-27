import type { ElementType } from 'react';
import { useCarouselContext } from './hooks';
import type { CarouselViewportProps } from './types';

/**
 * Wraps the slides. Announces slide changes politely unless the carousel is
 * rotating on its own (APG: `aria-live="off"` while auto-rotating).
 */
export const CarouselViewport = <T extends ElementType = 'div'>({ as, children, ref, ...props }: CarouselViewportProps<T>) => {
  const { viewportId, isRotating } = useCarouselContext();
  const Component = as || 'div';

  return (
    <Component ref={ref} id={viewportId} aria-live={isRotating ? 'off' : 'polite'} {...props}>
      {children}
    </Component>
  );
};

CarouselViewport.displayName = 'CarouselViewport';
