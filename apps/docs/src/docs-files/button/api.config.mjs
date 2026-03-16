export default {
  sourceFile: 'packages/react-spar/src/components/button/types.ts',
  typeName: 'ButtonProps',
  headingBase: 'button',
  prependPropNames: ['children'],
  appendPropNames: ['className'],
  propOverrides: {
    children: {
      type: 'React.ReactNode',
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
    {
      attribute: 'data-slot="label"',
      appliedWhen: 'Always',
      purpose: 'Stable label slot selector for wrapper styling.',
    },
    {
      attribute: 'data-slot="leading-icon"',
      appliedWhen: 'Leading icon or loading spinner is rendered',
      purpose: 'Stable leading adornment selector.',
    },
    {
      attribute: 'data-slot="trailing-icon"',
      appliedWhen: 'Trailing icon is rendered',
      purpose: 'Stable trailing adornment selector.',
    },
    {
      attribute: 'data-slot="spinner"',
      appliedWhen: '`loading` is `true`',
      purpose: 'Stable loading indicator selector.',
    },
    {
      attribute: 'data-pressed',
      appliedWhen: 'The underlying Spar button exposes its pressed/toggle state',
      purpose: 'Styling hook for pressed treatments.',
    },
    {
      attribute: 'data-disabled',
      appliedWhen: '`disabled` is `true`',
      purpose: 'Styling hook for the disabled state.',
    },
    {
      attribute: 'data-loading',
      appliedWhen: '`loading` is `true`',
      purpose: 'Styling hook for the loading state.',
    },
    {
      attribute: 'data-type / data-variant / data-size / data-mode',
      appliedWhen: 'Always',
      purpose: 'Product styling hooks for visual variants and semantics.',
    },
    {
      attribute: 'data-full-width / data-icon-only / data-rounded / data-underline',
      appliedWhen: 'When the corresponding product prop is enabled',
      purpose: 'Anatomy and layout hooks for Button recipes.',
    },
  ],
};
