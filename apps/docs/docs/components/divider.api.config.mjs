/**
 * API table source-of-truth for the Divider docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * API block in the sibling `divider.mdx` page whenever this file or
 * `packages/react-spar/src/components/divider/types.ts` changes.
 */

const dividerTypesFile = 'packages/react-spar/src/components/divider/types.ts';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

export default {
  components: [
    {
      sourceFile: dividerTypesFile,
      typeName: 'DividerProps',
      displayName: 'Divider',
      headingBase: 'divider',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Label content rendered between the line segments.'),
        className: classNameOverride,
      },
      dataAttributes: [
        {
          attribute: 'data-slot="root"',
          appliedWhen: 'Always',
          purpose: 'Stable selector for wrapper styling on the root slot.',
        },
        {
          attribute: 'data-slot="label"',
          appliedWhen: 'When children are renderable',
          purpose: 'Stable selector for the wrapper-owned label slot.',
        },
        {
          attribute: 'data-orientation',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `orientation` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-type',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `appearance` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-align',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `align` prop that positions the label along the line.',
        },
        {
          attribute: 'role',
          appliedWhen: 'Always',
          purpose: '`separator` when the divider carries semantic meaning; `none` when `decorative` is true (removes the element from the accessibility tree).',
        },
        {
          attribute: 'aria-orientation',
          appliedWhen: 'When `decorative` is false',
          purpose: 'Tells assistive technology the axis of the separator (`horizontal` | `vertical`). Absent on decorative dividers to avoid ARIA on a `role="none"` element.',
        },
      ],
    },
  ],
};
