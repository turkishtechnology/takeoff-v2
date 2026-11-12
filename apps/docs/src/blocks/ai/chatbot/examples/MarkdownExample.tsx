import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

// `content` takes any ReactNode. In your app, render the model's markdown with
// the renderer you already use (e.g. react-markdown) and map its elements to
// classes like these. The block adds no typography of its own.
const answer = (
  <div className="flex flex-col gap-2">
    <p className="!m-0">
      Here is how to <strong>check in online</strong> for TK1980:
    </p>
    <ol className="!m-0 flex list-decimal flex-col gap-1 !pl-5">
      <li>
        Open <a href="#check-in">Manage booking</a> 24 hours before departure.
      </li>
      <li>Enter your booking code and surname.</li>
      <li>Pick your seat and download your boarding pass.</li>
    </ol>
    <p className="!m-0">Your booking code is the six characters on your confirmation, for example:</p>
    <code className="block rounded-md !border-0 !bg-background-light px-2 py-1.5 font-mono text-xs !text-text-darkest">Booking code: TKX7Q2</code>
    <p className="!m-0 text-text-base">
      <em>Online check-in closes 90 minutes before departure.</em>
    </p>
  </div>
);

const conversation: ChatbotMessage[] = [
  { id: '1', role: 'user', content: 'How do I check in online?', time: '07:15', status: 'read' },
  { id: '2', role: 'assistant', content: answer, time: '07:15' },
];

export default function MarkdownExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);

  return (
    <div className="flex w-full justify-center">
      <Chatbot type="divided" messages={messages} typing={typing} onSubmit={submit} copyable userAvatar="/img/blocks/chatbot/user-avatar.svg" />
    </div>
  );
}
