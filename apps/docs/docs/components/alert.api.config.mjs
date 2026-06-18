/**
 * API table source-of-truth for the Alert docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * API block in the sibling `alert.mdx` page whenever this file or
 * `packages/react-spar/src/components/alert/types.ts` changes.
 */

const alertTypesFile = 'packages/react-spar/src/components/alert/types.ts';

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

export default {
  components: [
    {
      sourceFile: alertTypesFile,
      typeName: 'AlertProps',
      displayName: 'Alert',
      headingBase: 'alert',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      propOverrides: {
        children: childrenOverride('Alert content, usually Alert.Content plus optional Alert.Actions and Alert.Close.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-variant',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `variant` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `appearance` prop for theme recipe scoping.',
        },
      ],
    },
    {
      sourceFile: alertTypesFile,
      typeName: 'AlertContentProps',
      displayName: 'Alert.Content',
      headingBase: 'alert-content',
      propOverrides: {
        children: childrenOverride('Title, description, or custom alert content.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: alertTypesFile,
      typeName: 'AlertTitleProps',
      displayName: 'Alert.Title',
      headingBase: 'alert-title',
      propOverrides: {
        children: childrenOverride('Heading text content.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: alertTypesFile,
      typeName: 'AlertDescriptionProps',
      displayName: 'Alert.Description',
      headingBase: 'alert-description',
      propOverrides: {
        children: childrenOverride('Supporting description text.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: alertTypesFile,
      typeName: 'AlertActionsProps',
      displayName: 'Alert.Actions',
      headingBase: 'alert-actions',
      propOverrides: {
        children: childrenOverride('Action controls associated with the alert.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: alertTypesFile,
      typeName: 'AlertCloseProps',
      displayName: 'Alert.Close',
      headingBase: 'alert-close',
      propOverrides: {
        children: childrenOverride('Close control content. Defaults to a built-in close icon; pass `aria-label` to name it.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
