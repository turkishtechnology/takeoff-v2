/**
 * API table source-of-truth for the Button docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * sibling `_button.api.mdx` partial whenever this file or
 * `packages/react-spar/src/components/button/types.ts` changes.
 */

const buttonTypesFile = 'packages/react-spar/src/components/button/types.ts';
const sparButtonDocsUrl = 'https://spar.app.turkishtechlab.com/docs/Components/Button';

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
      sourceFile: buttonTypesFile,
      typeName: 'ButtonProps',
      displayName: 'Button',
      headingBase: 'button',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      sparDocsUrl: sparButtonDocsUrl,
      sparDocsLabel: 'Spar Button docs',
      sparBehaviorProps: ['loading', 'pressed', 'onPressedChange', 'disabled'],
      propOverrides: {
        children: childrenOverride('Button label content.'),
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
        {
          attribute: 'data-size',
          appliedWhen: 'Always',
          purpose: 'Reflects the resolved `size` prop for theme recipe scoping.',
        },
        {
          attribute: 'data-rounded',
          appliedWhen: 'When `rounded` is true',
          purpose: 'Styling hook for the pill-shaped state.',
        },
        {
          attribute: 'data-icon-only',
          appliedWhen: 'When icon-only',
          purpose: 'Auto-detected when icons exist but no children.',
        },
        {
          attribute: 'data-loading',
          appliedWhen: 'When `loading` is true',
          purpose: 'Styling hook for the loading state.',
        },
        {
          attribute: 'data-disabled',
          appliedWhen: 'When `disabled` is true',
          purpose: 'Styling hook for the disabled state.',
        },
      ],
    },
  ],
};
