export default {
  sourceFile: 'packages/react-spar/src/components/accordion/types.ts',
  typeName: 'AccordionItemProps',
  headingBase: 'accordion-item',
  prependPropNames: ['children'],
  appendPropNames: ['className'],
  propOverrides: {
    children: {
      type: 'React.ReactNode',
      description: 'Compound children — typically Accordion.Header and Accordion.Content.',
    },
    className: {
      type: 'string',
      default: 'undefined',
      description: 'Appends custom classes to the item root slot.',
    },
  },
  dataAttributes: [
    {
      attribute: 'data-slot="root"',
      appliedWhen: 'Always',
      purpose: 'Stable item root slot selector.',
    },
    {
      attribute: 'data-slot="header"',
      appliedWhen: '`Accordion.Header` is rendered',
      purpose: 'Stable header slot selector.',
    },
    {
      attribute: 'data-slot="title"',
      appliedWhen: '`Accordion.Title` is rendered',
      purpose: 'Stable title slot selector.',
    },
    {
      attribute: 'data-slot="content"',
      appliedWhen: '`Accordion.Content` is rendered',
      purpose: 'Stable content slot selector.',
    },
    {
      attribute: 'data-slot="icon"',
      appliedWhen: '`Accordion.Icon` is rendered',
      purpose: 'Stable icon slot selector.',
    },
    {
      attribute: 'data-slot="arrow"',
      appliedWhen: '`Accordion.Arrow` is rendered',
      purpose: 'Stable collapse/expand arrow selector.',
    },
    {
      attribute: 'data-open',
      appliedWhen: 'Item is expanded',
      purpose: 'Styling hook for the open/active state.',
    },
    {
      attribute: 'data-type',
      appliedWhen: 'Always',
      purpose: 'Inherited from parent Accordion `type` prop.',
    },
    {
      attribute: 'data-size',
      appliedWhen: 'Always',
      purpose: 'Reflects item `size` prop.',
    },
    {
      attribute: 'data-mode',
      appliedWhen: 'Always',
      purpose: 'Inherited from parent Accordion `mode` prop.',
    },
  ],
};
