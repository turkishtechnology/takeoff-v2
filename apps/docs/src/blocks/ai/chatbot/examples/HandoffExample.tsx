import { useState } from 'react';
import { Chip } from '@takeoff-ui/react-spar';
import { CustomerIconOutlinedRounded } from '@takeoff-icons/react/customer';
import { Chatbot, type ChatbotAuthor } from '../Chatbot';
import { newId, now, useDemoConversation } from '../useDemoConversation';

// The illustration stands on the avatar's bottom edge, so it is passed as an
// element; a photo URL is cropped to the circle instead.
const agent: ChatbotAuthor = {
  name: 'Ayşe Yılmaz',
  avatar: <img src="/img/blocks/chatbot/agent-avatar.svg" alt="" className="h-[87.5%] w-auto" />,
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function HandoffExample() {
  const [connected, setConnected] = useState(false);
  // After the handoff, replies come from the agent.
  const { messages, setMessages, typing, submit } = useDemoConversation(
    [
      {
        id: '1',
        role: 'assistant',
        content: 'I could not find a way to change the name on your ticket. Would you like to talk to one of our agents?',
        time: '14:30',
        extra: <TalkToAgent onClick={() => void handOff()} />,
      },
    ],
    { author: connected ? agent : undefined },
  );

  // In your app, open the session with your live chat service here.
  async function handOff() {
    setMessages(current => [
      ...current.map(message => ({ ...message, extra: undefined })),
      { id: newId(), role: 'user', content: 'Talk to an agent', time: now(), status: 'read' },
      { id: newId(), role: 'system', content: 'Connecting you to an agent…' },
    ]);
    await wait(2000);
    setConnected(true);
    setMessages(current => [
      ...current,
      { id: newId(), role: 'system', content: `${agent.name} joined the chat` },
      { id: newId(), role: 'assistant', author: agent, content: 'Hi, I am Ayşe. I can help you with the name change. What is your booking code?', time: now() },
    ]);
  }

  return (
    <div className="flex w-full justify-center">
      <Chatbot
        type="divided"
        subtitle={connected ? 'Live agent' : 'Chat with'}
        agent={connected ? agent : undefined}
        messages={messages}
        typing={typing}
        onSubmit={submit}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
      />
    </div>
  );
}

function TalkToAgent({ onClick }: { onClick: () => void }) {
  return (
    <div>
      <Chip variant="primary" appearance="outlined" clickable onClick={onClick} className="!bg-frames-lightest">
        <CustomerIconOutlinedRounded width={16} height={16} aria-hidden="true" />
        Talk to an agent
      </Chip>
    </div>
  );
}
