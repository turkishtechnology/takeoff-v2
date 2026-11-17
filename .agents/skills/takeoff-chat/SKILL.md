---
name: takeoff-chat
description:
  'Messaging between people — a conversation log with delivery and read
  receipts, editing and deleting a message within a time window, typing
  indicator, history loading, and an optional conversation list. This is the
  Chat from @takeoff-ui/react-spar (Takeoff UI / Spar React). Use WHENEVER
  building, adding, importing, styling, or fixing a chat, messenger, direct
  messages, inbox, conversation view, message thread, comments thread, support
  chat, chat in a drawer, read receipts, or "seen" ticks in a React app that
  uses @takeoff-ui/react-spar / Takeoff / Spar. Triggers: chat, takeoff chat,
  Chat.Messages, Chat.Composer, messenger, conversation, read receipt.'
---

# Chat — @takeoff-ui/react-spar

`Chat` is a compound messaging surface. The root holds the conversation —
`messages`, `currentUserId` and the callbacks — and the parts lay it out.

**It never talks to a server.** It is fully controlled: your app keeps the
messages, sends them, and updates their `status`; the component shows them and
reports what the user does (`onSend`, `onEdit`, `onDelete`, `onRead`, …).

**When to use:** person-to-person or group messaging, a support chat, a comments
thread with edit/delete. It fills its container, so it fits a `Drawer`, a `Card`
or any sized region. Not this — use `takeoff-toast` for system notifications,
and `takeoff-input` (`as="textarea"`) for a single free-text field.

## Setup

Requires the Takeoff provider + token CSS mounted once at the app root (see the
`takeoff-ui` skill or the installation docs). Then import:

```tsx
import { Chat } from '@takeoff-ui/react-spar';
```

`Chat` is a compound component — all sub-parts are accessed as `Chat.*`.

## Compound parts

- `Chat.Header` / `Chat.Title` — bar above the log; the title labels the chat
  region.
- `Chat.Pinned` — bar of pinned messages under the header; pressing it jumps to
  the one shown and steps back to older pins. Renders nothing without pins.
- `Chat.Messages` — the scrolling `role="log"`. Stays at the bottom while the
  reader is there, shows a "N new" jump button otherwise, adds day dividers and
  the typing line, and reports read messages. Function children render a row.
- `Chat.Message` — one message: bubble, time, "Edited", delivery ticks, menu.
  Children replace the bubble content.
- `Chat.MessageActions` — the message's menu. Lists Reply, Copy, Pin, Edit and
  Delete when they apply, then your `Dropdown.Item` children.
- `Chat.Empty` — shown while there are no messages.
- `Chat.Composer` — the field and send button. Also the editing and reply UI.
- `Chat.ConversationList` / `Chat.Conversation` — the conversation list; its
  presence switches to the split layout.
- `Chat.Thread` — wraps the thread parts next to a conversation list.

## Basic usage

```tsx
const [messages, setMessages] = useState<ChatMessage[]>([]);

<Chat
  messages={messages}
  currentUserId={me.id}
  participants={[me, ayse]}
  onSend={text => api.send(text)}
>
  <Chat.Header>
    <Chat.Title>Ayşe Yılmaz</Chat.Title>
  </Chat.Header>
  <Chat.Messages />
  <Chat.Empty>Say hello</Chat.Empty>
  <Chat.Composer />
</Chat>;
```

## Examples

### Delivery and read receipts

```tsx
const update = (id: string, patch: Partial<ChatMessage>) =>
  setMessages(list => list.map(m => (m.id === id ? { ...m, ...patch } : m)));

const handleSend = async (text: string) => {
  const id = crypto.randomUUID();
  setMessages(list => [
    ...list,
    { id, senderId: me.id, text, createdAt: new Date(), status: 'sending' },
  ]);
  await api.send({ id, text });
  update(id, { status: 'sent' });
};

// Server events: delivered / read by the other side
socket.on('delivered', id => update(id, { status: 'delivered' }));
socket.on('read', id => update(id, { status: 'read' }));

<Chat
  messages={messages}
  currentUserId={me.id}
  onSend={handleSend}
  // Incoming unread messages that came on screen while the page was visible.
  onRead={read => {
    api.markRead(read.map(m => m.id));
    read.forEach(m => update(m.id, { status: 'read' }));
  }}
>
  <Chat.Messages />
  <Chat.Composer />
</Chat>;
```

