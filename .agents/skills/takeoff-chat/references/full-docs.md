# Chat

`Chat` is a messaging surface between people: a conversation log, delivery and
read receipts, editing and deleting a message within a time window, replies,
file attachments, and an optional conversation list. It is controlled — your app
owns the messages and talks to the server; the component shows them and reports
what the user does. It fills its container, so the same anatomy works inside a
`Drawer`, a `Card`, or any sized region of a page.

## Usage

```tsx
import { Chat } from '@takeoff-ui/react-spar';
```

```tsx
<Chat>
  <Chat.ConversationList>
    <Chat.Conversation />
  </Chat.ConversationList>
  <Chat.Thread>
    <Chat.Header>
      <Chat.Title />
    </Chat.Header>
    <Chat.Messages>
      <Chat.Message>
        <Chat.MessageActions />
      </Chat.Message>
    </Chat.Messages>
    <Chat.Empty />
    <Chat.Composer />
  </Chat.Thread>
</Chat>
```

`Chat.ConversationList` and `Chat.Thread` are only needed for the split layout;
a single conversation uses the thread parts directly under `Chat`.

## Playground

Send a message to watch it go from _sending_ (clock) to _sent_ (one tick),
_delivered_ (two ticks) and _read_ (two coloured ticks). Hover one of your
messages for **Edit** and **Delete**, or press <kbd>↑</kbd> in the empty field
to edit your last message. Edits stay open for 15 minutes and deletes for an
hour. Any message can be answered with **Reply**.

```tsx
function PlaygroundDemo() {
  const minutesAgo = minutes => new Date(Date.now() - minutes * 60000);
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'ayse',
      text: 'Hi! Is the crew list for TK1979 ready?',
      createdAt: minutesAgo(32),
      status: 'read',
    },
    {
      id: '2',
      senderId: 'me',
      text: 'Almost — waiting for one confirmation.',
      createdAt: minutesAgo(30),
      status: 'read',
    },
    {
      id: '3',
      senderId: 'me',
      text: 'I will send it in 10 minutes.',
      createdAt: minutesAgo(29),
      status: 'read',
    },
    {
      id: '4',
      senderId: 'ayse',
      text: 'Great, thanks 🙏',
      createdAt: minutesAgo(2),
      status: 'delivered',
    },
  ]);
  const [typing, setTyping] = useState([]);

  const update = (id, patch) =>
    setMessages(list =>
      list.map(message =>
        message.id === id ? { ...message, ...patch } : message,
      ),
    );

  // Stand-in for your server: the message is sent, delivered, read, then answered.
  const handleSend = (text, attachments, { replyTo }) => {
    const id = String(Date.now());
    // Keep a copy of what is quoted, for when the original is not loaded.
    const reply = replyTo && {
      id: replyTo.id,
      senderId: replyTo.senderId,
      text: replyTo.text,
    };
    setMessages(list => [
      ...list,
      {
        id,
        senderId: 'me',
        text,
        createdAt: new Date(),
        status: 'sending',
        replyTo: reply,
      },
    ]);
    setTimeout(() => update(id, { status: 'sent' }), 500);
    setTimeout(() => update(id, { status: 'delivered' }), 1200);
    setTimeout(() => {
      update(id, { status: 'read' });
      setTyping(['ayse']);
    }, 2200);
    setTimeout(() => {
      setTyping([]);
      setMessages(list => [
        ...list,
        {
          id: id + '-reply',
          senderId: 'ayse',
          text: 'Got it 👍',
          createdAt: new Date(),
          status: 'delivered',
        },
      ]);
    }, 4000);
  };

  return (
    <Card className="h-130 w-full max-w-110 overflow-hidden">
      <Chat
        messages={messages}
        currentUserId="me"
        participants={[
          { id: 'me', name: 'You' },
          { id: 'ayse', name: 'Ayşe Yılmaz' },
        ]}
        typing={typing}
        allowReplies
        editWindow={15 * 60000}
        deleteWindow={60 * 60000}
        onSend={handleSend}
        onEdit={(message, text) =>
          update(message.id, { text, editedAt: new Date() })
        }
        onDelete={message => update(message.id, { deleted: true })}
        onRead={read =>
          read.forEach(message => update(message.id, { status: 'read' }))
        }
      >
        <Chat.Header>
          <Chat.Title>Ayşe Yılmaz</Chat.Title>
          <Badge variant="success" appearance="filledLight">
            Online
          </Badge>
        </Chat.Header>
        <Chat.Messages />
        <Chat.Empty>Say hello 👋</Chat.Empty>
        <Chat.Composer />
      </Chat>
    </Card>
  );
}
```

## Data model

A message is a plain object; update it immutably when the server answers.

```ts
interface ChatMessage {
  id: string;
  senderId: string; // equals `currentUserId` for the user's own messages
  text: string;
  createdAt: Date | string | number;
  editedAt?: Date | string | number; // shows "Edited"
  deleted?: boolean; // shows "This message was deleted"
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: ChatAttachment[]; // the same entries Upload uses
  replyTo?: { id: string; senderId?: string; text?: string }; // the message it answers
}
```

