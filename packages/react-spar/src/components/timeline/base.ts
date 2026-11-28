import { createComponentBase } from '../../core';

import type { TimelineDescriptionProps, TimelineItemProps, TimelineItemSlot, TimelineProps, TimelineTimeProps, TimelineTitleProps } from './types';

// @archetype react-enhancement — Spar ships no timeline or list primitive, and
// a timeline has no behavior to own (no state, keyboard, focus or ARIA beyond
// native <ol>/<li> semantics). If a Spar primitive lands upstream, these parts
// must migrate to Inherited in the same release (composition-archetype rule 3).
//
// One-off data-* justification (data-attribute-vocabulary.md rule 10):
// - `data-placement` (Variant, root): which side of the line item content sits
//   on (`alternate` | `start` | `end`); the recipe resolves the alternating
//   sides with `:nth-child`, so no per-item index or attribute is emitted.
export const TimelineBase = createComponentBase<TimelineProps, 'root'>({
  name: 'Timeline',
  slots: ['root'] as const,
  classes: { root: 'tk-timeline' },
});

// @archetype react-enhancement — no upstream part. The <li> owns the event;
// `separator` (aria-hidden) holds the decorative `indicator` dot and the
// `connector` line, and `content` is the box the item's children render in.
export const TimelineItemBase = createComponentBase<TimelineItemProps, TimelineItemSlot>({
  name: 'TimelineItem',
  slots: ['root', 'separator', 'indicator', 'connector', 'content'] as const,
  classes: {
    root: 'tk-timeline-item',
    separator: 'tk-timeline-separator',
    indicator: 'tk-timeline-indicator',
    connector: 'tk-timeline-connector',
    content: 'tk-timeline-content',
  },
});

// @archetype react-enhancement — no upstream part; canonical event title node.
export const TimelineTitleBase = createComponentBase<TimelineTitleProps, 'root'>({
  name: 'TimelineTitle',
  slots: ['root'] as const,
  classes: { root: 'tk-timeline-title' },
});

// @archetype react-enhancement — no upstream part; canonical event description node.
export const TimelineDescriptionBase = createComponentBase<TimelineDescriptionProps, 'root'>({
  name: 'TimelineDescription',
  slots: ['root'] as const,
  classes: { root: 'tk-timeline-description' },
});

// @archetype react-enhancement — no upstream part; canonical <time> node.
export const TimelineTimeBase = createComponentBase<TimelineTimeProps, 'root'>({
  name: 'TimelineTime',
  slots: ['root'] as const,
  classes: { root: 'tk-timeline-time' },
});
