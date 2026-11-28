import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TimelineTimeBase } from './base';
import { useTimelineItemContext } from './context';
import type { TimelineTimeProps } from './types';

export const TimelineTime = <T extends ElementType = 'time'>(props: TimelineTimeProps<T>) => {
  const theme = useComponentTheme('TimelineTime');
  useTimelineItemContext('Timeline.Time');

  const { rootAttrs, rest } = composeRootAttrs(TimelineTimeBase, props as TimelineTimeProps<'time'>, theme);
  const { as, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'time') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

TimelineTime.displayName = 'Timeline.Time';
