/**
 * API table source-of-truth for the Chip docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `_chip.api.mdx` partial whenever this file or
 * `packages/react-spar/src/components/chip/types.ts` changes.
 */

const chipTypesFile = 'packages/react-spar/src/components/chip/types.ts';

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
      sourceFile: chipTypesFile,
      typeName: 'ChipProps',
      displayName: 'Chip',
      headingBase: 'chip',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Chip content.'),
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
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-clickable',
          appliedWhen: 'When `clickable` is true',
          purpose: 'Styling hook for chips with a click action.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When `disabled` is true',
          purpose: 'Styling hook for the disabled state.',
        },
        {
          attribute: 'data-removable',
          appliedWhen: 'When `removable` is true',
          purpose: 'Styling hook for chip with a remove action.',
        },
      ],
    },
  ],
};
