/**
 * API table source-of-truth for the Popover docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `_popover.api.mdx` partial whenever this file or
 * `packages/react-spar/src/components/popover/types.ts` changes.
 */

const popoverTypesFile = 'packages/react-spar/src/components/popover/types.ts';
const sparPopoverDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Popover';

export default {
  components: [
    {
      sourceFile: popoverTypesFile,
      typeName: 'PopoverProps',
      displayName: 'Popover',
      headingBase: 'popover',
      prependPropNames: ['children'],
      skipPropNames: [],
      sparDocsUrl: sparPopoverDocsUrl,
      sparDocsLabel: 'Spar Popover docs',
    },
    {
      sourceFile: popoverTypesFile,
      typeName: 'PopoverContentProps',
      displayName: 'Popover.Content',
      headingBase: 'popover-content',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for wrapper styling on the root slot.',
        },
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` for theme recipe scoping.',
        },
      ],
    },
    {
      sourceFile: popoverTypesFile,
      typeName: 'PopoverTriggerProps',
      displayName: 'Popover.Trigger',
      headingBase: 'popover-trigger',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for wrapper styling on the root slot.',
        },
      ],
    },
    {
      sourceFile: popoverTypesFile,
      typeName: 'PopoverArrowProps',
      displayName: 'Popover.Arrow',
      headingBase: 'popover-arrow',
      skipPropNames: ['ref'],
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for the arrow.',
        },
      ],
    },
    {
      sourceFile: popoverTypesFile,
      typeName: 'PopoverCloseProps',
      displayName: 'Popover.Close',
      headingBase: 'popover-close',
      prependPropNames: ['children'],
      skipPropNames: ['ref'],
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for the close button.',
        },
      ],
    },
  ],
};
