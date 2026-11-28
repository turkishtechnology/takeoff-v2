import type { ElementType, ReactNode } from 'react';
import type { Orientation, PolymorphicProps } from '../../types';

/**
 * Own props for the Carousel root component
 */
export interface CarouselOwnProps {
  /**
   * Custom base ID for ARIA relationships. Generated when omitted.
   * The viewport id is derived as `${id}-viewport`.
   */
  id?: string;

  /**
   * Controlled index of the first visible slide.
   */
  value?: number;

  /**
   * Uncontrolled initial index of the first visible slide.
   * @defaultValue 0
   */
  defaultValue?: number;

  /**
   * Called when the first visible slide changes through navigation (triggers,
   * indicators, arrow keys or autoplay). Not called when the target equals the
   * current index.
   * @param value - The new index of the first visible slide
   */
  onValueChange?: (value: number) => void;

  /**
   * Whether navigation wraps from the last page to the first and back.
   * @defaultValue true
   */
  loop?: boolean;

  /**
   * Number of slides visible at once. Navigation moves one slide per step, so
   * the last start index is `slideCount - slidesPerView`.
   * @defaultValue 1
   */
  slidesPerView?: number;

  /**
   * Axis the slides move along; selects the arrow keys used for navigation.
   * @defaultValue 'horizontal'
   */
  orientation?: Orientation;

  /**
   * Whether the carousel advances on its own. Rotation pauses while the
   * pointer is over the carousel or focus is inside it, and does not start
   * when the user prefers reduced motion.
   * @defaultValue false
   */
  autoplay?: boolean;

  /**
   * Time between automatic advances, in milliseconds.
   * @defaultValue 3000
   */
  autoplayInterval?: number;

  /**
   * Controlled autoplay state (the play/pause control). Only meaningful with
   * `autoplay`.
   */
  isPlaying?: boolean;

  /**
   * Uncontrolled initial autoplay state.
   * @defaultValue `true`, or `false` when `prefers-reduced-motion: reduce` matches
   */
  defaultPlaying?: boolean;

  /**
   * Called when autoplay is started or stopped through `CarouselAutoplayTrigger`,
   * or stopped on reaching the last page without `loop`.
   */
  onPlayingChange?: (isPlaying: boolean) => void;

  /**
   * Accessible name builder for each slide.
   * @defaultValue `(index, count) => \`${index + 1} of ${count}\``
   */
  getSlideLabel?: (index: number, count: number) => string;
}

/**
 * Props for the Carousel root component
 * @remarks Headless WAI-ARIA carousel: a labelled region whose slides move one
 * step at a time, with optional auto-rotation.
 */
export type CarouselProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, CarouselOwnProps>;

/**
 * Props for CarouselViewport
 * @remarks Wraps the slides; owns the live region announcing slide changes.
 */
export type CarouselViewportProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T>;

/**
 * Render props provided to CarouselSlide children
 */
export interface CarouselSlideRenderProps {
  /** Position of the slide in document order. */
  index: number;
  /** Whether the slide is inside the visible window. */
  isActive: boolean;
}

/**
 * Own props for CarouselSlide
 */
export interface CarouselSlideOwnProps {
  /**
   * Slide content, or a render function receiving the slide state.
   */
  children?: ReactNode | ((state: CarouselSlideRenderProps) => ReactNode);
}

/**
 * Props for CarouselSlide
 * @remarks A `group` with `aria-roledescription="slide"`; slides outside the
 * visible window are `inert`.
 */
export type CarouselSlideProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, CarouselSlideOwnProps>;

/**
 * Props for CarouselPrevTrigger / CarouselNextTrigger
 * @remarks Disabled at the ends when `loop` is off.
 */
export type CarouselTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T>;

/**
 * Own props for CarouselIndicator
 */
export interface CarouselIndicatorOwnProps {
  /** Start index of the page this indicator selects (`0` … `pageCount - 1`). */
  index: number;
}

/**
 * Props for CarouselIndicator
 * @remarks Carries `aria-current="true"` while its page is shown.
 */
export type CarouselIndicatorProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, CarouselIndicatorOwnProps>;

/**
 * Render props provided to CarouselAutoplayTrigger children
 */
export interface CarouselAutoplayTriggerRenderProps {
  /** Whether autoplay is on (it may still be paused by hover or focus). */
  isPlaying: boolean;
}

/**
 * Own props for CarouselAutoplayTrigger
 */
export interface CarouselAutoplayTriggerOwnProps {
  /** Content, or a render function receiving the autoplay state. */
  children?: ReactNode | ((state: CarouselAutoplayTriggerRenderProps) => ReactNode);
}

/**
 * Props for CarouselAutoplayTrigger
 * @remarks Starts or stops automatic rotation. Renders nothing without `autoplay`.
 */
export type CarouselAutoplayTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, CarouselAutoplayTriggerOwnProps>;

/**
 * Context value provided by the Carousel root
 */
export interface CarouselContextValue {
  /** Index of the first visible slide (clamped to the page range). */
  value: number;
  /** Number of registered slides. */
  slideCount: number;
  /** Number of pages: `max(1, slideCount - slidesPerView + 1)`. */
  pageCount: number;
  slidesPerView: number;
  orientation: Orientation;
  loop: boolean;
  /** Whether a previous step exists (always true with `loop` and more slides than fit). */
  canGoPrev: boolean;
  /** Whether a next step exists. */
  canGoNext: boolean;
  autoplay: boolean;
  /** Autoplay is on (the user has not stopped it). */
  isPlaying: boolean;
  /** Autoplay is on and not paused by hover or focus. */
  isRotating: boolean;
  viewportId: string;
  goTo: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
  setPlaying: (isPlaying: boolean) => void;
  registerSlide: (id: string, element: HTMLElement) => void;
  unregisterSlide: (id: string) => void;
  getSlideIndex: (id: string) => number;
  getSlideLabel: (index: number, count: number) => string;
}
