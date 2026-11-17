import { Chat as ChatRoot } from './Chat';
import { ChatComposer } from './ChatComposer';
import { ChatConversation } from './ChatConversation';
import { ChatConversationList } from './ChatConversationList';
import { ChatEmpty } from './ChatEmpty';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatMessageActions } from './ChatMessageActions';
import { ChatMessages } from './ChatMessages';
import { ChatThread } from './ChatThread';
import { ChatTitle } from './ChatTitle';

const Chat = Object.assign(ChatRoot, {
  ConversationList: ChatConversationList,
  Conversation: ChatConversation,
  Thread: ChatThread,
  Header: ChatHeader,
  Title: ChatTitle,
  Messages: ChatMessages,
  Message: ChatMessage,
  MessageActions: ChatMessageActions,
  Empty: ChatEmpty,
  Composer: ChatComposer,
});

export { Chat };

// No value exports: messages, participants and conversations are plain
// objects the consumer builds and updates.
export type {
  ChatComposerProps,
  ChatComposerSlot,
  ChatConversation,
  ChatConversationListProps,
  ChatConversationListSlot,
  ChatConversationProps,
  ChatConversationSlot,
  ChatEmptyProps,
  ChatEmptySlot,
  ChatHeaderProps,
  ChatHeaderSlot,
  ChatLabels,
  ChatMessage,
  ChatMessageActionsProps,
  ChatMessageActionsSlot,
  ChatMessageProps,
  ChatMessageSlot,
  ChatMessagesProps,
  ChatMessagesSlot,
  ChatMessageStatus,
  ChatParticipant,
  ChatProps,
  ChatSlot,
  ChatThreadProps,
  ChatThreadSlot,
  ChatTimestamp,
  ChatTitleProps,
  ChatTitleSlot,
} from './types';
