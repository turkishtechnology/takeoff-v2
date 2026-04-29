/**
 * API table source-of-truth for the Accordion docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `_accordion.api.mdx` partial whenever this file or
 * `packages/react-spar/src/components/accordion/types.ts` changes.
 */

const accordionTypesFile = 'packages/react-spar/src/components/accordion/types.ts';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  default: 'undefined',
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
      propOverrides: {
        children: childrenOverride('`Accordion.Item` elements rendered inside the disclosure container.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        dataMode,
        dataSize,
        {
          attribute: 'data-arrow-position',
          appliedWhen: 'Always',
          purpose: 'Reflects `arrowPosition`. Theme recipes can flip arrow alignment without reading the React prop.',
        },
      ],
    },
    {
      sourceFile: accordionTypesFile,
      typeName: 'AccordionItemProps',
      displayName: 'Accordion.Item',
      headingBase: 'accordion-item',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('`Accordion.Header` and `Accordion.Content` elements that compose the item.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `type` prop after legacy `compact` normalization. Theme recipes can target items per type.',
        },
        dataMode,
        dataSize,
        {
          attribute: 'data-open',
          appliedWhen: 'When the item is open.',
          purpose:
            'Stable open-state hook. Mirrors the active-index match independently of `data-state` so theme rules stay attached when `forceMount` keeps closed panels in the DOM.',
        },
      ],
    },
    {
      sourceFile: accordionTypesFile,
      typeName: 'AccordionHeaderProps',
      displayName: 'Accordion.Header',
      headingBase: 'accordion-header',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      propOverrides: {
        children: childrenOverride('`Accordion.Trigger` element rendered inside the heading tag.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: accordionTypesFile,
      typeName: 'AccordionTriggerProps',
      displayName: 'Accordion.Trigger',
      headingBase: 'accordion-trigger',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      propOverrides: {
        children: childrenOverride('Accessible label for the trigger button.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: accordionTypesFile,
      typeName: 'AccordionContentProps',
      displayName: 'Accordion.Content',
      headingBase: 'accordion-content',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      propOverrides: {
        children: childrenOverride('Panel body. Animated open/closed by Spar.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-open',
          appliedWhen: 'When the panel is open.',
          purpose:
            'Stable open-state hook for the panel. Mirrors `useCollapsibleContext().isOpen` so theme animations and `max-height` rules stay in sync even when `forceMount` keeps the panel rendered while closed.',
        },
      ],
    },
  ],
};
