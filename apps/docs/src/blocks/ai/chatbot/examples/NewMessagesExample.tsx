import { Button } from '@takeoff-ui/react-spar';
import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { newId, now, useDemoConversation } from '../useDemoConversation';

const topics = ['baggage', 'seats', 'meals', 'lounges', 'Wi-Fi', 'Miles&Smiles', 'check-in', 'refunds'];

// A long history, so there is something to scroll up to.
const conversation: ChatbotMessage[] = topics.flatMap((topic, index) => [
  { id: `q${index}`, role: 'user' as const, content: `Tell me about ${topic}.`, time: '12:00', status: 'read' as const },
  { id: `a${index}`, role: 'assistant' as const, content: `Here is what you need to know about ${topic}. This is a short canned answer.`, time: '12:00' },
]);

export default function NewMessagesExample() {
  const { messages, setMessages, typing, submit } = useDemoConversation(conversation);

  // In your app, messages arrive from your service, e.g. over a WebSocket.
  const receive = () => setMessages(current => [...current, { id: newId(), role: 'assistant', content: 'Your gate has changed to F7. Boarding starts at 13:20.', time: now() }]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Chatbot type="divided" messages={messages} typing={typing} onSubmit={submit} userAvatar="/img/blocks/chatbot/user-avatar.svg" className="!h-[480px]" />
      <Button variant="neutral" appearance="outlined" size="small" onClick={receive}>
        Receive a message
      </Button>
    </div>
  );
}
