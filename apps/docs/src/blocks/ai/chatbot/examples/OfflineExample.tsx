import { Chatbot, type ChatbotMessage } from '../Chatbot';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. How can I help with your trip today?', time: '23:58' },
  { id: '2', role: 'user', content: 'I need help with my refund.', time: '23:59', status: 'sent' },
];

export default function OfflineExample() {
  return (
    <div className="flex w-full justify-center">
      <Chatbot
        type="divided"
        online={false}
        offlineNotice="We are offline for maintenance until 06:00. Your messages are saved."
        messages={conversation}
        onSubmit={() => {}}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
        className="!h-[420px]"
      />
    </div>
  );
}
