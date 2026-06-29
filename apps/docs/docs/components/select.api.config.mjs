/**
 * API table source-of-truth for the Select docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `select.mdx` whenever this file or
 * `packages/react-spar/src/components/select/types.ts` changes.
 */

const selectTypesFile = 'packages/react-spar/src/components/select/types.ts';
const sparSelectDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Select';

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

const dataInvalid = {
  attribute: 'data-invalid',
  appliedWhen: 'When `invalid` is true.',
  purpose: 'Borders/background switch to the danger state. Mirrored from the root.',
};

const dataOpenClosed = [
  {
    attribute: 'data-state="open"',
    appliedWhen: 'While the dropdown is open.',
    purpose: 'Spar open-state hook on the trigger and content.',
  },
  {
    attribute: 'data-state="closed"',
    appliedWhen: 'While the dropdown is closed.',
    purpose: 'Spar closed-state hook on the trigger.',
  },
];

export default {
  components: [
    {
      sourceFile: selectTypesFile,
      typeName: 'SelectProps',
      displayName: 'Select',
      headingBase: 'select',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparSelectDocsUrl,
      sparDocsLabel: 'Spar Select docs',
      propOverrides: {
        children: childrenOverride('Compound parts (`Select.Trigger`, `Select.Content`).'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        dataSize,
        dataInvalid,
        {
          attribute: 'data-disabled',
          appliedWhen: 'When `disabled` is true.',
          purpose: 'Theme hook for the disabled state. Emitted by Spar Select.',
        },
      ],
    },
    {
      sourceFile: selectTypesFile,
      typeName: 'SelectTriggerProps',
      displayName: 'Select.Trigger',
      headingBase: 'select-trigger',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparSelectDocsUrl,
      sparDocsLabel: 'Spar Select docs',
      propOverrides: {
        children: childrenOverride(
          'Trigger content. Defaults to the selected item label or `placeholder`; supply children to override the rendering, or pass a render function for full layout control.',
        ),
        indicator: {
          type: 'boolean | React.ReactNode | ((state: SelectIndicatorRenderState) => React.ReactNode)',
          description:
            'Disclosure indicator after the value. Defaults to a chevron that flips with the open state. Pass `false` to hide it, a node for a custom static icon, or a render function `({ isOpen }) => …` to swap icons by open state.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        dataSize,
        dataInvalid,
        ...dataOpenClosed,
        {
          attribute: 'data-placeholder',
          appliedWhen: 'When no value is selected.',
          purpose: 'Theme hook to style the placeholder color.',
        },
      ],
    },
    {
      sourceFile: selectTypesFile,
      typeName: 'SelectIndicatorProps',
      displayName: 'Select.Indicator',
      headingBase: 'select-indicator',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparSelectDocsUrl,
      sparDocsLabel: 'Spar Select docs',
      propOverrides: {
        children: childrenOverride(
          'Override the default chevron. A node renders in every state; a render function `({ isOpen }) => …` swaps icons by open state. Standalone part — drop it into the trigger’s render-prop `children` for full layout control.',
        ),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: selectTypesFile,
      typeName: 'SelectContentProps',
      displayName: 'Select.Content',
      headingBase: 'select-content',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparSelectDocsUrl,
      sparDocsLabel: 'Spar Select docs',
      propOverrides: {
        children: childrenOverride('`Select.Item`, `Select.Group`, `Select.Separator`.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot, dataSize],
    },
    {
      sourceFile: selectTypesFile,
      typeName: 'SelectItemProps',
      displayName: 'Select.Item',
      headingBase: 'select-item',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparSelectDocsUrl,
      sparDocsLabel: 'Spar Select docs',
      propOverrides: {
        children: childrenOverride('Visible item content. Set `label` alongside it to register the text used for typeahead and trigger display.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-highlighted',
          appliedWhen: 'When the item is focused via keyboard or pointer.',
          purpose: 'Theme hook for the highlighted state.',
        },
        {
          attribute: 'data-state="checked"',
          appliedWhen: 'When the item matches the current value.',
          purpose: 'Theme hook for the checked state.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When the item `disabled` is true.',
          purpose: 'Theme hook for the disabled item state.',
        },
      ],
    },
    {
      sourceFile: selectTypesFile,
      typeName: 'SelectGroupProps',
      displayName: 'Select.Group',
      headingBase: 'select-group',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparSelectDocsUrl,
      sparDocsLabel: 'Spar Select docs',
      propOverrides: {
        children: childrenOverride('`Select.Label` and `Select.Item` siblings.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: selectTypesFile,
      typeName: 'SelectLabelProps',
      displayName: 'Select.Label',
      headingBase: 'select-label',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparSelectDocsUrl,
      sparDocsLabel: 'Spar Select docs',
      propOverrides: {
        children: childrenOverride('Heading text for a `Select.Group`.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: selectTypesFile,
      typeName: 'SelectSeparatorProps',
      displayName: 'Select.Separator',
      headingBase: 'select-separator',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparSelectDocsUrl,
      sparDocsLabel: 'Spar Select docs',
      propOverrides: {
        children: childrenOverride('Optional separator content — typically empty.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
