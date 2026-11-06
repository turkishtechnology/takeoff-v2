import { Chip } from '@takeoff-ui/react-spar';
import { Chatbot } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const starters = ['Where is my baggage?', 'Change my seat', 'Flight status TK1'];

export default function EmbeddedExample() {
  const { messages, typing, submit } = useDemoConversation([]);

  return (
    <div className="flex w-full justify-center">
      <Chatbot
        type="divided"
        messages={messages}
        typing={typing}
        onSubmit={submit}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
        emptyState={
          <div className="m-auto flex max-w-72 flex-col items-center gap-3 text-center">
            <p className="m-0 text-sm text-text-base">Ask anything about your flight, or start with one of these:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {starters.map(text => (
                <Chip
                  key={text}
                  clickable
                  onClick={event => {
                    // The starters unmount once a message exists; move focus to the composer first.
                    event.currentTarget.closest('section')?.querySelector('textarea')?.focus();
                    submit(text, []);
                  }}
                >
                  {text}
                </Chip>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}
