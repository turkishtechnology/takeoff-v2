/**
 * API table source-of-truth for the Timeline docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `timeline.mdx` whenever this file or
 * `packages/react-spar/src/components/timeline/types.ts` changes.
 */

const timelineTypesFile = 'packages/react-spar/src/components/timeline/types.ts';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

const contentPart = (typeName, displayName, headingBase, description) => ({
  sourceFile: timelineTypesFile,
  typeName,
  displayName,
  headingBase,
  prependPropNames: ['children'],
  appendPropNames: ['className'],
  skipPropNames: ['ref'],
  propOverrides: {
    children: childrenOverride(description),
    className: classNameOverride,
  },
  dataAttributes: [dataSlotRoot],
});

export default {
  components: [
    {
      sourceFile: timelineTypesFile,
      typeName: 'TimelineProps',
      displayName: 'Timeline',
      headingBase: 'timeline',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('`Timeline.Item` elements. Alternating sides follow each item’s position in the list.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-orientation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `orientation` prop (`horizontal` | `vertical`).',
        },
        {
          attribute: 'data-placement',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `placement` prop (`alternate` | `start` | `end`); the recipe alternates sides with `:nth-child`.',
        },
      ],
    },
    {
      sourceFile: timelineTypesFile,
      typeName: 'TimelineItemProps',
      displayName: 'Timeline.Item',
      headingBase: 'timeline-item',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride(
          'Event content — typically `Timeline.Title`, `Timeline.Description` and `Timeline.Time`, plus any other node. Renders inside the `content` slot.',
        ),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-slot="separator"',
          appliedWhen: 'Always',
          purpose: 'The `aria-hidden` column (vertical) or row (horizontal) holding the indicator and the connector.',
        },
        {
          attribute: 'data-slot="indicator"',
          appliedWhen: 'Always',
          purpose: 'The point on the line. Empty by default (the recipe paints the dot); holds the `indicator` content otherwise.',
        },
        {
          attribute: 'data-slot="connector"',
          appliedWhen: 'Always',
          purpose: 'The line to the next item; hidden on the last item.',
        },
        {
          attribute: 'data-slot="content"',
          appliedWhen: 'Always',
          purpose: 'The box the item’s children render in.',
        },
      ],
    },
    contentPart('TimelineTitleProps', 'Timeline.Title', 'timeline-title', 'Event title. Pass `as="h3"` (etc.) to render a heading.'),
    contentPart('TimelineDescriptionProps', 'Timeline.Description', 'timeline-description', 'Event description shown under the title.'),
    contentPart('TimelineTimeProps', 'Timeline.Time', 'timeline-time', 'Human-readable date or time. Set `dateTime` for the machine-readable value.'),
  ],
};
