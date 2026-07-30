import type { ElementType, ImgHTMLAttributes, ReactNode } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ButtonAppearance, ButtonSize, ButtonVariant } from '../button';

import type { ClassNamesMap, SlotPropsMap } from '../../core';

export type UploadSlot = 'root';
export type UploadDropzoneSlot = 'root' | 'actions';
export type UploadTriggerSlot = 'root';
export type UploadSubmitSlot = 'root';
export type UploadListSlot = 'root';
export type UploadItemSlot = 'root';
export type UploadItemContentSlot = 'root' | 'name' | 'size' | 'status' | 'progress';
export type UploadItemPreviewSlot = 'root' | 'image' | 'icon' | 'extension';
export type UploadItemActionsSlot = 'root';
export type UploadItemActionSlot = 'root';

/**
 * Per-file lifecycle status, driven by the consumer (the component does not
 * upload): `'idle'` is the resting state, `'uploading'` the transfer itself (the
 * only status that draws the progress bar), `'processing'` the server's own step
 * once the bytes have landed, which reports no percentage, and `'completed'` /
 * `'error'` the two outcomes.
 */
export type UploadFileStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

// Deliberately not `extends File`: an entry is spread, patched, and often
// written as a literal, none of which survive a `File`'s prototype getters — and
// a server-side attachment has no local bytes to be one with. Same two-layer
// split as Ant Design's `UploadFile` / `originFileObj`.
/**
 * A file in the Upload value: a plain object that *points at* a picked `File`,
 * or stands for a remote/preloaded one through its `url`. `name` / `size` /
 * `type` may be set on the entry or read off `file`; the entry's own value
 * always wins.
 */
export interface UploadFile {
  /** Stable identity (React key, status mapping). Generated for picked files. */
  id: string;
  /** The local bytes. Absent for a remote/preloaded entry, which uses `url`. */
  file?: File;
  /** Display name. Read off `file` when the entry does not state it. */
  name?: string;
  /** Size in bytes. Read off `file` when the entry does not state it. */
  size?: number;
  /** MIME type. Read off `file` when the entry does not state it. */
  type?: string;
  /** Remote URL for download / image preview when the bytes are not local. */
  url?: string;
  /**
   * A picture *of* the file rather than the file itself — a server-rendered
   * first page, a video's poster frame. Shown whatever the entry's `type` is,
   * which is what puts a non-image on the image branch; the download ignores it.
   */
  thumbUrl?: string;
  /**
   * Lifecycle status. Optional because an entry without one already means the
   * resting state.
   * @defaultValue 'idle'
   */
  status?: UploadFileStatus;
  /** Upload progress 0–100 while `status` is `'uploading'`. */
  progress?: number;
  /** Human-readable error, shown when `status` is `'error'`. */
  error?: string;
}

/**
 * A file that failed validation, emitted (batched) through `onFilesReject` —
 * rejected files never enter `value`, so this is the only way a consumer learns
 * about them. Discriminated on `code`, and each branch carries the limit that
 * was broken, since the sentence shown to the user is the consumer's to write.
 */
export type UploadRejection =
  | {
      file: File;
      code: 'file-invalid-type';
      /** The `accept` list the file failed to match. */
      accept: string;
    }
  | {
      file: File;
      code: 'file-too-large';
      /** The `maxFileSize` (bytes) the file exceeded. */
      maxFileSize: number;
    }
  | {
      file: File;
      code: 'too-many-files';
      /** How many files were allowed — `maxFileCount`, or 1 without `multiple`. */
      maxFileCount: number;
    };

/**
 * State + validation props owned by the Upload root. The anatomy — dropzone,
 * trigger, per-file actions — is expressed by composing parts rather than by
 * flags, mirroring the Input "modes as composition" model.
 */
