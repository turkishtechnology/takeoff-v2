import { useState } from 'react';
import { ArrowDownloadIconOutlinedRounded } from '@takeoff-icons/react/arrow-download';
import { ChatIconOutlinedRounded } from '@takeoff-icons/react/chat';
import { VolumeOffIconOutlinedRounded } from '@takeoff-icons/react/volume-off';
import { VolumeUpIconOutlinedRounded } from '@takeoff-icons/react/volume-up';
import { ChatbotLauncher, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. How can I help with your trip today?', time: '20:12' },
  { id: '2', role: 'user', content: 'Can I add extra baggage to my booking?', time: '20:13', status: 'read' },
  {
    id: '3',
    role: 'assistant',
    content: 'Yes. You can add up to 2 extra pieces until 3 hours before departure. Shall I open the baggage page for your booking?',
    time: '20:13',
  },
];

/** Saves the conversation as a text file. */
function download(messages: ChatbotMessage[]) {
  const text = messages
    .filter(message => typeof message.content === 'string')
    .map(message => `[${message.time ?? ''}] ${message.role === 'user' ? 'You' : 'Takeoff bot'}: ${message.content}`)
    .join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  link.download = 'chat.txt';
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function FloatingExample() {
  const { messages, setMessages, typing, submit } = useDemoConversation(conversation);
  const [muted, setMuted] = useState(false);

  return (
    <div className="relative h-[680px] w-full">
      <ChatbotLauncher
        defaultOpen
        positionClassName="absolute bottom-4 right-4"
        // Keep the open preview inside its frame on phones; see the Mobile example.
        fullScreen={false}
        messages={messages}
        typing={typing}
        onSubmit={submit}
        assistantBubble="primary"
        userBubble="light"
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
        menuItems={[
          { label: 'New chat', icon: <ChatIconOutlinedRounded />, onSelect: () => setMessages([conversation[0]]) },
          { label: 'Download chat', icon: <ArrowDownloadIconOutlinedRounded />, onSelect: () => download(messages) },
          muted
            ? { label: 'Unmute', icon: <VolumeUpIconOutlinedRounded />, onSelect: () => setMuted(false) }
            : { label: 'Mute', icon: <VolumeOffIconOutlinedRounded />, onSelect: () => setMuted(true) },
        ]}
      />
    </div>
  );
}
