/**
 * Takeoff block — AI / Chatbot
 *
 * A copy-paste block, not a package export. Copy this file into your app and
 * own it: wire `messages` and `onSubmit` to your backend or AI SDK, and change
 * the markup freely. It is built only from `@takeoff-ui/react-spar`,
 * `@takeoff-icons/react` and Tailwind classes from `@takeoff-design/tailwind`.
 *
 * Design: Figma → Takeoff - Blocks → Chatbot.
 */
import { type FormEvent, type KeyboardEvent, type ReactNode, type SVGProps, useEffect, useId, useRef, useState } from 'react';
import { Badge, Button, Card, Input } from '@takeoff-ui/react-spar';
import { AddCircleIconOutlinedRounded } from '@takeoff-icons/react/add-circle';
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';
import { DoneAllIconOutlinedRounded } from '@takeoff-icons/react/done-all';
import { FlashIconFilledRounded } from '@takeoff-icons/react/flash';
import { SendIconFilledRounded } from '@takeoff-icons/react/send';

export type ChatbotType = 'basic' | 'divided' | 'light' | 'dark' | 'primary';

export interface ChatbotMessage {
  id: string;
  role: 'assistant' | 'user';
  content: ReactNode;
  /** Shown under the bubble, e.g. `20:13`. */
  time?: string;
  /** Delivery state of a user message. `read` shows the double tick. */
  status?: 'sent' | 'read';
}

export interface ChatbotProps {
  messages: ChatbotMessage[];
  /** Called with the trimmed text when the user sends a message. */
  onSubmit: (text: string) => void;
  /** Shows the typing indicator below the last message. */
  typing?: boolean;
  /** Visual style; matches the Figma `type` variants of header, bubble and footer. */
  type?: ChatbotType;
  title?: string;
  subtitle?: string;
  online?: boolean;
  placeholder?: string;
  /** Renders the attach button and calls this when it is pressed. */
  onAttach?: () => void;
  /** Renders the close button and calls this when it is pressed. */
  onClose?: () => void;
  /** Content shown when there are no messages, e.g. prompt starters. */
  emptyState?: ReactNode;
  className?: string;
}

const styles: Record<
  ChatbotType,
  {
    subtitle: string;
    avatar: string;
    headerButton: 'neutral' | 'white';
    bubble: string;
    userBubble: string;
    footer: string;
    composer: string;
    field: string;
    divider: string;
    attach: string;
    send: string;
  }
> = {
  basic: {
    subtitle: 'text-text-base',
    avatar: 'text-primary-base',
    headerButton: 'neutral',
    bubble: 'text-text-darkest',
    userBubble: 'text-text-darkest',
    footer: 'bg-frames-lightest',
    composer: '',
    field: '',
    divider: 'bg-border-light',
    attach: '!text-neutral-600',
    send: '!text-primary-base',
  },
  divided: {
    subtitle: 'text-text-base',
    avatar: 'text-primary-base',
    headerButton: 'neutral',
    bubble: 'border border-border-light bg-frames-lightest p-3 text-text-darkest',
    userBubble: 'border border-border-light bg-frames-lightest px-3 py-2 text-text-darkest',
    footer: 'border-t border-border-light bg-frames-lightest',
    composer: '',
    field: '',
    divider: 'bg-border-light',
    attach: '!text-neutral-600',
    send: '!text-primary-base',
  },
  light: {
    subtitle: 'text-text-base',
    avatar: 'text-primary-base',
    headerButton: 'neutral',
    bubble: 'border border-border-light bg-background-lightest p-3 text-text-darkest',
    userBubble: 'border border-border-light bg-background-lightest px-3 py-2 text-text-darkest',
    footer: 'border-t border-border-light bg-background-lightest',
    composer: '',
    field: '',
    divider: 'bg-border-light',
    attach: '!text-neutral-600',
    send: '!text-primary-base',
  },
  dark: {
    subtitle: 'text-neutral-400',
    avatar: 'text-neutral-200',
    headerButton: 'white',
    bubble: 'border border-border-light bg-neutral-900 p-3 text-neutral-50',
    userBubble: 'border border-border-light bg-neutral-900 px-3 py-2 text-neutral-50',
    footer: 'bg-neutral-800',
    composer: '!border-neutral-600 !bg-transparent',
    field: '!text-neutral-50 placeholder:!text-neutral-600',
    divider: 'bg-neutral-600',
    attach: '!text-neutral-200',
    send: '!text-neutral-50',
  },
  primary: {
    subtitle: 'text-static-white',
    avatar: 'text-static-white',
    headerButton: 'white',
    bubble: 'bg-primary-lightest p-3 text-primary-darkest',
    userBubble: 'bg-primary-lightest px-3 py-2 text-primary-darkest',
    footer: 'bg-primary-base',
    composer: '!border-primary-sub-base !bg-transparent',
    field: '!text-static-white placeholder:!text-primary-light',
    divider: 'bg-primary-sub-base',
    attach: '!text-static-white',
    send: '!text-static-white',
  },
};

