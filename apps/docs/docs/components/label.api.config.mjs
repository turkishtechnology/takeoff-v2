/**
 * API table source-of-truth for the Label docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `label.mdx` page whenever this file or
 * `packages/react-spar/src/components/label/types.ts` changes.
 */

const labelTypesFile = 'packages/react-spar/src/components/label/types.ts';

const childrenOverride = {
  type: 'React.ReactNode',
  description: 'Label content.',
};

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

export default {
  components: [
    {
      sourceFile: labelTypesFile,
      typeName: 'LabelProps',
      displayName: 'Label',
      headingBase: 'label',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride,
        htmlFor: {
          type: 'string',
          description: 'Associates the label with a control by id. Use `as="span"` without `htmlFor` for title-like text.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for wrapper styling on the root slot.',
        },
        {
          attribute: 'data-required',
          appliedWhen: '`required` is true.',
          purpose: 'Styling hook for required labels.',
        },
        {
          attribute: 'data-optional',
          appliedWhen: '`optional` is true.',
          purpose: 'Styling hook for optional labels.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: '`disabled` is true.',
          purpose: 'Styling hook for disabled labels.',
        },
        {
          attribute: 'data-readonly',
          appliedWhen: '`readOnly` is true.',
          purpose: 'Styling hook for read-only labels.',
        },
        {
          attribute: 'data-invalid',
          appliedWhen: '`invalid` is true.',
          purpose: 'Styling hook for invalid labels.',
        },
      ],
    },
  ],
};
