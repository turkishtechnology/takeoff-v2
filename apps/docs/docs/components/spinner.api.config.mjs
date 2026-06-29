/**
 * API table source-of-truth for the Spinner docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `spinner.mdx` page whenever this file or
 * `packages/react-spar/src/components/spinner/types.ts` changes.
 */

const spinnerTypesFile = 'packages/react-spar/src/components/spinner/types.ts';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

export default {
  components: [
    {
      sourceFile: spinnerTypesFile,
      typeName: 'SpinnerProps',
      displayName: 'Spinner',
      headingBase: 'spinner',
      appendPropNames: ['className', 'aria-label', 'aria-labelledby', 'aria-hidden'],
      skipPropNames: ['ref'],
      propOverrides: {
        'className': classNameOverride,
        'aria-label': {
          type: 'string',
          default: "'Loading'",
          description: 'Accessible name for the loading status. Override it for domain-specific loading text.',
        },
        'aria-labelledby': {
          type: 'string',
          description: 'ID reference for visible loading text. When provided, the default `aria-label` is not applied.',
        },
        'aria-hidden': {
          type: 'boolean',
          default: 'false',
          description: 'Hides a decorative spinner from assistive technology. When true, status role and default accessible name are not applied.',
        },
      },
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for wrapper styling on the root slot.',
        },
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `appearance` prop for theme recipe scoping.',
        },
      ],
    },
  ],
};
