import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { FlightLoaderTaglineBase } from './base';
import { useFlightLoaderContext } from './context';
import type { FlightLoaderTaglineProps, FlightLoaderTaglineSlot } from './types';

export const FlightLoaderTagline = <T extends ElementType = 'p'>(props: FlightLoaderTaglineProps<T>) => {
  useFlightLoaderContext('FlightLoader.Tagline');
  const theme = useComponentTheme('FlightLoaderTagline');

  const { rootAttrs, rest } = composeRootAttrs<FlightLoaderTaglineProps, FlightLoaderTaglineSlot>(FlightLoaderTaglineBase, props as FlightLoaderTaglineProps<'p'>, theme);

  const { as, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'p') as ElementType;

  return (
    <Component {...nativeProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

FlightLoaderTagline.displayName = 'FlightLoader.Tagline';
