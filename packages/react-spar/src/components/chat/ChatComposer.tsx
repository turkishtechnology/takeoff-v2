import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
  type ElementType,
  type FormEvent,
  type KeyboardEvent,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from 'react';

import { AttachIconOutlinedRounded } from '@takeoff-icons/react/attach';

import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';
import { EditIconOutlinedRounded } from '@takeoff-icons/react/edit';
import { SendIconFilledRounded } from '@takeoff-icons/react/send';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';
import { Input } from '../input';
import { Upload } from '../upload';
import { useUploadContext } from '../upload/context';
import { dragStateFor, type DragState } from '../upload/helpers';

import { ChatComposerBase } from './base';
import { useChatContext } from './context';
import { isComposing, slotAttrsFor } from './helpers';
import type { ChatAttachment, ChatComposerOwnProps, ChatComposerProps } from './types';

type ChatComposerResolvedProps = Omit<ChatComposerOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onDragOver?: (event: DragEvent<HTMLFormElement>) => void;
  onDragLeave?: (event: DragEvent<HTMLFormElement>) => void;
  onDrop?: (event: DragEvent<HTMLFormElement>) => void;
};

type Intake = (files: FileList | File[]) => void;

/**
 * Hands the Upload root's file intake — the same validation as its trigger —
 * to the composer's drop and paste handlers, which sit outside it.
 */
const UploadIntake = ({ intake }: { intake: MutableRefObject<Intake | null> }) => {
  const { processFiles } = useUploadContext('Chat.Composer');
  useEffect(() => {
    intake.current = processFiles;
    return () => {
      intake.current = null;
    };
  }, [intake, processFiles]);
  return null;
};

/** Opens the Upload root's file picker; an icon button like the composer's others. */
const AttachButton = (props: { 'aria-label': string; 'className'?: string }) => {
  const { openFileDialog, disabled } = useUploadContext('Chat.Composer');
  return (
    <Button
      {...props}
      type="button"
      variant="neutral"
      appearance="text"
      rounded
      disabled={disabled}
      startContent={<AttachIconOutlinedRounded aria-hidden="true" focusable="false" />}
      onClick={openFileDialog}
    />
  );
};

const carriesFiles = (event: DragEvent) => Array.from(event.dataTransfer.types).includes('Files');

