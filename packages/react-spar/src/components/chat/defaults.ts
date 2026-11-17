import type { ChatLabels } from './types';

// English copy. `{names}` and `{count}` are placeholders so a translation can
// put them where its grammar wants them.
export const DEFAULT_LABELS: ChatLabels = {
  conversations: 'Conversations',
  back: 'Back to conversations',
  messages: 'Messages',
  loadOlder: 'Load older messages',
  today: 'Today',
  yesterday: 'Yesterday',
  typing: '{names} is typing…',
  typingMany: '{names} are typing…',
  jumpToLatest: 'Jump to latest message',
  newMessages: '{count} new',
  placeholder: 'Write a message…',
  send: 'Send message',
  save: 'Save changes',
  editing: 'Editing message',
  cancelEdit: 'Cancel editing',
  messageActions: 'Message actions',
  edit: 'Edit',
  delete: 'Delete',
  undo: 'Undo',
  edited: 'Edited',
  deleted: 'This message was deleted',
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Not delivered',
  retry: 'Retry',
  unread: '{count} unread messages',
  copy: 'Copy text',
  copied: 'Copied',
  reply: 'Reply',
  replyingTo: 'Replying to {name}',
  cancelReply: 'Cancel reply',
  inReplyTo: 'In reply to',
  you: 'You',
  originalMessage: 'Original message',
  attach: 'Attach files',
  attachments: 'Files to send',
  removeAttachment: 'Remove {name}',
  downloadAttachment: 'Download {name}',
  openAttachment: 'Open {name}',
  uploading: 'Uploading…',
  uploadFailed: 'Upload failed',
  uploadProgress: '{name} upload progress',
};

// Consecutive messages from one sender closer than this share a group: one
// avatar and author line, and tighter spacing.
export const GROUP_GAP_MS = 5 * 60 * 1000;

// How close to the bottom (px) still counts as "at the bottom", so new
// messages keep following.
export const STICK_THRESHOLD_PX = 24;

// Scrolling within this distance of the top (px) loads older messages.
export const LOAD_OLDER_THRESHOLD_PX = 40;

// Share of a message that has to be on screen before it counts as read.
export const READ_VISIBILITY_THRESHOLD = 0.6;

// How long a deleted message can be restored before `onDelete` is called.
export const UNDO_WINDOW_MS = 5000;

// How long (ms) a message stays highlighted after a quote jumps to it.
export const HIGHLIGHT_MS = 1600;

// How long (ms) the "Copied" note stays under a message.
export const COPIED_MS = 1500;

// A touch held this long (ms) without moving opens a message's menu.
export const LONG_PRESS_MS = 500;

// Moving the finger further than this (px) is a scroll, not a long press.
export const LONG_PRESS_MOVE_PX = 10;
