import { useCallback, useEffect, useId, useMemo, useRef, useState, type ElementType, type ReactNode, type Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useControllableState } from '../../hooks';
import { useComponentTheme } from '../../provider';
import { resolveLabels, visuallyHidden } from '../../utils';

import { ChatBase } from './base';
import { ChatProvider, type ChatContextValue, type ComposerField } from './context';
import { COPIED_MS, DEFAULT_LABELS, HIGHLIGHT_MS, UNDO_WINDOW_MS } from './defaults';
import { isWithinWindow, nextWindowClose } from './helpers';
import type { ChatAttachment, ChatMessage, ChatOwnProps, ChatProps } from './types';

type ChatResolvedProps = Omit<ChatOwnProps, 'classNames' | 'slotProps'> & {
  'as'?: ElementType;
  'children'?: ReactNode;
  'ref'?: Ref<Element>;
  'aria-labelledby'?: string;
};

// setTimeout overflows above this and fires at once.
const MAX_TIMEOUT_MS = 2_147_483_647;

const EMPTY_TYPING: string[] = [];
const EMPTY_IDS: string[] = [];
const EMPTY_PARTICIPANTS: NonNullable<ChatOwnProps['participants']> = [];
const NO_PENDING: ReadonlySet<string> = new Set();

interface PendingDelete {
  message: ChatMessage;
  timer: ReturnType<typeof setTimeout>;
}

