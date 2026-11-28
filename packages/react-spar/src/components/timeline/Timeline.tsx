import { useMemo, type ElementType } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TimelineBase } from './base';
import { TimelineProvider, type TimelineContextValue } from './context';
import { DEFAULT_ORIENTATION, DEFAULT_PLACEMENT } from './defaults';
import type { TimelineProps } from './types';

export const Timeline = <T extends ElementType = 'ol'>(props: TimelineProps<T>) => {
  const theme = useComponentTheme('Timeline');

  const { rootAttrs, rest } = composeRootAttrs(TimelineBase, props as TimelineProps<'ol'>, theme, {
    stateAttrs: ({ orientation = DEFAULT_ORIENTATION, placement = DEFAULT_PLACEMENT }) => ({
      'data-orientation': orientation,
      'data-placement': placement,
    }),
  });

  const { orientation = DEFAULT_ORIENTATION, placement = DEFAULT_PLACEMENT, as, children, ref, ...nativeProps } = rest;

  const contextValue = useMemo<TimelineContextValue>(() => ({ orientation, placement }), [orientation, placement]);
  const Component = (as ?? 'ol') as ElementType;

  return (
    <TimelineProvider value={contextValue}>
      <Component {...nativeProps} {...rootAttrs} ref={ref}>
        {children}
      </Component>
    </TimelineProvider>
  );
};

Timeline.displayName = 'Timeline';
