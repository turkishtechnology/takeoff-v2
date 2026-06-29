/**
 * API table source-of-truth for the Switch docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `switch.mdx` page whenever this file or
 * `packages/react-spar/src/components/switch/types.ts` changes.
 */

const switchTypesFile = 'packages/react-spar/src/components/switch/types.ts';
const sparSwitchDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Switch';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const dataSlot = slot => ({
  attribute: `data-slot="${slot}"`,
  appliedWhen: 'Always',
  purpose: `Stable selector for the ${slot} slot.`,
});

export default {
  components: [
    {
      sourceFile: switchTypesFile,
      typeName: 'SwitchProps',
      displayName: 'Switch',
      headingBase: 'switch',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparSwitchDocsUrl,
      sparDocsLabel: 'Spar Switch docs',
      sparBehaviorProps: ['checked', 'defaultChecked', 'onChange', 'disabled', 'readOnly', 'required', 'name', 'value', 'form', 'autoFocus'],
      propOverrides: {
        children: {
          type: 'React.ReactNode | ((state: SwitchRenderProps) => React.ReactNode)',
          description: 'Compound children for switch anatomy, or a render function exposing Spar state.',
        },
        size: {
          default: "'base'",
          description: 'Size scale.',
        },
        variant: {
          default: "'info'",
          description: 'Color variant used while checked.',
        },
        invalid: {
          default: 'false',
          description: 'Marks the switch as visually invalid. Inherited from `<Field>` automatically; pass this prop only to override.',
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
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` prop so theme recipes can scope color variants.',
        },
        {
          attribute: 'data-state="checked"',
          appliedWhen: 'When checked.',
          purpose: 'Spar checked-state hook.',
        },
        {
          attribute: 'data-state="unchecked"',
          appliedWhen: 'When unchecked.',
          purpose: 'Spar unchecked-state hook.',
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
        {
          attribute: 'data-invalid',
          appliedWhen: '`invalid` is true.',
          purpose: 'Marks invalid visual state for theme recipes.',
        },
      ],
    },
    {
      sourceFile: switchTypesFile,
      typeName: 'SwitchIndicatorProps',
      displayName: 'Switch.Indicator',
      headingBase: 'switch-indicator',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparSwitchDocsUrl,
      sparDocsLabel: 'Spar Switch docs',
      propOverrides: {
        children: {
          type: 'React.ReactNode | ((state: SwitchIndicatorRenderProps) => React.ReactNode)',
          description:
            'Indicator content. When omitted, the built-in track + thumb anatomy is rendered. When a function, receives the current `checked` / `disabled` / `readOnly` state. A `ReactNode` replaces the default `thumb` slot entirely.',
          default: 'a built-in `thumb` slot inside the indicator track',
        },
        className: classNameOverride,
      },
      dataAttributes: [dataSlot('indicator'), dataSlot('thumb')],
    },
  ],
};
