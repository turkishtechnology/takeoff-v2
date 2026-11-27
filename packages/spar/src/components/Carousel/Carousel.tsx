import { useCallback, useEffect, useId, useMemo, useRef, useState, type ElementType, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react';
import { useControlledState, useItemRegistry, useMergedRef } from '@/hooks';
import { CarouselContext } from './hooks';
import type { CarouselContextValue, CarouselProps } from './types';

const DEFAULT_INTERVAL = 3000;

const defaultSlideLabel = (index: number, count: number): string => `${index + 1} of ${count}`;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Arrow keys belong to the field while the user edits text inside a slide. */
const isEditableTarget = (target: EventTarget): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
};

/**
 * Carousel root: a labelled `region` (`aria-roledescription="carousel"`) that
 * owns the slide index, the page model, keyboard navigation and auto-rotation
 * (WAI-ARIA APG carousel pattern).
 */
export const Carousel = <T extends ElementType = 'div'>({
  id: providedId,
  value: controlledValue,
  defaultValue = 0,
  onValueChange,
  loop = true,
  slidesPerView: slidesPerViewProp = 1,
  orientation = 'horizontal',
  autoplay = false,
  autoplayInterval = DEFAULT_INTERVAL,
  isPlaying: controlledPlaying,
  defaultPlaying,
  onPlayingChange,
  getSlideLabel = defaultSlideLabel,
  as,
  children,
  ref,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: CarouselProps<T>) => {
  const Component = as || 'div';
  const rootRef = useRef<HTMLElement>(null);
  const mergedRef = useMergedRef(rootRef, ref);

  const generatedId = useId();
  const baseId = providedId ?? generatedId;
  const viewportId = `${baseId}-viewport`;

  const slidesPerView = Math.max(1, Math.floor(slidesPerViewProp));
  const { registerItem, unregisterItem, getItemIndex, count: slideCount } = useItemRegistry<HTMLElement>();
  const maxIndex = Math.max(0, slideCount - slidesPerView);
  const pageCount = maxIndex + 1;
  const canNavigate = slideCount > slidesPerView;

  const [selected, setSelected] = useControlledState(controlledValue, defaultValue, onValueChange);
  const value = Math.min(Math.max(0, selected ?? 0), maxIndex);

  // Reduced motion is read once, for the initial state only: a user who then
  // presses play has asked for rotation explicitly.
  const [initialPlaying] = useState(() => defaultPlaying ?? !prefersReducedMotion());
  const [playingState, setPlayingState] = useControlledState(controlledPlaying, initialPlaying, onPlayingChange);
  const isPlaying = autoplay && Boolean(playingState);

  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const isRotating = isPlaying && canNavigate && !isHovered && !hasFocusWithin;

  const goTo = useCallback(
    (index: number) => {
      if (!canNavigate) return;
      let target = index;
      if (loop) {
        if (target < 0) target = maxIndex;
        else if (target > maxIndex) target = 0;
      } else {
        target = Math.min(Math.max(0, target), maxIndex);
      }
      if (target === value) return;
      setSelected(target);
    },
    [canNavigate, loop, maxIndex, value, setSelected],
  );

  const goPrev = useCallback(() => goTo(value - 1), [goTo, value]);
  const goNext = useCallback(() => goTo(value + 1), [goTo, value]);

  const setPlaying = useCallback(
    (next: boolean) => {
      // Pressing play while hovering or focused (the control itself is inside
      // the region) must start rotation now; the pauses re-arm on the next
      // pointer or focus entry.
      if (next) {
        setIsHovered(false);
        setHasFocusWithin(false);
      }
      if (next !== Boolean(playingState)) setPlayingState(next);
    },
    [playingState, setPlayingState],
  );

  useEffect(() => {
    if (!isRotating) return undefined;
    const timer = setTimeout(() => {
      if (!loop && value >= maxIndex) {
        setPlaying(false);
        return;
      }
      goNext();
    }, autoplayInterval);
    return () => clearTimeout(timer);
  }, [isRotating, autoplayInterval, loop, value, maxIndex, goNext, setPlaying]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event as never);
    if (event.defaultPrevented || isEditableTarget(event.target)) return;
    let step = 0;
    if (orientation === 'vertical') {
      if (event.key === 'ArrowUp') step = -1;
      else if (event.key === 'ArrowDown') step = 1;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const isRtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false;
      step = (event.key === 'ArrowRight') !== isRtl ? 1 : -1;
    }
    if (!step) return;
    event.preventDefault();
    goTo(value + step);
  };

  const handlePointerEnter = (event: PointerEvent<HTMLElement>) => {
    onPointerEnter?.(event as never);
    setIsHovered(true);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    onPointerLeave?.(event as never);
    setIsHovered(false);
  };

  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    onFocus?.(event as never);
    setHasFocusWithin(true);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    onBlur?.(event as never);
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !event.currentTarget.contains(next)) setHasFocusWithin(false);
  };

  const contextValue = useMemo<CarouselContextValue>(
    () => ({
      value,
      slideCount,
      pageCount,
      slidesPerView,
      orientation,
      loop,
      canGoPrev: canNavigate && (loop || value > 0),
      canGoNext: canNavigate && (loop || value < maxIndex),
      autoplay,
      isPlaying,
      isRotating,
      viewportId,
      goTo,
      goPrev,
      goNext,
      setPlaying,
      registerSlide: registerItem,
      unregisterSlide: unregisterItem,
      getSlideIndex: getItemIndex,
      getSlideLabel,
    }),
    [
      value,
      slideCount,
      pageCount,
      slidesPerView,
      orientation,
      loop,
      canNavigate,
      maxIndex,
      autoplay,
      isPlaying,
      isRotating,
      viewportId,
      goTo,
      goPrev,
      goNext,
      setPlaying,
      registerItem,
      unregisterItem,
      getItemIndex,
      getSlideLabel,
    ],
  );

  return (
    <CarouselContext.Provider value={contextValue}>
      <Component
        ref={mergedRef}
        id={baseId}
        role="region"
        aria-roledescription="carousel"
        data-orientation={orientation}
        {...props}
        onKeyDown={handleKeyDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
      </Component>
    </CarouselContext.Provider>
  );
};

Carousel.displayName = 'Carousel';
