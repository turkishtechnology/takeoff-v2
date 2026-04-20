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
      description: 'Fired after the user activates `<Input.ClearButton>`.',
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
      appliedWhen: 'Always (on `<Input>`)',
      purpose: 'Stable root slot selector for wrapper styling.',
    },
    {
      attribute: 'data-slot="label"',
      appliedWhen: '`<Input.Label>` is rendered',
      purpose: 'Stable label slot selector with ARIA wiring to the field.',
    },
    {
      attribute: 'data-slot="asterisk"',
      appliedWhen: '`required` is `true` and `<Input.Asterisk>` is rendered',
      purpose: 'Stable selector for the required-field marker.',
    },
    {
      attribute: 'data-slot="container"',
      appliedWhen: '`<Input.Container>` is rendered',
      purpose: 'Stable container selector for the field + adornment row.',
    },
    {
      attribute: 'data-slot="field"',
      appliedWhen: '`<Input.Field>` is rendered',
      purpose: 'Stable selector for the native input element.',
    },
    {
      attribute: 'data-slot="leading-icon"',
      appliedWhen: '`<Input.LeadingIcon>` is rendered',
      purpose: 'Stable selector for the leading inline icon adornment.',
    },
    {
      attribute: 'data-slot="trailing-icon"',
      appliedWhen: '`<Input.TrailingIcon>` is rendered',
      purpose: 'Stable selector for the trailing inline icon adornment.',
    },
    {
      attribute: 'data-slot="prefix"',
      appliedWhen: '`<Input.Prefix>` is rendered',
      purpose: 'Stable selector for the inline prefix adornment.',
    },
    {
      attribute: 'data-slot="suffix"',
      appliedWhen: '`<Input.Suffix>` is rendered',
      purpose: 'Stable selector for the inline suffix adornment.',
    },
    {
      attribute: 'data-slot="clear-button"',
      appliedWhen: '`clearable` is `true`, the field is non-empty, and `<Input.ClearButton>` is rendered',
      purpose: 'Stable selector for the clear-button structural owner.',
    },
    {
      attribute: 'data-slot="spinner"',
      appliedWhen: '`loading` is `true`, the clear button is not active, and `<Input.Spinner>` is rendered',
      purpose: 'Stable selector for the trailing-side loading indicator.',
    },
    {
      attribute: 'data-slot="description"',
      appliedWhen: '`<Input.Description>` is rendered and `invalid` is `false`',
      purpose: 'Stable selector for helper text below the field.',
    },
    {
      attribute: 'data-slot="error-message"',
      appliedWhen: '`invalid` is `true` and `<Input.ErrorMessage>` is rendered',
      purpose: 'Stable selector for validation feedback announced via `role="alert"`.',
    },
    {
      attribute: 'data-size',
      appliedWhen: 'Always (on root and `<Input.Container>`)',
      purpose: 'Styling hook for `size`.',
    },
    {
      attribute: 'data-disabled / data-readonly / data-invalid / data-loading / data-clearable',
      appliedWhen: 'On `<Input.Container>` when the corresponding root prop is enabled',
      purpose: 'Anatomy and state hooks for Input recipes.',
    },
  ],
};
