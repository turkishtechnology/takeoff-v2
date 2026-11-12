import { ChatbotLauncher, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. How can I help with your trip today?', time: '20:12' },
  { id: '2', role: 'user', content: 'Can I bring my bike?', time: '20:13', status: 'read' },
  { id: '3', role: 'assistant', content: 'Yes. Bikes fly as sports equipment, packed in a bike box. Add it to your booking up to 24 hours before departure.', time: '20:13' },
];

export default function MobileExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);

  return (
    // A phone-sized frame. Its transform makes it the containing block of the
    // full-screen panel, which in your app covers the viewport.
    <div className="relative mx-auto h-[640px] w-[360px] max-w-full transform-gpu overflow-hidden rounded-[28px] border-8 border-neutral-900 bg-background-lightest">
      <div className="flex flex-col gap-3 p-4">
        <div className="h-6 w-32 rounded bg-background-light" />
        <div className="h-32 rounded-lg bg-background-light" />
        <div className="h-4 w-3/4 rounded bg-background-light" />
        <div className="h-4 w-1/2 rounded bg-background-light" />
      </div>
      <ChatbotLauncher
        defaultOpen
        fullScreen
        positionClassName="absolute bottom-4 right-4"
        messages={messages}
        typing={typing}
        onSubmit={submit}
        assistantBubble="primary"
        userBubble="light"
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
      />
    </div>
  );
}