### Edit and delete within a time window

```tsx
<Chat
  messages={messages}
  currentUserId={me.id}
  onSend={handleSend}
  editWindow={15 * 60_000} // 15 minutes
  deleteWindow={60 * 60_000} // 1 hour
  onEdit={(message, text) => update(message.id, { text, editedAt: new Date() })}
  onDelete={message => update(message.id, { deleted: true })}
>
  <Chat.Messages />
  <Chat.Composer />
</Chat>
```

The actions disappear when the window closes; an edit in progress ends with it.
Enforce the same limit on the server.

### Conversation list (split layout)

```tsx
<Chat
  messages={threads[conversationId] ?? []}
  currentUserId={me.id}
  conversationId={conversationId}
  onConversationChange={setConversationId}
  onSend={handleSend}
>
  <Chat.ConversationList>
    {conversations.map(c => (
      <Chat.Conversation key={c.id} conversation={c} />
    ))}
  </Chat.ConversationList>
  <Chat.Thread>
    <Chat.Header>
      <Chat.Title>{current?.title}</Chat.Title>
    </Chat.Header>
    <Chat.Messages />
    <Chat.Empty>Pick a conversation</Chat.Empty>
    <Chat.Composer />
  </Chat.Thread>
</Chat>
```

Below 640px of chat width only one pane shows: the list until a conversation is
open, then the thread with a back button in `Chat.Header`.

### In a Drawer

```tsx
<Drawer placement="right">
  <Drawer.Trigger as={Button}>Open chat</Drawer.Trigger>
  <Drawer.Overlay />
  <Drawer.Panel>
    <Drawer.Header>
      <Drawer.Title>Support</Drawer.Title>
      <Drawer.Close />
    </Drawer.Header>
    <Drawer.Body className="p-0">
      <Chat messages={messages} currentUserId={me.id} onSend={handleSend}>
        <Chat.Messages />
        <Chat.Composer />
      </Chat>
    </Drawer.Body>
  </Drawer.Panel>
</Drawer>
```

### Extra message actions and custom content

```tsx
<Chat.Messages>
  {message => (
    <Chat.Message message={message}>
      <Chat.MessageActions>
        <Dropdown.Item onSelect={() => setReplyTo(message)}>
          Reply
        </Dropdown.Item>
      </Chat.MessageActions>
    </Chat.Message>
  )}
</Chat.Messages>
```

### Replies

```tsx
<Chat
  messages={messages}
  currentUserId="me"
  onSend={(text, attachments, { replyTo }) =>
    addMessage({
      text,
      // A copy of what is quoted, shown while the original is not loaded.
      replyTo: replyTo && {
        id: replyTo.id,
        senderId: replyTo.senderId,
        text: replyTo.text,
      },
    })
  }
>
  <Chat.Messages />
  <Chat.Composer />
</Chat>
```

The quote follows the loaded original (edits, deletes) and jumps to it when
pressed; Escape or the banner's close button stops answering.

### Attachments

```tsx
<Chat
  messages={messages}
  currentUserId="me"
  onSend={(text, attachments) => {
    // Put the files on the message as 'uploading', then update each one's
    // progress, and its status / url when the upload finishes.
    addMessage({
      text,
      attachments: attachments.map(f => ({
        ...f,
        status: 'uploading',
        progress: 0,
      })),
    });
    attachments.forEach(uploadFile);
  }}
>
  <Chat.Messages />
  <Chat.Composer
    allowAttachments
    accept="image/*,.pdf"
    maxFileSize={10 * 1024 * 1024}
    onFilesReject={showToast}
  />
</Chat>
```

Uploaded images show as previews; other files, and anything still uploading or
failed, as Upload rows with a download button.

## Key props

