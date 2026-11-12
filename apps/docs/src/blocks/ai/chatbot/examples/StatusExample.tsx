import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. How can I help with your trip today?', time: '09:40' },
  { id: '2', role: 'user', content: 'Cancel my flight to Paris', time: '09:41', retracted: true },
  { id: '3', role: 'user', content: 'Which terminal does TK1823 leave from?', time: '09:41', status: 'read' },
  { id: '4', role: 'assistant', content: 'TK1823 leaves from Istanbul Airport, international departures. Check-in is in row F.', time: '09:41' },
];

export default function StatusExample() {
  // A sent message can be undone for up to 5 seconds, until the bot reads it.
  const { messages, typing, submit, undo } = useDemoConversation(conversation, { undoWindow: 5000, delay: 2500 });

  return (
    <div className="flex w-full justify-center">
      <Chatbot type="divided" messages={messages} typing={typing} onSubmit={submit} onUndo={undo} userAvatar="/img/blocks/chatbot/user-avatar.svg" />
    </div>
  );
}
