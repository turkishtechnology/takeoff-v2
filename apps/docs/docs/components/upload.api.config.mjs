/**
 * API table source-of-truth for the Upload docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * `api-tables` block in `upload.mdx` whenever this file or
 * `packages/react-spar/src/components/upload/types.ts` changes.
 */

const uploadTypesFile = 'packages/react-spar/src/components/upload/types.ts';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

export default {
  components: [
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadProps',
      displayName: 'Upload',
      headingBase: 'upload',
      prependPropNames: ['value', 'defaultValue', 'onValueChange'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-disabled',
          appliedWhen: 'When disabled (own prop or inherited from a surrounding `Field`)',
          purpose: 'Styling hook for the disabled state.',
        },
        {
          attribute: 'data-readonly',
          appliedWhen: 'When read-only (own prop or `Field`)',
          purpose: 'Styling hook for the read-only state — takes the zone out of the drag flow.',
        },
        {
          attribute: 'data-invalid',
          appliedWhen: 'When invalid (own prop or `Field`)',
          purpose: 'Styling hook for the invalid state (danger treatment).',
        },
      ],
    },
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadDropzoneProps',
      displayName: 'Upload.Dropzone',
      headingBase: 'upload-dropzone',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Dropzone content — typically a prompt and an `Upload.Trigger`.'),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-drag-state',
          appliedWhen: 'While a payload is dragged over (`accept` | `reject`, by matching the dragged type against `accept`)',
          purpose: 'Styling hook distinguishing an acceptable from a rejected drag. Unstyled by default — the recipe ships no drag treatment.',
        },
      ],
    },
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadActionsProps',
      displayName: 'Upload.Actions',
      headingBase: 'upload-actions',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('The controls to put on one line — typically `Upload.Trigger` and `Upload.Submit`.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadTriggerProps',
      displayName: 'Upload.Trigger',
      headingBase: 'upload-trigger',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Trigger label (e.g. "Choose file").'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadSubmitProps',
      displayName: 'Upload.Submit',
      headingBase: 'upload-submit',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Submit label (e.g. "Upload"). Wire the actual upload through `onClick`.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadListProps',
      displayName: 'Upload.List',
      headingBase: 'upload-list',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('`(files) => ReactNode` — map the files into `Upload.Item`s. Plain nodes render as authored; omit it for a default row per file.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadItemProps',
      displayName: 'Upload.Item',
      headingBase: 'upload-item',
      prependPropNames: ['file', 'children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride(
          'Per-file action controls (`Upload.ItemAction`), wrapped in a default `Upload.ItemActions` — and replacing its default download + remove pair rather than joining it. A composed `Upload.ItemPreview`, `Upload.ItemContent`, or `Upload.ItemActions` among them is hoisted into its own region, replacing that default.',
        ),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-status',
          appliedWhen: 'Always (`idle` | `uploading` | `processing` | `completed` | `error`)',
          purpose: 'Per-file status styling hook (consumer-driven `UploadFile.status`).',
        },
      ],
    },
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadItemContentProps',
      displayName: 'Upload.ItemContent',
      headingBase: 'upload-item-content',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride("Replaces the file's details. Omit it for the default name, size, status support text, and progress bar."),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadItemPreviewProps',
      displayName: 'Upload.ItemPreview',
      headingBase: 'upload-item-preview',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride('Replaces the built-in thumbnail. Omit it for the default image / extension preview.'),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadItemActionsProps',
      displayName: 'Upload.ItemActions',
      headingBase: 'upload-item-actions',
      prependPropNames: ['children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride("The row's actions. Replaces the default `download` + `remove` pair."),
        className: classNameOverride,
      },
      dataAttributes: [dataSlotRoot],
    },
    {
      sourceFile: uploadTypesFile,
      typeName: 'UploadItemActionProps',
      displayName: 'Upload.ItemAction',
      headingBase: 'upload-item-action',
      prependPropNames: ['action', 'label', 'children'],
      appendPropNames: ['className'],
      skipPropNames: ['ref'],
      propOverrides: {
        children: childrenOverride("Action content — typically an icon. Defaults to the `action`'s own glyph."),
        className: classNameOverride,
      },
      dataAttributes: [
        dataSlotRoot,
        {
          attribute: 'data-action',
          appliedWhen: 'When `action` is set (any name; `download` | `remove` are the wired pair)',
          purpose: 'Names the action, for styling one action out of a row.',
        },
      ],
    },
  ],
};
