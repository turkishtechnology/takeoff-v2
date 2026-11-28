import type { ElementType } from 'react';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { getStatusAttrs } from '../../utils';

import { FlightLoaderBase } from './base';
import { FlightLoaderProvider } from './context';
import { DEFAULT_ARIA_LABEL, DEFAULT_VARIANT } from './defaults';
import type { FlightLoaderProps, FlightLoaderSlot } from './types';

/** Side-view plane (viewBox 0 0 120 40), nose to the right. */
const TakeoffPlane = () => (
  <svg aria-hidden="true" className="tk-flight-loader-plane-body" focusable="false" viewBox="0 0 120 40">
    <path className="tk-flight-loader-plane-tail" d="M14 15 5 1h10l16 14Z" />
    <path className="tk-flight-loader-plane-fuselage" d="M10 22q-2-6 4-7h82q18 1 22 7-4 5-22 6H16q-6-1-6-6Z" />
    <path className="tk-flight-loader-plane-fuselage" d="M9 20 1 16l23 3Z" />
    <path className="tk-flight-loader-plane-wing" d="M48 23h20L54 36h-9Z" />
    <rect className="tk-flight-loader-plane-wing" height="6" rx="3" width="17" x="50" y="27" />
    <g className="tk-flight-loader-plane-gear">
      <rect height="5" width="1.5" x="31" y="28" />
      <circle cx="31.8" cy="35" r="2.5" />
      <rect height="5" width="1.5" x="99" y="28" />
      <circle cx="99.8" cy="35" r="2.5" />
    </g>
  </svg>
);

export const FlightLoader = <T extends ElementType = 'div'>(props: FlightLoaderProps<T>) => {
  const theme = useComponentTheme('FlightLoader');
  const resolvedProps = props as FlightLoaderProps<'div'>;

  const { rootAttrs, rest } = composeRootAttrs<FlightLoaderProps, FlightLoaderSlot>(FlightLoaderBase, resolvedProps, theme, {
    stateAttrs: ({ variant = DEFAULT_VARIANT }) => ({
      'data-variant': variant,
    }),
  });

  const { as, variant = DEFAULT_VARIANT, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  const slotLayers = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: resolvedProps.slotProps,
    instanceClassNames: resolvedProps.classNames,
  };
  const sceneSlotAttrs = buildSlotAttrs(FlightLoaderBase.getSlotProps('scene'), 'scene' as FlightLoaderSlot, slotLayers);
  const progressSlotAttrs = buildSlotAttrs(FlightLoaderBase.getSlotProps('progress'), 'progress' as FlightLoaderSlot, slotLayers);

  return (
    <FlightLoaderProvider value={{ variant }}>
      <Component {...nativeProps} {...getStatusAttrs(nativeProps, DEFAULT_ARIA_LABEL)} ref={ref} {...rootAttrs}>
        <span {...sceneSlotAttrs} aria-hidden="true">
          {/* Three nested movers so run, climb and pitch each keep one continuous easing curve. */}
          <span className="tk-flight-loader-plane">
            <span className="tk-flight-loader-plane-climb">
              <TakeoffPlane />
            </span>
          </span>
          <span className="tk-flight-loader-runway" />
        </span>
        <span {...progressSlotAttrs} aria-hidden="true" />
        {children}
      </Component>
    </FlightLoaderProvider>
  );
};

FlightLoader.displayName = 'FlightLoader';
