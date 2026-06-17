/**
 * API table source-of-truth for the Dialog docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `_dialog.api.mdx` partial whenever this file or
 * `packages/react-spar/src/components/dialog/types.ts` changes.
 */

const dialogTypesFile = 'packages/react-spar/src/components/dialog/types.ts';

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
      sourceFile: dialogTypesFile,
      typeName: 'DialogProps',
      displayName: 'Dialog',
      headingBase: 'dialog',
      prependPropNames: ['children'],
      propOverrides: {
        children: childrenOverride('Dialog parts rendered inside the root.'),
      },
      dataAttributes: [],
    },
    {
      sourceFile: dialogTypesFile,
      typeName: 'DialogTriggerProps',
      displayName: 'Dialog.Trigger',
      headingBase: 'dialog-trigger',
      propOverrides: {
        children: childrenOverride('Button label or render function.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: dialogTypesFile,
      typeName: 'DialogOverlayProps',
      displayName: 'Dialog.Overlay',
      headingBase: 'dialog-overlay',
      propOverrides: {
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-state',
          appliedWhen: 'Always',
          purpose: '`"open"` or `"closed"` — used for overlay fade transitions.',
        },
        {
          attribute: 'data-intensity',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `intensity` prop.',
        },
        {
          attribute: 'data-invisible',
          appliedWhen: 'When `invisible` is true',
          purpose: 'Indicates the overlay is visually hidden but still mounted.',
        },
        {
          attribute: 'data-blur',
          appliedWhen: 'When `blur` is true',
          purpose: 'Enables backdrop blur styling on the overlay.',
        },
      ],
    },
    {
      sourceFile: dialogTypesFile,
      typeName: 'DialogPanelProps',
      displayName: 'Dialog.Panel',
      headingBase: 'dialog-panel',
      propOverrides: {
        children: childrenOverride('Dialog body content, header, footer, and actions.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-state',
          appliedWhen: 'Always',
          purpose: '`"open"` or `"closed"` — forwarded from Spar dialog state.',
        },
        {
          attribute: 'data-modal',
          appliedWhen: 'Always',
          purpose: 'Reflects whether the dialog is modal.',
        },
        {
          attribute: 'data-role',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved ARIA role.',
        },
      ],
    },
    {
      sourceFile: dialogTypesFile,
      typeName: 'DialogHeaderProps',
      displayName: 'Dialog.Header',
      headingBase: 'dialog-header',
      propOverrides: {
        children: childrenOverride('Title, description, and optional close action.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-header-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `headerType` prop.',
        },
      ],
    },
    {
      sourceFile: dialogTypesFile,
      typeName: 'DialogTitleProps',
      displayName: 'Dialog.Title',
      headingBase: 'dialog-title',
      propOverrides: {
        children: childrenOverride('Heading text content.'),
        className: classNameOverride,
        // The wrapper defaults `level` to 5 (an h5 visual heading), not Spar's
        // primitive default of 2. The generated default comes from Spar's
        // `@defaultValue` JSDoc, so override it to match the wrapper.
        level: { default: '5' },
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: dialogTypesFile,
      typeName: 'DialogDescriptionProps',
      displayName: 'Dialog.Description',
      headingBase: 'dialog-description',
      propOverrides: {
        children: childrenOverride('Description text.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: dialogTypesFile,
      typeName: 'DialogBodyProps',
      displayName: 'Dialog.Body',
      headingBase: 'dialog-body',
      propOverrides: {
        children: childrenOverride('Main content area between header and footer.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: dialogTypesFile,
      typeName: 'DialogFooterProps',
      displayName: 'Dialog.Footer',
      headingBase: 'dialog-footer',
      propOverrides: {
        children: childrenOverride('Footer actions or secondary controls.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-footer-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `footerType` prop.',
        },
      ],
    },
    {
      sourceFile: dialogTypesFile,
      typeName: 'DialogCloseProps',
      displayName: 'Dialog.Close',
      headingBase: 'dialog-close',
      propOverrides: {
        children: childrenOverride('Close label, icon, or render function.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