| Prop                    | Type                                | Default | Notes                                                                                   |
| ----------------------- | ----------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `messages`              | `ChatMessage[]`                     | -       | Oldest first. Required. On `Chat`.                                                      |
| `currentUserId`         | `string`                            | -       | Messages with this `senderId` are the user's own. Required.                             |
| `participants`          | `ChatParticipant[]`                 | `[]`    | Names/avatars. More than one other participant = group chat.                            |
| `onSend`                | `(text, attachments, details)`      | -       | Trimmed text (empty for files only), the composer's files, `details.replyTo`.           |
| `allowReplies`          | `boolean`                           | `true`  | Reply in every menu while `onSend` is set; `details.replyTo` goes to `onSend`.          |
| `pinnedIds`             | `string[]`                          | `[]`    | Pinned message ids, oldest pin first.                                                   |
| `onPinChange`           | `(message, pinned) => void`         | -       | Turns on Pin / Unpin; `Chat.Pinned` shows the pins.                                     |
| `allowCopy`             | `boolean`                           | `true`  | Copy in the menu of messages with text; works read-only too.                            |
| `onEdit`                | `(message, text) => void`           | -       | Turns on Edit for own messages. Not called if the text did not change.                  |
| `onDelete`              | `(message) => void`                 | -       | Turns on Delete for own messages.                                                       |
| `onRetry`               | `(message) => void`                 | -       | Retry button under `'failed'` own messages.                                             |
| `onRead`                | `(messages: ChatMessage[]) => void` | -       | Incoming non-`read` messages seen on screen; each reported once.                        |
| `editWindow`            | `number` (ms)                       | -       | No limit when unset.                                                                    |
| `deleteWindow`          | `number` (ms)                       | -       | No limit when unset.                                                                    |
| `undoWindow`            | `number` (ms)                       | `5000`  | Undo period before `onDelete` runs (also runs on unmount). `0` deletes at once.         |
| `typing`                | `string[]`                          | `[]`    | Participant ids typing now.                                                             |
| `hasOlder`              | `boolean`                           | `false` | Load-older button; scrolling to the top loads too.                                      |
| `isLoadingOlder`        | `boolean`                           | `false` | Spinner on the button, `aria-busy` on the log.                                          |
| `onLoadOlder`           | `() => void`                        | -       | Prepend the older messages; the reader stays in place.                                  |
| `conversationId`        | `string \| null`                    | -       | Open conversation (controlled). `null` = list.                                          |
| `defaultConversationId` | `string \| null`                    | `null`  | Uncontrolled start.                                                                     |
| `onConversationChange`  | `(id: string \| null) => void`      | -       | A conversation opened, or back to the list.                                             |
| `disabled`              | `boolean`                           | `false` | Composer and actions off (e.g. offline).                                                |
| `readOnly`              | `boolean`                           | `false` | No composer, no actions.                                                                |
| `locale`                | `string`                            | browser | Times and day dividers.                                                                 |
| `labels`                | `Partial<ChatLabels>`               | English | Every string; see Localization.                                                         |
| `message`               | `ChatMessage`                       | -       | On `Chat.Message`. Required.                                                            |
| `conversation`          | `ChatConversation`                  | -       | On `Chat.Conversation`: `id`, `title`, `avatar`, `preview`, `updatedAt`, `unreadCount`. |
| `value`                 | `string`                            | -       | Draft (controlled). On `Chat.Composer`.                                                 |
| `defaultValue`          | `string`                            | `''`    | Draft (uncontrolled). On `Chat.Composer`.                                               |
| `onValueChange`         | `(value: string) => void`           | -       | Every draft change, including the clear after sending.                                  |
| `maxLength`             | `number`                            | -       | On `Chat.Composer`.                                                                     |
| `placeholder`           | `string`                            | label   | On `Chat.Composer`.                                                                     |
| `startContent`          | `ReactNode`                         | -       | Controls before the field. On `Chat.Composer`.                                          |
| `endContent`            | `ReactNode`                         | -       | Controls before the send button (emoji). On `Chat.Composer`.                            |
| `allowAttachments`      | `boolean`                           | `false` | Attach button, drop and paste. Files go to `onSend`. On `Chat.Composer`.                |
| `accept`                | `string`                            | -       | File types, as `<input type="file">` `accept`. On `Chat.Composer`.                      |
| `maxFileSize`           | `number` (bytes)                    | -       | Largest file taken. On `Chat.Composer`.                                                 |
| `maxFileCount`          | `number`                            | -       | Most files per message. On `Chat.Composer`.                                             |
| `onFilesReject`         | `(rejections: UploadRejection[])`   | -       | Files turned down; the composer shows nothing, so tell the user. On `Chat.Composer`.    |

