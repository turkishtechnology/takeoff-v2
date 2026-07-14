import type { SVGProps } from 'react';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ProgressTrackBase } from './base';
import { useProgressContext } from './context';
import { RING_CENTER, RING_RADIUS, RING_VIEWBOX } from './defaults';
import { ProgressIndicator } from './ProgressIndicator';
import type { ProgressTrackProps } from './types';

export const ProgressTrack = (props: ProgressTrackProps) => {
  const theme = useComponentTheme('ProgressTrack');
  const { appearance } = useProgressContext('Progress.Track');

  const { rootAttrs, rest } = composeRootAttrs(ProgressTrackBase, props, theme, {
    stateAttrs: () => ({ 'data-type': appearance }),
  });
  const { children, ref, ...nativeProps } = rest;

  const content = children ?? <ProgressIndicator />;

  // The element is decided by the root's appearance: the circular track is
  // the ring <svg> drawing the rail circle (the arc indicator sits on it),
  // the linear one the rail <div> the fill indicator grows inside.
  if (appearance === 'circular') {
    const railAttrs = buildSlotAttrs(ProgressTrackBase.getSlotProps('rail'), 'rail', {
      themeSlotProps: theme?.slotProps,
      themeClassNames: theme?.classNames,
      instanceSlotProps: props.slotProps,
      instanceClassNames: props.classNames,
    });

    return (
      // The decorative role and the ring geometry are design-system
      // invariants (the value is announced by the root; the viewBox must
      // agree with the rail/arc circles) — layered after the spreads so
      // neither instance nor slot props can override them.
      <svg {...(nativeProps as unknown as SVGProps<SVGSVGElement>)} {...rootAttrs} aria-hidden="true" focusable="false" viewBox={RING_VIEWBOX} ref={ref as never}>
        <circle {...(railAttrs as SVGProps<SVGCircleElement>)} cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS} />
        {content}
      </svg>
    );
  }

  return (
    <div {...nativeProps} {...rootAttrs} ref={ref as never}>
      {content}
    </div>
  );
};

ProgressTrack.displayName = 'Progress.Track';
