export default {
  sourceFile: 'packages/react-spar/src/components/accordion/types.ts',
  typeName: 'AccordionProps',
  headingBase: 'accordion',
  prependPropNames: ['children'],
  appendPropNames: ['className'],
  propOverrides: {
    children: {
      type: 'React.ReactNode',
      description: 'Accordion.Item elements rendered inside the accordion container.',
    },
    className: {
      type: 'string',
      default: 'undefined',
      description: 'Appends custom classes to the wrapper root slot.',
    },
  },
  dataAttributes: [
    {
      attribute: 'data-slot="root"',
      appliedWhen: 'Always',
      purpose: 'Stable root slot selector for wrapper styling.',
    },
  ],
};
