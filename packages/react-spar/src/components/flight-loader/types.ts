import type { ElementType } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';
import type { SpinnerVariant } from '../spinner';

export type FlightLoaderVariant = SpinnerVariant;

export type FlightLoaderSlot = 'root' | 'scene' | 'progress';
export type FlightLoaderLogoSlot = 'root';
export type FlightLoaderTaglineSlot = 'root';
export type FlightLoaderStatusSlot = 'root';

export interface FlightLoaderOwnProps {
  /**
   * Accent color of the plane's tail and the progress bar. For a color outside
   * the variant palette, set the `--tk-flight-loader-accent` custom property.
   * @defaultValue 'primary'
   */
  variant?: FlightLoaderVariant;
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<FlightLoaderSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<FlightLoaderSlot>;
}

export type FlightLoaderProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, FlightLoaderOwnProps>;

export interface FlightLoaderLogoOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<FlightLoaderLogoSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<FlightLoaderLogoSlot>;
}

export type FlightLoaderLogoProps<T extends ElementType = 'img'> = PolymorphicProps<'img', T, FlightLoaderLogoOwnProps>;

export interface FlightLoaderTaglineOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<FlightLoaderTaglineSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<FlightLoaderTaglineSlot>;
}

export type FlightLoaderTaglineProps<T extends ElementType = 'p'> = PolymorphicProps<'p', T, FlightLoaderTaglineOwnProps>;

export interface FlightLoaderStatusOwnProps {
  /** Per-slot extra classes. */
  classNames?: ClassNamesMap<FlightLoaderStatusSlot>;
  /** Per-slot HTML-attribute overrides. */
  slotProps?: SlotPropsMap<FlightLoaderStatusSlot>;
}

export type FlightLoaderStatusProps<T extends ElementType = 'p'> = PolymorphicProps<'p', T, FlightLoaderStatusOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    FlightLoader: import('../../core').ComponentThemeConfig<FlightLoaderProps, FlightLoaderSlot>;
    FlightLoaderLogo: import('../../core').ComponentThemeConfig<FlightLoaderLogoProps, FlightLoaderLogoSlot>;
    FlightLoaderTagline: import('../../core').ComponentThemeConfig<FlightLoaderTaglineProps, FlightLoaderTaglineSlot>;
    FlightLoaderStatus: import('../../core').ComponentThemeConfig<FlightLoaderStatusProps, FlightLoaderStatusSlot>;
  }
}
