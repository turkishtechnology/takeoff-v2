import { createComponentBase } from '../../core';

import type {
  UploadDropzoneProps,
  UploadItemActionProps,
  UploadItemActionsProps,
  UploadItemContentProps,
  UploadItemPreviewProps,
  UploadItemProps,
  UploadListProps,
  UploadProps,
  UploadSubmitProps,
  UploadTriggerProps,
} from './types';

// @archetype react-enhancement — Spar ships no Upload/File primitive (same
// no-upstream situation as Progress/Table/Slider/Stepper). The wrapper owns the
// slice that would normally be Spar's: controlled/uncontrolled `File[]`
// reconciliation, drag-and-drop, file validation, and `FileList → File[]`.
// Takeoff Core's `tk-upload` is the visual/behavior reference; if a Spar Upload
// primitive lands upstream these parts migrate to Inherited in the same release
// (composition-archetype rule 3 / the upstream-first rule).
export const UploadBase = createComponentBase<UploadProps, 'root'>({
  name: 'Upload',
  slots: ['root'] as const,
  classes: { root: 'tk-upload' },
});

// @archetype react-enhancement — no upstream part; the drop target + drag-state
// owner (`data-drag-state`). `actions` is the row a Trigger + Submit pair is
// grouped into — a decorative inline slot, not a part: it holds no behavior and
// a consumer never composes it, they just write the two buttons side by side.
export const UploadDropzoneBase = createComponentBase<UploadDropzoneProps, 'root' | 'actions'>({
  name: 'UploadDropzone',
  slots: ['root', 'actions'] as const,
  classes: { root: 'tk-upload-dropzone', actions: 'tk-upload-dropzone-actions' },
});

// @archetype react-enhancement — no upstream part; opens the native picker.
export const UploadTriggerBase = createComponentBase<UploadTriggerProps, 'root'>({
  name: 'UploadTrigger',
  slots: ['root'] as const,
  classes: { root: 'tk-upload-trigger' },
});

// @archetype react-enhancement — no upstream part; optional upload action
// (network upload is the consumer's, wired via onClick).
export const UploadSubmitBase = createComponentBase<UploadSubmitProps, 'root'>({
  name: 'UploadSubmit',
  slots: ['root'] as const,
  classes: { root: 'tk-upload-submit' },
});

// @archetype react-enhancement — no upstream part; the file list region. The
// consumer maps the files into `Upload.Item`s (Ark-style collection), so a row's
// file is a prop rather than a hidden template binding.
export const UploadListBase = createComponentBase<UploadListProps, 'root'>({
  name: 'UploadList',
  slots: ['root'] as const,
  classes: { root: 'tk-upload-list' },
});

// @archetype react-enhancement — no upstream part; the per-file row. It holds
// nothing of its own beyond the three regions it lays out — preview, content,
// and actions — each a part with a default, so the row stays a layout box.
export const UploadItemBase = createComponentBase<UploadItemProps, 'root'>({
  name: 'UploadItem',
  slots: ['root'] as const,
  classes: { root: 'tk-upload-item' },
});

// @archetype react-enhancement — no upstream part; the row's middle region.
// Public (contract criterion 3 + 5) rather than an anonymous wrapper: it is what
// a consumer replaces to say something else about the file (a description line,
// an inline error), and it is the box a layout re-flows as a unit. Its
// name/size/status/progress stay decorative inline slots
// (data-attribute-vocabulary: styled via classNames/slotProps, not exposed as
// compound parts of their own).
export const UploadItemContentBase = createComponentBase<UploadItemContentProps, 'root' | 'name' | 'size' | 'status' | 'progress'>({
  name: 'UploadItemContent',
  slots: ['root', 'name', 'size', 'status', 'progress'] as const,
  classes: {
    root: 'tk-upload-item-content',
    name: 'tk-upload-item-name',
    size: 'tk-upload-item-size',
    status: 'tk-upload-item-status',
    progress: 'tk-upload-item-progress',
  },
});

// @archetype react-enhancement — no upstream part; the row's thumbnail. Public
// (contract criterion 3 + 5) rather than an inline slot like name/size: it owns
// behavior of its own — the object-URL lifecycle for a local image `File`,
// created in an effect and revoked on unmount/change — and its *content*, not
// just its styling, is what a consumer replaces (a type icon, a video poster),
// which `classNames` / `slotProps` cannot express.
export const UploadItemPreviewBase = createComponentBase<UploadItemPreviewProps, 'root' | 'image' | 'icon' | 'extension'>({
  name: 'UploadItemPreview',
  slots: ['root', 'image', 'icon', 'extension'] as const,
  classes: {
    root: 'tk-upload-item-preview',
    image: 'tk-upload-item-preview-image',
    icon: 'tk-upload-item-preview-icon',
    extension: 'tk-upload-item-preview-extension',
  },
});

// @archetype react-enhancement — no upstream part; the row's action area. Public
// (contract criterion 1 + 5) rather than an inline slot: it owns the default
// action set — a consumer replaces that set by passing children — and the
// container itself is what moves when a row's layout changes (the picture-card
// grid pins it over the thumbnail).
export const UploadItemActionsBase = createComponentBase<UploadItemActionsProps, 'root'>({
  name: 'UploadItemActions',
  slots: ['root'] as const,
  classes: { root: 'tk-upload-item-actions' },
});

// @archetype react-enhancement — no upstream part; the one focusable, labelled
// per-file action. `action` selects a built-in behavior (download / remove) and
// is mirrored as `data-action` so a consumer can target one action out of a row;
// preview, retry, and share are the same part wired by the consumer.
export const UploadItemActionBase = createComponentBase<UploadItemActionProps, 'root'>({
  name: 'UploadItemAction',
  slots: ['root'] as const,
  classes: { root: 'tk-upload-item-action' },
});
