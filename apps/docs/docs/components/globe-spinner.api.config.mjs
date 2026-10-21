/**
 * API table source-of-truth for the GlobeSpinner docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * API block in the sibling `globe-spinner.mdx` page whenever this file or
 * `packages/react-spar/src/components/globe-spinner/types.ts` changes.
 */

const globeSpinnerTypesFile = 'packages/react-spar/src/components/globe-spinner/types.ts';

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

export default {
  components: [
    {
      sourceFile: globeSpinnerTypesFile,
      typeName: 'GlobeSpinnerProps',
      displayName: 'GlobeSpinner',
      headingBase: 'globe-spinner',
      prependPropNames: ['children'],
      appendPropNames: ['className', 'aria-label', 'aria-labelledby', 'aria-hidden'],
      skipPropNames: ['ref'],
      propOverrides: {
        'children': {
          type: 'React.ReactNode',
          description: 'Optional `GlobeSpinner.Label`. It is rendered inside the SVG, so pass no other content.',
        },
        'className': {
          type: 'string',
          description: 'Appends custom classes to the root slot.',
        },
        'aria-label': {
          type: 'string',
          default: "'Loading'",
          description: 'Accessible name for the loading status. The arc label is decorative and never names the status.',
        },
        'aria-labelledby': {
          type: 'string',
          description: 'ID reference for visible loading text. When provided, the default `aria-label` is not applied.',
        },
        'aria-hidden': {
          type: 'boolean',
          default: 'false',
          description: 'Hides a decorative loader from assistive technology. When true, status role and default accessible name are not applied.',
        },
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` prop; drives the arc color.',
        },
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` prop.',
        },
      ],
    },
    {
      sourceFile: globeSpinnerTypesFile,
      typeName: 'GlobeSpinnerLabelProps',
      displayName: 'GlobeSpinner.Label',
      headingBase: 'globe-spinner-label',
      propOverrides: {
        className: {
          type: 'string',
          description: "Appends custom classes to the label's `<text>` node.",
        },
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
