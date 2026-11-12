import { useEffect, useRef, useState } from 'react';
import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi! Messages can be up to 200 characters. Send three in a row to see the rate limit.', time: '13:10' },
];

const MAX_PER_MINUTE = 3;

export default function LimitsExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);
  const [sent, setSent] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  useEffect(() => () => clearInterval(timer.current), []);

  // In your app, your service answers 429 Too Many Requests, often with a
  // Retry-After header that says how long to wait.
  const send = (text: string, files: File[]) => {
    void submit(text, files);
    if (sent + 1 < MAX_PER_MINUTE) {
      setSent(sent + 1);
      return;
    }
    setSent(0);
    setCooldown(15);
    timer.current = setInterval(() => {
      setCooldown(seconds => {
        if (seconds <= 1) clearInterval(timer.current);
        return seconds - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex w-full justify-center">
      <Chatbot
        type="divided"
        messages={messages}
        typing={typing}
        onSubmit={send}
        maxLength={200}
        disabled={cooldown > 0}
        notice={cooldown > 0 ? `You are sending messages too quickly. Try again in ${cooldown} s.` : undefined}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
      />
    </div>
  );
}
