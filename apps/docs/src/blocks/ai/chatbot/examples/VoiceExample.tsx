import { useEffect, useRef, useState } from 'react';
import { Chatbot, type ChatbotMessage } from '../Chatbot';
import { useDemoConversation } from '../useDemoConversation';

const conversation: ChatbotMessage[] = [{ id: '1', role: 'assistant', content: 'Hi, press the microphone and ask your question out loud.', time: '07:30' }];

export default function VoiceExample() {
  const { messages, typing, submit } = useDemoConversation(conversation);
  const [listening, setListening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  // This demo pretends to hear a question after two seconds. In your app,
  // record with the Web Speech API or MediaRecorder and send the transcript.
  const toggle = () => {
    clearTimeout(timer.current);
    if (listening) {
      setListening(false);
      return;
    }
    setListening(true);
    timer.current = setTimeout(() => {
      setListening(false);
      void submit('What is the weather like in Istanbul?', []);
    }, 2000);
  };

  return (
    <div className="flex w-full justify-center">
      <Chatbot
        type="divided"
        messages={messages}
        typing={typing}
        onSubmit={submit}
        onVoiceInput={toggle}
        listening={listening}
        userAvatar="/img/blocks/chatbot/user-avatar.svg"
        className="!h-[420px]"
      />
    </div>
  );
}
