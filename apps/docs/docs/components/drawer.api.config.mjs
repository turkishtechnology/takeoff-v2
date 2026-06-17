/**
 * API table source-of-truth for the Drawer docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `_drawer.api.mdx` partial whenever this file or
 * `packages/react-spar/src/components/drawer/types.ts` changes.
 */

const drawerTypesFile = 'packages/react-spar/src/components/drawer/types.ts';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot of this part.',
};

const levelOverride = {
  default: '5',
  description: 'Semantic heading level (1-6). Sets the rendered tag (`h1`-`h6`) and ' + '`data-level` for the document outline; the visual size is fixed regardless of level.',
};

const dataLevel = {
  attribute: 'data-level',
  appliedWhen: 'Always',
  purpose: 'Reflects the resolved `level` prop for the document outline (does not change typography).',
};

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

export default {
  components: [
    {
      sourceFile: drawerTypesFile,
      typeName: 'DrawerProps',
      displayName: 'Drawer',
      headingBase: 'drawer',
      prependPropNames: ['children'],
      // Drawer root is state-only — renders no DOM. No `className`, no slot
      // attributes, no `data-*`. State-driven styling hooks live on the
      // Panel/Overlay/Header children below.
      propOverrides: {
        children: childrenOverride('Drawer parts rendered inside the root.'),
      },
      dataAttributes: [],
    },
    {
      sourceFile: drawerTypesFile,
      typeName: 'DrawerTriggerProps',
      displayName: 'Drawer.Trigger',
      headingBase: 'drawer-trigger',
      propOverrides: {
        children: childrenOverride('Button label or render function.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: drawerTypesFile,
      typeName: 'DrawerOverlayProps',
      displayName: 'Drawer.Overlay',
      headingBase: 'drawer-overlay',
      propOverrides: {
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-state',
          appliedWhen: 'Always',
          purpose: '`"open"` or `"closed"` — used for entry/exit animations.',
        },
        {
          attribute: 'data-intensity',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `intensity` prop.',
        },
        {
          attribute: 'data-invisible',
          appliedWhen: 'When `invisible` is true',
          purpose: 'Indicates overlay is visually hidden but still interactive.',
        },
        {
          attribute: 'data-blur',
          appliedWhen: 'When `blur` is true',
          purpose: 'Enables backdrop blur styling on the overlay.',
        },
      ],
    },
    {
      sourceFile: drawerTypesFile,
      typeName: 'DrawerPanelProps',
      displayName: 'Drawer.Panel',
      headingBase: 'drawer-panel',
      propOverrides: {
        children: childrenOverride('Panel content (Header, Body, Footer).'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-state',
          appliedWhen: 'Always',
          purpose: '`"open"` or `"closed"` — drives slide/scale animations.',
        },
        {
          attribute: 'data-placement',
          appliedWhen: 'Always',
          purpose: 'Reflects placement for directional CSS transitions.',
        },
      ],
    },
    {
      sourceFile: drawerTypesFile,
      typeName: 'DrawerHeaderProps',
      displayName: 'Drawer.Header',
      headingBase: 'drawer-header',
      propOverrides: {
        children: childrenOverride('Title and close control.'),
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
      sourceFile: drawerTypesFile,
      typeName: 'DrawerTitleProps',
      displayName: 'Drawer.Title',
      headingBase: 'drawer-title',
      propOverrides: {
        children: childrenOverride('Heading text content.'),
        className: classNameOverride,
        level: levelOverride,
      },
      dataAttributes: [dataSlotRoot, dataLevel],
    },
    {
      sourceFile: drawerTypesFile,
      typeName: 'DrawerDescriptionProps',
      displayName: 'Drawer.Description',
      headingBase: 'drawer-description',
      propOverrides: {
        children: childrenOverride('Description text.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: drawerTypesFile,
      typeName: 'DrawerBodyProps',
      displayName: 'Drawer.Body',
      headingBase: 'drawer-body',
      propOverrides: {
        children: childrenOverride('Main scrollable content.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: drawerTypesFile,
      typeName: 'DrawerFooterProps',
      displayName: 'Drawer.Footer',
      headingBase: 'drawer-footer',
      propOverrides: {
        children: childrenOverride('Footer actions.'),
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
      sourceFile: drawerTypesFile,
      typeName: 'DrawerCloseProps',
      displayName: 'Drawer.Close',
      headingBase: 'drawer-close',
      propOverrides: {
        children: childrenOverride('Custom close label or icon.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
  ],
};
