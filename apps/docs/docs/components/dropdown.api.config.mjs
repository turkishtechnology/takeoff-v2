/**
 * API table source-of-truth for the Dropdown docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `_dropdown.api.mdx` partial whenever this file or
 * `packages/react-spar/src/components/dropdown/types.ts` changes.
 */

const dropdownTypesFile = 'packages/react-spar/src/components/dropdown/types.ts';
const sparDropdownDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/DropdownMenu';

const rootDataAttribute = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

export default {
  components: [
    {
      sourceFile: dropdownTypesFile,
      typeName: 'DropdownProps',
      displayName: 'Dropdown',
      headingBase: 'dropdown',
      prependPropNames: ['children'],
      skipPropNames: [],
      sparDocsUrl: sparDropdownDocsUrl,
      sparDocsLabel: 'Spar DropdownMenu docs',
    },
    {
      sourceFile: dropdownTypesFile,
      typeName: 'DropdownTriggerProps',
      displayName: 'Dropdown.Trigger',
      headingBase: 'dropdown-trigger',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      dataAttributes: [rootDataAttribute],
    },
    {
      sourceFile: dropdownTypesFile,
      typeName: 'DropdownContentProps',
      displayName: 'Dropdown.Content',
      headingBase: 'dropdown-content',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      dataAttributes: [
        rootDataAttribute,
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `Dropdown.size` for menu item sizing.',
        },
      ],
    },
    {
      sourceFile: dropdownTypesFile,
      typeName: 'DropdownViewportProps',
      displayName: 'Dropdown.Viewport',
      headingBase: 'dropdown-viewport',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      dataAttributes: [rootDataAttribute],
    },
    {
      sourceFile: dropdownTypesFile,
      typeName: 'DropdownItemProps',
      displayName: 'Dropdown.Item',
      headingBase: 'dropdown-item',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      dataAttributes: [
        rootDataAttribute,
        {
          attribute: 'data-highlighted',
          appliedWhen: 'Highlighted',
          purpose: 'Present while the item is the active option (keyboard, pointer, or typeahead). Style hover/active affordances off this.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'Disabled',
          purpose: 'Present when the item is disabled; the item stays visible but is not highlightable or selectable.',
        },
      ],
    },
    {
      sourceFile: dropdownTypesFile,
      typeName: 'DropdownGroupProps',
      displayName: 'Dropdown.Group',
      headingBase: 'dropdown-group',
      prependPropNames: ['children'],
      skipPropNames: ['ref'],
      dataAttributes: [rootDataAttribute],
    },
    {
      sourceFile: dropdownTypesFile,
      typeName: 'DropdownLabelProps',
      displayName: 'Dropdown.Label',
      headingBase: 'dropdown-label',
      prependPropNames: ['children'],
      skipPropNames: ['ref'],
      dataAttributes: [rootDataAttribute],
    },
    {
      sourceFile: dropdownTypesFile,
      typeName: 'DropdownSeparatorProps',
      displayName: 'Dropdown.Separator',
      headingBase: 'dropdown-separator',
      skipPropNames: ['ref'],
      dataAttributes: [rootDataAttribute],
    },
    {
      sourceFile: dropdownTypesFile,
      typeName: 'DropdownArrowProps',
      displayName: 'Dropdown.Arrow',
      headingBase: 'dropdown-arrow',
      skipPropNames: ['ref'],
      dataAttributes: [rootDataAttribute],
    },
  ],
};
