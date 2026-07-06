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
          description: 'Optional anatomy override. When omitted, the root renders the default `Progress.Indicator`.',
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
      dataAttributes: [dataSlotRoot],
    },
  ],
};
