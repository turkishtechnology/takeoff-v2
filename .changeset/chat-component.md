---
'@takeoff-ui/react-spar': minor
'@takeoff-design/tokens': minor
---

Add `Chat`, a compound messaging component for conversations between people. The
root is controlled (`messages`, `currentUserId`, `onSend`) and the parts lay it
out: `Chat.Header`, `Chat.Title`, `Chat.Messages` (a `role="log"` that stays at
the bottom, offers a "new messages" jump button, adds day dividers and a typing
line), `Chat.Message`, `Chat.MessageActions`, `Chat.Empty`, `Chat.Composer`, and
an optional `Chat.ConversationList` / `Chat.Conversation` / `Chat.Thread` split
layout that collapses to one pane below 640px.

- Delivery and read receipts: each message's `status` (`sending` / `sent` /
  `delivered` / `read` / `failed`) draws a clock, one tick, or two ticks;
  `onRead` reports incoming messages once they are on screen while the page is
  visible.
- Editing and deleting within a time window: `onEdit` / `onDelete` with
  `editWindow` / `deleteWindow` (ms). The actions disappear when the window
  closes; ArrowUp in an empty composer edits the last message and Escape leaves
  editing.
- Every string is in `labels` (with `locale` for times), so the whole chat
  translates through the provider.

`@takeoff-design/tokens` ships the `tk-chat-*` recipe.