export interface UploadOwnProps {
  /** Committed files (controlled). Pair with `onValueChange`. */
  value?: UploadFile[];
  /** Initial files for uncontrolled usage. */
  defaultValue?: UploadFile[];
  /** Called with the next file array after a selection, drop, or removal. */
  onValueChange?: (files: UploadFile[]) => void;
  /** Acceptable file types — comma-separated MIME types (`image/*`) and/or extensions (`.pdf`). */
  accept?: string;
  /**
   * Allow selecting/holding more than one file. When `false`, a new selection
   * replaces the current file.
   * @defaultValue false
   */
  multiple?: boolean;
  /**
   * Browse folders instead of single files: the picker takes a directory and
   * every file inside it (recursively), each keeping its `webkitRelativePath`
   * (e.g. `reports/2024/q1.pdf`) for rebuilding the tree. Implies `multiple`.
   * Only affects the picker — dropping a folder on `Upload.Dropzone` does not
   * expand it.
   * @defaultValue false
   */
  directory?: boolean;
  /** Maximum size per file, in bytes. Larger files are rejected. */
  maxFileSize?: number;
  /** Maximum number of files (only meaningful with `multiple`). Extra files are rejected. */
  maxFileCount?: number;
  /**
   * Called with the entries that just entered the value — the files wrapped this
   * batch rather than the whole array, which is what a consumer starts its own
   * upload from. Files dropped as duplicates of ones already held are not
   * reported.
   */
  onFileAccept?: (files: UploadFile[]) => void;
  /** Called with every file rejected by validation (type, size, or count). */
  onFilesReject?: (rejections: UploadRejection[]) => void;
  /**
   * Row support text while a file transfers. Localize per upload; an empty
   * string drops the status line, glyph included.
   * @defaultValue 'Uploading…'
   */
  uploadingLabel?: string;
  /**
   * Row support text while the server works on a file that has landed.
   * Localize per upload; an empty string drops the status line, glyph included.
   * @defaultValue 'Processing…'
   */
  processingLabel?: string;
  /**
   * Row support text once a file is done. Localize per upload; an empty string
   * drops the status line, glyph included.
   * @defaultValue 'Completed'
   */
  completedLabel?: string;
  /**
   * Row support text for a failure that reports no `error` message of its own —
   * an entry's own `error` always wins. Localize per upload; an empty string
   * drops the status line, glyph included.
   * @defaultValue 'Failed'
   */
  errorLabel?: string;
  /**
   * Accessible name for a row's progress bar, as a template: `{name}` stands
   * for the file's name, so several bars uploading at once stay distinguishable.
   * An empty string counts as unset — the bar cannot go unnamed.
   * @defaultValue '{name} upload progress'
   */
  progressLabel?: string;
  /**
   * Accessible name for the built-in `action="download"`, as a `{name}`
   * template. An `Upload.ItemAction`'s own `label` wins over it, and an empty
   * string counts as unset — an icon-only button cannot go unnamed.
   * @defaultValue 'Download {name}'
   */
  downloadLabel?: string;
  /**
   * Accessible name for the built-in `action="remove"`, as a `{name}` template.
   * An `Upload.ItemAction`'s own `label` wins over it, and an empty string
   * counts as unset — an icon-only button cannot go unnamed.
   * @defaultValue 'Remove {name}'
   */
  removeLabel?: string;
  /** Disables the whole control. Also inherited from a surrounding `Field`. */
  disabled?: boolean;
  /** Read-only: files render and remain downloadable, but adding/removing is blocked. Also inherited from `Field`. */
  readOnly?: boolean;
  /** Marks the control invalid — mirrored as `data-invalid` for the recipe's danger styling. Also inherited from `Field`. */
  invalid?: boolean;
  /** Per-slot class name overrides. */
  classNames?: ClassNamesMap<UploadSlot>;
  /** Per-slot HTML attribute overrides. */
  slotProps?: SlotPropsMap<UploadSlot>;
}

/** Public props for the Upload root. Polymorphic via `as` (default `div`). */
export type UploadProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, UploadOwnProps>;

export interface UploadDropzoneOwnProps {
  /** Zone content — typically a prompt and an `Upload.Trigger`. */
  children?: ReactNode;
  classNames?: ClassNamesMap<UploadDropzoneSlot>;
  slotProps?: SlotPropsMap<UploadDropzoneSlot>;
}

/**
 * Drag-and-drop target. Composing it is what enables drag-and-drop; it owns the
 * `data-drag-state` (`accept` | `reject`) styling hook while a payload hovers.
 */
export type UploadDropzoneProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, UploadDropzoneOwnProps>;

export interface UploadTriggerOwnProps {
  /** Trigger label (e.g. `"Choose file"`). */
  children?: ReactNode;
  /**
   * Button appearance. Quieter than Button's own default, and the treatment
   * `Upload.Submit` takes too — the two stand beside each other in the zone, so
   * they read as one pair. Re-point it on a Trigger that stands alone.
   * @defaultValue 'outlined'
   */
  appearance?: ButtonAppearance;
  /**
   * Button color variant.
   * @defaultValue 'neutral'
   */
  variant?: ButtonVariant;
  classNames?: ClassNamesMap<UploadTriggerSlot>;
  slotProps?: SlotPropsMap<UploadTriggerSlot>;
}

/** Button that opens the native file picker. Focusable; disabled when the upload is disabled or read-only. */
export type UploadTriggerProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, UploadTriggerOwnProps>;

