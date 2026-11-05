import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'user', content: 'How much cabin baggage can I take?', time: '09:41', status: 'read' },
  {
    id: '2',
    role: 'assistant',
    content: 'In economy you can take one cabin bag up to 8 kg and 23 × 40 × 55 cm, plus one personal item such as a handbag or laptop bag.',
    time: '09:41',
    sources: [
      { title: 'Cabin baggage rules', url: 'https://www.turkishairlines.com/en-int/any-questions/carry-on-baggage/' },
      { title: 'Baggage allowance', url: 'https://www.turkishairlines.com/en-int/any-questions/free-baggage/' },
    ],
  },
];

export default function SourcesExample() {
  const { messages, typing, submit } = useDemoConversation(conversation, {
    // In your app, return the documents your retrieval step used for the answer.
    answerWith: () => ({
      content: 'This demo answers with a canned reply and the pages it is based on.',
      sources: [{ title: 'Help center', url: 'https://www.turkishairlines.com/en-int/any-questions/' }],
    }),
  });

  return (
    <div className="flex w-full justify-center">
      <Chatbot
        type="divided"
        assistantBubble="light"
        messages={messages}
        typing={typing}
        onSubmit={submit}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
        className="!h-[480px]"
      />
    </div>
  );
}
