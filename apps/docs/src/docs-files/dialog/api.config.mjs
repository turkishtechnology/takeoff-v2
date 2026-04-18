export default {
  sourceFile: 'packages/react-spar/src/components/dialog/types.ts',
  typeName: 'DialogProps',
  headingBase: 'dialog',
  dataAttributes: [
    {
      attribute: 'data-slot="root"',
      appliedWhen: 'Always on `Dialog.Panel`',
      purpose:
        'Stable root selector for the dialog container. Carries `data-variant`, `data-header-type`, `data-mask-variant`, and the `tk-dialog` class (plus the variant-specific class).',
    },
    {
      attribute: 'data-slot="mask"',
      appliedWhen: 'When `Dialog.Mask` is rendered and the dialog is visible',
      purpose: 'Stable backdrop selector. Adds the mask variant class plus `data-mask-variant`, `data-backdrop-hidden`, and `data-mask-blur` hooks.',
    },
    {
      attribute: 'data-slot="header"',
      appliedWhen: 'On `Dialog.Header`',
      purpose: 'Stable header band selector. Carries the header type class and `data-header-type`.',
    },
    {
      attribute: 'data-slot="sign-icon"',
      appliedWhen: 'On `Dialog.SignIcon`',
      purpose: 'Stable selector for the variant sign treatment.',
    },
    {
      attribute: 'data-slot="title-container"',
      appliedWhen: 'On `Dialog.TitleGroup`',
      purpose: 'Stable selector that wraps the title and description.',
    },
    {
      attribute: 'data-slot="title"',
      appliedWhen: 'On `Dialog.Title`',
      purpose: 'Stable selector for the dialog title.',
    },
    {
      attribute: 'data-slot="subtitle"',
      appliedWhen: 'On `Dialog.Description`',
      purpose: 'Stable selector for the dialog description copy.',
    },
    {
      attribute: 'data-slot="close-button"',
      appliedWhen: 'On `Dialog.CloseButton`',
      purpose: 'Stable selector for the header close action. Activation calls `requestClose()` from dialog context.',
    },
    {
      attribute: 'data-slot="content"',
      appliedWhen: 'On `Dialog.Body`',
      purpose: 'Stable selector for the main dialog content region.',
    },
    {
      attribute: 'data-slot="footer"',
      appliedWhen: 'On `Dialog.Footer`',
      purpose: 'Stable selector for the footer band.',
    },
    {
      attribute: 'data-slot="footer-actions"',
      appliedWhen: 'On `Dialog.FooterActions`',
      purpose: 'Stable selector for the actions group inside the footer.',
    },
    {
      attribute: 'data-variant / data-header-type / data-mask-variant',
      appliedWhen: 'Always on `Dialog.Panel`; `data-mask-variant` also on `Dialog.Mask`; `data-header-type` also on `Dialog.Header`',
      purpose: 'Product styling hooks for dialog tone, header treatment, and mask treatment.',
    },
    {
      attribute: 'data-backdrop-hidden / data-mask-blur',
      appliedWhen: 'When the corresponding visual prop is enabled',
      purpose: 'Mask styling hooks for transparent and blurred backdrops.',
    },
  ],
};