export interface UploadSubmitOwnProps {
  /** Submit label (e.g. `"Upload"`). Wire the actual upload through `onClick`. */
  children?: ReactNode;
  /**
   * Button appearance. The Trigger's, not Button's own: the two stand beside
   * each other in the zone, so they read as one pair rather than as two weights.
   * Re-point it where the send is the page's primary action.
   * @defaultValue 'outlined'
   */
  appearance?: ButtonAppearance;
  /**
   * Button color variant.
   * @defaultValue 'neutral'
   */
  variant?: ButtonVariant;
  classNames?: ClassNamesMap<UploadSubmitSlot>;
  slotProps?: SlotPropsMap<UploadSubmitSlot>;
}

/**
 * Optional "upload" button. The component does not perform the network upload
 * (out of scope) — wire it through `onClick`. Disabled while there are no files
 * or when the upload is disabled; read-only leaves it working, since handing a
 * fixed list upstream does not change it.
 */
export type UploadSubmitProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, UploadSubmitOwnProps>;

export interface UploadListOwnProps {
  /**
   * The rows. A function receives the current files and returns them (the usual
   * form — the consumer owns the map, so each `Upload.Item` gets its `file` and
   * every action closes over it). Plain nodes are rendered as authored. Omit it
   * for a default `Upload.Item` per file.
   */
  children?: ReactNode | ((files: UploadFile[]) => ReactNode);
  classNames?: ClassNamesMap<UploadListSlot>;
  slotProps?: SlotPropsMap<UploadListSlot>;
}

/**
 * File list region. Renders nothing while empty; otherwise its children (or a
 * default row per file).
 */
export type UploadListProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, UploadListOwnProps>;

export interface UploadItemOwnProps {
  /** The file this row renders. Also what its `Upload.ItemAction` children read. */
  file: UploadFile;
  /**
   * Action controls (`Upload.ItemAction`), wrapped in a default
   * `Upload.ItemActions` for you — and *replacing* its default download + remove
   * pair rather than joining it. Composing `Upload.ItemPreview`,
   * `Upload.ItemContent`, or `Upload.ItemActions` replaces that region instead,
   * each hoisted into its own position wherever it is written; with an
   * `Upload.ItemActions` composed, anything else stays where it was written.
   */
  children?: ReactNode;
  classNames?: ClassNamesMap<UploadItemSlot>;
  slotProps?: SlotPropsMap<UploadItemSlot>;
}

/**
 * Per-file row, in three regions: preview · content · actions. Every region has
 * a default, so a bare row with only `file` is complete. Mirrors the entry's
 * `status` as `data-status`.
 */
export type UploadItemProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, UploadItemOwnProps>;

export interface UploadItemContentOwnProps {
  /**
   * Replaces the file's details entirely — your own name/meta layout, a
   * description line, an inline error. Omit it for the default content (name,
   * size, status icon, and the progress bar while uploading).
   */
  children?: ReactNode;
  classNames?: ClassNamesMap<UploadItemContentSlot>;
  slotProps?: SlotPropsMap<UploadItemContentSlot>;
}

/**
 * The row's middle region: the file's name, its formatted size, the status icon
 * (spinner / check / warning), and the progress bar while the entry uploads —
 * all decorative inline slots of this part, styled through `classNames` /
 * `slotProps`. `Upload.Item` renders it by default, and it reads its file from
 * the surrounding row.
 */
export type UploadItemContentProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, UploadItemContentOwnProps>;

/**
 * Per-slot attribute overrides for the preview. The `image` slot renders an
 * `<img>`, so it also accepts image attributes (`alt`, `loading`, `sizes`, …) —
 * the part's own `alt=""` / `loading="lazy"` are defaults a call site can
 * replace, not invariants.
 */
export type UploadItemPreviewSlotProps = SlotPropsMap<UploadItemPreviewSlot> & {
  image?: ImgHTMLAttributes<HTMLImageElement>;
};

export interface UploadItemPreviewOwnProps {
  /**
   * Replaces the built-in thumbnail entirely — your own glyph, a video poster,
   * a rendered document page. Omit it for the default preview (image thumbnail,
   * file-type icon, or extension badge).
   */
  children?: ReactNode;
  classNames?: ClassNamesMap<UploadItemPreviewSlot>;
  slotProps?: UploadItemPreviewSlotProps;
}

