import { useState } from 'react';
import { Chatbot, ChatbotRating, type ChatbotMessage } from '../Chatbot';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'user', content: 'I want to change my flight to tomorrow morning.', time: '15:02', status: 'read' },
  { id: '2', role: 'assistant', content: 'Done. You are now on TK2312, departing tomorrow at 08:45. Your new boarding pass is in your email.', time: '15:03' },
  { id: '3', role: 'system', content: 'The chat has ended' },
];

export default function RatingExample() {
  const [rating, setRating] = useState(0);

  return (
    <div className="flex w-full justify-center">
      <Chatbot
        type="divided"
        messages={conversation}
        onSubmit={() => {}}
        // The chat has ended, so the composer is off.
        disabled
        // In your app, send the rating to your analytics or survey service.
        endContent={<ChatbotRating question="How was your chat with Takeoff bot?" value={rating} onChange={setRating} />}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
      />
    </div>
  );
}
