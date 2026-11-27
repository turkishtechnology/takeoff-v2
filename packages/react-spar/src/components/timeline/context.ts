import { createSafeContext } from '../../hooks';

import type { TimelineOrientation, TimelinePlacement } from './types';

export interface TimelineContextValue {
  orientation: TimelineOrientation;
  placement: TimelinePlacement;
}

export const [TimelineProvider, useTimelineContext] = createSafeContext<TimelineContextValue>('TimelineProvider');

/** Boundary marker provided by each `Timeline.Item` to its content parts. */
export type TimelineItemContextValue = Record<string, never>;

export const [TimelineItemProvider, useTimelineItemContext] = createSafeContext<TimelineItemContextValue>('Timeline.Item');
