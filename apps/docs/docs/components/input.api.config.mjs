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
    appliedWhen: 'When `invalid` is true.',
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
          'Compound parts (`Input.Field`, optional affixes, icons, clear/spinner/reveal/stepper actions). Wrap in a `Field` to attach labels and helper text.',
        ),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        dataSize,
        {
          attribute: 'data-layout="counter"',
          appliedWhen: 'When set by the consumer.',
          purpose:
            'Opts into the counter look (centered value, brand-coloured flanking `Input.Decrement` / `Input.Increment`). Replaces the former DOM-placement detection.',
        },
        ...formStateAttrs,
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
      dataAttributes: [dataSlotRoot],
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
        children: childrenOverride('Decorative icon or visual node rendered before the field.'),
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
        children: childrenOverride('Decorative icon or visual node rendered after the field.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputClearButtonProps',
      displayName: 'Input.ClearButton',
      headingBase: 'input-clear-button',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Optional custom icon. The default icon is decorative.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputSpinnerProps',
      displayName: 'Input.Spinner',
      headingBase: 'input-spinner',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Optional custom spinner. A default spinner is rendered when omitted.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputRevealButtonProps',
      displayName: 'Input.RevealButton',
      headingBase: 'input-reveal-button',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Optional custom icon. The default icon changes with reveal state.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputStrengthProps',
      displayName: 'Input.Strength',
      headingBase: 'input-strength',
      appendPropNames: ['className'],
      skipPropNames: ['ref', 'children'],
      propOverrides: {
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-level',
          appliedWhen: 'On each filled segment.',
          purpose: 'Strength tier of the current field value: `weak`, `medium`, or `strong`.',
        },
      ],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputStepperProps',
      displayName: 'Input.Stepper',
      headingBase: 'input-stepper',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Structural wrapper for `Input.Decrement` and `Input.Increment`.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputDecrementProps',
      displayName: 'Input.Decrement',
      headingBase: 'input-decrement',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Optional custom icon. The default icon is decorative.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputIncrementProps',
      displayName: 'Input.Increment',
      headingBase: 'input-increment',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Optional custom icon. The default icon is decorative.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: inputTypesFile,
      typeName: 'InputChipsProps',
      displayName: 'Input.Chips',
      headingBase: 'input-chips',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Optional extra content rendered after the auto-generated chip tokens.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
