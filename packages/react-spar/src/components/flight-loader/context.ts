import { createSafeContext } from '../../hooks';

import type { FlightLoaderVariant } from './types';

export interface FlightLoaderContextValue {
  variant: FlightLoaderVariant;
}

// Besides sharing the variant, the context makes `FlightLoader.Logo` /
// `.Tagline` / `.Status` throw a descriptive error outside the root instead of
// rendering unstyled.
export const [FlightLoaderProvider, useFlightLoaderContext] = createSafeContext<FlightLoaderContextValue>('FlightLoader');
