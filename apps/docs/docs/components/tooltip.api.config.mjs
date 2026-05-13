/**
 * API table source-of-truth for the Tooltip docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `_tooltip.api.mdx` partial whenever this file or
 * `packages/react-spar/src/components/tooltip/types.ts` changes.
 */

const tooltipTypesFile = 'packages/react-spar/src/components/tooltip/types.ts';
const sparTooltipDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Tooltip';

export default {
  components: [
    {
      sourceFile: tooltipTypesFile,
      typeName: 'TooltipProps',
      displayName: 'Tooltip',
      headingBase: 'tooltip',
      prependPropNames: ['children'],
      skipPropNames: [],
      sparDocsUrl: sparTooltipDocsUrl,
      sparDocsLabel: 'Spar Tooltip docs',
      sparBehaviorProps: ['open', 'defaultOpen', 'onOpenChange', 'delay', 'hideDelay', 'disabled'],
    },
    {
      sourceFile: tooltipTypesFile,
      typeName: 'TooltipContentProps',
      displayName: 'Tooltip.Content',
      headingBase: 'tooltip-content',
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
      sourceFile: tooltipTypesFile,
      typeName: 'TooltipHeaderProps',
      displayName: 'Tooltip.Header',
      headingBase: 'tooltip-header',
      prependPropNames: ['children'],
      skipPropNames: ['ref'],
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for the header.',
        },
      ],
    },
    {
      sourceFile: tooltipTypesFile,
      typeName: 'TooltipDescriptionProps',
      displayName: 'Tooltip.Description',
      headingBase: 'tooltip-description',
      prependPropNames: ['children'],
      skipPropNames: ['ref'],
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for the description.',
        },
      ],
    },
    {
      sourceFile: tooltipTypesFile,
      typeName: 'TooltipTriggerProps',
      displayName: 'Tooltip.Trigger',
      headingBase: 'tooltip-trigger',
      prependPropNames: ['children'],
      skipPropNames: ['ref'],
    },
    {
      sourceFile: tooltipTypesFile,
      typeName: 'TooltipArrowProps',
      displayName: 'Tooltip.Arrow',
      headingBase: 'tooltip-arrow',
      skipPropNames: ['ref'],
    },
  ],
};
