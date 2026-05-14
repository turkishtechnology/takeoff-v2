/**
 * API table source-of-truth for the Accordion docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `_accordion.api.mdx` partial whenever this file or
 * `packages/react-spar/src/components/accordion/types.ts` changes.
 */

const accordionTypesFile = 'packages/react-spar/src/components/accordion/types.ts';
const sparAccordionDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Accordion';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

const dataMode = {
  attribute: 'data-mode',
  appliedWhen: 'Always',
  purpose: 'Reflects the resolved `mode` prop. Theme recipes can scope per-mode rules without reading React props.',
};

const dataSize = {
  attribute: 'data-size',
  appliedWhen: 'Always',
  purpose: 'Reflects the resolved `size` prop so theme recipes can scope size variants.',
};

const dataOpenClosed = [
  {
    attribute: 'data-state="open"',
    appliedWhen: 'When expanded.',
    purpose: 'Spar open-state hook.',
  },
  {
    attribute: 'data-state="closed"',
    appliedWhen: 'When collapsed.',
    purpose: 'Spar closed-state hook.',
  },
];

export default {
  components: [
    {
      sourceFile: accordionTypesFile,
      typeName: 'AccordionProps',
      displayName: 'Accordion',
      headingBase: 'accordion',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparAccordionDocsUrl,
      sparDocsLabel: 'Spar Accordion docs',
      propOverrides: {
        children: childrenOverride('`Accordion.Item` elements rendered inside the disclosure container.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot, dataMode, dataSize],
    },
    {
      sourceFile: accordionTypesFile,
      typeName: 'AccordionItemProps',
      displayName: 'Accordion.Item',
      headingBase: 'accordion-item',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparAccordionDocsUrl,
      sparDocsLabel: 'Spar Accordion docs',
      propOverrides: {
        children: childrenOverride('`Accordion.Header` and `Accordion.Content` elements that compose the item.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `type` prop. Theme recipes can target items per type.',
        },
        dataMode,
        dataSize,
        ...dataOpenClosed,
      ],
    },
    {
      sourceFile: accordionTypesFile,
      typeName: 'AccordionHeaderProps',
      displayName: 'Accordion.Header',
      headingBase: 'accordion-header',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparAccordionDocsUrl,
      sparDocsLabel: 'Spar Accordion docs',
      propOverrides: {
        children: childrenOverride('`Accordion.Trigger` element rendered inside the heading tag.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot, ...dataOpenClosed],
    },
    {
      sourceFile: accordionTypesFile,
      typeName: 'AccordionTriggerProps',
      displayName: 'Accordion.Trigger',
      headingBase: 'accordion-trigger',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparAccordionDocsUrl,
      sparDocsLabel: 'Spar Accordion docs',
      propOverrides: {
        children: childrenOverride('Accessible label for the trigger button.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot, ...dataOpenClosed],
    },
    {
      sourceFile: accordionTypesFile,
      typeName: 'AccordionContentProps',
      displayName: 'Accordion.Content',
      headingBase: 'accordion-content',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparAccordionDocsUrl,
      sparDocsLabel: 'Spar Accordion docs',
      propOverrides: {
        children: childrenOverride('Panel body. Animated open/closed by Spar.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot, ...dataOpenClosed],
    },
  ],
};
