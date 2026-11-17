import type { ElementType, ReactNode } from 'react';
import type { PolymorphicProps } from '@turkish-technology/spar';

import type { ClassNamesMap, SlotPropsMap } from '../../core';
import type { UploadFile, UploadRejection } from '../upload';

export type ChatSlot = 'root';
export type ChatThreadSlot = 'root';
export type ChatHeaderSlot = 'root' | 'back';
export type ChatTitleSlot = 'root';
export type ChatMessagesSlot = 'root' | 'viewport' | 'content' | 'loadOlder' | 'divider' | 'typing' | 'typingDots' | 'jump';
export type ChatMessageSlot =
  | 'root'
  | 'avatar'
  | 'body'
  | 'author'
  | 'bubble'
  | 'text'
  | 'meta'
  | 'time'
  | 'edited'
  | 'status'
  | 'retry'
  | 'undo'
  | 'attachments'
  | 'image'
  | 'quote'
  | 'quoteAuthor'
  | 'quoteText'
  | 'copied';
export type ChatMessageActionsSlot = 'root';
export type ChatEmptySlot = 'root';
export type ChatComposerSlot = 'root' | 'editing' | 'cancel' | 'replying' | 'cancelReply' | 'controls' | 'send' | 'upload' | 'attach' | 'attachments';
export type ChatConversationListSlot = 'root';
export type ChatConversationSlot = 'root' | 'avatar' | 'body' | 'title' | 'preview' | 'time' | 'unread';

/** A point in time: a `Date`, an ISO string, or epoch milliseconds. */
export type ChatTimestamp = Date | string | number;

/**
 * Delivery state of a message, driven by the consumer (the component does not
 * talk to a server). On the current user's own messages it is shown as an
 * icon: a clock while `'sending'`, one tick once `'sent'`, two grey ticks once
 * `'delivered'`, two coloured ticks once `'read'` by the other side, and a
 * warning once `'failed'`. On an incoming message `'read'` means the current
 * user has seen it; anything else counts as unread and is reported through
 * `onRead` once the message is on screen.
 */
export type ChatMessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/** Someone who takes part in the conversation. */
export interface ChatParticipant {
  /** Matches `ChatMessage.senderId`. */
  id: string;
  /** Display name, shown above their messages in a group chat and in the typing line. */
  name: string;
  /** Image URL or element. Falls back to the initials of `name`. */
  avatar?: string | ReactNode;
}

/** A message in the conversation, as a plain object the consumer owns. */
export interface ChatMessage {
  /** Stable identity (React key, `onRead` payloads, editing). */
  id: string;
  /** Who wrote it. Equal to the root's `currentUserId` for the user's own messages. */
  senderId: string;
  /** Plain text body. This is what the composer loads when the message is edited. */
  text: string;
  /** When it was written. Drives the time stamp, the day dividers and the edit/delete windows. */
  createdAt: ChatTimestamp;
  /** Set once the message has been edited; shows the "Edited" note. */
  editedAt?: ChatTimestamp;
  /** The message was deleted: its text is replaced by the "deleted" note and it has no actions. */
  deleted?: boolean;
  /** Delivery state. See {@link ChatMessageStatus}. */
  status?: ChatMessageStatus;
  /**
   * Files sent with the message. Images show as previews once uploaded;
   * other files, and anything still uploading or failed, as file rows with a
   * download button.
   */
  attachments?: ChatAttachment[];
  /**
   * The message this one answers. The quote above the text shows the original
   * while it is in `messages` — current, so an edit or delete shows — and
   * falls back to `senderId` / `text` here when it is not loaded.
   */
  replyTo?: ChatReply;
}

/** A reference to the message being answered, with what to show while the original is not loaded. */
export interface ChatReply {
  id: string;
  senderId?: string;
  text?: string;
}

/** What `onSend` knows about a message beyond its text and files. */
export interface ChatSendDetails {
  /** The message the user is answering, while `allowReplies` is set. */
  replyTo?: ChatMessage;
}

/**
 * A file on a message or in the composer — the same entry `Upload` uses. Set
 * `url` (and `thumbUrl` for a smaller preview) once it is on the server;
 * `status` / `progress` / `error` while it uploads.
 */
