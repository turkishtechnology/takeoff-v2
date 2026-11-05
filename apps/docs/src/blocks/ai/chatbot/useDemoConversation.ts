/**
 * Demo state for the Chatbot examples: keeps the conversation in React state
 * and answers with a canned reply. In your app, replace `reply` with a call
 * to your backend or AI SDK.
 */
import { useEffect, useRef, useState } from 'react';
import type { ChatbotAttachment, ChatbotMessage } from './Chatbot';

let nextId = 0;
export const newId = () => `message-${++nextId}`;

export const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function reply(text: string, files: File[]) {
  const received = files.length > 0 ? `I received ${files.length === 1 ? files[0].name : `${files.length} files`}. ` : '';
  const asked = text ? `You asked: "${text}". ` : '';
  return `${received}${asked}This demo answers with a canned reply. Connect onSubmit to your own service.`;
}

export interface DemoConversationOptions {
  /** Reveal the reply word by word, like a streamed AI response. */
  stream?: boolean;
  /** How long the bot "thinks" before answering, in ms. */
  delay?: number;
}

export function useDemoConversation(initial: ChatbotMessage[], { stream = false, delay = 1200 }: DemoConversationOptions = {}) {
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

  const submit = async (text: string, files: File[]) => {
    // Object URLs keep the files viewable in the log. Revoke them when the
    // conversation is cleared, or upload the files and use their URLs.
    const attachments: ChatbotAttachment[] = files.map(file => ({ id: newId(), name: file.name, type: file.type, url: URL.createObjectURL(file) }));
    setMessages(current => [...current, { id: newId(), role: 'user', content: text, attachments, time: now(), status: 'sent' }]);
    setPending(count => count + 1);
    await wait(delay);
    if (!mounted.current) return;
    setPending(count => count - 1);

    const answer = reply(text, files);
    const id = newId();
    const markRead = (current: ChatbotMessage[]) => current.map(message => (message.role === 'user' ? { ...message, status: 'read' as const } : message));

    if (!stream) {
      setMessages(current => [...markRead(current), { id, role: 'assistant', content: answer, time: now() }]);
      return;
    }

    // Streaming: add an empty message, then grow its content chunk by chunk.
    setMessages(current => [...markRead(current), { id, role: 'assistant', content: '', time: now() }]);
    const words = answer.split(' ');
    for (let i = 1; i <= words.length; i++) {
      await wait(60);
      if (!mounted.current) return;
      const content = words.slice(0, i).join(' ');
      setMessages(current => current.map(message => (message.id === id ? { ...message, content } : message)));
    }
  };

  return { messages, setMessages, typing: pending > 0, submit };
}
