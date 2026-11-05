import { useEffect, useState } from 'react';
import { Button } from '@takeoff-ui/react-spar';
import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

/** Pages of a stored conversation, newest first. In your app, fetch them from your service. */
const pages: ChatbotMessage[][] = [
  [
    { id: 'p0-1', role: 'user', content: 'Did you add my Miles&Smiles number?', time: '11:20', status: 'read' },
    { id: 'p0-2', role: 'assistant', content: 'Yes, your miles for this trip will be credited within 3 days after the flight.', time: '11:20' },
  ],
  [
    { id: 'p1-1', role: 'user', content: 'Please add a vegetarian meal.', time: '11:18', status: 'read' },
    { id: 'p1-2', role: 'assistant', content: 'Done. A vegetarian meal is booked for both flights.', time: '11:18' },
  ],
  [
    { id: 'p2-1', role: 'assistant', content: 'Hi, I am Takeoff bot. How can I help with your trip?', time: '11:15' },
    { id: 'p2-2', role: 'user', content: 'I booked a flight to Tokyo yesterday.', time: '11:16', status: 'read' },
    { id: 'p2-3', role: 'assistant', content: 'I found it: TK52 on 12 December. What would you like to do?', time: '11:16' },
  ],
];

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function HistoryExample() {
  const { messages, setMessages, typing, submit } = useDemoConversation([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(0);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const loadFirstPage = async () => {
    setLoading(true);
    setMessages([]);
    await wait(1500);
    setMessages(pages[0]);
    setLoaded(1);
    setLoading(false);
  };

  useEffect(() => {
    void loadFirstPage();
    // Load once, when the chat opens.
  }, []);

  const loadOlder = async () => {
    if (loadingOlder || loaded >= pages.length) return;
    setLoadingOlder(true);
    await wait(1000);
    setMessages(current => [...pages[loaded], ...current]);
    setLoaded(loaded + 1);
    setLoadingOlder(false);
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Chatbot
        type="divided"
        messages={messages}
        typing={typing}
        onSubmit={submit}
        loading={loading}
        hasOlder={loaded < pages.length}
        loadingOlder={loadingOlder}
        onLoadOlder={() => void loadOlder()}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
        className="!h-[420px]"
      />
      <Button variant="neutral" appearance="outlined" size="small" onClick={() => void loadFirstPage()}>
        Reload
      </Button>
    </div>
  );
}
