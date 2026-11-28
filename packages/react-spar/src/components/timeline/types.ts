import type { ElementType, ReactNode } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

/** Layout axis of the timeline line. */
export type TimelineOrientation = 'horizontal' | 'vertical';

/**
 * Which side of the line item content sits on. `'alternate'` starts after the
 * line and switches sides on every item; `'start'` and `'end'` keep every item
 * before or after it.
 */
export type TimelinePlacement = 'alternate' | 'start' | 'end';

export type TimelineSlot = 'root';
export type TimelineItemSlot = 'root' | 'separator' | 'indicator' | 'connector' | 'content';
export type TimelineTitleSlot = 'root';
export type TimelineDescriptionSlot = 'root';
export type TimelineTimeSlot = 'root';

/**
 * Props owned by takeoff-v2. There is no Spar timeline primitive to `Pick`
 * from — the whole surface is wrapper-owned (see the react-enhancement
 * rationale in `base.ts`).
 */
export interface TimelineOwnProps {
  /**
   * Layout axis of the timeline line.
   * @defaultValue 'horizontal'
   */
  orientation?: TimelineOrientation;
  /**
   * Which side of the line item content sits on.
   * @defaultValue 'alternate'
   */
  placement?: TimelinePlacement;
  /** Timeline content — `Timeline.Item` elements. */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TimelineSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TimelineSlot>;
}

/**
 * Public props for the Timeline root, an ordered list of events. Children
 * should be `Timeline.Item` elements rendered directly (or from an array):
 * alternating sides follow DOM position, so every list child counts.
 *
 * Overriding `as` on the root leaves items rendering `<li>` — override the
 * item's `as` in tandem to keep the markup valid.
 */
export type TimelineProps<T extends ElementType = 'ol'> = PolymorphicProps<'ol', T, TimelineOwnProps>;

export interface TimelineItemOwnProps {
  /**
   * Custom indicator content, replacing the default dot — typically an icon.
   * Rendered inside the decorative, `aria-hidden` separator.
   */
  indicator?: ReactNode;
  /** Event content — typically `Timeline.Title`, `Timeline.Description` and `Timeline.Time`. */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TimelineItemSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TimelineItemSlot>;
}

export type TimelineItemProps<T extends ElementType = 'li'> = PolymorphicProps<'li', T, TimelineItemOwnProps>;

export interface TimelineTitleOwnProps {
  /** Event title content. */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TimelineTitleSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TimelineTitleSlot>;
}

// Defaults to `div`; pass `as="h3"` (etc.) to make the title a heading.
export type TimelineTitleProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, TimelineTitleOwnProps>;

export interface TimelineDescriptionOwnProps {
  /** Event description content. */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TimelineDescriptionSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TimelineDescriptionSlot>;
}

export type TimelineDescriptionProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, TimelineDescriptionOwnProps>;

export interface TimelineTimeOwnProps {
  /** Human-readable date or time of the event. */
  children?: ReactNode;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<TimelineTimeSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<TimelineTimeSlot>;
}

// Renders `<time>`, so the native `dateTime` attribute carries the
// machine-readable value (e.g. `dateTime="2024-07-07"`).
export type TimelineTimeProps<T extends ElementType = 'time'> = PolymorphicProps<'time', T, TimelineTimeOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Timeline: import('../../core').ComponentThemeConfig<TimelineProps>;
    TimelineItem: import('../../core').ComponentThemeConfig<TimelineItemProps, TimelineItemSlot>;
    TimelineTitle: import('../../core').ComponentThemeConfig<TimelineTitleProps>;
    TimelineDescription: import('../../core').ComponentThemeConfig<TimelineDescriptionProps>;
    TimelineTime: import('../../core').ComponentThemeConfig<TimelineTimeProps>;
  }
}
