import { createSafeContext } from '../../hooks';

import type { UploadFile, UploadFileStatus } from './types';

export interface UploadContextValue {
  /** The current committed files. */
  files: UploadFile[];
  /** Resolved disabled state (own prop or inherited from a surrounding `Field`). */
  disabled: boolean;
  /** Resolved read-only state — files render and download, but add/remove is blocked. */
  readOnly: boolean;
  /** Resolved invalid state (own prop or `Field`); mirrored as `data-invalid`. */
  invalid: boolean;
  /** The `accept` list, shared with the dropzone's drag-state hint and the hidden input. */
  accept?: string;
  /** Whether more than one file may be held. */
  multiple: boolean;
  /** Opens the native file picker (no-op when disabled/read-only). */
  openFileDialog: () => void;
  /** Removes a file (by id) from `value` (no-op when disabled/read-only). */
  removeFile: (id: string) => void;
  /** Validates an incoming batch and commits the accepted files (no-op when disabled/read-only). */
  processFiles: (files: FileList | File[]) => void;
  /**
   * The row's support text, resolved from the root's four status label props
   * over the shipped English defaults. Keyed by the status it stands for so a
   * row looks one up rather than branching on it; `idle` has none, since a file
   * just sitting in the list needs no commentary.
   *
   * The copy reaches the parts through context because the wording is one per
   * control, not per row — and the parts that render it are the ones
   * `Upload.Item` supplies by default, with no call site to pass it through.
   */
  statusLabels: Record<Exclude<UploadFileStatus, 'idle'>, string>;
  /** Accessible-name template for a row's progress bar, resolved from the root (guaranteed non-empty). */
  progressLabel: string;
  /** Accessible-name template for the built-in download action, resolved from the root (guaranteed non-empty). */
  downloadLabel: string;
  /** Accessible-name template for the built-in remove action, resolved from the root (guaranteed non-empty). */
  removeLabel: string;
}

export interface UploadItemContextValue {
  /** The file this row renders, published by `Upload.Item` for its actions. */
  item: UploadFile;
}

export const [UploadProvider, useUploadContext] = createSafeContext<UploadContextValue>('UploadProvider');
export const [UploadItemProvider, useUploadItemContext] = createSafeContext<UploadItemContextValue>('UploadItemProvider');
