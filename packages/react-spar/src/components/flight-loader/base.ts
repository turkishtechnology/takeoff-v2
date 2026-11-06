import { createComponentBase } from '../../core';

import type {
  FlightLoaderLogoProps,
  FlightLoaderLogoSlot,
  FlightLoaderProps,
  FlightLoaderSlot,
  FlightLoaderStatusProps,
  FlightLoaderStatusSlot,
  FlightLoaderTaglineProps,
  FlightLoaderTaglineSlot,
} from './types';

// @archetype react-enhancement — no upstream Spar primitive for a loader; the
// takeoff layer owns the takeoff scene, the progress bar and the
// `tk-flight-loader` classes.
export const FlightLoaderBase = createComponentBase<FlightLoaderProps, FlightLoaderSlot>({
  name: 'FlightLoader',
  slots: ['root', 'scene', 'progress'] as const,
  classes: {
    root: 'tk-flight-loader',
    scene: 'tk-flight-loader-scene',
    progress: 'tk-flight-loader-progress',
  },
});

// @archetype react-enhancement — plain `img`, no upstream equivalent.
export const FlightLoaderLogoBase = createComponentBase<FlightLoaderLogoProps, FlightLoaderLogoSlot>({
  name: 'FlightLoaderLogo',
  slots: ['root'] as const,
  classes: { root: 'tk-flight-loader-logo' },
});

// @archetype react-enhancement — plain `p`, no upstream equivalent.
export const FlightLoaderTaglineBase = createComponentBase<FlightLoaderTaglineProps, FlightLoaderTaglineSlot>({
  name: 'FlightLoaderTagline',
  slots: ['root'] as const,
  classes: { root: 'tk-flight-loader-tagline' },
});

// @archetype react-enhancement — plain `p`, no upstream equivalent.
export const FlightLoaderStatusBase = createComponentBase<FlightLoaderStatusProps, FlightLoaderStatusSlot>({
  name: 'FlightLoaderStatus',
  slots: ['root'] as const,
  classes: { root: 'tk-flight-loader-status' },
});
