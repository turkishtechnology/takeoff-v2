import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { FlightLoaderStatusBase } from './base';
import { useFlightLoaderContext } from './context';
import type { FlightLoaderStatusProps, FlightLoaderStatusSlot } from './types';

export const FlightLoaderStatus = <T extends ElementType = 'p'>(props: FlightLoaderStatusProps<T>) => {
  useFlightLoaderContext('FlightLoader.Status');
  const theme = useComponentTheme('FlightLoaderStatus');

  const { rootAttrs, rest } = composeRootAttrs<FlightLoaderStatusProps, FlightLoaderStatusSlot>(FlightLoaderStatusBase, props as FlightLoaderStatusProps<'p'>, theme);

  const { as, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'p') as ElementType;

  return (
    <Component {...nativeProps} ref={ref} {...rootAttrs}>
      {children}
    </Component>
  );
};

FlightLoaderStatus.displayName = 'FlightLoader.Status';
