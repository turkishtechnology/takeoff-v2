import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'user', content: 'How much hand luggage can I take?', time: '16:20', status: 'read' },
  {
    id: '2',
    role: 'assistant',
    content: 'In economy you can take one cabin bag up to 8 kg and 23 × 40 × 55 cm, plus a small personal item such as a handbag or laptop bag.',
    time: '16:20',
    feedback: 'up',
  },
];

export default function FeedbackExample() {
  const { messages, typing, submit, rate, regenerate } = useDemoConversation(conversation, { stream: true });

  return (
    <div className="flex w-full justify-center">
      <Chatbot
        type="divided"
        messages={messages}
        typing={typing}
        onSubmit={submit}
        copyable
        onFeedback={rate}
        onRegenerate={regenerate}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
      />
    </div>
  );
}
