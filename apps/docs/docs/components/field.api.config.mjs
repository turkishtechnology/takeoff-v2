/**
 * API table source-of-truth for the Field docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `field.mdx` page whenever this file or
 * `packages/react-spar/src/components/field/types.ts` changes.
 */

const fieldTypesFile = 'packages/react-spar/src/components/field/types.ts';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

/** Field's slot maps carry no JSDoc upstream, so describe them here. */
const slotOverrides = {
  classNames: { description: 'Per-slot extra classes.' },
  slotProps: { description: 'Per-slot HTML-attribute overrides.' },
};

/** The state props Field owns and cascades to every nested control. */
const stateProps = {
  invalid: {
    type: 'boolean',
    description: 'Marks the field invalid. Reveals `Field.ErrorMessage` and cascades to the nested control.',
  },
  disabled: {
    type: 'boolean',
    description: 'Disables the field and every control inside it.',
  },
  required: {
    type: 'boolean',
    description: 'Marks the field required. Renders the asterisk slot on `Field.Label`.',
  },
  optional: {
    type: 'boolean',
    description: 'Marks the field optional. Mutually exclusive with `required` in practice.',
  },
  readOnly: {
    type: 'boolean',
    description: 'Marks the field read-only and cascades to the nested control.',
  },
};

const rootDataAttributes = [
  {
    attribute: 'data-slot="root"',
    appliedWhen: 'Always',
    purpose: 'Stable selector for wrapper styling on the root slot.',
  },
  {
    attribute: 'data-invalid',
    appliedWhen: '`invalid` is true.',
    purpose: 'Styling hook for the invalid state.',
  },
  {
    attribute: 'data-disabled',
    appliedWhen: '`disabled` is true.',
    purpose: 'Styling hook for the disabled state.',
  },
  {
    attribute: 'data-required',
    appliedWhen: '`required` is true.',
    purpose: 'Styling hook for required fields.',
  },
  {
    attribute: 'data-optional',
    appliedWhen: '`optional` is true.',
    purpose: 'Styling hook for optional fields.',
  },
  {
    attribute: 'data-readonly',
    appliedWhen: '`readOnly` is true.',
    purpose: 'Styling hook for read-only fields.',
  },
];

export default {
  components: [
    {
      sourceFile: fieldTypesFile,
      typeName: 'FieldProps',
      displayName: 'Field',
      headingBase: 'field',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        ...slotOverrides,
        children: {
          type: 'React.ReactNode',
          description: 'Field parts and the control they describe.',
        },
        id: {
          type: 'string',
          description: 'Base id for the generated label / description / error associations. Generated when omitted.',
        },
        ...stateProps,
        className: classNameOverride,
      },
      dataAttributes: rootDataAttributes,
    },
    {
      sourceFile: fieldTypesFile,
      typeName: 'FieldLabelProps',
      displayName: 'Field.Label',
      headingBase: 'field-label',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        ...slotOverrides,
        children: {
          type: 'React.ReactNode',
          description: 'Label text. `htmlFor` is wired automatically from Field context.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for the label element.',
        },
        {
          attribute: 'data-slot="asterisk"',
          appliedWhen: 'The field is `required`.',
          purpose: 'Stable selector for the required marker.',
        },
      ],
    },
    {
      sourceFile: fieldTypesFile,
      typeName: 'FieldDescriptionProps',
      displayName: 'Field.Description',
      headingBase: 'field-description',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        ...slotOverrides,
        children: {
          type: 'React.ReactNode',
          description: 'Helper text. Linked to the control via `aria-describedby`.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for the description element.',
        },
        {
          attribute: 'data-slot="icon"',
          appliedWhen: 'An icon is rendered inside the description.',
          purpose: 'Stable selector for the description icon.',
        },
      ],
    },
    {
      sourceFile: fieldTypesFile,
      typeName: 'FieldErrorMessageProps',
      displayName: 'Field.ErrorMessage',
      headingBase: 'field-error-message',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        ...slotOverrides,
        children: {
          type: 'React.ReactNode',
          description: 'Validation message. Rendered only while the field is `invalid`.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for the error message element.',
        },
        {
          attribute: 'data-slot="icon"',
          appliedWhen: 'An icon is rendered inside the error message.',
          purpose: 'Stable selector for the error icon.',
        },
      ],
    },
  ],
};