| You want to…                         | Do this                                                                                                                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Send a message                       | Handle `onSend(text)`: append it with `status: 'sending'`, then move it to `sent` / `delivered` / `read` as the server reports.                                                                         |
| Show whether the other side read it  | Set the `status` of the user's own messages. `read` draws the coloured double tick.                                                                                                                     |
| Mark incoming messages read          | Handle `onRead(messages)`. It fires once per message when an unread incoming message is on screen while the page is visible. Tell the server, then set their `status` to `read`.                        |
| Let users edit or delete for a while | Pass `onEdit` / `onDelete` and `editWindow` / `deleteWindow` in milliseconds. The actions disappear when the window closes, and an edit in progress ends with it. Enforce the same limit on the server. |
| Let users take back a delete         | Deleted messages offer Undo for `undoWindow` (5 seconds by default) and `onDelete` runs only after it, or when the chat unmounts. Pass `undoWindow={0}` to delete at once.                              |
| Let users send files                 | Set `allowAttachments` on `Chat.Composer`. `onSend(text, attachments)` gets the files; put them on the message and update each one's `status` / `progress`, then its `url`, as it uploads.              |
| Let users answer a message           | Set `allowReplies`. `onSend` gets the answered message as `details.replyTo`; store `{ id, senderId, text }` of it on the new message's `replyTo`.                                                       |
| Show who is typing                   | Pass `typing` with the participant ids.                                                                                                                                                                 |
| Load history                         | Set `hasOlder` and handle `onLoadOlder`; prepend the older messages. The reader stays on the same message.                                                                                              |

## Conversation list

With a `Chat.ConversationList` the chat shows the list beside the thread. When
the chat is narrower than 640px — a drawer, a phone — it shows one pane at a
time: the list until a conversation is opened, then the thread with a back
button in its header. Drive the open conversation with `conversationId` and
`onConversationChange`, and swap `messages` with it.

```tsx
function ConversationsDemo() {
  const minutesAgo = minutes => new Date(Date.now() - minutes * 60000);
  const [conversationId, setConversationId] = useState('ops');
  const [threads, setThreads] = useState({
    ops: [
      {
        id: 'o1',
        senderId: 'mehmet',
        text: 'Gate changed to F4.',
        createdAt: minutesAgo(12),
        status: 'read',
      },
      {
        id: 'o2',
        senderId: 'me',
        text: 'Noted, informing the crew.',
        createdAt: minutesAgo(10),
        status: 'read',
      },
    ],
    ayse: [
      {
        id: 'a1',
        senderId: 'ayse',
        text: 'Can you check the roster?',
        createdAt: minutesAgo(3),
        status: 'delivered',
      },
    ],
    zeynep: [],
  });
  const conversations = [
    {
      id: 'ops',
      title: 'Ops team',
      preview: 'Noted, informing the crew.',
      updatedAt: minutesAgo(10),
    },
    {
      id: 'ayse',
      title: 'Ayşe Yılmaz',
      preview: 'Can you check the roster?',
      updatedAt: minutesAgo(3),
      unreadCount: threads.ayse.some(m => m.status !== 'read') ? 1 : 0,
    },
    { id: 'zeynep', title: 'Zeynep Demir', preview: 'No messages yet' },
  ];
  const messages = conversationId ? threads[conversationId] : [];
  const setThread = fn =>
    setThreads(all => ({ ...all, [conversationId]: fn(all[conversationId]) }));

  return (
    <Card className="h-130 w-full overflow-hidden">
      <Chat
        messages={messages}
        currentUserId="me"
        participants={[
          { id: 'me', name: 'You' },
          { id: 'ayse', name: 'Ayşe Yılmaz' },
          { id: 'mehmet', name: 'Mehmet Kaya' },
        ]}
        conversationId={conversationId}
        onConversationChange={setConversationId}
        onSend={text =>
          setThread(list => [
            ...list,
            {
              id: String(Date.now()),
              senderId: 'me',
              text,
              createdAt: new Date(),
              status: 'sent',
            },
          ])
        }
        onRead={read =>
          setThread(list =>
            list.map(m =>
              read.some(r => r.id === m.id) ? { ...m, status: 'read' } : m,
            ),
          )
        }
      >
        <Chat.ConversationList>
          {conversations.map(conversation => (
            <Chat.Conversation
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </Chat.ConversationList>
        <Chat.Thread>
          <Chat.Header>
            <Chat.Title>
              {conversations.find(c => c.id === conversationId)?.title ??
                'Chat'}
            </Chat.Title>
          </Chat.Header>
          <Chat.Messages />
          <Chat.Empty>
            {conversationId ? 'No messages yet' : 'Pick a conversation'}
          </Chat.Empty>
          <Chat.Composer />
        </Chat.Thread>
      </Chat>
    </Card>
  );
}
```

## In a Drawer

`Chat` takes the height of its container, so a `Drawer.Body` without padding is
enough. Escape leaves message editing without closing the drawer.

```tsx
function DrawerDemo() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'support',
      text: 'Hello! How can we help with your booking?',
      createdAt: new Date(),
      status: 'read',
    },
  ]);

  return (
    <Drawer placement="right">
      <Drawer.Trigger as={Button}>Open chat</Drawer.Trigger>
      <Drawer.Overlay />
      <Drawer.Panel>
        <Drawer.Header>
          <Drawer.Title>Support</Drawer.Title>
          <Drawer.Close />
        </Drawer.Header>
        <Drawer.Body className="p-0">
          <Chat
            messages={messages}
            currentUserId="me"
            onSend={text =>
              setMessages(list => [
                ...list,
                {
                  id: String(Date.now()),
                  senderId: 'me',
                  text,
                  createdAt: new Date(),
                  status: 'sent',
                },
              ])
            }
          >
            <Chat.Messages />
            <Chat.Composer />
          </Chat>
        </Drawer.Body>
      </Drawer.Panel>
    </Drawer>
  );
}
```

## Group chat

With more than one other participant, incoming messages show their author's name
and avatar. Consecutive messages from one person within five minutes are
grouped.

