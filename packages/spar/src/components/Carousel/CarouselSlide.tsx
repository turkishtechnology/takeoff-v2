import { useEffect, useId, useRef, type ElementType } from 'react';
import { useMergedRef } from '@/hooks';
import { useCarouselContext } from './hooks';
import type { CarouselSlideProps } from './types';

/**
 * One slide. Registers itself in document order, so its index follows the
 * rendered position. Slides outside the visible window are `inert`, which
 * keeps their links and buttons out of the tab order and the accessibility
 * tree.
 */
export const CarouselSlide = <T extends ElementType = 'div'>({ as, children, ref, ...props }: CarouselSlideProps<T>) => {
  const { value, slidesPerView, slideCount, registerSlide, unregisterSlide, getSlideIndex, getSlideLabel } = useCarouselContext();
  const Component = as || 'div';
  const id = useId();
  const internalRef = useRef<HTMLElement>(null);
  const mergedRef = useMergedRef(internalRef, ref);

  useEffect(() => {
    const element = internalRef.current;
    if (!element) return undefined;
    registerSlide(id, element);
    return () => unregisterSlide(id);
  }, [id, registerSlide, unregisterSlide]);

  const index = getSlideIndex(id);
  // Until registration lands (first render) the slide counts as visible, so
  // server-rendered markup is not inert.
  const isActive = index < 0 || (index >= value && index < value + slidesPerView);

  return (
    <Component
      ref={mergedRef}
      role="group"
      aria-roledescription="slide"
      aria-label={index < 0 ? undefined : getSlideLabel(index, slideCount)}
      data-active={isActive ? '' : undefined}
      inert={!isActive}
      {...props}
    >
      {typeof children === 'function' ? children({ index, isActive }) : children}
    </Component>
  );
};

CarouselSlide.displayName = 'CarouselSlide';
