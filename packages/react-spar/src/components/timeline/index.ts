import { Timeline as TimelineRoot } from './Timeline';
import { TimelineDescription } from './TimelineDescription';
import { TimelineItem } from './TimelineItem';
import { TimelineTime } from './TimelineTime';
import { TimelineTitle } from './TimelineTitle';

const Timeline = Object.assign(TimelineRoot, {
  Item: TimelineItem,
  Title: TimelineTitle,
  Description: TimelineDescription,
  Time: TimelineTime,
});

export { Timeline };

export type { TimelineDescriptionProps, TimelineItemProps, TimelineOrientation, TimelinePlacement, TimelineProps, TimelineTimeProps, TimelineTitleProps } from './types';
