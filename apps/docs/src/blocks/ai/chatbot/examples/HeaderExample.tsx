import { Card } from '@takeoff-ui/react-spar';
import { ChatbotHeader, type ChatbotType } from '../Chatbot';

const types: ChatbotType[] = ['basic', 'divided', 'light', 'dark', 'primary'];

export default function HeaderExample() {
  return (
    <div className="mx-auto flex w-full max-w-[400px] flex-col gap-4">
      {types.map(type => (
        <Card key={type} className="overflow-hidden !shadow-1-default-xs">
          <ChatbotHeader type={type} onMenu={() => {}} onClose={() => {}} />
        </Card>
      ))}
    </div>
  );
}
