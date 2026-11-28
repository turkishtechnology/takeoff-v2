import type { ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TimelineDescriptionBase } from './base';
import { useTimelineItemContext } from './context';
import type { TimelineDescriptionProps } from './types';

export const TimelineDescription = <T extends ElementType = 'div'>(props: TimelineDescriptionProps<T>) => {
  const theme = useComponentTheme('TimelineDescription');
  useTimelineItemContext('Timeline.Description');

  const { rootAttrs, rest } = composeRootAttrs(TimelineDescriptionBase, props as TimelineDescriptionProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

TimelineDescription.displayName = 'Timeline.Description';
