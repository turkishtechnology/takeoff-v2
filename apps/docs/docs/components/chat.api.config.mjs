/**
 * API table source-of-truth for the Chat docs page.
 *
 * Picked up by `apps/docs/scripts/generate-api-mdx.mjs`, which rewrites the
 * `api-tables` block in `chat.mdx` whenever this file or
 * `packages/react-spar/src/components/chat/types.ts` changes.
 */

const chatTypesFile = 'packages/react-spar/src/components/chat/types.ts';

const childrenOverride = description => ({
  type: 'React.ReactNode',
  description,
});

const classNameOverride = {
  type: 'string',
  description: 'Appends custom classes to the root slot.',
};

const dataSlotRoot = {
  attribute: 'data-slot="root"',
  appliedWhen: 'Always',
  purpose: 'Stable selector for wrapper styling on the root slot.',
};

const part = (typeName, displayName, headingBase, extra = {}) => ({
  sourceFile: chatTypesFile,
  typeName,
  displayName,
  headingBase,
  appendPropNames: ['className'],
  skipPropNames: ['ref'],
  ...extra,
  propOverrides: { className: classNameOverride, ...extra.propOverrides },
  dataAttributes: [dataSlotRoot, ...(extra.dataAttributes ?? [])],
});

export default {
  components: [
    part('ChatProps', 'Chat', 'chat', {
      prependPropNames: ['messages', 'currentUserId', 'participants', 'onSend', 'onEdit', 'onDelete', 'onRead'],
      propOverrides: {
        children: childrenOverride('The parts: `Chat.Header`, `Chat.Messages`, `Chat.Empty`, `Chat.Composer`, and optionally `Chat.ConversationList` + `Chat.Thread`.'),
      },
      dataAttributes: [
        { attribute: 'data-layout', appliedWhen: 'Always (`single` | `split`)', purpose: '`split` while a `Chat.ConversationList` is mounted: list and thread side by side.' },
        { attribute: 'data-view', appliedWhen: 'Always (`list` | `thread`)', purpose: 'Which pane a narrow split chat shows — the list until a conversation is open.' },
        { attribute: 'data-disabled', appliedWhen: 'When `disabled`', purpose: 'Styling hook for the disabled state.' },
        { attribute: 'data-readonly', appliedWhen: 'When `readOnly`', purpose: 'Styling hook for the view-only state.' },
      ],
    }),
    part('ChatConversationListProps', 'Chat.ConversationList', 'chat-conversation-list', {
      prependPropNames: ['children'],
      propOverrides: { children: childrenOverride('`Chat.Conversation` items.') },
    }),
    part('ChatConversationProps', 'Chat.Conversation', 'chat-conversation', {
      prependPropNames: ['conversation'],
      dataAttributes: [
        { attribute: 'data-selected', appliedWhen: 'When it is the open conversation', purpose: 'Selected treatment; `aria-current="true"` is set too.' },
        { attribute: 'data-unread', appliedWhen: 'When `unreadCount` is above zero', purpose: 'Unread treatment (bold title).' },
      ],
    }),
    part('ChatThreadProps', 'Chat.Thread', 'chat-thread', {
      prependPropNames: ['children'],
      propOverrides: { children: childrenOverride('The thread parts: header, messages, empty state and composer.') },
    }),
    part('ChatHeaderProps', 'Chat.Header', 'chat-header', {
      prependPropNames: ['children'],
      propOverrides: { children: childrenOverride('Title, avatar, status and actions of the conversation.') },
    }),
    part('ChatTitleProps', 'Chat.Title', 'chat-title', {
      prependPropNames: ['children'],
      propOverrides: { children: childrenOverride("The conversation's name. Labels the chat region.") },
    }),
    part('ChatPinnedProps', 'Chat.Pinned', 'chat-pinned'),
    part('ChatMessagesProps', 'Chat.Messages', 'chat-messages', {
      prependPropNames: ['children'],
      propOverrides: { children: { type: '(message: ChatMessage) => React.ReactNode', description: 'Renders one message. Defaults to `<Chat.Message message={message} />`.' } },
    }),
    part('ChatMessageProps', 'Chat.Message', 'chat-message', {
      prependPropNames: ['message', 'children'],
      propOverrides: { children: childrenOverride("Replaces the text inside the bubble. A composed `Chat.MessageActions` becomes the row's menu.") },
      dataAttributes: [
        { attribute: 'data-own', appliedWhen: "On the current user's messages", purpose: 'Aligns the row to the end and colours the bubble.' },
        { attribute: 'data-status', appliedWhen: 'When the message has a `status`', purpose: 'Delivery state: `sending` | `sent` | `delivered` | `read` | `failed`.' },
        { attribute: 'data-deleted', appliedWhen: 'When `deleted`, or deleted and waiting out `undoWindow`', purpose: 'Deleted-message treatment.' },
        { attribute: 'data-deleting', appliedWhen: 'While a delete can still be undone', purpose: 'Dims the message until `onDelete` runs.' },
        { attribute: 'data-grouped', appliedWhen: 'When it continues the previous message’s group', purpose: 'Tighter spacing; hides the repeated avatar.' },
        { attribute: 'data-editing', appliedWhen: 'While the composer edits or answers it', purpose: 'Outlines the message the composer is working on.' },
        { attribute: 'data-pinned', appliedWhen: 'When its id is in `pinnedIds`', purpose: 'Shows the pin in the meta line.' },
        { attribute: 'data-highlighted', appliedWhen: 'For a moment after a quote jumps to it', purpose: 'Flashes the bubble so the eye finds it.' },
      ],
    }),
    part('ChatMessageActionsProps', 'Chat.MessageActions', 'chat-message-actions', {
      prependPropNames: ['children'],
      propOverrides: { children: childrenOverride('Extra `Dropdown.Item`s, after the built-in Edit and Delete.') },
    }),
    part('ChatEmptyProps', 'Chat.Empty', 'chat-empty', {
      prependPropNames: ['children'],
      propOverrides: { children: childrenOverride('Shown while the conversation has no messages.') },
    }),
    part('ChatComposerProps', 'Chat.Composer', 'chat-composer', {
      prependPropNames: ['value', 'defaultValue', 'onValueChange'],
      dataAttributes: [
        { attribute: 'data-editing', appliedWhen: 'While a message is being edited', purpose: 'Editing treatment of the composer.' },
        {
          attribute: 'data-drag-state',
          appliedWhen: 'While files are dragged over it (`allowAttachments`)',
          purpose: '`accept` | `reject` — the drop-target treatment; `reject` for types outside `accept` or while editing.',
        },
      ],
    }),
  ],
};