/**
 * The row's thumbnail, in three branches: an image preview for image entries (a
 * local `File` through an object URL revoked on unmount/change, a remote entry
 * through its `url`), the shipped file-type icon (PDF, Word, Excel, PowerPoint,
 * JPG, PNG, MP4, TXT, ZIP), and the uppercased extension for everything else.
 * `Upload.Item` renders it by default, and it reads its file from the
 * surrounding row.
 */
export type UploadItemPreviewProps<T extends ElementType = 'span'> = PolymorphicProps<'span', T, UploadItemPreviewOwnProps>;

export interface UploadItemActionsOwnProps {
  /**
   * The row's actions. Replaces the default pair (`download` + `remove`)
   * entirely — pass the `Upload.ItemAction`s you want, in the order you want.
   */
  children?: ReactNode;
  classNames?: ClassNamesMap<UploadItemActionsSlot>;
  slotProps?: SlotPropsMap<UploadItemActionsSlot>;
}

/**
 * The row's trailing action area. `Upload.Item` renders it by default — holding
 * a download and a remove action — so it only needs composing to change that set
 * or to style / move the container itself.
 */
export type UploadItemActionsProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, UploadItemActionsOwnProps>;

export interface UploadItemActionOwnProps {
  // The type stays open on purpose, so nothing here is checked: a misspelled
  // `'donwload'` is a valid consumer action with no icon, label, or behavior.
  /**
   * Names the action, mirrored as `data-action` whatever the name is.
   *
   * Two names arrive wired, each with its own icon and label: `'download'` saves
   * the row's file (its `File` through an object URL, a preloaded entry through
   * its `url`) and stays available in read-only; `'remove'` drops the file from
   * `value` and is not rendered at all in read-only. Any other name —
   * `'preview'`, `'retry'`, `'share'` — is yours: the behavior comes from
   * `onClick`, the glyph from `children`, the wording from `label`.
   */
  action?: 'download' | 'remove' | (string & {});
  /**
   * Accessible name for the action, as a template: `{name}` stands for the
   * file's name, so `"Preview {name}"` gives `aria-label="Preview report.pdf"`
   * and icon-only actions stay labelled per file. An explicit `aria-label` wins
   * over it, and an empty one counts as unset, so a built-in action falls back
   * to the root's copy rather than losing its name.
   * @defaultValue the root's copy for the `action` (`downloadLabel` / `removeLabel`)
   */
  label?: string;
  /** Action content — typically an icon. Defaults to the `action`'s own glyph. */
  children?: ReactNode;
  /**
   * Button appearance. Defaults to the row's shape — a small, quiet icon button
   * beside the file's details — rather than Button's own default, so a text-only
   * remove or a danger-coloured one is a re-point, not a rebuild.
   * @defaultValue 'outlined'
   */
  appearance?: ButtonAppearance;
  /**
   * Button color variant.
   * @defaultValue 'neutral'
   */
  variant?: ButtonVariant;
  /**
   * Button size scale.
   * @defaultValue 'small'
   */
  size?: ButtonSize;
  classNames?: ClassNamesMap<UploadItemActionSlot>;
  slotProps?: SlotPropsMap<UploadItemActionSlot>;
}

/**
 * Per-file action control: one focusable, file-labelled button covering the
 * built-in download / remove and every consumer-wired action — preview, retry,
 * share — through `onClick`. Rendering it as `as="a" href` hands the download to
 * the platform instead. Inert when the upload is disabled, or when the call site
 * disables this one action.
 */
export type UploadItemActionProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, UploadItemActionOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Upload: import('../../core').ComponentThemeConfig<UploadProps, UploadSlot>;
    UploadDropzone: import('../../core').ComponentThemeConfig<UploadDropzoneProps, UploadDropzoneSlot>;
    UploadTrigger: import('../../core').ComponentThemeConfig<UploadTriggerProps, UploadTriggerSlot>;
    UploadSubmit: import('../../core').ComponentThemeConfig<UploadSubmitProps, UploadSubmitSlot>;
    UploadList: import('../../core').ComponentThemeConfig<UploadListProps, UploadListSlot>;
    UploadItem: import('../../core').ComponentThemeConfig<UploadItemProps, UploadItemSlot>;
    UploadItemContent: import('../../core').ComponentThemeConfig<UploadItemContentProps, UploadItemContentSlot>;
    UploadItemPreview: import('../../core').ComponentThemeConfig<UploadItemPreviewProps, UploadItemPreviewSlot, UploadItemPreviewSlotProps>;
    UploadItemActions: import('../../core').ComponentThemeConfig<UploadItemActionsProps, UploadItemActionsSlot>;
    UploadItemAction: import('../../core').ComponentThemeConfig<UploadItemActionProps, UploadItemActionSlot>;
  }
}
