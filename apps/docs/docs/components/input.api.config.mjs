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
    purpose: 'Theme hook used by the parent `Field` to auto-render its required asterisk.',
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
        children: childrenOverride(
          'Compound parts (`Input.Container`, plus optional `Input.Prefix` / `Input.Field` / `Input.Suffix`). Wrap in a `Field` to attach labels and helper text.',
        ),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot, dataSize, ...formStateAttrs],
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
        children: childrenOverride('`Input.Prefix`, `Input.Field`, `Input.Suffix`. Leading / trailing icons go through the `startContent` / `endContent` props.'),
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
  ],
};