export type ChatAttachment = UploadFile;

/** A conversation in `Chat.ConversationList`. */
export interface ChatConversation {
  /** Matches the root's `conversationId`. */
  id: string;
  /** The contact's or the group's name. */
  title: string;
  /** Image URL or element. Falls back to the initials of `title`. */
  avatar?: string | ReactNode;
  /** A line under the title, typically the last message. */
  preview?: ReactNode;
  /** When the last message arrived. */
  updatedAt?: ChatTimestamp;
  /** Messages the current user has not read yet. Shown as a count while above zero. */
  unreadCount?: number;
}

/**
 * Every string Chat renders or announces. `{placeholder}` parts are filled in
 * at render time, so a translation can move them inside the sentence.
 */
export interface ChatLabels {
  /** Accessible name of the conversation list. */
  conversations: string;
  /** Header button that returns to the conversation list on narrow layouts. */
  back: string;
  /** Accessible name of the message log. */
  messages: string;
  /** Button at the top of the log while `hasOlder` is set. */
  loadOlder: string;
  /** Day divider for today's messages. */
  today: string;
  /** Day divider for yesterday's messages. */
  yesterday: string;
  /** Typing line for one person. `{names}` is their name. */
  typing: string;
  /** Typing line for several people. `{names}` is the list of their names. */
  typingMany: string;
  /** Button that scrolls the log back to the latest message. */
  jumpToLatest: string;
  /** Count shown on the jump button for messages that arrived while scrolled up. `{count}` is the number. */
  newMessages: string;
  /** Composer placeholder. */
  placeholder: string;
  /** Accessible name of the send button. */
  send: string;
  /** Accessible name of the send button while a message is being edited. */
  save: string;
  /** Banner above the composer while a message is being edited. */
  editing: string;
  /** Accessible name of the button that leaves editing. */
  cancelEdit: string;
  /** Accessible name of a message's actions menu button. */
  messageActions: string;
  /** Menu item that edits a message. */
  edit: string;
  /** Menu item that deletes a message. */
  delete: string;
  /** Button on a just-deleted message that restores it, shown for `undoWindow`. */
  undo: string;
  /** Note under an edited message. */
  edited: string;
  /** Text shown in place of a deleted message. */
  deleted: string;
  /** Status of the user's message while it is being sent. */
  sending: string;
  /** Status of the user's message once the server has it. */
  sent: string;
  /** Status of the user's message once it reached the other side. */
  delivered: string;
  /** Status of the user's message once the other side has seen it. */
  read: string;
  /** Status of the user's message when it could not be sent. */
  failed: string;
  /** Button under a failed message, shown when `onRetry` is set. */
  retry: string;
  /** Accessible text for a conversation's unread count. `{count}` is the number. */
  unread: string;
  /** Menu item that copies a message's text. */
  copy: string;
  /** Note under a message whose text was just copied; also announced. */
  copied: string;
  /** Menu item that answers a message. */
  reply: string;
  /** Banner above the composer while answering a message. `{name}` is its author. */
  replyingTo: string;
  /** Accessible name of the button that stops answering. */
  cancelReply: string;
  /** Lead-in read before a quoted message. */
  inReplyTo: string;
  /** The user's own name in quotes and the reply banner. */
  you: string;
  /** Quote text when the original is not loaded and the reply carries none. */
  originalMessage: string;
  /** Accessible name of the composer's attach button. */
  attach: string;
  /** Accessible name of the composer's list of files waiting to be sent. */
  attachments: string;
  /** Button that takes a file out of the composer. `{name}` is the file name. */
  removeAttachment: string;
  /** Button that downloads a file on a message. `{name}` is the file name. */
  downloadAttachment: string;
  /** Link around an image preview. `{name}` is the file name. */
  openAttachment: string;
  /** Status of a file that is uploading. */
  uploading: string;
  /** Status of a file whose upload failed. */
  uploadFailed: string;
  /** Accessible name of a file's progress bar. `{name}` is the file name. */
  uploadProgress: string;
}

