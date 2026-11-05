import { ChatbotLauncher, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. How can I help with your trip today?', time: '20:12' },
  { id: '2', role: 'user', content: 'Can I add extra baggage to my booking?', time: '20:13', status: 'read' },
  {
    id: '3',
    role: 'assistant',
    content: 'Yes. You can add up to 2 extra pieces until 3 hours before departure. Shall I open the baggage page for your booking?',
    time: '20:13',
  },
];

export default function FloatingExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);

  return (
    <div className="relative h-[680px] w-full">
      <ChatbotLauncher
        defaultOpen
        positionClassName="absolute bottom-4 right-4"
        messages={messages}
        typing={typing}
        onSubmit={submit}
        assistantBubble="primary"
        userBubble="light"
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
        onMenu={() => {}}
      />
    </div>
  );
}
