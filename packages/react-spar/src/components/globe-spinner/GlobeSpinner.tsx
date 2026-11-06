import { useId } from 'react';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { getStatusAttrs } from '../../utils';

import { GlobeSpinnerBase } from './base';
import { GlobeSpinnerProvider } from './context';
import { DEFAULT_ARIA_LABEL, DEFAULT_SIZE, DEFAULT_VARIANT } from './defaults';
import { ARC_PATH, LABEL_PATH, LAND_PATH, PLANE_PATH } from './paths';
import type { GlobeSpinnerProps, GlobeSpinnerSlot } from './types';

/** Width of the continent strip in LAND_PATH units (360 degrees of longitude). */
const LAND_WIDTH = 360;

// `useId` output may contain characters (`:`, `«`) that are unsafe inside a
// `url(#…)` reference, so ids used by SVG references are reduced to [A-Za-z0-9_-].
const toSvgId = (reactId: string, suffix: string) => `tk-globe-spinner-${reactId.replace(/[^\w-]/g, '')}-${suffix}`;

export const GlobeSpinner = (props: GlobeSpinnerProps) => {
  const theme = useComponentTheme('GlobeSpinner');
  const reactId = useId();
  const clipId = toSvgId(reactId, 'clip');
  const labelPathId = toSvgId(reactId, 'label-path');

  const { rootAttrs, rest } = composeRootAttrs<GlobeSpinnerProps, GlobeSpinnerSlot>(GlobeSpinnerBase, props, theme, {
    stateAttrs: ({ variant = DEFAULT_VARIANT, size = DEFAULT_SIZE }) => ({
      'data-variant': variant,
      'data-size': size,
    }),
  });

  const { variant: _variant, size: _size, children, ref, ...nativeProps } = rest;

  const indicatorSlotAttrs = buildSlotAttrs(GlobeSpinnerBase.getSlotProps('indicator'), 'indicator' as GlobeSpinnerSlot, {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  });

  return (
    <GlobeSpinnerProvider value={{ labelPathId }}>
      <span {...nativeProps} {...getStatusAttrs(nativeProps, DEFAULT_ARIA_LABEL)} {...rootAttrs} ref={ref}>
        <span {...indicatorSlotAttrs} aria-hidden="true">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 120 120">
            <defs>
              <clipPath id={clipId}>
                <circle cx="60" cy="60" r="35" />
              </clipPath>
            </defs>
            <g className="tk-globe-spinner-globe">
              <circle className="tk-globe-spinner-ocean" cx="60" cy="60" r="36" />
              <g clipPath={`url(#${clipId})`}>
                {/* 360° of longitude spans 144 units, so the 72-unit globe shows one hemisphere. */}
                <g transform="translate(-12 28) scale(0.4)">
                  <g className="tk-globe-spinner-land">
                    <path d={LAND_PATH} />
                    <path d={LAND_PATH} transform={`translate(${LAND_WIDTH} 0)`} />
                  </g>
                </g>
              </g>
            </g>
            <circle className="tk-globe-spinner-track" cx="60" cy="60" r="48" />
            <g className="tk-globe-spinner-orbit">
              <path className="tk-globe-spinner-arc" d={ARC_PATH} />
              <path d={LABEL_PATH} fill="none" id={labelPathId} />
              {children}
              <path className="tk-globe-spinner-plane" d={PLANE_PATH} />
            </g>
          </svg>
        </span>
      </span>
    </GlobeSpinnerProvider>
  );
};

GlobeSpinner.displayName = 'GlobeSpinner';