/** The Takeoff bot mark. Colour follows `currentColor`. */
export function ChatbotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M36.67 0H20C14.48 0 9.48 2.24 5.86 5.86A19.94 19.94 0 0 0 0 20c0 11.05 8.95 20 20 20s20-8.95 20-20V3.33C40 1.5 38.5 0 36.67 0Zm-7.24 29.43A13.29 13.29 0 0 1 20 33.33c-7.37 0-13.33-5.96-13.33-13.33 0-3.68 1.49-7.01 3.9-9.43A13.29 13.29 0 0 1 20 6.67c3.68 0 7.02 1.49 9.43 3.9a13.3 13.3 0 0 1 3.9 9.43c0 3.68-1.49 7.02-3.9 9.43Z" />
      <path d="M15.37 19.37c-.38.64-.87.5-1.61.3a6.81 6.81 0 0 0-1.85-.3c-.75 0-1.35.17-1.84.3-.75.2-1.23.34-1.61-.3-.62-1.02 1.08-3.54 3.45-3.54 2.38 0 4.07 2.52 3.46 3.54Z" />
      <path d="M29.93 19.67c.74.2 1.23.34 1.61-.3.61-1.02-1.08-3.54-3.45-3.54-2.38 0-4.07 2.52-3.46 3.54.38.64.87.5 1.61.3.49-.13 1.09-.3 1.84-.3.76 0 1.36.17 1.85.3Z" />
      <path d="M20 24.17c-1.33 0-2.21-1.15-2.25-1.2a.65.65 0 0 1 .08-.86.55.55 0 0 1 .8.09c.01.01.59.73 1.37.73.78 0 1.36-.73 1.37-.74a.55.55 0 0 1 .8-.09c.24.22.28.6.08.87-.04.05-.92 1.2-2.25 1.2Z" />
    </svg>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-end gap-2">
      <ChatbotIcon className="size-8 shrink-0 text-primary-base" />
      <div className="flex h-9 items-center gap-1 rounded-lg bg-background-lightest px-3" role="status">
        <span className="sr-only">{label}</span>
        {[0, 150, 300].map(delay => (
          <span key={delay} className="size-1.5 animate-bounce rounded-full bg-neutral-400 motion-reduce:animate-none" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
    </div>
  );
}

function Message({ message, type }: { message: ChatbotMessage; type: ChatbotType }) {
  const isUser = message.role === 'user';
  const s = styles[type];

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {isUser ? (
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-frames-lightest bg-background-light text-xs text-text-dark"
          aria-hidden="true"
        >
          You
        </span>
      ) : (
        <ChatbotIcon className="size-8 shrink-0 text-primary-base" />
      )}
      <div className={`flex max-w-[75%] flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg text-sm leading-5 whitespace-pre-wrap ${isUser ? s.userBubble : s.bubble}`}>{message.content}</div>
        {(message.time || message.status) && (
          <div className="flex items-center gap-1 text-[11px] leading-4 text-text-base">
            {message.time && <span>{message.time}</span>}
            {message.status === 'read' && <DoneAllIconOutlinedRounded width={16} height={16} className="text-primary-sub-base" />}
            {message.status === 'sent' && <CheckIconOutlinedRounded width={16} height={16} className="text-text-base" />}
            {message.status && <span className="sr-only">{message.status === 'read' ? 'Read' : 'Sent'}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function Chatbot({
  messages,
  onSubmit,
  typing = false,
  type = 'basic',
  title = 'Takeoff bot',
  subtitle = 'Chat with',
  online = true,
  placeholder = 'Type your message here',
  onAttach,
  onClose,
  emptyState,
  className = '',
}: ChatbotProps) {
  const s = styles[type];
  const titleId = useId();
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  // Follow new messages only while the reader is already at the bottom, so
  // scrolling up to re-read an earlier answer is never interrupted.
  useEffect(() => {
    const log = logRef.current;
    if (log && stickToBottom.current) {
      log.scrollTop = log.scrollHeight;
    }
  }, [messages, typing]);

  const handleScroll = () => {
    const log = logRef.current;
    if (log) {
      stickToBottom.current = log.scrollHeight - log.scrollTop - log.clientHeight < 24;
    }
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    stickToBottom.current = true;
    onSubmit(text);
    setDraft('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    send();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds a line. Never send while an IME
    // composition (e.g. Japanese or Korean input) is still open.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  return (
    <Card as="section" aria-labelledby={titleId} className={`flex h-[560px] w-full max-w-[400px] flex-col overflow-hidden ${className}`}>
      <Card.Header headerType={type} className="!flex-row items-center justify-between gap-3 !px-3 !py-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <ChatbotIcon className={`size-10 shrink-0 ${s.avatar}`} />
          <div className="min-w-0">
            <div className={`text-[11px] leading-4 ${s.subtitle}`}>{subtitle}</div>
            <div className="flex items-center gap-1">
              <Card.Title id={titleId} level={2} className="truncate !text-xl !leading-[30px]">
                {title}
              </Card.Title>
              {online && (
                <Badge variant="success" appearance="filledLight" size="small" rounded startContent={<FlashIconFilledRounded />}>
                  Online
                </Badge>
              )}
            </div>
          </div>
        </div>
        {onClose && (
          <Button variant={s.headerButton} appearance="text" size="small" aria-label="Close chat" onClick={onClose}>
            <CloseIconOutlinedRounded width={20} height={20} />
          </Button>
        )}
      </Card.Header>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={`Conversation with ${title}`}
        tabIndex={0}
        onScroll={handleScroll}
        className="flex flex-1 flex-col gap-4 overflow-y-auto bg-frames-lightest p-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-base"
      >
        {messages.length === 0 && !typing ? emptyState : messages.map(message => <Message key={message.id} message={message} type={type} />)}
        {typing && <TypingIndicator label={`${title} is typing`} />}
      </div>

      <form onSubmit={handleSubmit} className={`p-3 ${s.footer}`}>
        <Input className={`items-end !gap-2 !p-1 ${s.composer}`}>
          {onAttach && (
            <>
              <Button variant="neutral" appearance="text" size="small" aria-label="Attach a file" onClick={onAttach} className={s.attach}>
                <AddCircleIconOutlinedRounded width={20} height={20} />
              </Button>
              <span className={`h-8 w-px shrink-0 ${s.divider}`} aria-hidden="true" />
            </>
          )}
          <Input.Field
            as="textarea"
            rows={1}
            value={draft}
            onChange={event => setDraft(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Message"
            className={`max-h-32 !resize-none self-center py-1.5 [field-sizing:content] ${s.field}`}
          />
          <Button type="submit" variant="neutral" appearance="text" size="small" aria-label="Send message" disabled={!draft.trim()} className={`disabled:opacity-40 ${s.send}`}>
            <SendIconFilledRounded width={20} height={20} />
          </Button>
        </Input>
      </form>
    </Card>
  );
}

export interface ChatbotLauncherProps extends Omit<ChatbotProps, 'onClose'> {
  /** Start open. */
  defaultOpen?: boolean;
  /** Positioning of the launcher. Defaults to the bottom-right of the viewport. */
  positionClassName?: string;
}

/** A floating action button that opens the chatbot in a panel above it. */
export function ChatbotLauncher({ defaultOpen = false, positionClassName = 'fixed bottom-6 right-6', ...chatbotProps }: ChatbotLauncherProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Move focus into the composer only when the user opens the panel, never on
  // mount: a `defaultOpen` launcher must not pull the page to itself on load.
  const openedByUser = useRef(false);
  useEffect(() => {
    if (open && openedByUser.current) {
      openedByUser.current = false;
      panelRef.current?.querySelector('textarea')?.focus();
    }
  }, [open]);

  const openPanel = () => {
    openedByUser.current = true;
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={`z-50 flex flex-col items-end gap-3 ${positionClassName}`} onKeyDown={event => event.key === 'Escape' && !event.nativeEvent.isComposing && open && close()}>
      {open && (
        <div id={panelId} ref={panelRef} className="w-[min(400px,calc(100vw-2rem))]">
          <Chatbot {...chatbotProps} onClose={close} />
        </div>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? 'Hide chat' : `Chat with ${chatbotProps.title ?? 'Takeoff bot'}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? close() : openPanel())}
        className="flex size-12 items-center justify-center rounded-full bg-static-white text-primary-base shadow-lg transition-colors hover:text-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-base"
      >
        <ChatbotIcon className="size-12" />
      </button>
    </div>
  );
}
