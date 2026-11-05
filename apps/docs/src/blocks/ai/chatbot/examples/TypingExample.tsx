import { useState } from 'react';
import { Button } from '@takeoff-ui/react-spar';
import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [{ id: '1', role: 'user', content: 'What is the baggage allowance on my flight to London?', time: '09:41', status: 'read' }];

export default function TypingExample() {
  // `stream` reveals each reply word by word after the typing indicator.
  const { messages, typing, submit } = useDemoConversation(conversation, { stream: true, delay: 1800 });
  const [forceTyping, setForceTyping] = useState(true);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Button variant="neutral" appearance="outlined" size="small" aria-pressed={forceTyping} onClick={() => setForceTyping(value => !value)}>
        {forceTyping ? 'Stop typing' : 'Show typing'}
      </Button>
      <Chatbot
        type="light"
        messages={messages}
        typing={typing || forceTyping}
        onSubmit={(text, files) => {
          setForceTyping(false);
          submit(text, files);
        }}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
        className="!h-[480px]"
      />
    </div>
  );
}