export const ChatComposer = <T extends ElementType = 'form'>(props: ChatComposerProps<T>) => {
  const theme = useComponentTheme('ChatComposer');
  const { labels, disabled, readOnly, editing, startEditing, stopEditing, submit, messages, currentUserId, canEdit, composerFieldRef } = useChatContext('Chat.Composer');

  const [files, setFiles] = useState<ChatAttachment[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const intake = useRef<Intake | null>(null);

  const { rootAttrs, rest } = composeRootAttrs(ChatComposerBase, props as ChatComposerProps<'form'>, theme, {
    stateAttrs: () => ({ 'data-editing': editing ? '' : undefined, 'data-drag-state': dragState ?? undefined }),
  });
  const {
    as,
    value,
    defaultValue,
    onValueChange,
    maxLength,
    placeholder,
    startContent,
    endContent,
    allowAttachments = false,
    accept,
    maxFileSize,
    maxFileCount,
    onFilesReject,
    children: _children,
    ref,
    onSubmit,
    onDragOver,
    onDragLeave,
    onDrop,
    ...nativeProps
  } = rest as ChatComposerResolvedProps;
  const slot = slotAttrsFor(ChatComposerBase, theme, props);

  const [draft = '', setDraft] = useControllableState(value, defaultValue ?? '', onValueChange);

  // Editing borrows the field: the draft is put aside, the message's text
  // loaded, and the draft given back when the edit is saved or cancelled.
  const setDraftRef = useRef(setDraft);
  setDraftRef.current = setDraft;
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const savedDraft = useRef('');
  const previousEditingId = useRef<string | undefined>(undefined);
  const editingId = editing?.id;
  const editingText = editing?.text;
  useEffect(() => {
    const was = previousEditingId.current;
    if (was === editingId) return;
    previousEditingId.current = editingId;
    if (editingId === undefined) {
      setDraftRef.current(savedDraft.current);
      savedDraft.current = '';
      return;
    }
    if (was === undefined) savedDraft.current = draftRef.current;
    setDraftRef.current(editingText ?? '');
    // After the menu that started the edit has handed focus back to its trigger.
    const timer = setTimeout(() => {
      const field = composerFieldRef.current;
      field?.focus();
      field?.setSelectionRange(field.value.length, field.value.length);
    });
    return () => clearTimeout(timer);
  }, [editingId, editingText, composerFieldRef]);

  if (readOnly) return null;

  // Files wait while a message is edited: an edit changes text only.
  const attachable = allowAttachments && !editing && !disabled;
  const canSend = !disabled && (draft.trim() !== '' || (attachable && files.length > 0));

  const send = () => {
    if (!canSend) return;
    const wasEditing = Boolean(editing);
    // Keep focus in the field: the send button disables itself once the draft clears.
    if (submit(draft, attachable ? files : []) && !wasEditing) {
      setDraft('');
      setFiles([]);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const pasted = Array.from(event.clipboardData.files);
    if (!attachable || pasted.length === 0) return;
    event.preventDefault();
    intake.current?.(pasted);
  };

  const cancelEditing = () => {
    stopEditing();
    composerFieldRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isComposing(event)) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    } else if (event.key === 'Escape' && editing) {
      // Leaves editing without also closing a surrounding Drawer or Dialog.
      event.preventDefault();
      event.stopPropagation();
      cancelEditing();
    } else if (event.key === 'ArrowUp' && !editing && draft === '') {
      const lastEditable = [...messages].reverse().find(message => message.senderId === currentUserId && canEdit(message));
      if (lastEditable) {
        event.preventDefault();
        startEditing(lastEditable);
      }
    }
  };

  const fields = (
    <>
      {editing && (
        <div {...slot('editing')}>
          <EditIconOutlinedRounded aria-hidden="true" focusable="false" />
          <span>
            <strong>{labels.editing}</strong> <span>{editing.text}</span>
          </span>
          <Button
            {...slot('cancel')}
            type="button"
            variant="neutral"
            appearance="text"
            size="small"
            rounded
            aria-label={labels.cancelEdit}
            startContent={<CloseIconOutlinedRounded aria-hidden="true" focusable="false" />}
            onClick={cancelEditing}
          />
        </div>
      )}
      {attachable && (
        <Upload.List {...slot('attachments')} role="group" aria-label={labels.attachments}>
          {items =>
            items.map(item => (
              <Upload.Item key={item.id} file={item}>
                <Upload.ItemAction action="remove" />
              </Upload.Item>
            ))
          }
        </Upload.List>
      )}
      <div {...slot('controls')}>
        {allowAttachments && <AttachButton {...slot('attach')} aria-label={labels.attach} />}
        {startContent}
        <Input disabled={disabled}>
          <Input.Field
            as="textarea"
            ref={composerFieldRef}
            rows={1}
            value={draft}
            maxLength={maxLength}
            placeholder={placeholder ?? labels.placeholder}
            // While editing, the field is named after what it is doing, so
            // moving focus into it says so.
            aria-label={editing ? labels.editing : (placeholder ?? labels.placeholder)}
            onChange={(event: { target: { value: string } }) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />
        </Input>
        {endContent}
        <Button
          {...slot('send')}
          type="submit"
          variant="primary"
          rounded
          disabled={!canSend}
          aria-label={editing ? labels.save : labels.send}
          startContent={editing ? <CheckIconOutlinedRounded aria-hidden="true" focusable="false" /> : <SendIconFilledRounded aria-hidden="true" focusable="false" />}
        />
      </div>
    </>
  );

  const Component = (as ?? 'form') as ElementType;

  return (
    <Component
      {...nativeProps}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit?.(event);
        send();
      }}
      // A composer that takes files claims every file drop, even while it
      // cannot use one (editing, disabled): unclaimed, the browser would open
      // the file in place of the app. Upload's dropzone does the same.
      onDragOver={(event: DragEvent<HTMLFormElement>) => {
        onDragOver?.(event);
        if (!allowAttachments || !carriesFiles(event)) return;
        event.preventDefault();
        setDragState(attachable ? dragStateFor(event, accept) : 'reject');
      }}
      onDragLeave={(event: DragEvent<HTMLFormElement>) => {
        onDragLeave?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragState(null);
      }}
      onDrop={(event: DragEvent<HTMLFormElement>) => {
        onDrop?.(event);
        setDragState(null);
        if (!allowAttachments || !carriesFiles(event)) return;
        event.preventDefault();
        if (attachable) intake.current?.(event.dataTransfer.files);
      }}
      {...rootAttrs}
      ref={ref}
    >
      {allowAttachments ? (
        <Upload
          {...slot('upload')}
          multiple
          value={files}
          onValueChange={setFiles}
          accept={accept}
          maxFileSize={maxFileSize}
          maxFileCount={maxFileCount}
          onFilesReject={onFilesReject}
          disabled={!attachable}
          removeLabel={labels.removeAttachment}
          downloadLabel={labels.downloadAttachment}
          uploadingLabel={labels.uploading}
          errorLabel={labels.uploadFailed}
          progressLabel={labels.uploadProgress}
        >
          <UploadIntake intake={intake} />
          {fields}
        </Upload>
      ) : (
        fields
      )}
    </Component>
  );
};

ChatComposer.displayName = 'Chat.Composer';
