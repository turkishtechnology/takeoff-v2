/**
 * API table source-of-truth for the Card docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * API block in the sibling `card.mdx` page whenever this file or
 * `packages/react-spar/src/components/card/types.ts` changes.
 */

const cardTypesFile = 'packages/react-spar/src/components/card/types.ts';

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

export default {
  components: [
    {
      sourceFile: cardTypesFile,
      typeName: 'CardProps',
      displayName: 'Card',
      headingBase: 'card',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      propOverrides: {
        children: childrenOverride('Card content, usually Card.Header, Card.Body, and Card.Footer.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: cardTypesFile,
      typeName: 'CardHeaderProps',
      displayName: 'Card.Header',
      headingBase: 'card-header',
      propOverrides: {
        children: childrenOverride('Title, description, or custom header content.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-header-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `headerType` prop.',
        },
      ],
    },
    {
      sourceFile: cardTypesFile,
      typeName: 'CardTitleProps',
      displayName: 'Card.Title',
      headingBase: 'card-title',
      propOverrides: {
        children: childrenOverride('Heading text content.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-level',
          appliedWhen: 'Always',
          purpose: 'Reflects the semantic heading `level`.',
        },
      ],
    },
    {
      sourceFile: cardTypesFile,
      typeName: 'CardDescriptionProps',
      displayName: 'Card.Description',
      headingBase: 'card-description',
      propOverrides: {
        children: childrenOverride('Supporting description text.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: cardTypesFile,
      typeName: 'CardBodyProps',
      displayName: 'Card.Body',
      headingBase: 'card-body',
      propOverrides: {
        children: childrenOverride('Main card content.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: cardTypesFile,
      typeName: 'CardFooterProps',
      displayName: 'Card.Footer',
      headingBase: 'card-footer',
      propOverrides: {
        children: childrenOverride('Footer content or actions.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-footer-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `footerType` prop.',
        },
      ],
    },
  ],
};
