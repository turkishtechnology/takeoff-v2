/**
 * API table source-of-truth for the Switch docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `switch.mdx` page whenever this file or
 * `packages/react-spar/src/components/switch/types.ts` changes.
 */

const switchTypesFile = 'packages/react-spar/src/components/switch/types.ts';
const sparSwitchDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Switch';

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

const dataSwitchState = [
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
    purpose: 'Marks disabled visual state for theme recipes.',
  },
  {
    attribute: 'data-readonly',
    appliedWhen: '`readOnly` is true.',
    purpose: 'Marks read-only visual state for theme recipes.',
  },
];

const _dataPassiveState = [
  {
    attribute: 'data-disabled',
    appliedWhen: '`disabled` is true.',
    purpose: 'Marks disabled visual state for theme recipes.',
  },
  {
    attribute: 'data-readonly',
    appliedWhen: '`readOnly` is true.',
    purpose: 'Marks read-only visual state for theme recipes.',
  },
];

const compoundPartConfig = (typeName, displayName, headingBase, slot, stateAttrs) => ({
  sourceFile: switchTypesFile,
  typeName,
  displayName,
  headingBase,
  prependPropNames: ['children'],
  appendPropNames: ['className'],
  skipPropNames: ['ref'],
  sparDocsUrl: sparSwitchDocsUrl,
  sparDocsLabel: 'Spar Switch docs',
  propOverrides: {
    children: childrenOverride(`${displayName} children.`),
    className: classNameOverride,
  },
  dataAttributes: [dataSlot(slot), ...stateAttrs],
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
      sparBehaviorProps: ['checked', 'defaultChecked', 'onChange', 'disabled', 'readOnly', 'required', 'name', 'value', 'form'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: 'Compound children for switch anatomy.',
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
          description: 'Marks the switch as visually invalid.',
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
          attribute: 'data-invalid',
          appliedWhen: '`invalid` is true.',
          purpose: 'Marks invalid visual state for theme recipes.',
        },
        ...dataSwitchState,
      ],
    },
    compoundPartConfig('SwitchControlProps', 'Switch.Control', 'switch-control', 'control', dataSwitchState),
    compoundPartConfig('SwitchTrackProps', 'Switch.Track', 'switch-track', 'track', dataSwitchState),
    compoundPartConfig('SwitchThumbProps', 'Switch.Thumb', 'switch-thumb', 'thumb', dataSwitchState),
  ],
};
