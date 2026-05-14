/**
 * API table source-of-truth for the Input docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `input.mdx` whenever this file or
 * `packages/react-spar/src/components/input/types.ts` changes.
 */

const inputTypesFile = 'packages/react-spar/src/components/input/types.ts';
const sparInputDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Input';

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

const dataSize = {
  attribute: 'data-size',
  appliedWhen: 'Always',
  purpose: 'Reflects the resolved `size` prop so theme recipes can scope size variants.',
};

const formStateAttrs = [
  {
    attribute: 'data-invalid',
    appliedWhen: 'When `isInvalid` is true.',
    purpose: 'Theme hook for the invalid state. Emitted by Spar Input on the root.',
  },
  {
    attribute: 'data-disabled',
    appliedWhen: 'When `disabled` is true.',
    purpose: 'Theme hook for the disabled state. Emitted by Spar Input.',
  },
  {
    attribute: 'data-required',
    appliedWhen: 'When `required` is true.',
    purpose: 'Theme hook used to auto-render the asterisk inside `Input.Label`.',
  },
  {
    attribute: 'data-readonly',
    appliedWhen: 'When `readOnly` is true.',
    purpose: 'Theme hook for the read-only state. Emitted by Spar Input.',
  },
];

export default {
  components: [
    {
      sourceFile: inputTypesFile,
      typeName: 'InputProps',
      displayName: 'Input',
      headingBase: 'input',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparInputDocsUrl,
      sparDocsLabel: 'Spar Input docs',
      propOverrides: {
        children: childrenOverride('Compound parts (`Input.Label`, `Input.Container`, `Input.Description`, `Input.ErrorMessage`).'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot, dataSize, ...formStateAttrs],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputLabelProps',
      displayName: 'Input.Label',
      headingBase: 'input-label',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparInputDocsUrl,
      sparDocsLabel: 'Spar Input docs',
      propOverrides: {
        children: childrenOverride('Label text. An asterisk is auto-appended when the root `required` is true.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputContainerProps',
      displayName: 'Input.Container',
      headingBase: 'input-container',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('`Input.Prefix`, `Input.LeadingIcon`, `Input.Field`, `Input.TrailingIcon`, `Input.Suffix`.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-invalid',
          appliedWhen: 'When the root `isInvalid` is true.',
          purpose: 'Borders/background switch to the danger state on the visual row.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When the root `disabled` is true.',
          purpose: 'Theme hook for the disabled visual row.',
        },
        {
          attribute: 'data-readonly',
          appliedWhen: 'When the root `readOnly` is true.',
          purpose: 'Theme hook for the read-only visual row.',
        },
      ],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputFieldProps',
      displayName: 'Input.Field',
      headingBase: 'input-field',
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparInputDocsUrl,
      sparDocsLabel: 'Spar Input docs',
      propOverrides: {
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot, dataSize],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputPrefixProps',
      displayName: 'Input.Prefix',
      headingBase: 'input-prefix',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Plain text prefix (e.g. currency code).'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputSuffixProps',
      displayName: 'Input.Suffix',
      headingBase: 'input-suffix',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Plain text suffix (e.g. unit label).'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputLeadingIconProps',
      displayName: 'Input.LeadingIcon',
      headingBase: 'input-leading-icon',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Icon rendered before the field. Pure visual — `aria-hidden` is set automatically.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputTrailingIconProps',
      displayName: 'Input.TrailingIcon',
      headingBase: 'input-trailing-icon',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Icon rendered after the field. Pure visual — `aria-hidden` is set automatically.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputDescriptionProps',
      displayName: 'Input.Description',
      headingBase: 'input-description',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparInputDocsUrl,
      sparDocsLabel: 'Spar Input docs',
      propOverrides: {
        children: childrenOverride('Helper text. Wired to the field via `aria-describedby` by Spar.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputErrorMessageProps',
      displayName: 'Input.ErrorMessage',
      headingBase: 'input-error-message',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparInputDocsUrl,
      sparDocsLabel: 'Spar Input docs',
      propOverrides: {
        children: childrenOverride('Error message. Surfaced via `aria-describedby` when the root `isInvalid` is true.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