export interface ChatOwnProps {
  /** The conversation, oldest first. */
  messages: ChatMessage[];
  /** The signed-in user. Messages whose `senderId` matches are drawn as the user's own. */
  currentUserId: string;
  /**
   * Everyone in the conversation, for names and avatars. With more than one
   * other participant the chat is drawn as a group: incoming messages show
   * their author's name and avatar.
   */
  participants?: ChatParticipant[];
  /**
   * Called when the user sends a message, with its trimmed text and the
   * files added in the composer (`Chat.Composer`'s `allowAttachments`). The
   * text is empty when only files are sent. Each file carries a fresh `id`
   * and its `file`; upload it and put it on the message as an attachment.
   */
  onSend?: (text: string, attachments: ChatAttachment[], details: ChatSendDetails) => void;
  /**
   * Called with the message and its new trimmed text when an edit is saved.
   * Setting it turns on the Edit action for the user's own messages.
   */
  onEdit?: (message: ChatMessage, text: string) => void;
  /**
   * Adds Reply to every message's menu. The composer then shows what is being
   * answered, and `onSend` gets it as `details.replyTo` — store it on the new
   * message's `replyTo`.
   */
  allowReplies?: boolean;
  /**
   * Copy in the menu of every message with text. It also works in a
   * `readOnly` or `disabled` chat, since it changes nothing.
   * @defaultValue true
   */
  allowCopy?: boolean;
  /**
   * Called when the user deletes one of their messages, once `undoWindow` has
   * passed without an undo. Setting it turns on the Delete action.
   */
  onDelete?: (message: ChatMessage) => void;
  /** Called from the Retry button under a `'failed'` message. The button is shown only when this is set. */
  onRetry?: (message: ChatMessage) => void;
  /**
   * Called with incoming messages that are not `'read'` yet once they are on
   * screen while the page is visible — mark them read on the server and set
   * their `status` to `'read'`. A message is reported once.
   */
  onRead?: (messages: ChatMessage[]) => void;
  /**
   * How long after `createdAt` a message can still be edited, in milliseconds.
   * Leave it unset for no limit. The Edit action disappears once it passes.
   */
  editWindow?: number;
  /**
   * How long after `createdAt` a message can still be deleted, in milliseconds.
   * Leave it unset for no limit. The Delete action disappears once it passes.
   */
  deleteWindow?: number;
  /**
   * How long a deleted message can still be restored, in milliseconds. Until
   * then it shows as deleted with an Undo button, and `onDelete` is called
   * when the time is up — or right away if the chat unmounts first. `0`
   * calls `onDelete` at once.
   * @defaultValue 5000
   */
  undoWindow?: number;
  /** Ids of the participants who are typing right now. Shows the typing line at the end of the log. */
  typing?: string[];
  /** Shows a Load older messages button at the top of the log. Scrolling to the top loads them too. */
  hasOlder?: boolean;
  /** Older messages are loading: the button shows a spinner and the log is marked busy. */
  isLoadingOlder?: boolean;
  /** Called to load older messages. Prepend them to `messages`; the reader's place in the log is kept. */
  onLoadOlder?: () => void;
  /**
   * The open conversation (controlled), for chats with a `Chat.ConversationList`.
   * `null` means none is open. Pair with `onConversationChange`.
   */
  conversationId?: string | null;
  /** The conversation open at first (uncontrolled). */
  defaultConversationId?: string | null;
  /** Called when the user opens a conversation, or goes back to the list (`null`). */
  onConversationChange?: (id: string | null) => void;
  /** Turns the composer and the message actions (except Copy) off, e.g. while offline. */
  disabled?: boolean;
  /** View-only conversation: no composer, and Copy is the only message action. */
  readOnly?: boolean;
  /**
   * BCP 47 locale for times and dates, e.g. `'tr-TR'`.
   * @defaultValue the browser's locale
   */
  locale?: string;
  /** Texts of the chat, e.g. a translation. Anything left out stays in English. */
  labels?: Partial<ChatLabels>;
  children?: ReactNode;
  classNames?: ClassNamesMap<ChatSlot>;
  slotProps?: SlotPropsMap<ChatSlot>;
}

