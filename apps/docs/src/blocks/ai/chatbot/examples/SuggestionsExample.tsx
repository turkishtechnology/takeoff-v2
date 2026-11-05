import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'user', content: 'Can I bring my pet on board?', time: '10:02', status: 'read' },
  {
    id: '2',
    role: 'assistant',
    content: 'Yes. Cats, dogs and birds up to 8 kg, carrier included, can travel in the cabin on most flights.',
    time: '10:02',
    suggestions: ['How much does it cost?', 'What carrier can I use?', 'Book a pet seat'],
  },
];

// In your app, ask your service for follow-up questions along with the answer.
const followUps: Record<string, string[]> = {
  'How much does it cost?': ['What carrier can I use?', 'Book a pet seat'],
  'What carrier can I use?': ['How much does it cost?', 'Book a pet seat'],
};

export default function SuggestionsExample() {
  const { messages, typing, submit } = useDemoConversation(conversation, {
    answerWith: text => ({
      content: `Here is the answer to "${text}". In your app, it comes from your service.`,
      suggestions: followUps[text] ?? ['Talk to an agent'],
    }),
  });

  return (
    <div className="flex w-full justify-center">
      <Chatbot type="divided" messages={messages} typing={typing} onSubmit={submit} userAvatar="/img/blocks/chatbot/user-avatar.svg" />
    </div>
  );
}
