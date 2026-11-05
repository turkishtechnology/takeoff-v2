import { useState } from 'react';
import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [{ id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. Before we start, please read the note below.', time: '09:00' }];

export default function ConsentExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);
  // In your app, store the consent with the user's profile or session.
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex w-full justify-center">
      <Chatbot
        type="divided"
        messages={messages}
        typing={typing}
        onSubmit={submit}
        consent={
          accepted ? undefined : (
            <>
              This chat is recorded to improve our service. Your personal data is processed as described in our{' '}
              <a href="https://www.turkishairlines.com/en-int/legal-notice/privacy-policy/" target="_blank" rel="noreferrer" className="!text-current underline">
                privacy notice
              </a>
              .
            </>
          )
        }
        onAcceptConsent={() => setAccepted(true)}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
        className="!h-[420px]"
      />
    </div>
  );
}
