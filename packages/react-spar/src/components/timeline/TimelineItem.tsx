import type { ElementType } from 'react';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { TimelineItemBase } from './base';
import { TimelineItemProvider, useTimelineContext, type TimelineItemContextValue } from './context';
import type { TimelineItemProps, TimelineItemSlot } from './types';

const ITEM_CONTEXT: TimelineItemContextValue = {};

export const TimelineItem = <T extends ElementType = 'li'>(props: TimelineItemProps<T>) => {
  const theme = useComponentTheme('TimelineItem');
  // Consumed for the safe-context boundary only — items are laid out through
  // the root's cascading data-* hooks.
  useTimelineContext('Timeline.Item');

  const { rootAttrs, rest } = composeRootAttrs<TimelineItemProps, TimelineItemSlot>(TimelineItemBase, props as TimelineItemProps<'li'>, theme);
  const { indicator, as, children, ref, ...nativeProps } = rest;

  const slotLayering = {
    themeSlotProps: theme?.slotProps,
    themeClassNames: theme?.classNames,
    instanceSlotProps: props.slotProps,
    instanceClassNames: props.classNames,
  };

  const separatorAttrs = buildSlotAttrs(TimelineItemBase.getSlotProps('separator'), 'separator', slotLayering);
  const indicatorAttrs = buildSlotAttrs(TimelineItemBase.getSlotProps('indicator'), 'indicator', slotLayering);
  const connectorAttrs = buildSlotAttrs(TimelineItemBase.getSlotProps('connector'), 'connector', slotLayering);
  const contentAttrs = buildSlotAttrs(TimelineItemBase.getSlotProps('content'), 'content', slotLayering);

  const Component = (as ?? 'li') as ElementType;

  return (
    <TimelineItemProvider value={ITEM_CONTEXT}>
      <Component {...nativeProps} {...rootAttrs} ref={ref}>
        <span {...separatorAttrs} aria-hidden="true">
          <span {...indicatorAttrs}>{indicator}</span>
          <span {...connectorAttrs} />
        </span>
        <div {...contentAttrs}>{children}</div>
      </Component>
    </TimelineItemProvider>
  );
};

TimelineItem.displayName = 'Timeline.Item';
