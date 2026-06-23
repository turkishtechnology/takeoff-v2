/**
 * API table source-of-truth for the Table docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * api-tables block in `table.mdx` whenever this file or
 * `packages/react-spar/src/components/table/types.ts` changes.
 *
 * Table is a single props-first component (no public compound parts in Phase 1),
 * so there is exactly one entry here.
 */

const tableTypesFile = 'packages/react-spar/src/components/table/types.ts';
const tanstackDocsUrl = 'https://tanstack.com/table/latest/docs/introduction';

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root scroll container.',
};

export default {
  components: [
    {
      sourceFile: tableTypesFile,
      typeName: 'TableProps',
      displayName: 'Table',
      headingBase: 'table',
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: tanstackDocsUrl,
      sparDocsLabel: 'TanStack Table docs',
      propOverrides: {
        className: classNameOverride,
      },
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for the root scroll container.',
        },
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` (density) so recipes can scope cell padding.',
        },
        {
          attribute: 'data-striped',
          appliedWhen: 'When `striped` is true.',
          purpose: 'Enables zebra striping on body rows.',
        },
        {
          attribute: 'data-bordered',
          appliedWhen: 'When `bordered` is true.',
          purpose: 'Adds vertical separators between columns.',
        },
        {
          attribute: 'data-sticky-header',
          appliedWhen: 'When `stickyHeader` is true.',
          purpose: 'Pins the header row during vertical scroll (opaque background + bottom shadow).',
        },
        {
          attribute: 'data-loading',
          appliedWhen: 'When `loading` is true.',
          purpose: 'Shows the loading overlay; the table is also marked `aria-busy`.',
        },
        {
          attribute: 'data-align',
          appliedWhen: 'On every header/body cell with an `align` (or column `meta.headerAlign`).',
          purpose: 'Drives cell `text-align` (`start` | `center` | `end`).',
        },
        {
          attribute: 'data-sticky',
          appliedWhen: 'On cells of a column with `sticky: "left" | "right"`.',
          purpose: 'Pins the column; per-edge offset + z-index are applied inline.',
        },
        {
          attribute: 'aria-sort',
          appliedWhen: 'On sortable header cells.',
          purpose: 'A11y sort state (`ascending` | `descending` | `none`); the sort chevron mirrors it via `data-direction`.',
        },
        {
          attribute: 'data-selected',
          appliedWhen: 'On a selected body row.',
          purpose: 'Theme hook for the selected-row background.',
        },
      ],
    },
  ],
};
