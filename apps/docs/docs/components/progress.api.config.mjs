/**
 * API table source-of-truth for the Progress docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `progress.mdx` whenever this file or
 * `packages/react-spar/src/components/progress/types.ts` changes.
 */

const progressTypesFile = 'packages/react-spar/src/components/progress/types.ts';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

const dataTypePart = {
  attribute: 'data-type',
  appliedWhen: 'Always',
  purpose: 'Reflects the root’s resolved `appearance` so the part’s recipe styles itself without root selectors.',
};

export default {
  components: [
    {
      sourceFile: progressTypesFile,
      typeName: 'ProgressProps',
      displayName: 'Progress',
      headingBase: 'progress',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: 'Optional anatomy override. When omitted, the root renders the default anatomy — `Progress.Track` wrapping `Progress.Indicator` — for both appearances.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `appearance` prop (`linear` | `circular`).',
        },
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` prop so recipes can scale the bar or ring.',
        },
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` prop so theme recipes can recolor the fill.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'disabled (own prop or inherited from a surrounding `Field`)',
          purpose: 'Mutes the fill color through the recipe.',
        },
        {
          attribute: 'data-indeterminate',
          appliedWhen: '`indeterminate`',
          purpose: 'Marks the indeterminate state; `aria-valuenow` is dropped alongside it.',
        },
        {
          attribute: 'data-complete',
          appliedWhen: 'Determinate and the clamped `value` reaches `max`',
          purpose:
            'Styling hook for finished states (e.g. a success fill at 100%). It flips the instant the value reaches `max` — the fill’s 0.3s transition may still be catching up visually, so completion styling leads the fill slightly.',
        },
      ],
    },
    {
      sourceFile: progressTypesFile,
      typeName: 'ProgressTrackProps',
      displayName: 'Progress.Track',
      headingBase: 'progress-track',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: 'Track anatomy override. When omitted, `Progress.Track` renders the default `Progress.Indicator`.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-slot="rail"',
          appliedWhen: 'appearance="circular"',
          purpose: 'The rail `<circle>` the ring svg draws; style or override it via `classNames.rail` / `slotProps.rail`.',
        },
        dataTypePart,
      ],
    },
    {
      sourceFile: progressTypesFile,
      typeName: 'ProgressIndicatorProps',
      displayName: 'Progress.Indicator',
      headingBase: 'progress-indicator',
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        dataTypePart,
        {
          attribute: 'data-indeterminate',
          appliedWhen: '`indeterminate`',
          purpose: 'Drives the looping sweep animation instead of a written fill.',
        },
      ],
    },
    {
      sourceFile: progressTypesFile,
      typeName: 'ProgressValueProps',
      displayName: 'Progress.Value',
      headingBase: 'progress-value',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: 'Visible value content — typically the formatted value (e.g. `%60`) or a short status. No default content is rendered; formatting stays with the consumer.',
        },
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot, dataTypePart],
    },
  ],
};
