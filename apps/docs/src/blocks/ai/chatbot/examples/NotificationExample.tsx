import { useState } from 'react';
import { ChatbotLauncher, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. Your flight to London is in 3 days.', time: '10:00' },
  { id: '2', role: 'assistant', content: 'Online check-in opens tomorrow at 08:45. Shall I remind you?', time: '10:00' },
];

export default function NotificationExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);
  const [unread, setUnread] = useState(2);

  return (
    <div className="relative h-[680px] w-full">
      <ChatbotLauncher
        positionClassName="absolute bottom-4 right-4"
        fullScreen={false}
        unread={unread}
        greeting="Hi! Can I help you with your trip?"
        // Opening the chat marks the messages as read.
        onOpenChange={open => open && setUnread(0)}
        messages={messages}
        typing={typing}
        onSubmit={submit}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
      />
    </div>
  );
}