/**
 * A messaging surface between people: the root holds the conversation and
 * its callbacks, the parts lay it out. Fills its container, so it fits a
 * Drawer, a Card or any region of a page.
 */
export type ChatProps<T extends ElementType = 'section'> = PolymorphicProps<'section', T, ChatOwnProps>;

export interface ChatThreadOwnProps {
  children?: ReactNode;
  classNames?: ClassNamesMap<ChatThreadSlot>;
  slotProps?: SlotPropsMap<ChatThreadSlot>;
}

/**
 * The open conversation's column — header, messages and composer — next to a
 * `Chat.ConversationList`. Not needed in a chat without one.
 */
export type ChatThreadProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ChatThreadOwnProps>;

export interface ChatHeaderOwnProps {
  children?: ReactNode;
  classNames?: ClassNamesMap<ChatHeaderSlot>;
  slotProps?: SlotPropsMap<ChatHeaderSlot>;
}

/**
 * Bar above the messages for the contact's name, avatar and actions. Next to a
 * `Chat.ConversationList` it also holds a back button, shown when the chat is
 * too narrow to show both.
 */
export type ChatHeaderProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ChatHeaderOwnProps>;

export interface ChatTitleOwnProps {
  children?: ReactNode;
  classNames?: ClassNamesMap<ChatTitleSlot>;
  slotProps?: SlotPropsMap<ChatTitleSlot>;
}

/** The conversation's name. Also labels the chat region. */
export type ChatTitleProps<T extends ElementType = 'h2'> = PolymorphicProps<'h2', T, ChatTitleOwnProps>;

export interface ChatMessagesOwnProps {
  /** Renders one message. Defaults to `<Chat.Message message={message} />`. */
  children?: (message: ChatMessage) => ReactNode;
  classNames?: ClassNamesMap<ChatMessagesSlot>;
  slotProps?: SlotPropsMap<ChatMessagesSlot>;
}

/**
 * The scrolling message log (`role="log"`). Stays on the latest message while
 * the reader is at the bottom, offers a jump button when new messages arrive
 * while they are scrolled up, adds day dividers and the typing line, and
 * reports read messages. Renders nothing while there are no messages.
 */
export type ChatMessagesProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ChatMessagesOwnProps>;

export interface ChatMessageOwnProps {
  /** The message this row renders. */
  message: ChatMessage;
  /**
   * Replaces the text inside the bubble, e.g. rich content. A composed
   * `Chat.MessageActions` is taken out and placed as the row's menu.
   */
  children?: ReactNode;
  classNames?: ClassNamesMap<ChatMessageSlot>;
  slotProps?: SlotPropsMap<ChatMessageSlot>;
}

/**
 * One message: bubble, time, edited note, delivery status and the actions
 * menu. `data-own`, `data-status`, `data-deleted`, `data-deleting` and
 * `data-grouped` describe it for styling. A long press (touch) or a right
 * click on the bubble opens the actions menu too.
 */
export type ChatMessageProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ChatMessageOwnProps>;

export interface ChatMessageActionsOwnProps {
  /** Extra `Dropdown.Item`s, listed after the built-in Reply, Copy, Edit and Delete. */
  children?: ReactNode;
  classNames?: ClassNamesMap<ChatMessageActionsSlot>;
  slotProps?: SlotPropsMap<ChatMessageActionsSlot>;
}

/**
 * The message's menu button. Lists Reply while `allowReplies` is set, Copy on
 * messages with text (unless `allowCopy` is off), Edit and
 * Delete on the user's own messages while `onEdit` / `onDelete` are set and
 * their windows are open, then its children. Renders nothing when it has no
 * items.
 */
export type ChatMessageActionsProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ChatMessageActionsOwnProps>;

export interface ChatEmptyOwnProps {
  children?: ReactNode;
  classNames?: ClassNamesMap<ChatEmptySlot>;
  slotProps?: SlotPropsMap<ChatEmptySlot>;
}

/** Shown in place of the log while the conversation has no messages. */
export type ChatEmptyProps<T extends ElementType = 'div'> = PolymorphicProps<'div', T, ChatEmptyOwnProps>;

