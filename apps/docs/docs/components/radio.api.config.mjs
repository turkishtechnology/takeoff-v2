/**
 * API table source-of-truth for the Radio docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `radio.mdx` whenever this file or
 * `packages/react-spar/src/components/radio/types.ts` changes.
 */

const radioTypesFile = 'packages/react-spar/src/components/radio/types.ts';
const sparRadioDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Radio';

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

const dataType = {
  attribute: 'data-type',
  appliedWhen: 'Always',
  purpose: 'Reflects the resolved `type` prop. Theme recipes target the card variant per item.',
};

const dataPosition = {
  attribute: 'data-position',
  appliedWhen: 'Always',
  purpose: 'Reflects the resolved indicator `position` (`left` / `right`).',
};

const dataInvalidWhenTrue = {
  attribute: 'data-invalid',
  appliedWhen: 'When `invalid` is true, or inherited from a parent `<Field invalid>`.',
  purpose:
    'Theme hook for the invalid state. Emitted by Spar on the radiogroup root only; items style themselves through the ancestor selector `.tk-radio[data-invalid] .tk-radio-item`.',
};

export default {
  components: [
    {
      sourceFile: radioTypesFile,
      typeName: 'RadioProps',
      displayName: 'Radio',
      headingBase: 'radio',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparBehaviorProps: ['id', 'value', 'defaultValue', 'onChange', 'name', 'disabled', 'readOnly', 'required', 'orientation', 'selectOnFocus', 'autoFocus'],
      sparDocsUrl: sparRadioDocsUrl,
      sparDocsLabel: 'Spar Radio docs',
      propOverrides: {
        children: childrenOverride('`Radio.Item` elements rendered inside the radiogroup container.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        dataSize,
        dataType,
        dataPosition,
        dataInvalidWhenTrue,
        {
          attribute: 'data-spread',
          appliedWhen: 'When `spread` is true.',
          purpose: 'Layout hook used by recipes to stretch each item along the group axis.',
        },
        {
          attribute: 'data-orientation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `orientation` (`vertical` / `horizontal`). Emitted by Spar.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When `disabled` is true.',
          purpose: 'Theme hook for the disabled group. Emitted by Spar.',
        },
        {
          attribute: 'data-required',
          appliedWhen: 'When `required` is true.',
          purpose: 'Theme hook surfacing the required state. Emitted by Spar.',
        },
      ],
    },
    {
      sourceFile: radioTypesFile,
      typeName: 'RadioItemProps',
      displayName: 'Radio.Item',
      headingBase: 'radio-item',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparBehaviorProps: ['value', 'disabled'],
      sparDocsUrl: sparRadioDocsUrl,
      sparDocsLabel: 'Spar Radio docs',
      propOverrides: {
        children: childrenOverride(
          '`Radio.Indicator` and `Radio.Label` (compose helper text or richer markup inside the label), or a render function exposing per-item Spar state.',
        ),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        dataSize,
        dataType,
        dataPosition,
        {
          attribute: 'data-state="checked"',
          appliedWhen: 'When the item matches the group value.',
          purpose: 'Spar checked-state hook. Drives the indicator fill.',
        },
        {
          attribute: 'data-state="unchecked"',
          appliedWhen: 'When the item does not match the group value.',
          purpose: 'Spar unchecked-state hook.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When the item `disabled` is true, or the group is disabled.',
          purpose: 'Theme hook for the disabled item state. Emitted by Spar.',
        },
      ],
    },
    {
      sourceFile: radioTypesFile,
      typeName: 'RadioIndicatorProps',
      displayName: 'Radio.Indicator',
      headingBase: 'radio-indicator',
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-slot="icon"',
          appliedWhen: 'Always',
          purpose: 'Internal decorative fill element. Customize via `slotProps.icon` / `classNames.icon`.',
        },
      ],
    },
    {
      sourceFile: radioTypesFile,
      typeName: 'RadioLabelProps',
      displayName: 'Radio.Label',
      headingBase: 'radio-label',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride(
          'Label content for the item. Compose any markup inside — the wrapper styles the container as a column so helper text can live next to the primary label.',
        ),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
