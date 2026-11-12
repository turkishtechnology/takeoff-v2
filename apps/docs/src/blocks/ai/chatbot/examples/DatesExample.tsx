import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

// Give each message the label of its day. In your app, format the send date,
// e.g. with Intl.RelativeTimeFormat for "Yesterday" and Intl.DateTimeFormat for older days.
const conversation: ChatbotMessage[] = [
  { id: '1', day: '3 November', role: 'user', content: 'Is my flight to London on time?', time: '16:40', status: 'read' },
  { id: '2', day: '3 November', role: 'assistant', content: 'Yes, TK1979 is on time and boards at 17:35 from gate F4.', time: '16:40' },
  { id: '3', day: 'Yesterday', role: 'user', content: 'Can I choose a seat for my return flight?', time: '09:12', status: 'read' },
  { id: '4', day: 'Yesterday', role: 'assistant', content: 'Seat selection opens 72 hours before departure. I will remind you.', time: '09:12' },
  { id: '5', day: 'Today', role: 'assistant', content: 'Seat selection for your return flight TK1980 is open now.', time: '08:00' },
];

export default function DatesExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);

  return (
    <div className="flex w-full justify-center">
      <Chatbot type="divided" messages={messages} typing={typing} onSubmit={submit} userAvatar="/img/blocks/chatbot/user-avatar.svg" />
    </div>
  );
}
