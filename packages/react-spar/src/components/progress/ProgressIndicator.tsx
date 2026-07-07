import type { CSSProperties, SVGProps } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ProgressIndicatorBase } from './base';
import { useProgressContext } from './context';
import { RING_CENTER, RING_RADIUS } from './defaults';
import type { ProgressIndicatorProps } from './types';

export const ProgressIndicator = (props: ProgressIndicatorProps) => {
  const theme = useComponentTheme('ProgressIndicator');
  const { value, min, max, appearance, indeterminate } = useProgressContext('Progress.Indicator');
  // `(… * 100) / range` rather than a pre-divided fraction keeps round
  // percentages exact (0.3 * 100 floats to 30.000000000000004).
  const percent = ((value - min) * 100) / (max - min);

  const { rootAttrs, rest } = composeRootAttrs(ProgressIndicatorBase, props, theme, {
    stateAttrs: () => ({
      'data-type': appearance,
      'data-indeterminate': indeterminate ? '' : undefined,
    }),
  });
  const { ref, style, ...nativeProps } = rest;
  const { style: slotStyle, ...slotAttrs } = rootAttrs as Record<string, unknown> & { style?: CSSProperties };

  // The element is decided by the root's appearance: the circular indicator
  // is the arc <circle> carrying the dash offset (it sits on the rail the
  // Track svg draws), the linear one a fill <span> carrying the width.
  //
  // When indeterminate there is no progress to write — the recipe animates
  // the looping sweep off data-indeterminate instead, so the inline offset /
  // width below is skipped (the normalized dash geometry still applies).
  if (appearance === 'circular') {
    return (
      <circle
        cx={RING_CENTER}
        cy={RING_CENTER}
        r={RING_RADIUS}
        {...(nativeProps as unknown as SVGProps<SVGCircleElement>)}
        {...slotAttrs}
        // The normalized arc geometry and its offset are the design-system
        // invariant the recipe animates; they are layered after the spreads
        // so neither instance nor slot props can override them. The dash
        // values are written as inline style (not presentation attributes)
        // because any stylesheet rule outranks a presentation attribute —
        // only inline style keeps the invariant safe from CSS too.
        pathLength="100"
        style={{ ...style, ...slotStyle, strokeDasharray: 100, ...(indeterminate ? null : { strokeDashoffset: 100 - percent }) }}
        ref={ref as never}
      />
    );
  }

  // The decorative role and the width are the design-system invariants the
  // recipe relies on; both are layered after the spreads so neither instance
  // nor slot props can override them.
  return <span {...nativeProps} {...slotAttrs} aria-hidden="true" style={{ ...style, ...slotStyle, ...(indeterminate ? null : { width: `${percent}%` }) }} ref={ref as never} />;
};

ProgressIndicator.displayName = 'Progress.Indicator';