`ChatMessage` is
`{ id, senderId, text, createdAt, editedAt?, deleted?, status?, attachments?, replyTo? }`
with `status` one of `'sending' | 'sent' | 'delivered' | 'read' | 'failed'`.
`createdAt` / `editedAt` take a `Date`, an ISO string or epoch ms. `attachments`
are `ChatAttachment` — the same `UploadFile` entries `Upload` uses (`id`,
`file?`, `name?`, `size?`, `type?`, `url?`, `thumbUrl?`, `status?`, `progress?`,
`error?`).

Full props, events, data attributes & type definitions: see
`references/full-docs.md`.

## Localization

Pass `labels` (or set `components.Chat.defaultProps.labels` on the provider
once) and `locale`:

```tsx
<Chat
  locale="tr-TR"
  labels={{
    placeholder: 'Mesaj yazın…',
    send: 'Gönder',
    edit: 'Düzenle',
    delete: 'Sil',
    undo: 'Geri al',
    reply: 'Yanıtla',
    replyingTo: '{name} kişisine yanıt',
    you: 'Siz',
    attach: 'Dosya ekle',
    removeAttachment: '{name} dosyasını kaldır',
    downloadAttachment: '{name} dosyasını indir',
    edited: 'Düzenlendi',
    deleted: 'Bu mesaj silindi',
    read: 'Okundu',
    typing: '{names} yazıyor…',
  }}
  {...rest}
/>
```

`{names}` (typing) and `{count}` (`newMessages`, `unread`) are placeholders.
Empty strings fall back to the English default, so no control loses its name.

## Styling escape hatch

`classNames` / `slotProps` reach every slot — e.g. `Chat.Message`'s `bubble`,
`text`, `meta`, `status`; `Chat.Messages`' `viewport`, `divider`, `typing`;
`Chat.Composer`'s `controls`, `send`, `attach`, `attachments`; `Chat.Message`'s
`attachments`, `image`. Rows expose `data-own`, `data-status`, `data-deleted`,
`data-deleting`, `data-grouped` and `data-editing` for selectors.

## Gotchas

- **Give it a height.** The log scrolls inside the chat; the chat takes its
  container's height (`h-full`). In a page, put it in a sized box.
- **`status` on incoming messages means "read by me".** Anything but `'read'` is
  reported once through `onRead` when it is on screen; set it to `'read'`
  afterwards.
- **Edits are text only.** `onEdit` gets the new trimmed text; custom bubble
  content passed as `Chat.Message` children is yours to update.
- **Windows are UI only.** `editWindow` / `deleteWindow` hide the actions in
  time, but the server must reject late edits too.
- **`onDelete` is deferred.** It runs after `undoWindow` (5 s default), not on
  the click; the row shows as deleted with Undo meanwhile. Tests that expect an
  immediate call should pass `undoWindow={0}`.
- **Edits are text only, and files wait.** While a message is edited the
  composer's files stay aside (attach is off); a files-only message has no Edit.
- **`onSend` gets `File`s, not URLs.** Uploading is yours: update the
  attachment's `status` / `progress`, then set `url` (and `thumbUrl`). A local
  image previews from its `file` until then.
- **Replying and editing share the composer.** Starting one ends the other; a
  reply also ends when its message is deleted.
- **Reply, Copy and Pin are built in.** Don't add your own items for them. Reply
  and Copy are on by default (`allowReplies` / `allowCopy` turn them off); Pin
  appears with `onPinChange`. Menu order: Reply, Copy, Pin, Edit, Delete, then
  your items.
- **Every part must sit inside `Chat`**, and `Chat.MessageActions` inside
  `Chat.Message` — each throws otherwise.

## Accessibility

- The log is `role="log"` (new messages are announced) and focusable for
  keyboard scrolling; status ticks have text alternatives.
- Enter sends, Shift+Enter adds a line, IME composition is respected; ArrowUp in
  an empty field edits the last editable message; Escape leaves editing without
  closing a surrounding Drawer.
- The message menu button shows on hover and keyboard focus. Right click on the
  bubble (without a text selection) and a touch long press open the same menu.
  After Delete, focus goes to Undo.

## Reference

- Full component docs (Copy page): `references/full-docs.md`
- Live docs: https://takeoff-v2.app.turkishtechlab.com/docs/components/chat
- Source: `packages/react-spar/src/components/chat/`
