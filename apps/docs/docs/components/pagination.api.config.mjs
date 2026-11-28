/**
 * API table source-of-truth for the Pagination docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `pagination.mdx` whenever this file or
 * `packages/react-spar/src/components/pagination/types.ts` changes.
 */

const paginationTypesFile = 'packages/react-spar/src/components/pagination/types.ts';

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

const part = ({ typeName, displayName, headingBase, children, dataAttributes = [dataSlotRoot], prepend = ['children'] }) => ({
  sourceFile: paginationTypesFile,
  typeName,
  displayName,
  headingBase,
  prependPropNames: prepend,
  appendPropNames: ['className'],
  skipPropNames: ['ref'],
  propOverrides: {
    ...(children ? { children: childrenOverride(children) } : {}),
    className: classNameOverride,
  },
  dataAttributes,
});

const navButton = (displayName, headingBase, what) =>
  part({
    typeName: 'PaginationNavButtonProps',
    displayName,
    headingBase,
    children: `Replaces the default chevron glyph. The accessible name stays \`labels.${what}\` unless \`aria-label\` is set.`,
    dataAttributes: [
      dataSlotRoot,
      {
        attribute: 'data-disabled',
        appliedWhen: 'When there is no page to move to, or the root is disabled.',
        purpose: 'Mirrors the native `disabled` state. Emitted by Spar.',
      },
    ],
  });

export default {
  components: [
    {
      sourceFile: paginationTypesFile,
      typeName: 'PaginationProps',
      displayName: 'Pagination',
      headingBase: 'pagination',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparBehaviorProps: ['page', 'defaultPage', 'onPageChange', 'siblingCount', 'boundaryCount', 'disabled'],
      propOverrides: {
        children: childrenOverride('Parts to render. Without children the root renders the default anatomy for its `mode`.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `type` (`outlined` | `text` | `grouped`). Emitted by the wrapper.',
        },
        {
          attribute: 'data-mode',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `mode` (`default` | `compact`). Emitted by the wrapper.',
        },
        {
          attribute: 'data-rounded',
          appliedWhen: 'When `rounded` is true.',
          purpose: 'Fully rounded page cells. Emitted by the wrapper.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When `disabled` is true.',
          purpose: 'Theme hook for the disabled control. Emitted by Spar, alongside `aria-disabled`.',
        },
      ],
    },
    part({
      typeName: 'PaginationInfoProps',
      displayName: 'Pagination.Info',
      headingBase: 'pagination-info',
      children: 'Report parts. Defaults to `Pagination.PageReport` and `Pagination.ItemsReport`.',
    }),
    part({
      typeName: 'PaginationPageReportProps',
      displayName: 'Pagination.PageReport',
      headingBase: 'pagination-page-report',
      children: 'Replaces the `labels.pageStatus` text.',
    }),
    part({
      typeName: 'PaginationItemsReportProps',
      displayName: 'Pagination.ItemsReport',
      headingBase: 'pagination-items-report',
      children: 'Replaces the `labels.itemsRange` / `labels.noItems` text.',
    }),
    part({
      typeName: 'PaginationControlsProps',
      displayName: 'Pagination.Controls',
      headingBase: 'pagination-controls',
      children: 'Control parts. Defaults follow the root `mode`.',
    }),
    navButton('Pagination.First', 'pagination-first', 'firstPage'),
    navButton('Pagination.Previous', 'pagination-previous', 'previousPage'),
    part({
      typeName: 'PaginationPagesProps',
      displayName: 'Pagination.Pages',
      headingBase: 'pagination-pages',
      prepend: [],
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-slot="page"',
          appliedWhen: 'On every page button.',
          purpose: 'Stable selector for a page button. The current one carries `aria-current="page"` (and `data-current`) from Spar.',
        },
        {
          attribute: 'data-slot="ellipsis"',
          appliedWhen: 'On every gap marker.',
          purpose: 'Stable selector for the `aria-hidden` ellipsis.',
        },
      ],
    }),
    navButton('Pagination.Next', 'pagination-next', 'nextPage'),
    navButton('Pagination.Last', 'pagination-last', 'lastPage'),
    part({
      typeName: 'PaginationActionsProps',
      displayName: 'Pagination.Actions',
      headingBase: 'pagination-actions',
      children: 'Action parts. Defaults to `Pagination.PageSize`, plus `Pagination.PageJump` in `default` mode.',
    }),
    part({
      typeName: 'PaginationPageSizeProps',
      displayName: 'Pagination.PageSize',
      headingBase: 'pagination-page-size',
      prepend: [],
    }),
    part({
      typeName: 'PaginationPageJumpProps',
      displayName: 'Pagination.PageJump',
      headingBase: 'pagination-page-jump',
      prepend: [],
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-slot="submit"',
          appliedWhen: 'In `default` mode.',
          purpose: 'The submit button beside the field (a Takeoff `Button`).',
        },
      ],
    }),
  ],
};
