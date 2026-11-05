import { useState } from 'react';
import { Button, Drawer } from '@takeoff-ui/react-spar';
import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [{ id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. I stay open next to the page while you browse.', time: '10:15' }];

export default function DrawerExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full justify-center">
      <Drawer open={open} onOpenChange={setOpen} placement="right">
        <Drawer.Trigger as={Button}>Open chat</Drawer.Trigger>
        <Drawer.Overlay intensity="light" />
        {/* The chatbot brings its own header, so the panel holds only the chatbot. */}
        <Drawer.Panel aria-label="Takeoff bot" className="!w-[min(420px,100vw)] !p-0">
          <Chatbot
            messages={messages}
            typing={typing}
            onSubmit={submit}
            onClose={() => setOpen(false)}
            userAvatar="/img/blocks/chatbot/user-avatar.svg"
            className="!h-full !max-w-full !rounded-none !shadow-none"
          />
        </Drawer.Panel>
      </Drawer>
    </div>
  );
}
