import type { ElementType, MouseEvent } from 'react';
import { useCarouselContext } from './hooks';
import type { CarouselAutoplayTriggerProps, CarouselIndicatorProps, CarouselTriggerProps } from './types';

/**
 * Steps back one slide. Disabled on the first page when `loop` is off, or when
 * every slide already fits.
 */
export const CarouselPrevTrigger = <T extends ElementType = 'button'>({ as, children, onClick, ref, disabled, ...props }: CarouselTriggerProps<T>) => {
  const { goPrev, canGoPrev, viewportId } = useCarouselContext();
  const Component = as || 'button';

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event as never);
    if (!event.defaultPrevented) goPrev();
  };

  return (
    <Component ref={ref} type="button" aria-controls={viewportId} disabled={disabled || !canGoPrev} {...props} onClick={handleClick}>
      {children}
    </Component>
  );
};

CarouselPrevTrigger.displayName = 'CarouselPrevTrigger';

/**
 * Steps forward one slide. Disabled on the last page when `loop` is off, or
 * when every slide already fits.
 */
export const CarouselNextTrigger = <T extends ElementType = 'button'>({ as, children, onClick, ref, disabled, ...props }: CarouselTriggerProps<T>) => {
  const { goNext, canGoNext, viewportId } = useCarouselContext();
  const Component = as || 'button';

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event as never);
    if (!event.defaultPrevented) goNext();
  };

  return (
    <Component ref={ref} type="button" aria-controls={viewportId} disabled={disabled || !canGoNext} {...props} onClick={handleClick}>
      {children}
    </Component>
  );
};

CarouselNextTrigger.displayName = 'CarouselNextTrigger';

/**
 * Selects the page starting at `index`. Carries `aria-current="true"` and
 * `data-active` while that page is shown.
 */
export const CarouselIndicator = <T extends ElementType = 'button'>({ as, index, children, onClick, ref, ...props }: CarouselIndicatorProps<T>) => {
  const { value, goTo, viewportId } = useCarouselContext();
  const Component = as || 'button';
  const isActive = value === index;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event as never);
    if (!event.defaultPrevented) goTo(index);
  };

  return (
    <Component
      ref={ref}
      type="button"
      aria-controls={viewportId}
      aria-current={isActive ? 'true' : undefined}
      data-active={isActive ? '' : undefined}
      {...props}
      onClick={handleClick}
    >
      {children}
    </Component>
  );
};

CarouselIndicator.displayName = 'CarouselIndicator';

/**
 * Starts or stops automatic rotation. Renders nothing unless the root has
 * `autoplay`. Stopping here is permanent until the user starts it again;
 * hover and focus only pause.
 */
export const CarouselAutoplayTrigger = <T extends ElementType = 'button'>({ as, children, onClick, ref, ...props }: CarouselAutoplayTriggerProps<T>) => {
  const { autoplay, isPlaying, setPlaying, viewportId } = useCarouselContext();
  const Component = as || 'button';

  if (!autoplay) return null;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event as never);
    if (!event.defaultPrevented) setPlaying(!isPlaying);
  };

  return (
    <Component ref={ref} type="button" aria-controls={viewportId} {...props} onClick={handleClick}>
      {typeof children === 'function' ? children({ isPlaying }) : children}
    </Component>
  );
};

CarouselAutoplayTrigger.displayName = 'CarouselAutoplayTrigger';
