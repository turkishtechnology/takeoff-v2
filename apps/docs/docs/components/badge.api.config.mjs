/**
 * API table source-of-truth for the Badge docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `_badge.api.mdx` partial whenever this file or
 * `packages/react-spar/src/components/badge/types.ts` changes.
 */

const badgeTypesFile = 'packages/react-spar/src/components/badge/types.ts';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

export default {
  components: [
    {
      sourceFile: badgeTypesFile,
      typeName: 'BadgeProps',
      displayName: 'Badge',
      headingBase: 'badge',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Badge content.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `appearance` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-size',
          appliedWhen: 'When `dot` is false',
          purpose: 'Reflects the resolved `size` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-rounded',
          appliedWhen: 'When `rounded` is true',
          purpose: 'Styling hook for the pill-shaped state.',
        },
        {
          attribute: 'data-dot',
          appliedWhen: 'When `dot` is true',
          purpose: 'Styling hook for the minimal dot mode.',
        },
      ],
    },
  ],
};
