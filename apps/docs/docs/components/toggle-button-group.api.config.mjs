/**
 * API table source-of-truth for the ToggleButtonGroup docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `toggle-button-group.mdx` whenever this file or
 * `packages/react-spar/src/components/toggle-button-group/types.ts` changes.
 */

const typesFile = 'packages/react-spar/src/components/toggle-button-group/types.ts';
const sparDocsUrl = 'https://v2.takeoffui.com/headless/docs/Components/ToggleGroup';

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
  purpose: 'Reflects the resolved `size` so theme recipes can scope size variants.',
};

export default {
  components: [
    {
      sourceFile: typesFile,
      typeName: 'ToggleButtonGroupProps',
      displayName: 'ToggleButtonGroup',
      headingBase: 'toggle-button-group',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparBehaviorProps: ['multiple', 'value', 'defaultValue', 'onValueChange', 'deselectable', 'disabled', 'orientation'],
      sparDocsUrl,
      sparDocsLabel: 'Spar ToggleGroup docs',
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: '`ToggleButtonGroup.Item` elements.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved group `type` (`basic` / `divided` / `light`).',
        },
        dataSize,
        {
          attribute: 'data-rounded',
          appliedWhen: 'When `rounded` is true.',
          purpose: 'Pill-shaped group and items.',
        },
        {
          attribute: 'data-orientation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `orientation` (`horizontal` / `vertical`). Emitted by Spar.',
        },
        {
          attribute: 'data-multiple',
          appliedWhen: 'When `multiple` is true.',
          purpose: 'Marks a multiple-selection group. Emitted by Spar.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When `disabled` is true.',
          purpose: 'Theme hook for the disabled group. Emitted by Spar.',
        },
      ],
    },
    {
      sourceFile: typesFile,
      typeName: 'ToggleButtonGroupItemProps',
      displayName: 'ToggleButtonGroup.Item',
      headingBase: 'toggle-button-group-item',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparBehaviorProps: ['value', 'disabled'],
      sparDocsUrl,
      sparDocsLabel: 'Spar ToggleGroup docs',
      propOverrides: {
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-slot="content"',
          appliedWhen: 'When `startContent` / `endContent` is renderable.',
          purpose: 'Internal wrapper around the start / end content. Customize via `classNames.content` / `slotProps.content`.',
        },
        {
          attribute: 'data-slot="label"',
          appliedWhen: 'When children are renderable.',
          purpose: 'Internal wrapper around the label. Customize via `classNames.label` / `slotProps.label`.',
        },
        dataSize,
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved pressed colour (`neutral` / `primary`).',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `appearance` of the pressed item.',
        },
        {
          attribute: 'data-icon-only',
          appliedWhen: 'When the item has start / end content and no children.',
          purpose: 'Square padding for icon-only items.',
        },
        {
          attribute: 'aria-pressed',
          appliedWhen: 'Always',
          purpose: 'Pressed state (`true` / `false`); the recipe keys the pressed appearance on it. Emitted by Spar Button.',
        },
        {
          attribute: 'data-pressed',
          appliedWhen: 'When the item is pressed.',
          purpose: 'Presence hook for the pressed state. Emitted by Spar Button.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When the item or the group is disabled.',
          purpose: 'Theme hook for the disabled item. Emitted by Spar Button.',
        },
      ],
    },
  ],
};