```tsx
function GroupDemo() {
  const minutesAgo = minutes => new Date(Date.now() - minutes * 60000);
  const participants = [
    { id: 'me', name: 'You' },
    { id: 'ayse', name: 'Ayşe Yılmaz' },
    { id: 'mehmet', name: 'Mehmet Kaya' },
  ];
  const messages = [
    {
      id: '1',
      senderId: 'ayse',
      text: 'Briefing at 14:00 in room B.',
      createdAt: minutesAgo(20),
      status: 'read',
    },
    {
      id: '2',
      senderId: 'ayse',
      text: 'Please bring the updated manifests.',
      createdAt: minutesAgo(19),
      status: 'read',
    },
    {
      id: '3',
      senderId: 'mehmet',
      text: 'On my way.',
      createdAt: minutesAgo(5),
      status: 'read',
    },
    {
      id: '4',
      senderId: 'me',
      text: 'See you there.',
      createdAt: minutesAgo(1),
      status: 'delivered',
    },
  ];

  return (
    <Card className="h-110 w-full max-w-110 overflow-hidden">
      <Chat
        messages={messages}
        currentUserId="me"
        participants={participants}
        typing={['mehmet']}
      >
        <Chat.Header>
          <Chat.Title>Cabin crew · TK1979</Chat.Title>
        </Chat.Header>
        <Chat.Messages />
        <Chat.Composer />
      </Chat>
    </Card>
  );
}
```

## Replies

`allowReplies` adds **Reply** to every message's menu. The composer then shows
the message being answered above the field, with a button (or <kbd>Esc</kbd>) to
stop. `onSend(text, attachments, { replyTo })` hands it over; put a reference to
it on the new message's `replyTo`.

A reply quotes the original at the top of its bubble. While the original is in
`messages`, the quote shows it as it is now — edited or deleted — and pressing
the quote scrolls to it and highlights it for a moment. When it is not loaded,
the quote falls back to the `senderId` and `text` stored on `replyTo`.

```tsx
function RepliesDemo() {
  const minutesAgo = minutes => new Date(Date.now() - minutes * 60000);
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'ayse',
      text: 'Can you send me the gate info for TK1979?',
      createdAt: minutesAgo(40),
      status: 'read',
    },
    {
      id: '2',
      senderId: 'mehmet',
      text: 'Also: is the catering order final?',
      createdAt: minutesAgo(38),
      status: 'read',
    },
    {
      id: '3',
      senderId: 'ayse',
      text: 'Boarding starts 14:20.',
      createdAt: minutesAgo(30),
      status: 'read',
    },
    {
      id: '4',
      senderId: 'me',
      text: 'Gate F4, it changed this morning.',
      createdAt: minutesAgo(5),
      status: 'read',
      replyTo: {
        id: '1',
        senderId: 'ayse',
        text: 'Can you send me the gate info for TK1979?',
      },
    },
  ]);

  return (
    <Card className="h-120 w-full max-w-110 overflow-hidden">
      <Chat
        messages={messages}
        currentUserId="me"
        participants={[
          { id: 'me', name: 'You' },
          { id: 'ayse', name: 'Ayşe Yılmaz' },
          { id: 'mehmet', name: 'Mehmet Kaya' },
        ]}
        allowReplies
        onSend={(text, attachments, { replyTo }) =>
          setMessages(list => [
            ...list,
            {
              id: String(Date.now()),
              senderId: 'me',
              text,
              createdAt: new Date(),
              status: 'sent',
              replyTo: replyTo && {
                id: replyTo.id,
                senderId: replyTo.senderId,
                text: replyTo.text,
              },
            },
          ])
        }
      >
        <Chat.Header>
          <Chat.Title>Ops team</Chat.Title>
        </Chat.Header>
        <Chat.Messages />
        <Chat.Composer />
      </Chat>
    </Card>
  );
}
```

## Attachments

`allowAttachments` on `Chat.Composer` adds an attach button and takes files
dropped on the composer or pasted into it. They wait above the field, each with
a remove button, and go to `onSend` with the text — or on their own. `accept`,
`maxFileSize` and `maxFileCount` limit what the composer takes; `onFilesReject`
reports what it turned down, so you can tell the user.

