import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TimelineTitleBase } from './base';
import { useTimelineItemContext } from './context';
import type { TimelineTitleProps } from './types';

export const TimelineTitle = <T extends ElementType = 'div'>(props: TimelineTitleProps<T>) => {
  const theme = useComponentTheme('TimelineTitle');
  useTimelineItemContext('Timeline.Title');

  const { rootAttrs, rest } = composeRootAttrs(TimelineTitleBase, props as TimelineTitleProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

TimelineTitle.displayName = 'Timeline.Title';
