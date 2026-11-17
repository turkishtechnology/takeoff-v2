import { useEffect, useRef, type ElementType, type FormEvent, type KeyboardEvent, type ReactNode, type Ref } from 'react';

import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';
import { EditIconOutlinedRounded } from '@takeoff-icons/react/edit';
import { SendIconFilledRounded } from '@takeoff-icons/react/send';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';
import { Input } from '../input';

import { ChatComposerBase } from './base';
import { useChatContext } from './context';
import { isComposing, slotAttrsFor } from './helpers';
import type { ChatComposerOwnProps, ChatComposerProps } from './types';

type ChatComposerResolvedProps = Omit<ChatComposerOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export const ChatComposer = <T extends ElementType = 'form'>(props: ChatComposerProps<T>) => {
  const theme = useComponentTheme('ChatComposer');
  const { labels, disabled, readOnly, editing, startEditing, stopEditing, submit, messages, currentUserId, canEdit, composerFieldRef } = useChatContext('Chat.Composer');

  const { rootAttrs, rest } = composeRootAttrs(ChatComposerBase, props as ChatComposerProps<'form'>, theme, {
    stateAttrs: () => ({ 'data-editing': editing ? '' : undefined }),
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
    children: _children,
    ref,
    onSubmit,
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

  const canSend = !disabled && draft.trim() !== '';

  const send = () => {
    if (!canSend) return;
    const wasEditing = Boolean(editing);
    // Keep focus in the field: the send button disables itself once the draft clears.
    if (submit(draft) && !wasEditing) setDraft('');
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

  const Component = (as ?? 'form') as ElementType;

  return (
    <Component
      {...nativeProps}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit?.(event);
        send();
      }}
      {...rootAttrs}
      ref={ref}
    >
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
      <div {...slot('controls')}>
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
    </Component>
  );
};

ChatComposer.displayName = 'Chat.Composer';
