import { createContext, useContext, type MutableRefObject } from 'react';

import { createSafeContext } from '../../hooks';

import type { ChatAttachment, ChatLabels, ChatMessage, ChatParticipant } from './types';

/** Input.Field types its ref for both its input and textarea forms. */
export type ComposerField = HTMLInputElement & HTMLTextAreaElement;

export interface ChatContextValue {
  messages: ChatMessage[];
  currentUserId: string;
  /** Participants by id, for names and avatars. */
  participants: Map<string, ChatParticipant>;
  /** More than one other participant: incoming messages show their author. */
  isGroup: boolean;
  labels: ChatLabels;
  locale: string | undefined;
  /** Clock the edit/delete windows are measured against; moves when a window closes. */
  now: number;
  disabled: boolean;
  readOnly: boolean;
  /** Names of the participants typing right now. */
  typingNames: string[];
  hasOlder: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: (() => void) | undefined;
  onRetry: ((message: ChatMessage) => void) | undefined;
  onRead: ((messages: ChatMessage[]) => void) | undefined;
  canEdit: (message: ChatMessage) => boolean;
  canDelete: (message: ChatMessage) => boolean;
  /**
   * Deletes a message: at once, or after `undoWindow` while it can be
   * restored. Returns whether the delete is waiting for that window.
   */
  deleteMessage: (message: ChatMessage) => boolean;
  /** Messages deleted by the user whose `onDelete` waits for `undoWindow` to pass. */
  pendingDeletes: ReadonlySet<string>;
  /** Restores a message whose delete is still pending. */
  undoDelete: (id: string) => void;
  /** Registers a pending message's Undo button, so focus can go there after Delete. */
  registerUndo: (id: string, element: HTMLElement | null) => void;
  /** Focuses a pending message's Undo button. */
  focusUndo: (id: string) => void;
  canReply: (message: ChatMessage) => boolean;
  canCopy: (message: ChatMessage) => boolean;
  canPin: (message: ChatMessage) => boolean;
  /** Pinned message ids, oldest pin first. */
  pinnedIds: string[];
  isPinned: (message: ChatMessage) => boolean;
  /** Pins or unpins a message through `onPinChange`. */
  setPinned: (message: ChatMessage, pinned: boolean) => void;
  /** Copies a message's text to the clipboard and confirms it. */
  copyMessage: (message: ChatMessage) => void;
  /** The message whose text was just copied. */
  copiedId: string | null;
  /** The message the composer is answering, if any. */
  replying: ChatMessage | undefined;
  startReplying: (message: ChatMessage) => void;
  stopReplying: () => void;
  /** Registers a message's row, so a quote can scroll to it. */
  registerRow: (id: string, element: Element | null) => void;
  /** Scrolls the log to a message and highlights it for a moment. */
  showMessage: (id: string) => void;
  /** The message a quote just jumped to. */
  highlightedId: string | null;
  /** The message the composer is editing, if any. */
  editing: ChatMessage | undefined;
  startEditing: (message: ChatMessage) => void;
  stopEditing: () => void;
  /** Sends a new message, or saves the edit in progress. Returns whether it was taken. */
  submit: (text: string, attachments?: ChatAttachment[]) => boolean;
  /**
   * Whether the log follows new messages. Shared so that sending pins the log
   * to the bottom even while the reader had scrolled up.
   */
  stickToBottom: MutableRefObject<boolean>;
  /** Focuses the composer's field, e.g. after a menu action. */
  focusComposer: () => void;
  composerFieldRef: MutableRefObject<ComposerField | null>;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  /** A `Chat.ConversationList` is mounted: the root lays out list and thread side by side. */
  hasConversationList: boolean;
  setHasConversationList: (value: boolean) => void;
  /** Default id for `Chat.Title`. */
  titleId: string;
  /** The mounted title's id, which the root's `aria-labelledby` points at; `null` once it unmounts. */
  setLabelledBy: (id: string | null) => void;
}

export const [ChatProvider, useChatContext] = createSafeContext<ChatContextValue>('ChatProvider');

/**
 * Registration of message rows with the log that holds them, for read
 * tracking. Optional: a `Chat.Message` rendered outside `Chat.Messages` is
 * simply not tracked.
 */
export type ObserveRow = (message: ChatMessage, element: Element | null) => void;

export const ChatMessagesContext = createContext<ObserveRow | null>(null);
export const useObserveRow = (): ObserveRow | null => useContext(ChatMessagesContext);

/** Whether a row is the first of its group, set by `Chat.Messages`. */
export interface ChatRowContextValue {
  grouped: boolean;
}

export const ChatRowContext = createContext<ChatRowContextValue>({ grouped: false });
