export default {
  sourceFile: 'packages/react-spar/src/components/input/types.ts',
  typeName: 'InputProps',
  headingBase: 'input',
  appendPropNames: ['className'],
  eventPropNames: ['onChange', 'onClearClick', 'onFocus', 'onBlur'],
  propOverrides: {
    className: {
      type: 'string',
      default: 'undefined',
      description: 'Appends custom classes to the wrapper root slot.',
    },
    onChange: {
      type: '(event: React.ChangeEvent<HTMLInputElement>) => void',
      default: 'undefined',
      description: 'Fired on every value change. Receives the raw native event.',
    },
    onClearClick: {
      type: '(event: React.SyntheticEvent<HTMLButtonElement>) => void',
      default: 'undefined',
      description: 'Fired after the user activates the clear button.',
    },
    onFocus: {
      type: 'React.FocusEventHandler<HTMLInputElement>',
      default: 'undefined',
      description: 'Fired when the field gains focus.',
    },
    onBlur: {
      type: 'React.FocusEventHandler<HTMLInputElement>',
      default: 'undefined',
      description: 'Fired when the field loses focus.',
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
      appliedWhen: '`label` prop is provided',
      purpose: 'Stable label slot selector with ARIA wiring to the field.',
    },
    {
      attribute: 'data-slot="container"',
      appliedWhen: 'Always',
      purpose: 'Stable container selector for the field + adornment row.',
    },
    {
      attribute: 'data-slot="field"',
      appliedWhen: 'Always',
      purpose: 'Stable selector for the native input element.',
    },
    {
      attribute: 'data-slot="leading-icon" / "trailing-icon"',
      appliedWhen: 'Corresponding icon slot is populated',
      purpose: 'Stable selectors for inline icon adornments.',
    },
    {
      attribute: 'data-slot="prefix" / "suffix"',
      appliedWhen: '`prefix` or `suffix` is provided',
      purpose: 'Stable selectors for inline text adornments.',
    },
    {
      attribute: 'data-slot="clear-button" / "clear-icon"',
      appliedWhen: '`clearable` is enabled and the field is non-empty',
      purpose: 'Stable selectors for the clear-button structural owner and its icon.',
    },
    {
      attribute: 'data-slot="spinner" / "spinner-indicator"',
      appliedWhen: '`loading` is `true` and the clear button is not rendered',
      purpose: 'Stable selectors for the trailing-side loading indicator.',
    },
    {
      attribute: 'data-slot="description" / "error-message"',
      appliedWhen: '`description` or (`invalid` + `error`) is provided',
      purpose: 'Stable selectors for helper text and validation feedback.',
    },
    {
      attribute: 'data-size',
      appliedWhen: 'Always',
      purpose: 'Styling hook for `size` on root and container.',
    },
    {
      attribute: 'data-disabled / data-readonly / data-invalid / data-loading / data-clearable',
      appliedWhen: 'Corresponding product prop is enabled',
      purpose: 'Anatomy and state hooks for Input recipes.',
    },
  ],
};
