export default {
  sourceFile: 'packages/react-spar/src/components/button/types.ts',
  typeName: 'ButtonProps',
  headingBase: 'button',
  prependPropNames: ['children'],
  appendPropNames: ['className'],
  eventPropNames: ['onClick'],
  propOverrides: {
    children: {
      type: 'React.ReactNode',
      description: 'Compound children — must be composed from `Button.Label`, `Button.LeadingIcon`, `Button.TrailingIcon`, and `Button.Spinner`.',
    },
    onClick: {
      type: 'React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>',
      default: 'undefined',
      description: 'Fired when the user activates the button or link.',
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
      appliedWhen: '`Button.Label` is rendered',
      purpose: 'Stable label slot selector for wrapper styling.',
    },
    {
      attribute: 'data-slot="leading-icon"',
      appliedWhen: '`Button.LeadingIcon` is rendered',
      purpose: 'Stable leading adornment selector.',
    },
    {
      attribute: 'data-slot="trailing-icon"',
      appliedWhen: '`Button.TrailingIcon` is rendered',
      purpose: 'Stable trailing adornment selector.',
    },
    {
      attribute: 'data-slot="spinner"',
      appliedWhen: '`Button.Spinner` is rendered and `loading` is `true`',
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
