import { useCallback, useMemo, useRef, type ChangeEvent, type ElementType, type ReactNode, type Ref } from 'react';
import { InputField as SparInputField, useOptionalFieldContext } from '@turkish-technology/spar';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';

import { UploadBase } from './base';
import { UploadProvider, type UploadContextValue } from './context';
import {
  DEFAULT_COMPLETED_LABEL,
  DEFAULT_DIRECTORY,
  DEFAULT_DOWNLOAD_LABEL,
  DEFAULT_ERROR_LABEL,
  DEFAULT_MULTIPLE,
  DEFAULT_PROCESSING_LABEL,
  DEFAULT_PROGRESS_LABEL,
  DEFAULT_REMOVE_LABEL,
  DEFAULT_UPLOADING_LABEL,
} from './defaults';
import { createUploadFile, fileKey, validateFiles } from './helpers';
import type { UploadFile, UploadOwnProps, UploadProps } from './types';

type UploadResolvedProps = Omit<UploadOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
};

export const Upload = <T extends ElementType = 'div'>(props: UploadProps<T>) => {
  const theme = useComponentTheme('Upload');
  // Composing inside a Field wires the shared control state for free; direct
  // props still win over the inherited values (Slider precedent).
  const field = useOptionalFieldContext();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // No `stateAttrs` here: the three states this root emits are each an
  // `own prop ?? Field` fallback that the parts and the context need resolved
  // too, and `stateAttrs` only sees the merged props — deriving them there as
  // well would give one rule two implementations, free to drift the moment a
  // third source (a form, a nested Field) joins the precedence. They are
  // resolved once below and written at the render site instead, after
  // `rootAttrs`, which keeps the invariant `stateAttrs` exists for: consumer
  // `slotProps.root` cannot override them.
  const { rootAttrs, rest } = composeRootAttrs(UploadBase, props as UploadProps<'div'>, theme);

  const {
    value,
    defaultValue,
    onValueChange,
    accept,
    multiple: ownMultiple = DEFAULT_MULTIPLE,
    directory = DEFAULT_DIRECTORY,
    maxFileSize,
    maxFileCount,
    onFileAccept,
    onFilesReject,
    // The status four resolve here, at the destructure site: `??`, so an empty
    // one is honoured and the support line goes away with its glyph.
    uploadingLabel = DEFAULT_UPLOADING_LABEL,
    processingLabel = DEFAULT_PROCESSING_LABEL,
    completedLabel = DEFAULT_COMPLETED_LABEL,
    errorLabel = DEFAULT_ERROR_LABEL,
    // The accessible-name three cannot resolve here — see below.
    progressLabel: ownProgressLabel,
    downloadLabel: ownDownloadLabel,
    removeLabel: ownRemoveLabel,
    disabled: ownDisabled,
    readOnly: ownReadOnly,
    invalid: ownInvalid,
    as,
    children,
    ref,
    ...nativeProps
  } = rest as UploadResolvedProps;

  // A folder always yields a batch, so `directory` implies `multiple` —
  // otherwise every file but the first would be rejected as `too-many-files`.
  const multiple = ownMultiple || directory;
  const disabled = ownDisabled ?? field?.disabled ?? false;
  const readOnly = ownReadOnly ?? field?.readOnly ?? false;
  const invalid = ownInvalid ?? field?.invalid ?? false;

  const [files = [], setFiles] = useControllableState<UploadFile[]>(value, defaultValue ?? [], onValueChange);

  // The array the next write builds on, rather than the one this render closed
  // over. Both writes below derive a whole new array from the current one, and
  // two of them can land in a single tick — a "remove all" loop clicking every
  // row's remove button, or a drop arriving while one is being removed. Each
  // would derive from the same render's `files` and the last one to commit would
  // put back everything the others took out, so the base is read through a ref
  // that the commit itself moves forward. `useControllableState` takes a value
  // rather than an updater, which is why the previous array is threaded here
  // instead of being asked for at the point of the write.
  const latestFiles = useRef(files);
  latestFiles.current = files;

  const commitFiles = useCallback(
    (next: UploadFile[]) => {
      latestFiles.current = next;
      setFiles(next);
    },
    [setFiles],
  );

  const processFiles = useCallback(
    (incoming: FileList | File[]) => {
      if (disabled || readOnly) return;
      const list = Array.from(incoming);
      if (list.length === 0) return;
      const current = latestFiles.current;

      // Drop files already held (and intra-batch duplicates) so a re-drop of the
      // same file is a no-op rather than a duplicate row. Remote entries (no
      // `file`) never collide with a freshly picked File. This runs *before*
      // validation, not after: a duplicate is not a file the upload is turning
      // away, so it must not consume a count slot or be reported as
      // `too-many-files` — re-dropping the one file a `maxFileCount={1}` upload
      // already holds is a no-op, not a limit breach.
      const seen = new Set(current.filter(entry => entry.file).map(entry => fileKey(entry.file as File)));
      const fresh = list.filter(file => {
        const key = fileKey(file);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const { accepted, rejected } = validateFiles(fresh, { accept, maxFileSize, maxFileCount, multiple, currentCount: current.length });

      // What actually lands in the value: accepted files wrapped into UploadFile
      // entries with `status: 'idle'`. A non-multiple upload can only ever have
      // one of them — `validateFiles` gives that case a single slot — and it
      // replaces rather than appends.
      const added = accepted.map(createUploadFile);

      if (added.length > 0) {
        commitFiles(multiple ? [...current, ...added] : added);
        onFileAccept?.(added);
      }
      if (rejected.length > 0) {
        onFilesReject?.(rejected);
      }
    },
    [disabled, readOnly, accept, maxFileSize, maxFileCount, multiple, commitFiles, onFileAccept, onFilesReject],
  );

  const openFileDialog = useCallback(() => {
    if (disabled || readOnly) return;
    inputRef.current?.click();
  }, [disabled, readOnly]);

  const removeFile = useCallback(
    (id: string) => {
      if (disabled || readOnly) return;
      commitFiles(latestFiles.current.filter(entry => entry.id !== id));
      // Clearing the native input lets the same file be re-selected after removal.
      if (inputRef.current) inputRef.current.value = '';
    },
    [disabled, readOnly, commitFiles],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files ?? []);
    // Reset so selecting the same file again still fires `change`.
    event.target.value = '';
  };

  // `||` rather than the `??` the status four get: an accessible name emptied at
  // the call site is a missing one, not a request for a silent control, so the
  // shipped default takes over. Silencing visible copy is a legitimate choice
  // (the status line goes away, Stepper's rule); leaving a button that announces
  // itself as nothing is not one a consumer means. Also catches an explicit
  // `undefined`, which a partial dictionary lookup produces.
  const progressLabel = ownProgressLabel || DEFAULT_PROGRESS_LABEL;
  const downloadLabel = ownDownloadLabel || DEFAULT_DOWNLOAD_LABEL;
  const removeLabel = ownRemoveLabel || DEFAULT_REMOVE_LABEL;

  const contextValue = useMemo<UploadContextValue>(
    () => ({
      files,
      disabled,
      readOnly,
      invalid,
      accept,
      multiple,
      openFileDialog,
      removeFile,
      processFiles,
      // Keyed by the status it stands for, so a row looks one up rather than
      // mapping names to states. Built inside this memo rather than one of its
      // own: it changes exactly when the four strings do, which is when the
      // context is rebuilt anyway.
      statusLabels: { uploading: uploadingLabel, processing: processingLabel, completed: completedLabel, error: errorLabel },
      progressLabel,
      downloadLabel,
      removeLabel,
    }),
    [
      files,
      disabled,
      readOnly,
      invalid,
      accept,
      multiple,
      openFileDialog,
      removeFile,
      processFiles,
      uploadingLabel,
      processingLabel,
      completedLabel,
      errorLabel,
      progressLabel,
      downloadLabel,
      removeLabel,
    ],
  );

  const Component = (as ?? 'div') as ElementType;

  // `nativeProps` is the leftover HTML surface; the resolved shape above only
  // models the component's own props, so the attributes read back here are
  // typed at the point of use.
  const htmlProps = nativeProps as { 'id'?: string; 'role'?: string; 'aria-label'?: string; 'aria-labelledby'?: string; 'aria-describedby'?: string };

  // No single element in the anatomy *is* the control (the real input is hidden
  // and `aria-hidden`), so the root is the control's region: `role="group"`
  // gives the Field's label something to name and its description/error
  // something to describe — the range-Slider precedent. Consumer attributes
  // still win. It also claims the Field's `fieldId`, so `Field.Label`'s
  // `htmlFor` resolves to the region instead of dangling. That id deliberately
  // does NOT go on the Trigger: `<label for>` treats a button as labelable, so
  // the label's text would replace the Trigger's own accessible name ("Choose
  // file" → "Attachments") — the region already carries the field's name.
  // `aria-labelledby` outranks `aria-label`, so the inherited one is only
  // applied when the consumer named the region no other way — otherwise the
  // Field's label would silently override their `aria-label`.
  const named = htmlProps['aria-label'] !== undefined || htmlProps['aria-labelledby'] !== undefined;
  const groupAttrs = {
    'id': htmlProps.id ?? field?.fieldId,
    'role': htmlProps.role ?? 'group',
    'aria-labelledby': named ? htmlProps['aria-labelledby'] : field?.labelId,
    // Mirrors Spar's own controls: the error message replaces the description
    // while invalid, rather than both being announced.
    'aria-describedby': htmlProps['aria-describedby'] ?? (invalid ? field?.errorId : field?.descriptionId),
  };

  // Only states the recipe actually consumes are emitted (data-attribute-
  // vocabulary rule 9): disabled/readonly/invalid, each read off the one
  // resolution above rather than derived a second time. `data-status` is
  // per-file, so it sits on `Upload.Item` rather than here.
  // Written as presence-or-absent rather than as `'' | undefined` values, which
  // is what `composeRootAttrs` did with them: an attribute this root is not
  // asserting must be left alone, not set to `undefined` on top of whatever a
  // consumer's `slotProps.root` put there.
  const stateAttrs = {
    ...(disabled ? { 'data-disabled': '' } : null),
    ...(readOnly ? { 'data-readonly': '' } : null),
    ...(invalid ? { 'data-invalid': '' } : null),
  };

  return (
    <UploadProvider value={contextValue}>
      <Component {...nativeProps} {...groupAttrs} {...rootAttrs} {...stateAttrs} ref={ref}>
        {children}
        {/* The single hidden input every Trigger clicks; kept on the root so a
            Trigger placed anywhere in the anatomy can open it. Spar's headless
            InputField is used rather than a bare `<input>` (upstream-first
            rule); it renders one element and works standalone — no Input root,
            so it stays out of the Field's ID/ARIA wiring, which a hidden,
            `aria-hidden` control must not claim. It carries no `data-slot`
            either: `UploadSlot` is `'root'` alone, and a node a consumer cannot
            reach through `classNames` / `slotProps` must not advertise itself
            as one it can. takeoff-v2's own `Input` is
            deliberately NOT used: its root is visual chrome (`tk-input` row,
            `data-size`) and its `Input.Field` throws outside that root. */}
        <SparInputField
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          // `webkitdirectory` is what every current browser keys folder browsing
          // off. It is absent from React's DOM typings, so it is spread in as a
          // plain attribute — and only when on, since presence is what counts.
          {...(directory ? { webkitdirectory: '' } : null)}
          // Read-only blocks adding by every route, not just the Trigger: a
          // consumer-owned label or a programmatic `.click()` must not open the
          // picker either. Note there is no `required` here (or on the root):
          // a hidden required input is unfocusable, so the browser aborts
          // submission with "An invalid form control is not focusable" instead
          // of validating — so the flag has nowhere useful to land, and
          // `Field.Label` already draws the asterisk from `Field`'s own state.
          disabled={disabled || readOnly}
          onChange={handleInputChange}
          hidden
          tabIndex={-1}
          aria-hidden="true"
        />
      </Component>
    </UploadProvider>
  );
};

Upload.displayName = 'Upload';
