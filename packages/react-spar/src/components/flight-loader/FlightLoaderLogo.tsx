import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { FlightLoaderLogoBase } from './base';
import { useFlightLoaderContext } from './context';
import type { FlightLoaderLogoProps, FlightLoaderLogoSlot } from './types';

export const FlightLoaderLogo = <T extends ElementType = 'img'>(props: FlightLoaderLogoProps<T>) => {
  useFlightLoaderContext('FlightLoader.Logo');
  const theme = useComponentTheme('FlightLoaderLogo');

  const { rootAttrs, rest } = composeRootAttrs<FlightLoaderLogoProps, FlightLoaderLogoSlot>(FlightLoaderLogoBase, props as FlightLoaderLogoProps<'img'>, theme);

  const { as, ref, ...nativeProps } = rest;
  const Component = (as ?? 'img') as ElementType;

  return <Component {...nativeProps} ref={ref} {...rootAttrs} />;
};

FlightLoaderLogo.displayName = 'FlightLoader.Logo';
