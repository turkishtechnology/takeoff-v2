/**
 * Usage example for the Chatbot block: keeps the conversation in state and
 * answers with a canned reply. Replace `reply` with a call to your backend or
 * AI SDK; stream into the last assistant message if your API streams.
 */
import { useEffect, useRef, useState } from 'react';
import { Chip } from '@takeoff-ui/react-spar';
import { Chatbot, type ChatbotMessage, type ChatbotType, ChatbotLauncher } from './Chatbot';

let nextId = 0;
const newId = () => `message-${++nextId}`;

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const starters = ['Where is my baggage?', 'Change my seat', 'Flight status TK1'];

const sample: ChatbotMessage[] = [
  { id: '1', role: 'assistant', content: 'Hi, I am Takeoff bot. How can I help with your trip today?', time: '20:12' },
  { id: '2', role: 'user', content: 'Can I add extra baggage to my booking?', time: '20:13', status: 'read' },
  {
    id: '3',
    role: 'assistant',
    content: 'Yes. You can add up to 2 extra pieces until 3 hours before departure. Shall I open the baggage page for your booking?',
    time: '20:13',
  },
];

async function reply(text: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return `You asked: "${text}". This demo answers with a canned reply. Connect onSubmit to your own service.`;
}

function useConversation(initial: ChatbotMessage[]) {
  const [messages, setMessages] = useState(initial);
  // Count pending replies so overlapping sends keep the indicator on.
  const [pending, setPending] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const submit = async (text: string) => {
    setMessages(current => [...current, { id: newId(), role: 'user', content: text, time: now(), status: 'sent' }]);
    setPending(count => count + 1);
    const answer = await reply(text);
    if (!mounted.current) return;
    setPending(count => count - 1);
    setMessages(current => [
      ...current.map(message => (message.role === 'user' ? { ...message, status: 'read' as const } : message)),
      { id: newId(), role: 'assistant', content: answer, time: now() },
    ]);
  };

  return { messages, typing: pending > 0, submit };
}

function Starters({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="m-auto flex max-w-72 flex-col items-center gap-3 text-center">
      <p className="text-sm text-text-base">Ask anything about your flight, or start with one of these:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {starters.map(text => (
          <Chip
            key={text}
            clickable
            onClick={event => {
              // The starters unmount once a message exists; move focus to the composer first.
              event.currentTarget.closest('section')?.querySelector('textarea')?.focus();
              onPick(text);
            }}
          >
            {text}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function ChatbotFloatingDemo() {
  const { messages, typing, submit } = useConversation(sample);

  return (
    <div className="relative h-[680px] w-full">
      <ChatbotLauncher defaultOpen messages={messages} typing={typing} onSubmit={submit} onAttach={() => {}} positionClassName="absolute bottom-4 right-4" />
    </div>
  );
}

export function ChatbotEmbeddedDemo() {
  const { messages, typing, submit } = useConversation([]);

  return (
    <div className="flex w-full justify-center">
      <Chatbot type="divided" messages={messages} typing={typing} onSubmit={submit} emptyState={<Starters onPick={submit} />} />
    </div>
  );
}

export function ChatbotTypeDemo({ type }: { type: ChatbotType }) {
  const { messages, typing, submit } = useConversation(sample);

  return <Chatbot type={type} messages={messages} typing={typing} onSubmit={submit} onAttach={() => {}} className="!h-[480px]" />;
}
