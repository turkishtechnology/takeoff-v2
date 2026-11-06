import { ChatbotLauncher, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. Use the full screen button in my header when you need more room.', time: '11:05' },
];

export default function ExpandExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);

  return (
    // The transform makes this frame the containing block of the full screen
    // panel, so it fills the preview here. In your app it fills the viewport.
    <div className="relative h-[680px] w-full transform-gpu overflow-hidden">
      <ChatbotLauncher
        defaultOpen
        expandable
        positionClassName="absolute bottom-4 right-4"
        messages={messages}
        typing={typing}
        onSubmit={submit}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
      />
    </div>
  );
}
