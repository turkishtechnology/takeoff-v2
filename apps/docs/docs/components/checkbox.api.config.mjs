/**
 * API table source-of-truth for the Checkbox docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `checkbox.mdx` page whenever this file or
 * `packages/react-spar/src/components/checkbox/types.ts` changes.
 */

const checkboxTypesFile = 'packages/react-spar/src/components/checkbox/types.ts';
const sparCheckboxDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Checkbox';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const dataSlot = slot => ({
  attribute: `data-slot="${slot}"`,
  appliedWhen: 'Always',
  purpose: `Stable selector for the ${slot} slot.`,
});

const compoundPartConfig = (typeName, displayName, headingBase, slot) => ({
  sourceFile: checkboxTypesFile,
  typeName,
  displayName,
  headingBase,
  prependPropNames: ['children'],
  appendPropNames: ['className'],
  skipPropNames: ['ref'],
  propOverrides: {
    children: childrenOverride(`${displayName} children.`),
    className: classNameOverride,
  },
  dataAttributes: [dataSlot(slot)],
});

export default {
  components: [
    {
      sourceFile: checkboxTypesFile,
      typeName: 'CheckboxProps',
      displayName: 'Checkbox',
      headingBase: 'checkbox',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparCheckboxDocsUrl,
      sparDocsLabel: 'Spar Checkbox docs',
      sparBehaviorProps: ['checked', 'defaultChecked', 'onChange', 'disabled', 'readOnly', 'required', 'name', 'value', 'form', 'autoFocus'],
      propOverrides: {
        children: {
          type: 'React.ReactNode | ((state: CheckboxRenderProps) => React.ReactNode)',
          description: 'Compound children for checkbox anatomy, or a render function exposing Spar tri-state.',
        },
        indeterminate: {
          default: 'false',
          description: 'Indeterminate (mixed) visual + ARIA state. Overrides `checked` / `defaultChecked` and emits `aria-checked="mixed"`.',
        },
        size: {
          default: "'base'",
          description: 'Size scale.',
        },
        invalid: {
          default: 'false',
          description: 'Marks the checkbox as visually invalid.',
        },
        classNames: {
          description: 'Per-slot class name overrides.',
        },
        slotProps: {
          description: 'Per-slot HTML attribute overrides.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlot('root'),
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` prop so theme recipes can scope size variants.',
        },
        {
          attribute: 'data-invalid',
          appliedWhen: '`invalid` is true.',
          purpose: 'Marks invalid visual state for theme recipes.',
        },
        {
          attribute: 'data-checked',
          appliedWhen: 'When checked.',
          purpose: 'Spar checked-state hook.',
        },
        {
          attribute: 'data-indeterminate',
          appliedWhen: 'When indeterminate.',
          purpose: 'Spar indeterminate-state hook.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: '`disabled` is true.',
          purpose: 'Spar disabled-state hook.',
        },
        {
          attribute: 'data-readonly',
          appliedWhen: '`readOnly` is true.',
          purpose: 'Spar read-only-state hook.',
        },
        {
          attribute: 'data-required',
          appliedWhen: '`required` is true.',
          purpose: 'Spar required-state hook.',
        },
      ],
    },
    {
      ...compoundPartConfig('CheckboxIndicatorProps', 'Checkbox.Indicator', 'checkbox-indicator', 'indicator'),
      propOverrides: {
        children: {
          type: 'React.ReactNode | ((state: CheckboxIndicatorRenderProps) => React.ReactNode)',
          description:
            'Indicator content. When omitted, the built-in placeholder check / dash glyph is rendered. When a function, receives the current `checked` and `indeterminate` state. A `ReactNode` replaces the default `icon` slot entirely.',
          default: 'a built-in placeholder check / dash glyph driven by `indeterminate`',
        },
        className: classNameOverride,
      },
      dataAttributes: [dataSlot('indicator'), dataSlot('icon')],
    },
  ],
};
