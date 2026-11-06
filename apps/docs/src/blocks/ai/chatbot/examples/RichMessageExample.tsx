import { createContext, useContext } from 'react';
import { Badge, Button, Card, Chip } from '@takeoff-ui/react-spar';
import { AirplaneIconOutlinedRounded } from '@takeoff-icons/react/airplane';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';
import { FlashIconFilledRounded } from '@takeoff-icons/react/flash';
import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

// The quick replies live inside message content, which is created outside
// the component; a context hands them the conversation's `submit`. They sit
// on a white surface so they stand out from the tinted bubble.
const ReplyContext = createContext<(text: string) => void>(() => {});

function CityChips() {
  const reply = useContext(ReplyContext);

  return (
    <div className="flex flex-wrap gap-1.5">
      {['London', 'Paris', 'New York'].map(city => (
        <Chip key={city} variant="primary" appearance="outlined" clickable onClick={() => reply(city)} className="!bg-frames-lightest">
          <AirplaneIconOutlinedRounded width={16} height={16} aria-hidden="true" />
          {city}
        </Chip>
      ))}
    </div>
  );
}

function FareCard() {
  const reply = useContext(ReplyContext);

  return (
    <div className="flex w-60 flex-col gap-2">
      <Card className="overflow-hidden !rounded-2xl">
        <div className="relative">
          <img src="/img/blocks/chatbot/flight.jpg" alt="Turkish Airlines Boeing 777 above the clouds" className="block h-[178px] w-full object-cover" />
          <Badge variant="neutral" size="small" rounded startContent={<FlashIconFilledRounded />} className="!absolute top-2 right-2">
            Best fare
          </Badge>
        </div>
        <Card.Body className="flex flex-col gap-1">
          <span className="text-[11px] leading-4 text-text-base uppercase">Sat, 14 Nov · Direct</span>
          <Card.Title level={3} className="!text-xl !leading-[30px]">
            LHR → IST
          </Card.Title>
          <span className="text-sm text-text-base">TK1980 · 08:45 – 14:35 · from €189</span>
        </Card.Body>
        <Card.Footer>
          <Button variant="primary" appearance="text" size="small" endContent={<ChevronRightIconOutlinedRounded />} onClick={() => reply('Continue with TK1980')}>
            Continue
          </Button>
        </Card.Footer>
      </Card>
      <div className="flex gap-2">
        <Button variant="primary" appearance="outlined" className="flex-1 !bg-frames-lightest hover:!bg-background-lightest" onClick={() => reply('Yes')}>
          Yes
        </Button>
        <Button variant="primary" appearance="outlined" className="flex-1 !bg-frames-lightest hover:!bg-background-lightest" onClick={() => reply('No')}>
          No
        </Button>
      </div>
    </div>
  );
}

const conversation: ChatbotMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'I want to fly to Istanbul next weekend. Is this the plane?',
    attachments: [{ id: 'photo', name: 'plane.jpg', type: 'image/jpeg', url: '/img/blocks/chatbot/flight.jpg' }],
    time: '14:02',
    status: 'read',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'That is a Boeing 777. I found a direct flight that uses it. Where would you like to depart from?',
    time: '14:02',
    extra: <CityChips />,
  },
  { id: '3', role: 'user', content: 'London, on Saturday.', time: '14:03', status: 'read' },
  {
    id: '4',
    role: 'assistant',
    content: 'Here is the best match. Shall I hold this fare for you?',
    time: '14:03',
    extra: <FareCard />,
  },
];

export default function RichMessageExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);

  return (
    <ReplyContext.Provider value={text => submit(text, [])}>
      <div className="flex w-full justify-center">
        <Chatbot
          messages={messages}
          typing={typing}
          onSubmit={submit}
          assistantBubble="primary"
          userBubble="light"
          userAvatar="/img/blocks/chatbot/user-avatar.svg"
          className="!h-[640px]"
        />
      </div>
    </ReplyContext.Provider>
  );
}
