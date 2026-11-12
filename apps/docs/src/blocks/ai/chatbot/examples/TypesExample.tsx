import { Chatbot, type ChatbotIconType, type ChatbotMessage, type ChatbotType } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

// Each style paired with a bot icon type that suits it.
const variants: { type: ChatbotType; iconType: ChatbotIconType }[] = [
  { type: 'basic', iconType: 'primary' },
  { type: 'divided', iconType: 'dark' },
  { type: 'light', iconType: 'light' },
  { type: 'dark', iconType: 'dark' },
  { type: 'primary', iconType: 'primary' },
];

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. How can I help with your trip today?', time: '20:12' },
  { id: '2', role: 'user', content: 'Can I add extra baggage to my booking?', time: '20:13', status: 'read' },
  { id: '3', role: 'assistant', content: 'Yes. You can add up to 2 extra pieces until 3 hours before departure.', time: '20:13' },
];

function TypedChatbot({ type, iconType }: { type: ChatbotType; iconType: ChatbotIconType }) {
  const { messages, typing, submit } = useDemoConversation(conversation);

  return (
    <Chatbot
      type={type}
      iconType={iconType}
      messages={messages}
      typing={typing}
      onSubmit={submit}
      userAvatar="/img/blocks/chatbot/user-avatar.svg"
      onClose={() => {}}
      className="!h-[480px]"
    />
  );
}

export default function TypesExample() {
  return (
    <div className="grid w-full justify-items-center gap-6 lg:grid-cols-2">
      {variants.map(({ type, iconType }) => (
        <div key={type} className="flex w-full max-w-[400px] flex-col gap-2">
          <code className="self-start">
            type="{type}" iconType="{iconType}"
          </code>
          <TypedChatbot type={type} iconType={iconType} />
        </div>
      ))}
    </div>
  );
}
