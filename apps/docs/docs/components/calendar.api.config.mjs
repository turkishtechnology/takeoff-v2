/**
 * API table source-of-truth for the Calendar docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * `api-tables` block in the sibling `calendar.mdx` whenever this file or
 * `packages/react-spar/src/components/calendar/types.ts` changes.
 *
 * Calendar has no compound parts — every node below the root is rendered by
 * `react-day-picker`, so the anatomy is addressed through the `CalendarSlot`
 * keys instead. What the page documents instead is the discriminated union:
 * the shared surface, then one table per `mode` for the props whose type the
 * discriminant changes. There is no Spar primitive behind it, so the
 * "primitive behavior" link points at the engine's own docs.
 */

const calendarTypesFile = 'packages/react-spar/src/components/calendar/types.ts';
const engineDocsUrl = 'https://daypicker.dev';

const calendarDataAttributes = [
  {
    attribute: 'data-slot="root"',
    appliedWhen: 'Always',
    purpose: 'Stable selector for wrapper styling on the root slot. Every anatomy node carries its own `data-slot` (`day`, `month-grid`, `weekday`, …).',
  },
  {
    attribute: 'data-size',
    appliedWhen: 'Always',
    purpose: 'Reflects the resolved `size` for theme recipe scoping; also drives the day-cell geometry.',
  },
  {
    attribute: 'data-mode',
    appliedWhen: 'Always',
    purpose: 'Emitted by the engine. Reflects the selection mode.',
  },
  {
    attribute: 'data-multiple-months',
    appliedWhen: '`numberOfMonths` is greater than 1',
    purpose: 'Emitted by the engine.',
  },
  {
    attribute: 'data-week-numbers',
    appliedWhen: '`showWeekNumber` is set',
    purpose: 'Emitted by the engine.',
  },
  {
    attribute: 'data-nav-layout',
    appliedWhen: '`navLayout` is set',
    purpose: 'Emitted by the engine.',
  },
  {
    attribute: 'data-day',
    appliedWhen: 'Always, on each day cell',
    purpose: 'Emitted by the engine. The cell’s ISO date (`YYYY-MM-DD`) — the stable hook for targeting a specific day.',
  },
  {
    attribute: 'data-selected',
    appliedWhen: 'The day is part of the selection',
    purpose: 'Emitted by the engine on the day cell.',
  },
  {
    attribute: 'data-today',
    appliedWhen: 'The day is today',
    purpose: 'Emitted by the engine on the day cell.',
  },
  {
    attribute: 'data-outside',
    appliedWhen: 'The day belongs to a neighbouring month',
    purpose: 'Emitted by the engine on the day cell.',
  },
  {
    attribute: 'data-disabled',
    appliedWhen: 'The day cannot be selected',
    purpose: 'Emitted by the engine on the day cell.',
  },
  {
    attribute: 'data-focused',
    appliedWhen: 'The day holds keyboard focus',
    purpose: 'Emitted by the engine on the day cell.',
  },
];

/**
 * The shared surface, documented once in the `Calendar` table above. Each
 * mode-specific table repeats only the props whose type the `mode` discriminant
 * changes, so the same row never appears three times.
 */
const sharedSurfaceProps = [
  'ref',
  'className',
  'classNames',
  'slotProps',
  'size',
  'minDate',
  'maxDate',
  'disabledDates',
  'allowedDates',
  'disabledWeekDays',
  'firstDayOfWeekIndex',
  'id',
  'month',
  'defaultMonth',
  'onMonthChange',
  'numberOfMonths',
  'pagedNavigation',
  'reverseMonths',
  'reverseYears',
  'hideNavigation',
  'disableNavigation',
  'captionLayout',
  'navLayout',
  'fixedWeeks',
  'hideWeekdays',
  'showOutsideDays',
  'showWeekNumber',
  'broadcastCalendar',
  'ISOWeek',
  'timeZone',
  'today',
  'autoFocus',
  'dir',
  'locale',
  'numerals',
  'formatters',
  'labels',
  'footer',
  'role',
  'aria-label',
  'aria-labelledby',
];

export default {
  components: [
    {
      sourceFile: calendarTypesFile,
      typeName: 'CalendarOwnProps',
      displayName: 'Calendar',
      headingBase: 'calendar',
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: engineDocsUrl,
      sparDocsLabel: 'react-day-picker docs',
      dataAttributes: calendarDataAttributes,
    },
    {
      sourceFile: calendarTypesFile,
      typeName: 'CalendarSingleProps',
      displayName: 'Calendar — mode="single"',
      headingBase: 'calendar-single',
      skipPropNames: sharedSurfaceProps,
    },
    {
      sourceFile: calendarTypesFile,
      typeName: 'CalendarMultipleProps',
      displayName: 'Calendar — mode="multiple"',
      headingBase: 'calendar-multiple',
      skipPropNames: sharedSurfaceProps,
    },
    {
      sourceFile: calendarTypesFile,
      typeName: 'CalendarRangeProps',
      displayName: 'Calendar — mode="range"',
      headingBase: 'calendar-range',
      skipPropNames: sharedSurfaceProps,
    },
  ],
};
