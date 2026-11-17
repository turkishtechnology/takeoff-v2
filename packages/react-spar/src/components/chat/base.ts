import { createComponentBase } from '../../core';

import type {
  ChatComposerProps,
  ChatComposerSlot,
  ChatConversationListProps,
  ChatConversationProps,
  ChatConversationSlot,
  ChatEmptyProps,
  ChatHeaderProps,
  ChatHeaderSlot,
  ChatMessageActionsProps,
  ChatMessageProps,
  ChatMessageSlot,
  ChatMessagesProps,
  ChatMessagesSlot,
  ChatProps,
  ChatThreadProps,
  ChatTitleProps,
} from './types';

// @archetype react-enhancement — Spar ships no chat or message-log primitive
// (the Upload/Table situation). The wrapper owns the conversation state: the
// edit/delete windows, the editing message, the open conversation, and read
// tracking. Server traffic stays with the consumer. If a Spar primitive lands,
// these parts migrate to Inherited in the same release.
export const ChatBase = createComponentBase<ChatProps, 'root'>({
  name: 'Chat',
  slots: ['root'] as const,
  classes: { root: 'tk-chat' },
});

// @archetype react-enhancement — the thread column beside a conversation list.
// Public (criterion 1): the split layout needs the consumer to say which parts
// form the thread.
export const ChatThreadBase = createComponentBase<ChatThreadProps, 'root'>({
  name: 'ChatThread',
  slots: ['root'] as const,
  classes: { root: 'tk-chat-thread' },
});

// @archetype react-enhancement — content-bearing header. The back button is an
// internal slot: it only appears next to a conversation list, and its label
// comes from `labels.back`.
export const ChatHeaderBase = createComponentBase<ChatHeaderProps, ChatHeaderSlot>({
  name: 'ChatHeader',
  slots: ['root', 'back'] as const,
  classes: { root: 'tk-chat-header', back: 'tk-chat-back' },
});

// @archetype react-enhancement — the heading that names the chat region
// (criterion 2: it is the region's accessible name).
export const ChatTitleBase = createComponentBase<ChatTitleProps, 'root'>({
  name: 'ChatTitle',
  slots: ['root'] as const,
  classes: { root: 'tk-chat-title' },
});

// @archetype react-enhancement — the log. Day dividers, the load-older button,
// the typing line and the jump button are internal slots: they follow from
// root state and carry no content of the consumer's.
export const ChatMessagesBase = createComponentBase<ChatMessagesProps, ChatMessagesSlot>({
  name: 'ChatMessages',
  slots: ['root', 'viewport', 'content', 'loadOlder', 'divider', 'typing', 'typingDots', 'jump'] as const,
  classes: {
    root: 'tk-chat-messages',
    viewport: 'tk-chat-messages-viewport',
    content: 'tk-chat-messages-content',
    loadOlder: 'tk-chat-load-older',
    divider: 'tk-chat-divider',
    typing: 'tk-chat-typing',
    typingDots: 'tk-chat-typing-dots',
    jump: 'tk-chat-jump',
  },
});

// @archetype react-enhancement — one message row. Avatar, bubble and meta are
// internal slots styled through classNames / slotProps; the bubble's content
// is replaced through children.
export const ChatMessageBase = createComponentBase<ChatMessageProps, ChatMessageSlot>({
  name: 'ChatMessage',
  slots: [
    'root',
    'avatar',
    'body',
    'author',
    'bubble',
    'text',
    'meta',
    'time',
    'edited',
    'status',
    'retry',
    'undo',
    'attachments',
    'image',
    'quote',
    'quoteAuthor',
    'quoteText',
    'copied',
  ] as const,
  classes: {
    root: 'tk-chat-message',
    avatar: 'tk-chat-message-avatar',
    body: 'tk-chat-message-body',
    author: 'tk-chat-message-author',
    bubble: 'tk-chat-message-bubble',
    text: 'tk-chat-message-text',
    meta: 'tk-chat-message-meta',
    time: 'tk-chat-message-time',
    edited: 'tk-chat-message-edited',
    status: 'tk-chat-message-status',
    retry: 'tk-chat-message-retry',
    undo: 'tk-chat-message-undo',
    attachments: 'tk-chat-message-attachments',
    image: 'tk-chat-message-image',
    quote: 'tk-chat-message-quote',
    quoteAuthor: 'tk-chat-message-quote-author',
    quoteText: 'tk-chat-message-quote-text',
    copied: 'tk-chat-message-copied',
  },
});

// @archetype react-enhancement — the message's menu (criterion 3: its own
// open state and items; criterion 1: consumers add items by composing it).
export const ChatMessageActionsBase = createComponentBase<ChatMessageActionsProps, 'root'>({
  name: 'ChatMessageActions',
  slots: ['root'] as const,
  classes: { root: 'tk-chat-message-actions' },
});

// @archetype react-enhancement — content-bearing empty state.
export const ChatEmptyBase = createComponentBase<ChatEmptyProps, 'root'>({
  name: 'ChatEmpty',
  slots: ['root'] as const,
  classes: { root: 'tk-chat-empty' },
});

// @archetype react-enhancement — the composer form. It renders the Takeoff
// Input (textarea) and Button; the editing banner, its cancel button and the
// send button are internal slots.
export const ChatComposerBase = createComponentBase<ChatComposerProps, ChatComposerSlot>({
  name: 'ChatComposer',
  slots: ['root', 'editing', 'cancel', 'replying', 'cancelReply', 'controls', 'send', 'upload', 'attach', 'attachments'] as const,
  classes: {
    root: 'tk-chat-composer',
    editing: 'tk-chat-composer-editing',
    cancel: 'tk-chat-composer-cancel',
    replying: 'tk-chat-composer-replying',
    cancelReply: 'tk-chat-composer-cancel-reply',
    controls: 'tk-chat-composer-controls',
    send: 'tk-chat-composer-send',
    upload: 'tk-chat-composer-upload',
    attach: 'tk-chat-composer-attach',
    attachments: 'tk-chat-composer-attachments',
  },
});

// @archetype react-enhancement — the conversation list region; its presence
// switches the root to the split layout (`data-layout="split"`).
export const ChatConversationListBase = createComponentBase<ChatConversationListProps, 'root'>({
  name: 'ChatConversationList',
  slots: ['root'] as const,
  classes: { root: 'tk-chat-conversation-list' },
});

// @archetype react-enhancement — one focusable conversation (criterion 2).
export const ChatConversationBase = createComponentBase<ChatConversationProps, ChatConversationSlot>({
  name: 'ChatConversation',
  slots: ['root', 'avatar', 'body', 'title', 'preview', 'time', 'unread'] as const,
  classes: {
    root: 'tk-chat-conversation',
    avatar: 'tk-chat-conversation-avatar',
    body: 'tk-chat-conversation-body',
    title: 'tk-chat-conversation-title',
    preview: 'tk-chat-conversation-preview',
    time: 'tk-chat-conversation-time',
    unread: 'tk-chat-conversation-unread',
  },
});
