export default {
  sourceFile: 'packages/react-spar/src/components/dialog/types.ts',
  typeName: 'DialogProps',
  headingBase: 'dialog',
  dataAttributes: [
    {
      attribute: 'data-slot="root"',
      appliedWhen: 'Always',
      purpose: 'Stable root slot selector for the dialog container.',
    },
    {
      attribute: 'data-slot="mask"',
      appliedWhen: 'When the dialog is visible',
      purpose: 'Stable backdrop selector for mask styling.',
    },
    {
      attribute: 'data-slot="header" / "header-content" / "title-container"',
      appliedWhen: 'When the default header is rendered',
      purpose: 'Stable selectors for header layout and spacing.',
    },
    {
      attribute: 'data-slot="title" / "subtitle"',
      appliedWhen: 'When header and subheader content are present',
      purpose: 'Stable selectors for dialog copy styling.',
    },
    {
      attribute: 'data-slot="sign-icon"',
      appliedWhen: '`showVariantSign` is `true`',
      purpose: 'Stable selector for the variant sign treatment.',
    },
    {
      attribute: 'data-slot="content"',
      appliedWhen: 'When `contentSlot` or `children` render body content',
      purpose: 'Stable selector for the main dialog content region.',
    },
    {
      attribute: 'data-slot="footer" / "footer-actions"',
      appliedWhen: 'When `footerActions` renders the default footer layout',
      purpose: 'Stable selectors for footer spacing and action alignment.',
    },
    {
      attribute: 'data-variant / data-header-type / data-mask-variant',
      appliedWhen: 'Always',
      purpose: 'Product styling hooks for dialog tone, header treatment, and mask treatment.',
    },
    {
      attribute: 'data-backdrop-hidden / data-mask-blur',
      appliedWhen: 'When the corresponding visual prop is enabled',
      purpose: 'Mask styling hooks for transparent and blurred backdrops.',
    },
  ],
};
