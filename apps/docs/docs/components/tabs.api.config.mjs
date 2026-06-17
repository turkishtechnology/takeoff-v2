/**
 * API table source-of-truth for the Tabs docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `tabs.mdx` page whenever this file or
 * `packages/react-spar/src/components/tabs/types.ts` changes.
 */

const tabsTypesFile = 'packages/react-spar/src/components/tabs/types.ts';
const sparTabsDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Tabs';

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
      sourceFile: tabsTypesFile,
      typeName: 'TabsProps',
      displayName: 'Tabs',
      headingBase: 'tabs',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparTabsDocsUrl,
      sparDocsLabel: 'Spar Tabs docs',
      sparBehaviorProps: ['id', 'value', 'defaultValue', 'onValueChange', 'orientation', 'activationMode'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: '`Tabs.List`, `Tabs.Trigger`, and `Tabs.Content` elements rendered inside the tabs root.',
        },
        size: {
          default: "'base'",
          description: 'Size scale. Cascades to descendant `Tabs.Trigger`s via context.',
        },
        variant: {
          default: "'primary'",
          description: 'Color variant used by the active tab treatment.',
        },
        appearance: {
          default: "'basic'",
          description: 'Visual tab style.',
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
          purpose: 'Reflects the resolved `variant` prop for active-state coloring.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `appearance` prop for style variants.',
        },
        {
          attribute: 'data-orientation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `orientation` (`horizontal` / `vertical`). Emitted by Spar.',
        },
      ],
    },
    {
      sourceFile: tabsTypesFile,
      typeName: 'TabsListProps',
      displayName: 'Tabs.List',
      headingBase: 'tabs-list',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparTabsDocsUrl,
      sparDocsLabel: 'Spar Tabs docs',
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: '`Tabs.Trigger` elements rendered inside the tablist.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlot('root'),
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved root `size` prop.',
        },
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved root `variant` prop.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved root `appearance` prop.',
        },
        {
          attribute: 'data-orientation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `orientation`. Emitted by Spar.',
        },
      ],
    },
    {
      sourceFile: tabsTypesFile,
      typeName: 'TabsTriggerProps',
      displayName: 'Tabs.Trigger',
      headingBase: 'tabs-trigger',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparTabsDocsUrl,
      sparDocsLabel: 'Spar Tabs docs',
      sparBehaviorProps: ['value', 'disabled', 'autoFocus'],
      propOverrides: {
        children: {
          type: 'React.ReactNode | ((state: TabsTriggerRenderProps) => React.ReactNode)',
          description: 'Trigger label content, or a render function exposing the selected/focus/disabled state.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlot('root'),
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved root `size` prop.',
        },
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved root `variant` prop.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved root `appearance` prop.',
        },
        {
          attribute: 'data-state="active"',
          appliedWhen: 'When the trigger matches the selected value.',
          purpose: 'Spar selected-state hook.',
        },
        {
          attribute: 'data-state="inactive"',
          appliedWhen: 'When the trigger does not match the selected value.',
          purpose: 'Spar unselected-state hook.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: '`disabled` is true.',
          purpose: 'Theme hook for disabled triggers. Emitted by Spar.',
        },
        {
          attribute: 'data-orientation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `orientation`. Emitted by Spar.',
        },
      ],
    },
    {
      sourceFile: tabsTypesFile,
      typeName: 'TabsContentProps',
      displayName: 'Tabs.Content',
      headingBase: 'tabs-content',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparTabsDocsUrl,
      sparDocsLabel: 'Spar Tabs docs',
      sparBehaviorProps: ['value', 'forceMount'],
      propOverrides: {
        children: {
          type: 'React.ReactNode',
          description: 'Panel content displayed when the matching trigger is selected.',
        },
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlot('root'),
        {
          attribute: 'data-state="active"',
          appliedWhen: 'When the content matches the selected value.',
          purpose: 'Spar selected-state hook.',
        },
        {
          attribute: 'data-state="inactive"',
          appliedWhen: '`forceMount` is true and the content is not selected.',
          purpose: 'Spar unselected-state hook.',
        },
        {
          attribute: 'data-orientation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `orientation`. Emitted by Spar.',
        },
      ],
    },
  ],
};
