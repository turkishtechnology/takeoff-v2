import { FlightLoader as FlightLoaderRoot } from './FlightLoader';
import { FlightLoaderLogo } from './FlightLoaderLogo';
import { FlightLoaderTagline } from './FlightLoaderTagline';
import { FlightLoaderStatus } from './FlightLoaderStatus';

const FlightLoader = Object.assign(FlightLoaderRoot, {
  Logo: FlightLoaderLogo,
  Tagline: FlightLoaderTagline,
  Status: FlightLoaderStatus,
});

export { FlightLoader };

export type {
  FlightLoaderLogoProps,
  FlightLoaderLogoSlot,
  FlightLoaderProps,
  FlightLoaderSlot,
  FlightLoaderStatusProps,
  FlightLoaderStatusSlot,
  FlightLoaderTaglineProps,
  FlightLoaderTaglineSlot,
  FlightLoaderVariant,
} from './types';
