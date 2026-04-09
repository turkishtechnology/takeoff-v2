export default {
  sourceFile: 'packages/react-spar/src/components/accordion/types.ts',
  typeName: 'AccordionItemProps',
  headingBase: 'accordion-item',
  prependPropNames: ['children'],
  appendPropNames: ['className'],
  propOverrides: {
    children: {
      type: 'React.ReactNode',
      description: 'Content displayed when the accordion item is expanded.',
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
      appliedWhen: 'Always',
      purpose: 'Stable header slot selector.',
    },
    {
      attribute: 'data-slot="title"',
      appliedWhen: 'Always',
      purpose: 'Stable title slot selector.',
    },
    {
      attribute: 'data-slot="content"',
      appliedWhen: 'Always',
      purpose: 'Stable content slot selector.',
    },
    {
      attribute: 'data-slot="icon"',
      appliedWhen: '`icon` prop is provided',
      purpose: 'Stable icon slot selector.',
    },
    {
      attribute: 'data-slot="arrow"',
      appliedWhen: '`hideArrows` is not `true`',
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
