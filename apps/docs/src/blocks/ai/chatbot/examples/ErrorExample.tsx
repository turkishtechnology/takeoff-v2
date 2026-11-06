import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. How can I help with your trip today?', time: '11:02' },
  { id: '2', role: 'user', content: 'Is my flight on time?', time: '11:03', status: 'read' },
  { id: '3', role: 'assistant', content: 'I could not reach the flight status service. Please try again.', time: '11:03', status: 'failed' },
  { id: '4', role: 'user', content: 'Can I upgrade to business class?', time: '11:04', status: 'failed' },
];

export default function ErrorExample() {
  const { messages, typing, submit, retry } = useDemoConversation(conversation);

  return (
    <div className="flex w-full justify-center">
      <Chatbot type="divided" messages={messages} typing={typing} onSubmit={submit} onRetry={retry} userAvatar="/img/blocks/chatbot/user-avatar.svg" />
    </div>
  );
}
