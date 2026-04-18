export default {
  sourceFile: 'packages/react-spar/src/components/checkbox/types.ts',
  typeName: 'CheckboxProps',
  headingBase: 'checkbox',
  appendPropNames: ['className'],
  eventPropNames: ['onChange', 'onFocus', 'onBlur', 'onClick', 'onKeyDown'],
  propOverrides: {
    className: {
      type: 'string',
      default: 'undefined',
      description: 'Appends custom classes to the wrapper root slot.',
    },
    onChange: {
      type: '(value: boolean | null) => void',
      default: 'undefined',
      description: 'Fired when the tri-state value changes. `null` represents indeterminate, mirroring the `tk-checkbox` `tk-change` payload.',
    },
    onFocus: {
      type: 'React.FocusEventHandler<HTMLElement>',
      default: 'undefined',
      description: 'Fired when focus enters the root.',
    },
    onBlur: {
      type: 'React.FocusEventHandler<HTMLElement>',
      default: 'undefined',
      description: 'Fired when focus leaves the root.',
    },
    onClick: {
      type: 'React.MouseEventHandler<HTMLElement>',
      default: 'undefined',
      description: 'Fired when the root is clicked, in addition to the primitive toggle.',
    },
    onKeyDown: {
      type: 'React.KeyboardEventHandler<HTMLElement>',
      default: 'undefined',
      description: 'Fired on every keydown on the root. Space still toggles inside the primitive.',
    },
  },
  dataAttributes: [
    {
      attribute: 'data-slot="root"',
      appliedWhen: 'Always (on `Checkbox`)',
      purpose: 'Stable root slot selector for wrapper styling. Carries role="checkbox" and the full state data-* set. Class: `tk-checkbox`.',
    },
    {
      attribute: 'data-slot="indicator"',
      appliedWhen: 'Always (on `Checkbox.Indicator`)',
      purpose: 'Stable selector for the visible box (border + fill). Class: `tk-checkbox-indicator`.',
    },
    {
      attribute: 'data-slot="icon"',
      appliedWhen: 'Always (on `Checkbox.Icon`)',
      purpose: 'Stable selector for the check / indeterminate glyph holder. Visibility is driven by data-checked / data-indeterminate on the root. Class: `tk-checkbox-icon`.',
    },
    {
      attribute: 'data-slot="content"',
      appliedWhen: 'Always (on `Checkbox.Content`)',
      purpose: 'Stable wrapper around the label + description stack. Class: `tk-checkbox-content`.',
    },
    {
      attribute: 'data-slot="label"',
      appliedWhen: 'Always (on `Checkbox.Label`)',
      purpose: 'Stable selector for the visible label text. Class: `tk-checkbox-label`.',
    },
    {
      attribute: 'data-slot="description"',
      appliedWhen: 'Always (on `Checkbox.Description`)',
      purpose: 'Stable selector for the helper text. Class: `tk-checkbox-description`.',
    },
    {
      attribute: 'data-size',
      appliedWhen: 'Always',
      purpose: 'Styling hook for `size` (`base` / `small`) on the root.',
    },
    {
      attribute: 'data-type',
      appliedWhen: 'Always',
      purpose: 'Styling hook for `type` (`default` / `card`) on the root.',
    },
    {
      attribute: 'data-checked / data-indeterminate',
      appliedWhen: 'Resolved state is `true` / `null`',
      purpose: 'State hooks emitted by the spar primitive. The recipe reveals the icon fill through these attributes.',
    },
    {
      attribute: 'data-disabled / data-readonly / data-invalid / data-required',
      appliedWhen: 'Corresponding product prop is enabled',
      purpose: 'Anatomy and state hooks for Checkbox recipes.',
    },
    {
      attribute: 'data-focus / data-hover / data-active',
      appliedWhen: 'Root is focused / hovered / pressed',
      purpose: 'Interaction-state hooks owned by the spar primitive.',
    },
  ],
};
