import type { ElementType, ReactNode } from 'react';
import type {
  CarouselAutoplayTriggerRenderProps as SparCarouselAutoplayTriggerRenderProps,
  CarouselProps as SparCarouselProps,
  CarouselSlideRenderProps as SparCarouselSlideRenderProps,
  PolymorphicProps,
} from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/** Where the navigation sits: over the slides, or in reserved room around them. */
export type CarouselControlsPlacement = 'inside' | 'outside';

/**
 * How the navigation is laid out. `distributed` puts the arrows on either side
 * and the indicators along the bottom (inline-end when vertical); `start` /
 * `end` group every control in one bar at the top / bottom (inline-start /
 * inline-end when vertical).
 */
export type CarouselControlsPosition = 'distributed' | 'start' | 'end';

// Render-prop state surface of `Carousel.Slide` children (all of Spar's).
export type CarouselSlideRenderProps = Pick<SparCarouselSlideRenderProps, 'index' | 'isActive'>;
// Render-prop state surface of `Carousel.AutoplayTrigger` children (all of Spar's).
export type CarouselAutoplayTriggerRenderProps = Pick<SparCarouselAutoplayTriggerRenderProps, 'isPlaying'>;

/**
 * User-facing strings of a Carousel. `{index}` and `{count}` are filled in, so
 * word order stays with the translation.
 */
export interface CarouselLabels {
  /** Accessible name of `Carousel.PrevTrigger`. */
  previous: string;
  /** Accessible name of `Carousel.NextTrigger`. */
  next: string;
  /** Accessible name of `Carousel.AutoplayTrigger` while stopped. */
  play: string;
  /** Accessible name of `Carousel.AutoplayTrigger` while playing. */
  pause: string;
  /** Accessible name of each indicator (`{index}` is 1-based). */
  indicator: string;
  /** Accessible name of each slide (`{index}` is 1-based, `{count}` the total). */
  slide: string;
  /** `aria-roledescription` of the root. */
  roleDescription: string;
  /** `aria-roledescription` of each slide. */
  slideRoleDescription: string;
}

export type CarouselSlot = 'root';
export type CarouselViewportSlot = 'root' | 'track';
export type CarouselSlideSlot = 'root';
export type CarouselControlsSlot = 'root';
export type CarouselTriggerSlot = 'root';
export type CarouselIndicatorsSlot = 'root' | 'indicator' | 'indicatorDot';
export type CarouselAutoplayTriggerSlot = 'root';

export interface CarouselOwnProps {
  /**
   * Where the navigation sits. `outside` reserves room around the slides.
   * @defaultValue 'inside'
   */
  controlsPlacement?: CarouselControlsPlacement;
  /**
   * How the navigation is laid out (see `CarouselControlsPosition`).
   * @defaultValue 'distributed'
   */
  controlsPosition?: CarouselControlsPosition;
  /** Overrides for the user-facing strings; blank entries fall back to English. */
  labels?: Partial<CarouselLabels>;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CarouselSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CarouselSlot>;
}

export type CarouselProps<T extends ElementType = 'div'> = PolymorphicProps<
  'div',
  T,
  CarouselOwnProps &
    // Spar carousel state: index, page model, loop, orientation and autoplay.
    // Excluded: `getSlideLabel`, replaced by the template in `labels.slide`.
    Pick<
      SparCarouselProps,
      | 'id'
      | 'value'
      | 'defaultValue'
      | 'onValueChange'
      | 'loop'
      | 'slidesPerView'
      | 'orientation'
      | 'autoplay'
      | 'autoplayInterval'
      | 'isPlaying'
      | 'defaultPlaying'
      | 'onPlayingChange'
    >
>;

export interface CarouselViewportOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CarouselViewportSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CarouselViewportSlot>;
}

export type CarouselViewportProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, CarouselViewportOwnProps>;

export interface CarouselSlideOwnProps {
  /** Slide content, or a render function receiving the slide state. */
  children?: ReactNode | ((state: CarouselSlideRenderProps) => ReactNode);
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CarouselSlideSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CarouselSlideSlot>;
}

export type CarouselSlideProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, CarouselSlideOwnProps>;

export interface CarouselControlsOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CarouselControlsSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CarouselControlsSlot>;
}

export type CarouselControlsProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, CarouselControlsOwnProps>;

export interface CarouselTriggerOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CarouselTriggerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CarouselTriggerSlot>;
}

/** Renders a small icon-only Takeoff `Button`; `as` replaces that Button. */
export type CarouselTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, CarouselTriggerOwnProps>;

export interface CarouselIndicatorsOwnProps {
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CarouselIndicatorsSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CarouselIndicatorsSlot>;
}

export type CarouselIndicatorsProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, CarouselIndicatorsOwnProps>;

export interface CarouselAutoplayTriggerOwnProps {
  /** Replaces the play/pause glyph; a function receives the autoplay state. */
  children?: ReactNode | ((state: CarouselAutoplayTriggerRenderProps) => ReactNode);
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<CarouselAutoplayTriggerSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<CarouselAutoplayTriggerSlot>;
}

export type CarouselAutoplayTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, CarouselAutoplayTriggerOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Carousel: import('../../core').ComponentThemeConfig<CarouselProps, CarouselSlot>;
    CarouselViewport: import('../../core').ComponentThemeConfig<CarouselViewportProps, CarouselViewportSlot>;
    CarouselSlide: import('../../core').ComponentThemeConfig<CarouselSlideProps, CarouselSlideSlot>;
    CarouselControls: import('../../core').ComponentThemeConfig<CarouselControlsProps, CarouselControlsSlot>;
    CarouselPrevTrigger: import('../../core').ComponentThemeConfig<CarouselTriggerProps, CarouselTriggerSlot>;
    CarouselNextTrigger: import('../../core').ComponentThemeConfig<CarouselTriggerProps, CarouselTriggerSlot>;
    CarouselIndicators: import('../../core').ComponentThemeConfig<CarouselIndicatorsProps, CarouselIndicatorsSlot>;
    CarouselAutoplayTrigger: import('../../core').ComponentThemeConfig<CarouselAutoplayTriggerProps, CarouselAutoplayTriggerSlot>;
  }
}
