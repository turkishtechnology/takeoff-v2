import type { CSSProperties, SVGProps } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ProgressIndicatorBase } from './base';
import { useProgressContext } from './context';
import type { ProgressIndicatorProps } from './types';

export const ProgressIndicator = (props: ProgressIndicatorProps) => {
  const theme = useComponentTheme('ProgressIndicator');
  const { value, min, max, appearance } = useProgressContext('Progress.Indicator');
  // `(… * 100) / range` rather than a pre-divided fraction keeps round
  // percentages exact (0.3 * 100 floats to 30.000000000000004).
  const percent = ((value - min) * 100) / (max - min);

  const { rootAttrs, rest } = composeRootAttrs(ProgressIndicatorBase, props, theme);
  const { ref, style, ...nativeProps } = rest;
  const { style: slotStyle, ...slotAttrs } = rootAttrs as Record<string, unknown> & { style?: CSSProperties };

  // The element is decided by the root's appearance: the circular indicator
  // is the ring <svg> (rail circle + arc circle carrying the dash offset),
  // the linear one a fill <span> carrying the width.
  if (appearance === 'circular') {
    return (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 40 40" {...(nativeProps as unknown as SVGProps<SVGSVGElement>)} {...slotAttrs} style={{ ...style, ...slotStyle }} ref={ref as never}>
        <circle cx="20" cy="20" r="18" />
        <circle cx="20" cy="20" r="18" pathLength="100" strokeDashoffset={100 - percent} />
      </svg>
    );
  }

  // The width is the design-system invariant the recipe animates; it is
  // layered after the instance and slot styles so neither can override it.
  return <span aria-hidden="true" {...nativeProps} {...slotAttrs} style={{ ...style, ...slotStyle, width: `${percent}%` }} ref={ref as never} />;
};

ProgressIndicator.displayName = 'Progress.Indicator';