A file is a `ChatAttachment`, the same entry
[Upload](/docs/components/upload#the-value) uses. On a message, uploaded images
show as previews and other files as rows with a download button. A file that is
still uploading shows its progress, and a failed one says so. Here the upload is
simulated.

```tsx
function AttachmentsDemo() {
  const minutesAgo = minutes => new Date(Date.now() - minutes * 60000);
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'ayse',
      text: 'Here is the updated roster.',
      createdAt: minutesAgo(8),
      status: 'read',
      attachments: [
        {
          id: 'f1',
          name: 'crew-roster-may.pdf',
          type: 'application/pdf',
          size: 248000,
          url: '#',
        },
      ],
    },
  ]);

  const updateFile = (messageId, fileId, patch) =>
    setMessages(list =>
      list.map(message =>
        message.id === messageId
          ? {
              ...message,
              attachments: message.attachments.map(file =>
                file.id === fileId ? { ...file, ...patch } : file,
              ),
            }
          : message,
      ),
    );

  // Stand-in for your upload: progress in steps, then done.
  const handleSend = (text, attachments) => {
    const id = String(Date.now());
    const files = attachments.map(file => ({
      ...file,
      status: 'uploading',
      progress: 0,
    }));
    setMessages(list => [
      ...list,
      {
        id,
        senderId: 'me',
        text,
        createdAt: new Date(),
        status: 'sent',
        attachments: files,
      },
    ]);
    files.forEach(file => {
      [25, 50, 75].forEach((progress, step) =>
        setTimeout(
          () => updateFile(id, file.id, { progress }),
          400 * (step + 1),
        ),
      );
      setTimeout(() => updateFile(id, file.id, { status: 'completed' }), 1600);
    });
  };

  return (
    <Card className="h-130 w-full max-w-110 overflow-hidden">
      <Chat
        messages={messages}
        currentUserId="me"
        participants={[
          { id: 'me', name: 'You' },
          { id: 'ayse', name: 'Ayşe Yılmaz' },
        ]}
        onSend={handleSend}
      >
        <Chat.Header>
          <Chat.Title>Ayşe Yılmaz</Chat.Title>
        </Chat.Header>
        <Chat.Messages />
        <Chat.Composer
          allowAttachments
          accept="image/*,.pdf,.docx,.xlsx"
          maxFileSize={10 * 1024 * 1024}
          maxFileCount={5}
        />
      </Chat>
    </Card>
  );
}
```

## Message actions

A message's menu lists what applies to it: **Reply** (with `allowReplies`),
**Copy** (on by default for messages with text; `allowCopy={false}` turns it
off), and on the user's own messages **Edit** and **Delete** while their windows
are open. Compose `Chat.MessageActions` inside `Chat.Message` to add your own
items after them — here **Pin**, which the app shows under the header. The edit
and delete windows are 30 seconds, so those two disappear shortly after a
message is sent.

```tsx
function ActionsDemo() {
  const minutesAgo = minutes => new Date(Date.now() - minutes * 60000);
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'ayse',
      text: 'New boarding time for TK1979 is 14:20.',
      createdAt: minutesAgo(20),
      status: 'read',
    },
    {
      id: '2',
      senderId: 'mehmet',
      text: 'Shall we move the briefing then?',
      createdAt: minutesAgo(2),
      status: 'read',
    },
    {
      id: '3',
      senderId: 'me',
      text: 'Yes, to 13:30',
      createdAt: minutesAgo(1),
      status: 'read',
    },
  ]);
  const [pinnedId, setPinnedId] = useState('1');
  const pinned = messages.find(m => m.id === pinnedId && !m.deleted);
  const update = (id, patch) =>
    setMessages(list => list.map(m => (m.id === id ? { ...m, ...patch } : m)));

  return (
    <Card className="h-120 w-full max-w-110 overflow-hidden">
      <Chat
        messages={messages}
        currentUserId="me"
        participants={[
          { id: 'me', name: 'You' },
          { id: 'ayse', name: 'Ayşe Yılmaz' },
          { id: 'mehmet', name: 'Mehmet Kaya' },
        ]}
        allowReplies
        editWindow={30000}
        deleteWindow={30000}
        onSend={text =>
          setMessages(list => [
            ...list,
            {
              id: String(Date.now()),
              senderId: 'me',
              text,
              createdAt: new Date(),
              status: 'sent',
            },
          ])
        }
        onEdit={(message, text) =>
          update(message.id, { text, editedAt: new Date() })
        }
        onDelete={message => update(message.id, { deleted: true })}
      >
        <Chat.Header>
          <Chat.Title>Ops team</Chat.Title>
        </Chat.Header>
        {pinned && (
          <div className="flex items-center gap-2 border-b border-(--border-light) px-4 py-1.5 text-sm">
            <KeepIconOutlinedRounded
              aria-hidden="true"
              className="shrink-0 text-(--primary-base)"
            />
            <span className="min-w-0 flex-1 truncate">{pinned.text}</span>
            <Button
              variant="neutral"
              appearance="text"
              size="small"
              onClick={() => setPinnedId(null)}
            >
              Unpin
            </Button>
          </div>
        )}
        <Chat.Messages>
          {message => (
            <Chat.Message message={message}>
              <Chat.MessageActions>
                <Dropdown.Separator />
                <Dropdown.Item
                  onSelect={() =>
                    setPinnedId(message.id === pinnedId ? null : message.id)
                  }
                >
                  <KeepIconOutlinedRounded aria-hidden="true" />
                  {message.id === pinnedId ? 'Unpin' : 'Pin'}
                </Dropdown.Item>
              </Chat.MessageActions>
            </Chat.Message>
          )}
        </Chat.Messages>
        <Chat.Composer />
      </Chat>
    </Card>
  );
}
```

## Localization

Every visible string and accessible name comes from `labels`; `locale` formats
times and dates. `{names}`, `{name}` and `{count}` are placeholders. Set them
once for the whole app through `TakeoffSparProvider`'s
`components.Chat.defaultProps.labels`.

```tsx
function LocalizationDemo() {
  const labels = {
    placeholder: 'Mesaj yazın…',
    send: 'Gönder',
    save: 'Değişiklikleri kaydet',
    editing: 'Mesaj düzenleniyor',
    cancelEdit: 'Düzenlemeyi iptal et',
    messageActions: 'Mesaj işlemleri',
    edit: 'Düzenle',
    delete: 'Sil',
    undo: 'Geri al',
    copy: 'Kopyala',
    copied: 'Kopyalandı',
    reply: 'Yanıtla',
    replyingTo: '{name} kişisine yanıt',
    cancelReply: 'Yanıtı iptal et',
    inReplyTo: 'Yanıtlanan mesaj',
    you: 'Siz',
    originalMessage: 'Asıl mesaj',
    attach: 'Dosya ekle',
    attachments: 'Gönderilecek dosyalar',
    removeAttachment: '{name} dosyasını kaldır',
    downloadAttachment: '{name} dosyasını indir',
    openAttachment: '{name} dosyasını aç',
    uploading: 'Yükleniyor…',
    uploadFailed: 'Yüklenemedi',
    uploadProgress: '{name} yükleme durumu',
    edited: 'Düzenlendi',
    deleted: 'Bu mesaj silindi',
    today: 'Bugün',
    yesterday: 'Dün',
    sending: 'Gönderiliyor',
    sent: 'Gönderildi',
    delivered: 'İletildi',
    read: 'Okundu',
    failed: 'İletilemedi',
    retry: 'Tekrar dene',
    typing: '{names} yazıyor…',
    typingMany: '{names} yazıyor…',
    messages: 'Mesajlar',
  };
  const [messages, setMessages] = useState([
    {
      id: '1',
      senderId: 'ayse',
      text: 'Merhaba!',
      createdAt: new Date(Date.now() - 86400000),
      status: 'read',
    },
    {
      id: '2',
      senderId: 'me',
      text: 'Merhaba, nasılsın?',
      createdAt: new Date(),
      status: 'read',
      editedAt: new Date(),
    },
  ]);

  return (
    <Card className="h-100 w-full max-w-110 overflow-hidden">
      <Chat
        messages={messages}
        currentUserId="me"
        locale="tr-TR"
        labels={labels}
        allowReplies
        onSend={text =>
          setMessages(list => [
            ...list,
            {
              id: String(Date.now()),
              senderId: 'me',
              text,
              createdAt: new Date(),
              status: 'sent',
            },
          ])
        }
        onEdit={(message, text) =>
          setMessages(list =>
            list.map(m =>
              m.id === message.id ? { ...m, text, editedAt: new Date() } : m,
            ),
          )
        }
      >
        <Chat.Messages />
        <Chat.Composer allowAttachments />
      </Chat>
    </Card>
  );
}
```

## Accessibility

- The log is a `role="log"` region, so screen readers announce new messages. It
  is focusable for keyboard scrolling.
- Delivery status icons carry a text alternative ("Sent", "Read", …).
- <kbd>Enter</kbd> sends, <kbd>Shift</kbd>+<kbd>Enter</kbd> adds a line, and
  <kbd>Enter</kbd> during an IME composition does not send.
- <kbd>↑</kbd> in an empty field edits your last editable message;
  <kbd>Esc</kbd> leaves editing. While editing, the field is named "Editing
  message".
- The message menu button sits next to the top of the bubble and appears on
  hover and keyboard focus. A right click on the bubble opens the same menu
  (unless text in it is selected, so it can still be copied), and on touch
  screens a long press opens it.
- **Copy** confirms with a "Copied" note under the message, which a polite
  status region also reads out.
- A quote is read as "In reply to" its author and text; when the original is
  loaded it is a button that scrolls to it. While answering, the field is named
  "Replying to" the author, and <kbd>Esc</kbd> stops answering.
- The attach button is named "Attach files", and the files waiting to be sent
  are a group named "Files to send", each with a remove button named after the
  file ("Remove report.pdf"). Files can also be dropped on the composer or
  pasted into the field.
- After Delete, focus moves to the message's Undo button; once the undo window
  ends, it moves on to the composer.

## API Reference

### Chat {#chat}

#### Props {#chat-props}

| Name                    | Type                                                                                      | Default              | Description                                                                                                                                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messages`              | <code><a href="#chat-td-chatmessage">ChatMessage</a>[]</code>                             | -                    | The conversation, oldest first.                                                                                                                                                                                                               |
| `currentUserId`         | <code>string</code>                                                                       | -                    | The signed-in user. Messages whose `senderId` matches are drawn as the user's own.                                                                                                                                                            |
| `participants`          | <code><a href="#chat-td-chatparticipant">ChatParticipant</a>[]</code>                     | -                    | Everyone in the conversation, for names and avatars. With more than one other participant the chat is drawn as a group: incoming messages show their author's name and avatar.                                                                |
| `allowReplies`          | <code>boolean</code>                                                                      | -                    | Adds Reply to every message's menu. The composer then shows what is being answered, and `onSend` gets it as `details.replyTo` — store it on the new message's `replyTo`.                                                                      |
| `allowCopy`             | <code>boolean</code>                                                                      | true                 | Copy in the menu of every message with text. It also works in a `readOnly` or `disabled` chat, since it changes nothing.                                                                                                                      |
| `editWindow`            | <code>number</code>                                                                       | -                    | How long after `createdAt` a message can still be edited, in milliseconds. Leave it unset for no limit. The Edit action disappears once it passes.                                                                                            |
| `deleteWindow`          | <code>number</code>                                                                       | -                    | How long after `createdAt` a message can still be deleted, in milliseconds. Leave it unset for no limit. The Delete action disappears once it passes.                                                                                         |
| `undoWindow`            | <code>number</code>                                                                       | 5000                 | How long a deleted message can still be restored, in milliseconds. Until then it shows as deleted with an Undo button, and `onDelete` is called when the time is up — or right away if the chat unmounts first. `0` calls `onDelete` at once. |
| `typing`                | <code>string[]</code>                                                                     | -                    | Ids of the participants who are typing right now. Shows the typing line at the end of the log.                                                                                                                                                |
| `hasOlder`              | <code>boolean</code>                                                                      | -                    | Shows a Load older messages button at the top of the log. Scrolling to the top loads them too.                                                                                                                                                |
| `isLoadingOlder`        | <code>boolean</code>                                                                      | -                    | Older messages are loading: the button shows a spinner and the log is marked busy.                                                                                                                                                            |
| `conversationId`        | <code>string &#124; null</code>                                                           | -                    | The open conversation (controlled), for chats with a `Chat.ConversationList`. `null` means none is open. Pair with `onConversationChange`.                                                                                                    |
| `defaultConversationId` | <code>string &#124; null</code>                                                           | -                    | The conversation open at first (uncontrolled).                                                                                                                                                                                                |
| `disabled`              | <code>boolean</code>                                                                      | -                    | Turns the composer and the message actions (except Copy) off, e.g. while offline.                                                                                                                                                             |
| `readOnly`              | <code>boolean</code>                                                                      | -                    | View-only conversation: no composer, and Copy is the only message action.                                                                                                                                                                     |
| `locale`                | <code>string</code>                                                                       | the browser's locale | BCP 47 locale for times and dates, e.g. `'tr-TR'`.                                                                                                                                                                                            |
| `labels`                | <code>Partial&lt;<a href="#chat-td-chatlabels">ChatLabels</a>&gt;</code>                  | -                    | Texts of the chat, e.g. a translation. Anything left out stays in English.                                                                                                                                                                    |
| `children`              | <code>React.ReactNode</code>                                                              | -                    | The parts: `Chat.Header`, `Chat.Messages`, `Chat.Empty`, `Chat.Composer`, and optionally `Chat.ConversationList` + `Chat.Thread`.                                                                                                             |
| `classNames`            | <code>Partial&lt;Record&lt;"root", string&gt;&gt;</code>                                  | -                    |                                                                                                                                                                                                                                               |
| `slotProps`             | <code>Partial&lt;Record&lt;"root", React.HTMLAttributes&lt;HTMLElement&gt;&gt;&gt;</code> | -                    |                                                                                                                                                                                                                                               |
| `className`             | <code>string</code>                                                                       | -                    | Appends custom classes to the root slot.                                                                                                                                                                                                      |

#### Events {#chat-events}

| Name                   | Type                                                                                                                                                                         | Default | Description                                                                                                                                                                                                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onSend`               | <code>(text: string, attachments: <a href="#chat-td-chatattachment">ChatAttachment</a>[], details: <a href="#chat-td-chatsenddetails">ChatSendDetails</a>) =&gt; void</code> | -       | Called when the user sends a message, with its trimmed text and the files added in the composer (`Chat.Composer`'s `allowAttachments`). The text is empty when only files are sent. Each file carries a fresh `id` and its `file`; upload it and put it on the message as an attachment. |
| `onEdit`               | <code>(message: <a href="#chat-td-chatmessage">ChatMessage</a>, text: string) =&gt; void</code>                                                                              | -       | Called with the message and its new trimmed text when an edit is saved. Setting it turns on the Edit action for the user's own messages.                                                                                                                                                 |
| `onDelete`             | <code>(message: <a href="#chat-td-chatmessage">ChatMessage</a>) =&gt; void</code>                                                                                            | -       | Called when the user deletes one of their messages, once `undoWindow` has passed without an undo. Setting it turns on the Delete action.                                                                                                                                                 |
| `onRead`               | <code>(messages: <a href="#chat-td-chatmessage">ChatMessage</a>[]) =&gt; void</code>                                                                                         | -       | Called with incoming messages that are not `'read'` yet once they are on screen while the page is visible — mark them read on the server and set their `status` to `'read'`. A message is reported once.                                                                                 |
| `onRetry`              | <code>(message: <a href="#chat-td-chatmessage">ChatMessage</a>) =&gt; void</code>                                                                                            | -       | Called from the Retry button under a `'failed'` message. The button is shown only when this is set.                                                                                                                                                                                      |
| `onLoadOlder`          | <code>() =&gt; void</code>                                                                                                                                                   | -       | Called to load older messages. Prepend them to `messages`; the reader's place in the log is kept.                                                                                                                                                                                        |
| `onConversationChange` | <code>(id: string &#124; null) =&gt; void</code>                                                                                                                             | -       | Called when the user opens a conversation, or goes back to the list (`null`).                                                                                                                                                                                                            |

#### Data attributes {#chat-data-attributes}

| Attribute          | Applied when                 | Purpose                                                                           |
| ------------------ | ---------------------------- | --------------------------------------------------------------------------------- |
| `data-slot="root"` | Always                       | Stable selector for wrapper styling on the root slot.                             |
| `data-layout`      | Always (`single` \| `split`) | `split` while a `Chat.ConversationList` is mounted: list and thread side by side. |
| `data-view`        | Always (`list` \| `thread`)  | Which pane a narrow split chat shows — the list until a conversation is open.     |
| `data-disabled`    | When `disabled`              | Styling hook for the disabled state.                                              |
| `data-readonly`    | When `readOnly`              | Styling hook for the view-only state.                                             |

### Chat.ConversationList {#chat-conversation-list}

#### Data attributes {#chat-conversation-list-data-attributes}

| Attribute          | Applied when | Purpose                                               |
| ------------------ | ------------ | ----------------------------------------------------- |
| `data-slot="root"` | Always       | Stable selector for wrapper styling on the root slot. |

### Chat.Conversation {#chat-conversation}

#### Props {#chat-conversation-props}

| Name           | Type                                                                                                                                                | Default | Description                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------- |
| `conversation` | <code><a href="#chat-td-chatconversation">ChatConversation</a></code>                                                                               | -       | The conversation this item opens.        |
| `classNames`   | <code>Partial&lt;Record&lt;<a href="#chat-td-chatconversationslot">ChatConversationSlot</a>, string&gt;&gt;</code>                                  | -       |                                          |
| `slotProps`    | <code>Partial&lt;Record&lt;<a href="#chat-td-chatconversationslot">ChatConversationSlot</a>, React.HTMLAttributes&lt;HTMLElement&gt;&gt;&gt;</code> | -       |                                          |
| `className`    | <code>string</code>                                                                                                                                 | -       | Appends custom classes to the root slot. |

#### Data attributes {#chat-conversation-data-attributes}

| Attribute          | Applied when                     | Purpose                                               |
| ------------------ | -------------------------------- | ----------------------------------------------------- |
| `data-slot="root"` | Always                           | Stable selector for wrapper styling on the root slot. |
| `data-selected`    | When it is the open conversation | Selected treatment; `aria-current="true"` is set too. |
| `data-unread`      | When `unreadCount` is above zero | Unread treatment (bold title).                        |

### Chat.Thread {#chat-thread}

#### Data attributes {#chat-thread-data-attributes}

| Attribute          | Applied when | Purpose                                               |
| ------------------ | ------------ | ----------------------------------------------------- |
| `data-slot="root"` | Always       | Stable selector for wrapper styling on the root slot. |

### Chat.Header {#chat-header}

#### Data attributes {#chat-header-data-attributes}

| Attribute          | Applied when | Purpose                                               |
| ------------------ | ------------ | ----------------------------------------------------- |
| `data-slot="root"` | Always       | Stable selector for wrapper styling on the root slot. |

### Chat.Title {#chat-title}

#### Data attributes {#chat-title-data-attributes}

| Attribute          | Applied when | Purpose                                               |
| ------------------ | ------------ | ----------------------------------------------------- |
| `data-slot="root"` | Always       | Stable selector for wrapper styling on the root slot. |

### Chat.Messages {#chat-messages}

#### Data attributes {#chat-messages-data-attributes}

| Attribute          | Applied when | Purpose                                               |
| ------------------ | ------------ | ----------------------------------------------------- |
| `data-slot="root"` | Always       | Stable selector for wrapper styling on the root slot. |

### Chat.Message {#chat-message}

#### Props {#chat-message-props}

| Name         | Type                                                                                                                                      | Default | Description                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `message`    | <code><a href="#chat-td-chatmessage">ChatMessage</a></code>                                                                               | -       | The message this row renders.                                                                 |
| `children`   | <code>React.ReactNode</code>                                                                                                              | -       | Replaces the text inside the bubble. A composed `Chat.MessageActions` becomes the row's menu. |
| `classNames` | <code>Partial&lt;Record&lt;<a href="#chat-td-chatmessageslot">ChatMessageSlot</a>, string&gt;&gt;</code>                                  | -       |                                                                                               |
| `slotProps`  | <code>Partial&lt;Record&lt;<a href="#chat-td-chatmessageslot">ChatMessageSlot</a>, React.HTMLAttributes&lt;HTMLElement&gt;&gt;&gt;</code> | -       |                                                                                               |
| `className`  | <code>string</code>                                                                                                                       | -       | Appends custom classes to the root slot.                                                      |

#### Data attributes {#chat-message-data-attributes}

| Attribute          | Applied when                                            | Purpose                                                                   |
| ------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `data-slot="root"` | Always                                                  | Stable selector for wrapper styling on the root slot.                     |
| `data-own`         | On the current user's messages                          | Aligns the row to the end and colours the bubble.                         |
| `data-status`      | When the message has a `status`                         | Delivery state: `sending` \| `sent` \| `delivered` \| `read` \| `failed`. |
| `data-deleted`     | When `deleted`, or deleted and waiting out `undoWindow` | Deleted-message treatment.                                                |
| `data-deleting`    | While a delete can still be undone                      | Dims the message until `onDelete` runs.                                   |
| `data-grouped`     | When it continues the previous message’s group          | Tighter spacing; hides the repeated avatar.                               |
| `data-editing`     | While the composer edits or answers it                  | Outlines the message the composer is working on.                          |
| `data-highlighted` | For a moment after a quote jumps to it                  | Flashes the bubble so the eye finds it.                                   |

### Chat.MessageActions {#chat-message-actions}

#### Data attributes {#chat-message-actions-data-attributes}

| Attribute          | Applied when | Purpose                                               |
| ------------------ | ------------ | ----------------------------------------------------- |
| `data-slot="root"` | Always       | Stable selector for wrapper styling on the root slot. |

### Chat.Empty {#chat-empty}

#### Data attributes {#chat-empty-data-attributes}

| Attribute          | Applied when | Purpose                                               |
| ------------------ | ------------ | ----------------------------------------------------- |
| `data-slot="root"` | Always       | Stable selector for wrapper styling on the root slot. |

### Chat.Composer {#chat-composer}

#### Props {#chat-composer-props}

| Name               | Type                                                                                                                                        | Default | Description                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `value`            | <code>string</code>                                                                                                                         | -       | The draft (controlled). Pair with `onValueChange`.                                                                              |
| `defaultValue`     | <code>string</code>                                                                                                                         | -       | The draft at first (uncontrolled).                                                                                              |
| `maxLength`        | <code>number</code>                                                                                                                         | -       | Longest message the user can send.                                                                                              |
| `placeholder`      | <code>string</code>                                                                                                                         | -       | Placeholder of the text field. Defaults to `labels.placeholder`.                                                                |
| `startContent`     | <code>React.ReactNode</code>                                                                                                                | -       | Controls before the text field, e.g. an attach button.                                                                          |
| `endContent`       | <code>React.ReactNode</code>                                                                                                                | -       | Controls between the text field and the send button, e.g. an emoji picker.                                                      |
| `allowAttachments` | <code>boolean</code>                                                                                                                        | -       | Lets the user add files: an attach button, dropping files on the composer, and pasting them. They go to `onSend` with the text. |
| `accept`           | <code>string</code>                                                                                                                         | -       | File types the composer takes, as in an `<input type="file">` `accept`, e.g. `'image/*,.pdf'`.                                  |
| `maxFileSize`      | <code>number</code>                                                                                                                         | -       | Largest file the composer takes, in bytes.                                                                                      |
| `maxFileCount`     | <code>number</code>                                                                                                                         | -       | Most files one message can carry.                                                                                               |
| `classNames`       | <code>Partial&lt;Record&lt;<a href="#chat-td-chatcomposerslot">ChatComposerSlot</a>, string&gt;&gt;</code>                                  | -       |                                                                                                                                 |
| `slotProps`        | <code>Partial&lt;Record&lt;<a href="#chat-td-chatcomposerslot">ChatComposerSlot</a>, React.HTMLAttributes&lt;HTMLElement&gt;&gt;&gt;</code> | -       |                                                                                                                                 |
| `className`        | <code>string</code>                                                                                                                         | -       | Appends custom classes to the root slot.                                                                                        |

#### Events {#chat-composer-events}

| Name            | Type                                                                                           | Default | Description                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onValueChange` | <code>(value: string) =&gt; void</code>                                                        | -       | Called with the draft on every change, including when it is cleared after sending.                                                               |
| `onFilesReject` | <code>(rejections: <a href="#chat-td-uploadrejection">UploadRejection</a>[]) =&gt; void</code> | -       | Called with the files the composer turned down (type, size or count) — the composer shows nothing for them, so tell the user, e.g. with a toast. |

#### Data attributes {#chat-composer-data-attributes}

| Attribute          | Applied when                                         | Purpose                                                                                                 |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `data-slot="root"` | Always                                               | Stable selector for wrapper styling on the root slot.                                                   |
| `data-editing`     | While a message is being edited                      | Editing treatment of the composer.                                                                      |
| `data-drag-state`  | While files are dragged over it (`allowAttachments`) | `accept` \| `reject` — the drop-target treatment; `reject` for types outside `accept` or while editing. |

### Type Definitions {#chat-type-definitions}

| Name                   | Definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatMessage`          | <code>&#123; id: string; senderId: string; text: string; createdAt: ChatTimestamp; editedAt?: ChatTimestamp; deleted?: boolean; status?: ChatMessageStatus; attachments?: <a href="#chat-td-chatattachment">ChatAttachment</a>[]; replyTo?: ChatReply &#125;</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ChatParticipant`      | <code>&#123; id: string; name: string; avatar?: string &#124; ReactNode &#125;</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `ChatLabels`           | <code>&#123; conversations: string; back: string; messages: string; loadOlder: string; today: string; yesterday: string; typing: string; typingMany: string; jumpToLatest: string; newMessages: string; placeholder: string; send: string; save: string; editing: string; cancelEdit: string; messageActions: string; edit: string; delete: string; undo: string; edited: string; deleted: string; sending: string; sent: string; delivered: string; read: string; failed: string; retry: string; unread: string; copy: string; copied: string; reply: string; replyingTo: string; cancelReply: string; inReplyTo: string; you: string; originalMessage: string; attach: string; attachments: string; removeAttachment: string; downloadAttachment: string; openAttachment: string; uploading: string; uploadFailed: string; uploadProgress: string &#125;</code> |
| `ChatAttachment`       | <code>&#123; id: string; file?: File; name?: string; size?: number; type?: string; url?: string; thumbUrl?: string; status?: UploadFileStatus; progress?: number; error?: string &#125;</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `ChatSendDetails`      | <code>&#123; replyTo?: <a href="#chat-td-chatmessage">ChatMessage</a> &#125;</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ChatConversation`     | <code>&#123; id: string; title: string; avatar?: string &#124; ReactNode; preview?: ReactNode; updatedAt?: ChatTimestamp; unreadCount?: number &#125;</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `ChatConversationSlot` | <code>'root' &#124; 'avatar' &#124; 'body' &#124; 'title' &#124; 'preview' &#124; 'time' &#124; 'unread'</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `ChatHeaderSlot`       | <code>'root' &#124; 'back'</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `ChatMessagesSlot`     | <code>'root' &#124; 'viewport' &#124; 'content' &#124; 'loadOlder' &#124; 'divider' &#124; 'typing' &#124; 'typingDots' &#124; 'jump'</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `ChatMessageSlot`      | <code>&#124; 'root' &#124; 'avatar' &#124; 'body' &#124; 'author' &#124; 'bubble' &#124; 'text' &#124; 'meta' &#124; 'time' &#124; 'edited' &#124; 'status' &#124; 'retry' &#124; 'undo' &#124; 'attachments' &#124; 'image' &#124; 'quote' &#124; 'quoteAuthor' &#124; 'quoteText' &#124; 'copied'</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `ChatComposerSlot`     | <code>'root' &#124; 'editing' &#124; 'cancel' &#124; 'replying' &#124; 'cancelReply' &#124; 'controls' &#124; 'send' &#124; 'upload' &#124; 'attach' &#124; 'attachments'</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `UploadRejection`      | <code>&#124; &#123; file: File; code: 'file-invalid-type'; /** The `accept` list the file failed to match. \*/ accept: string; &#125; &#124; &#123; file: File; code: 'file-too-large'; /** The `maxFileSize` (bytes) the file exceeded. _/ maxFileSize: number; &#125; &#124; &#123; file: File; code: 'too-many-files'; /\*\* How many files were allowed — `maxFileCount`, or 1 without `multiple`. _/ maxFileCount: number; &#125;</code>                                                                                                                                                                                                                                                                                                                                                                                                                     |
