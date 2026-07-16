/**
 * API table source-of-truth for the Skeleton docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `skeleton.mdx` page whenever this file or
 * `packages/react-spar/src/components/skeleton/types.ts` changes.
 */

const skeletonTypesFile = 'packages/react-spar/src/components/skeleton/types.ts';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

export default {
  components: [
    {
      sourceFile: skeletonTypesFile,
      typeName: 'SkeletonProps',
      displayName: 'Skeleton',
      headingBase: 'skeleton',
      appendPropNames: ['className', 'aria-hidden'],
      skipPropNames: ['ref'],
      propOverrides: {
        'className': classNameOverride,
        'aria-hidden': {
          type: 'boolean | "true" | "false"',
          default: 'true',
          description: 'Keeps the placeholder out of the accessibility tree. Leave it hidden and expose loading context through nearby content.',
        },
      },
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for wrapper styling on the root slot.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `shape` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-animation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `animation` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-slot="shimmer"',
          appliedWhen: 'Always on the inner span',
          purpose: 'Stable selector for the decorative shimmer strip.',
        },
      ],
    },
  ],
};
