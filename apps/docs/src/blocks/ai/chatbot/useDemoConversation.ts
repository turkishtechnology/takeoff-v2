/**
 * Demo state for the Chatbot examples: keeps the conversation in React state
 * and answers with a canned reply. In your app, replace `reply` with a call
 * to your backend or AI SDK.
 */
import { useEffect, useRef, useState } from 'react';
import type { ChatbotAttachment, ChatbotAuthor, ChatbotMessage } from './Chatbot';

let nextId = 0;
export const newId = () => `message-${++nextId}`;

export const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function reply(text: string, files: File[], again: boolean) {
  if (again) {
    return 'Here is another answer. In your app, ask your service to answer the same question again.';
  }
  const received = files.length > 0 ? `I received ${files.length === 1 ? files[0].name : `${files.length} files`}. ` : '';
  const asked = text ? `You asked: "${text}". ` : '';
  return `${received}${asked}This demo answers with a canned reply. Connect onSubmit to your own service.`;
}

export interface DemoConversationOptions {
  /** Reveal the reply word by word, like a streamed AI response. */
  stream?: boolean;
  /** How long the bot "thinks" before answering, in ms. */
  delay?: number;
  /** How long a sent message can be undone, in ms. 0 turns undo off. */
  undoWindow?: number;
  /** Who answers, when it is not the bot, e.g. a human agent after a handoff. */
  author?: ChatbotAuthor;
}

export function useDemoConversation(initial: ChatbotMessage[], { stream = false, delay = 1200, undoWindow = 0, author }: DemoConversationOptions = {}) {
  const [messages, setMessages] = useState(initial);
  // Count pending replies so overlapping sends keep the indicator on.
  const [pending, setPending] = useState(0);
  const mounted = useRef(true);
  const retracted = useRef(new Set<string>());

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const update = (id: string, patch: Partial<ChatbotMessage>) => setMessages(current => current.map(message => (message.id === id ? { ...message, ...patch } : message)));

  /** Waits, then appends the bot's answer. Skipped if the question was retracted meanwhile. */
  const answer = async (prompt: string, files: File[], { again = false, questionId }: { again?: boolean; questionId?: string } = {}) => {
    setPending(count => count + 1);
    await wait(delay);
    if (!mounted.current) return;
    setPending(count => count - 1);
    if (questionId && retracted.current.has(questionId)) return;

    const text = reply(prompt, files, again);
    const id = newId();
    const markRead = (current: ChatbotMessage[]) =>
      current.map(message => (message.role === 'user' && message.status === 'sent' ? { ...message, status: 'read' as const, undoable: false } : message));

    if (!stream) {
      setMessages(current => [...markRead(current), { id, role: 'assistant', content: text, time: now(), author }]);
      return;
    }

    // Streaming: add an empty message, then grow its content chunk by chunk.
    setMessages(current => [...markRead(current), { id, role: 'assistant', content: '', time: now(), author }]);
    const words = text.split(' ');
    for (let i = 1; i <= words.length; i++) {
      await wait(60);
      if (!mounted.current) return;
      update(id, { content: words.slice(0, i).join(' ') });
    }
  };

  /** Delivers a user message (sending, then sent) and asks for the answer. */
  const deliver = async (id: string, text: string, files: File[]) => {
    await wait(500);
    if (!mounted.current || retracted.current.has(id)) return;
    update(id, { status: 'sent' });
    await answer(text, files, { questionId: id });
  };

  const submit = async (text: string, files: File[]) => {
    // Object URLs keep the files viewable in the log. Revoke them when the
    // conversation is cleared, or upload the files and use their URLs.
    const attachments: ChatbotAttachment[] = files.map(file => ({ id: newId(), name: file.name, type: file.type, url: URL.createObjectURL(file) }));
    const id = newId();
    setMessages(current => [...current, { id, role: 'user', content: text, attachments, time: now(), status: 'sending', undoable: undoWindow > 0 }]);
    if (undoWindow > 0) {
      setTimeout(() => mounted.current && update(id, { undoable: false }), undoWindow);
    }
    await deliver(id, text, files);
  };

  /** The text of the user message that an assistant message answers. */
  const questionFor = (message: ChatbotMessage) => {
    const before = messages.slice(0, messages.indexOf(message)).reverse();
    const question = before.find(item => item.role === 'user' && !item.retracted);
    return typeof question?.content === 'string' ? question.content : '';
  };

  /** Takes a user message back. Its answer is never sent. */
  const undo = (message: ChatbotMessage) => {
    retracted.current.add(message.id);
    update(message.id, { retracted: true, undoable: false });
  };

  /** Answers the same question again, in place of the given assistant message. */
  const regenerate = (message: ChatbotMessage) => {
    const prompt = questionFor(message);
    setMessages(current => current.filter(item => item.id !== message.id));
    void answer(prompt, [], { again: true });
  };

  /** Sends a failed user message again, or asks again after a failed answer. */
  const retry = (message: ChatbotMessage) => {
    if (message.role === 'assistant') {
      const prompt = questionFor(message);
      setMessages(current => current.filter(item => item.id !== message.id));
      void answer(prompt, []);
      return;
    }
    update(message.id, { status: 'sending' });
    void deliver(message.id, typeof message.content === 'string' ? message.content : '', []);
  };

  const rate = (message: ChatbotMessage, feedback: ChatbotMessage['feedback']) => update(message.id, { feedback });

  return { messages, setMessages, typing: pending > 0, submit, undo, retry, regenerate, rate };
}