export const Chat = <T extends ElementType = 'section'>(props: ChatProps<T>) => {
  const theme = useComponentTheme('Chat');
  const titleId = useId();
  const [labelledBy, setLabelledBy] = useState<string | null>(null);
  const [hasConversationList, setHasConversationList] = useState(false);

  // `labels` is merged per key, not taken from the shallow props merge, so a
  // provider-level translation survives an instance overriding one string.
  const themeLabels = theme?.defaultProps?.labels;
  const labels = useMemo(() => resolveLabels(DEFAULT_LABELS, themeLabels, props.labels), [themeLabels, props.labels]);

  const { rootAttrs, rest } = composeRootAttrs(ChatBase, props as ChatProps<'section'>, theme);
  const {
    messages,
    currentUserId,
    participants = EMPTY_PARTICIPANTS,
    onSend,
    allowReplies = true,
    allowCopy = true,
    pinnedIds = EMPTY_IDS,
    onPinChange,
    onEdit,
    onDelete,
    onRetry,
    onRead,
    editWindow,
    deleteWindow,
    undoWindow = UNDO_WINDOW_MS,
    typing = EMPTY_TYPING,
    hasOlder = false,
    isLoadingOlder = false,
    onLoadOlder,
    'conversationId': ownConversationId,
    defaultConversationId,
    onConversationChange,
    disabled = false,
    readOnly = false,
    locale,
    'labels': _labels,
    as,
    children,
    ref,
    'aria-labelledby': ariaLabelledBy,
    ...nativeProps
  } = rest as ChatResolvedProps;

  const [conversationId = null, setConversationId] = useControllableState<string | null>(ownConversationId, defaultConversationId ?? null, onConversationChange);

  // The edit/delete windows close on their own, without a new prop. Re-render
  // at the next closing moment so the actions disappear on time.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const own = messages.filter(message => message.senderId === currentUserId && !message.deleted);
    const next = nextWindowClose(own, [onEdit ? editWindow : undefined, onDelete ? deleteWindow : undefined], Date.now());
    if (next === undefined) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(next - Date.now() + 1, MAX_TIMEOUT_MS));
    return () => clearTimeout(timer);
  }, [messages, currentUserId, editWindow, deleteWindow, onEdit, onDelete, now]);

  const participantMap = useMemo(() => new Map(participants.map(participant => [participant.id, participant])), [participants]);
  const isGroup = participants.filter(participant => participant.id !== currentUserId).length > 1;
  const typingNames = typing.filter(id => id !== currentUserId).map(id => participantMap.get(id)?.name ?? id);

  const stickToBottom = useRef(true);
  const composerFieldRef = useRef<ComposerField | null>(null);
  const focusComposer = useCallback(() => composerFieldRef.current?.focus(), []);

  // Deletes wait out `undoWindow` before `onDelete` runs. The timers live in a
  // ref so a commit always reaches the latest `onDelete`.
  const [pendingDeletes, setPendingDeletes] = useState(NO_PENDING);
  const pending = useRef(new Map<string, PendingDelete>());
  const undoButtons = useRef(new Map<string, HTMLElement | null>());
  const onDeleteRef = useRef(onDelete);
  useEffect(() => {
    onDeleteRef.current = onDelete;
  }, [onDelete]);

  /** Ends a pending delete, by Undo or once its window has passed. */
  const settle = useCallback(
    (id: string) => {
      clearTimeout(pending.current.get(id)?.timer);
      pending.current.delete(id);
      // Its Undo button is about to go; keep focus inside the chat.
      if (undoButtons.current.get(id) === document.activeElement) focusComposer();
      undoButtons.current.delete(id);
      setPendingDeletes(previous => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
    },
    [focusComposer],
  );

  // A chat closed during the undo window still deletes what the user deleted.
  useEffect(() => {
    const entries = pending.current;
    return () => {
      entries.forEach(({ message, timer }) => {
        clearTimeout(timer);
        onDeleteRef.current?.(message);
      });
      entries.clear();
    };
  }, []);

  const interactive = !disabled && !readOnly;
  const isLive = (message: ChatMessage) => message.senderId === currentUserId && !message.deleted && !pendingDeletes.has(message.id);
  // A files-only message has no text to edit.
  const isEditable = (message: ChatMessage) => isLive(message) && message.text.trim() !== '' && message.status !== 'sending' && message.status !== 'failed';
  const canEdit = (message: ChatMessage) => interactive && Boolean(onEdit) && isEditable(message) && isWithinWindow(message, editWindow, now);
  const canDelete = (message: ChatMessage) => interactive && Boolean(onDelete) && isLive(message) && message.status !== 'sending' && isWithinWindow(message, deleteWindow, now);

  // Anyone's message can be answered once it has reached the server.
  const canReply = (message: ChatMessage) =>
    interactive && allowReplies && Boolean(onSend) && !message.deleted && !pendingDeletes.has(message.id) && message.status !== 'sending' && message.status !== 'failed';

  const [editingId, setEditingId] = useState<string | null>(null);
  const editingMessage = editingId === null ? undefined : messages.find(message => message.id === editingId);
  // An edit ends by itself when its message goes away, is deleted, or leaves
  // the edit window while the user is still typing.
  const editing = editingMessage && canEdit(editingMessage) ? editingMessage : undefined;

  // A reply ends the same way when its message can no longer be answered.
  // Editing and replying share the composer, so starting one ends the other.
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const replyingMessage = replyingId === null || editing ? undefined : messages.find(message => message.id === replyingId);
  const replying = replyingMessage && canReply(replyingMessage) ? replyingMessage : undefined;

  // Pins live on the server: `onPinChange` turns them on, like `onEdit`.
  const canPin = (message: ChatMessage) =>
    interactive && Boolean(onPinChange) && !message.deleted && !pendingDeletes.has(message.id) && message.status !== 'sending' && message.status !== 'failed';
  const isPinned = (message: ChatMessage) => pinnedIds.includes(message.id);

  // Copy changes nothing, so it stays on in a read-only or disabled chat.
  const canCopy = (message: ChatMessage) =>
    allowCopy && !message.deleted && !pendingDeletes.has(message.id) && message.text.trim() !== '' && typeof navigator !== 'undefined' && Boolean(navigator.clipboard);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  useEffect(() => {
    if (copiedId === null) return;
    const timer = setTimeout(() => setCopiedId(null), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copiedId]);
  const copyMessage = (message: ChatMessage) => {
    // A refused write (no permission, page not focused) just shows no note.
    navigator.clipboard.writeText(message.text).then(
      () => setCopiedId(message.id),
      () => undefined,
    );
  };

  // Quotes jump to the message they answer: rows register here, and the
  // target is highlighted for a moment.
  const rows = useRef(new Map<string, Element>());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  useEffect(() => {
    if (highlightedId === null) return;
    const timer = setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  const submit = (text: string, attachments: ChatAttachment[] = []): boolean => {
    const trimmed = text.trim();
    if (!interactive) return false;
    if (editing) {
      if (trimmed === '') return false;
      if (trimmed !== editing.text) onEdit?.(editing, trimmed);
      setEditingId(null);
      return true;
    }
    if (!onSend || (trimmed === '' && attachments.length === 0)) return false;
    stickToBottom.current = true;
    onSend(trimmed, attachments, { replyTo: replying });
    setReplyingId(null);
    return true;
  };

  const deleteMessage = (message: ChatMessage) => {
    if (!canDelete(message)) return false;
    if (editingId === message.id) setEditingId(null);
    if (undoWindow <= 0) {
      onDelete?.(message);
      return false;
    }
    const timer = setTimeout(
      () => {
        settle(message.id);
        onDeleteRef.current?.(message);
      },
      Math.min(undoWindow, MAX_TIMEOUT_MS),
    );
    pending.current.set(message.id, { message, timer });
    setPendingDeletes(previous => new Set(previous).add(message.id));
    return true;
  };

  const context: ChatContextValue = {
    messages,
    currentUserId,
    participants: participantMap,
    isGroup,
    labels,
    locale,
    now,
    disabled,
    readOnly,
    typingNames,
    hasOlder,
    isLoadingOlder,
    onLoadOlder,
    onRetry,
    onRead,
    canEdit,
    canDelete,
    deleteMessage,
    pendingDeletes,
    undoDelete: settle,
    registerUndo: (id, element) => {
      undoButtons.current.set(id, element);
    },
    focusUndo: id => undoButtons.current.get(id)?.focus(),
    editing,
    startEditing: message => {
      if (!canEdit(message)) return;
      setReplyingId(null);
      setEditingId(message.id);
    },
    stopEditing: () => setEditingId(null),
    canReply,
    canCopy,
    canPin,
    pinnedIds,
    isPinned,
    setPinned: (message, pinned) => {
      if (canPin(message) && isPinned(message) !== pinned) onPinChange?.(message, pinned);
    },
    copyMessage,
    copiedId,
    replying,
    startReplying: message => {
      if (!canReply(message)) return;
      setEditingId(null);
      setReplyingId(message.id);
    },
    stopReplying: () => setReplyingId(null),
    registerRow: (id, element) => {
      if (element) rows.current.set(id, element);
      else rows.current.delete(id);
    },
    showMessage: id => {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      rows.current.get(id)?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      setHighlightedId(id);
    },
    highlightedId,
    submit,
    stickToBottom,
    focusComposer,
    composerFieldRef,
    conversationId,
    setConversationId,
    hasConversationList,
    setHasConversationList,
    titleId,
    setLabelledBy,
  };

  const Component = (as ?? 'section') as ElementType;

  return (
    <ChatProvider value={context}>
      <Component
        {...nativeProps}
        aria-labelledby={ariaLabelledBy ?? labelledBy ?? undefined}
        {...rootAttrs}
        // Split layout and which pane a narrow chat shows. The recipe only
        // reads `data-view` together with `data-layout="split"`.
        data-layout={hasConversationList ? 'split' : 'single'}
        data-view={conversationId === null ? 'list' : 'thread'}
        data-disabled={disabled ? '' : undefined}
        data-readonly={readOnly ? '' : undefined}
        ref={ref}
      >
        {/* One polite region for short confirmations, so they are read out
            without moving focus. */}
        <span role="status" style={visuallyHidden}>
          {copiedId === null ? '' : labels.copied}
        </span>
        {children}
      </Component>
    </ChatProvider>
  );
};

Chat.displayName = 'Chat';