export interface ChatComposerOwnProps {
  /** The draft (controlled). Pair with `onValueChange`. */
  value?: string;
  /** The draft at first (uncontrolled). */
  defaultValue?: string;
  /** Called with the draft on every change, including when it is cleared after sending. */
  onValueChange?: (value: string) => void;
  /** Longest message the user can send. */
  maxLength?: number;
  /** Placeholder of the text field. Defaults to `labels.placeholder`. */
  placeholder?: string;
  /** Controls before the text field, e.g. an attach button. */
  startContent?: ReactNode;
  /** Controls between the text field and the send button, e.g. an emoji picker. */
  endContent?: ReactNode;
  /**
   * Lets the user add files: an attach button, dropping files on the
   * composer, and pasting them. They go to `onSend` with the text.
   */
  allowAttachments?: boolean;
  /** File types the composer takes, as in an `<input type="file">` `accept`, e.g. `'image/*,.pdf'`. */
  accept?: string;
  /** Largest file the composer takes, in bytes. */
  maxFileSize?: number;
  /** Most files one message can carry. */
  maxFileCount?: number;
  /**
   * Called with the files the composer turned down (type, size or count) —
   * the composer shows nothing for them, so tell the user, e.g. with a toast.
   */
  onFilesReject?: (rejections: UploadRejection[]) => void;
  classNames?: ClassNamesMap<ChatComposerSlot>;
  slotProps?: SlotPropsMap<ChatComposerSlot>;
}

/**
 * The message field and send button. Enter sends, Shift+Enter adds a line,
 * ArrowUp in an empty field edits the user's last editable message and Escape
 * leaves editing. Not rendered while the chat is `readOnly`.
 */
export type ChatComposerProps<T extends ElementType = 'form'> = PolymorphicProps<'form', T, ChatComposerOwnProps>;

export interface ChatConversationListOwnProps {
  /** `Chat.Conversation` items. */
  children?: ReactNode;
  classNames?: ClassNamesMap<ChatConversationListSlot>;
  slotProps?: SlotPropsMap<ChatConversationListSlot>;
}

/**
 * The user's conversations, next to a `Chat.Thread`. In a narrow container
 * (below 640px) the chat shows the list until one is opened, then the thread
 * with a back button.
 */
export type ChatConversationListProps<T extends ElementType = 'nav'> = PolymorphicProps<'nav', T, ChatConversationListOwnProps>;

export interface ChatConversationOwnProps {
  /** The conversation this item opens. */
  conversation: ChatConversation;
  classNames?: ClassNamesMap<ChatConversationSlot>;
  slotProps?: SlotPropsMap<ChatConversationSlot>;
}

/** One conversation in the list: avatar, title, preview, time and unread count. Opens it when pressed. */
export type ChatConversationProps<T extends ElementType = 'button'> = PolymorphicProps<'button', T, ChatConversationOwnProps>;

declare module '../../core/theme' {
  interface ComponentThemeRegistry {
    Chat: import('../../core').ComponentThemeConfig<ChatProps, ChatSlot>;
    ChatThread: import('../../core').ComponentThemeConfig<ChatThreadProps, ChatThreadSlot>;
    ChatHeader: import('../../core').ComponentThemeConfig<ChatHeaderProps, ChatHeaderSlot>;
    ChatTitle: import('../../core').ComponentThemeConfig<ChatTitleProps, ChatTitleSlot>;
    ChatMessages: import('../../core').ComponentThemeConfig<ChatMessagesProps, ChatMessagesSlot>;
    ChatMessage: import('../../core').ComponentThemeConfig<ChatMessageProps, ChatMessageSlot>;
    ChatMessageActions: import('../../core').ComponentThemeConfig<ChatMessageActionsProps, ChatMessageActionsSlot>;
    ChatEmpty: import('../../core').ComponentThemeConfig<ChatEmptyProps, ChatEmptySlot>;
    ChatComposer: import('../../core').ComponentThemeConfig<ChatComposerProps, ChatComposerSlot>;
    ChatConversationList: import('../../core').ComponentThemeConfig<ChatConversationListProps, ChatConversationListSlot>;
    ChatConversation: import('../../core').ComponentThemeConfig<ChatConversationProps, ChatConversationSlot>;
  }
}
