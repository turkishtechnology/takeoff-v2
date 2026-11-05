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
import { type ChangeEvent, type FormEvent, type KeyboardEvent, type ReactNode, type SVGProps, useEffect, useId, useRef, useState } from 'react';
import { Badge, Button, Card, Dropdown, Input } from '@takeoff-ui/react-spar';
import { AddCircleIconFilledTk } from '@takeoff-icons/react/add-circle';
import { AttachIconOutlinedRounded } from '@takeoff-icons/react/attach';
import { CameraIconOutlinedRounded } from '@takeoff-icons/react/camera';
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';
import { DoneAllIconOutlinedRounded } from '@takeoff-icons/react/done-all';
import { FileIconOutlinedRounded } from '@takeoff-icons/react/file';
import { FlashIconFilledRounded } from '@takeoff-icons/react/flash';
import { PdfIconOutlinedRounded } from '@takeoff-icons/react/pdf';
import { PersonIconFilledRounded } from '@takeoff-icons/react/person';
import { SendIconFilledRounded } from '@takeoff-icons/react/send';

const DEFAULT_TITLE = 'Takeoff bot';

export type ChatbotType = 'basic' | 'divided' | 'light' | 'dark' | 'primary';

export interface ChatbotAttachment {
  id: string;
  name: string;
  /** MIME type. `image/*` attachments render as a thumbnail. */
  type: string;
  /** Where the file can be shown or downloaded from, e.g. an object URL. */
  url: string;
}

/** A choice in the attach menu: what the file picker offers. */
export interface ChatbotAttachmentOption {
  label: string;
  icon?: ReactNode;
  /** `accept` of the file picker for this choice, e.g. `image/*`. Leave out for any file. */
  accept?: string;
}

export const defaultAttachmentOptions: ChatbotAttachmentOption[] = [
  { label: 'Photo or video', icon: <CameraIconOutlinedRounded />, accept: 'image/*,video/*' },
  { label: 'Document', icon: <PdfIconOutlinedRounded />, accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt' },
  { label: 'Any file', icon: <AttachIconOutlinedRounded /> },
];

export interface ChatbotMessage {
  id: string;
  role: 'assistant' | 'user';
  content: ReactNode;
  /** Files sent with the message. */
  attachments?: ChatbotAttachment[];
  /** Rendered under the bubble: suggestion chips, buttons, a card. */
  extra?: ReactNode;
  /** Shown under the bubble, e.g. `20:13`. */
  time?: string;
  /** Delivery state of a user message. `read` shows the double tick. */
  status?: 'sent' | 'read';
}

export interface ChatbotProps {
  messages: ChatbotMessage[];
  /** Called when the user sends. `text` is trimmed; `files` are the attached files. */
  onSubmit: (text: string, files: File[]) => void;
  /** Shows the typing indicator below the last message. */
  typing?: boolean;
  /** Style of the header and the composer; also the bubbles unless set below. Matches the Figma `type` variants. */
  type?: ChatbotType;
  /** Bubble style of assistant messages. Defaults to `type`. */
  assistantBubble?: ChatbotType;
  /** Bubble style of user messages. Defaults to `type`. */
  userBubble?: ChatbotType;
  title?: string;
  subtitle?: string;
  online?: boolean;
  placeholder?: string;
  /** Image URL or element for the user's avatar. Defaults to a person icon. */
  userAvatar?: string | ReactNode;
  /** Shows the attach button. Set to `false` to hide it. */
  allowAttachments?: boolean;
  /**
   * Choices of the attach menu that the plus button opens. With a single
   * option, the plus button opens the file picker directly.
   */
  attachmentOptions?: ChatbotAttachmentOption[];
  /** Renders the more button and calls this when it is pressed. */
  onMenu?: () => void;
  /** Renders the close button and calls this when it is pressed. */
  onClose?: () => void;
  /** Content shown when there are no messages, e.g. prompt starters. */
  emptyState?: ReactNode;
  className?: string;
}

// Dark and primary headers stay dark and red in both colour modes, so their
// icons use static white rather than the `white` button variant, which flips.
const headerStyles: Record<ChatbotType, { subtitle: string; avatar: string; face?: string; button: string }> = {
  basic: { subtitle: 'text-text-base', avatar: 'text-primary-base', face: 'fill-static-white', button: '' },
  divided: { subtitle: 'text-text-base', avatar: 'text-primary-base', face: 'fill-static-white', button: '' },
  light: { subtitle: 'text-text-base', avatar: 'text-primary-base', face: 'fill-static-white', button: '' },
  dark: { subtitle: 'text-neutral-400', avatar: 'text-neutral-200', button: '!text-static-white' },
  primary: { subtitle: 'text-static-white', avatar: 'text-static-white', button: '!text-static-white' },
};

const bubbleStyles: Record<ChatbotType, { assistant: string; user: string }> = {
  basic: { assistant: 'text-text-darkest', user: 'text-text-darkest' },
  divided: {
    assistant: 'border border-border-light bg-frames-lightest p-3 text-text-darkest',
    user: 'border border-border-light bg-frames-lightest px-3 py-2 text-text-darkest',
  },
  light: {
    assistant: 'border border-border-light bg-background-lightest p-3 text-text-darkest',
    user: 'border border-border-light bg-background-lightest px-3 py-2 text-text-darkest',
  },
  dark: {
    assistant: 'border border-border-light bg-neutral-900 p-3 text-neutral-50',
    user: 'border border-border-light bg-neutral-900 px-3 py-2 text-neutral-50',
  },
  primary: {
    assistant: 'bg-primary-lightest p-3 text-primary-darkest',
    user: 'bg-primary-lightest px-3 py-2 text-primary-darkest',
  },
};

const footerStyles: Record<ChatbotType, { footer: string; box: string; boxDivider: string; field: string; divider: string; attach: string; send: string }> = {
  basic: {
    footer: 'bg-frames-lightest',
    box: 'border-border-light bg-frames-lightest focus-within:border-primary-base',
    boxDivider: 'border-border-light',
    field: '',
    divider: 'bg-background-light',
    attach: '!text-neutral-600',
    send: '!text-primary-base',
  },
  divided: {
    footer: 'border-t border-border-light bg-frames-lightest',
    box: 'border-border-light bg-frames-lightest focus-within:border-primary-base',
    boxDivider: 'border-border-light',
    field: '',
    divider: 'bg-background-light',
    attach: '!text-neutral-600',
    send: '!text-primary-base',
  },
  light: {
    footer: 'border-t border-border-light bg-background-lightest',
    box: 'border-border-light bg-frames-lightest focus-within:border-primary-base',
    boxDivider: 'border-border-light',
    field: '',
    divider: 'bg-background-light',
    attach: '!text-neutral-600',
    send: '!text-primary-base',
  },
  dark: {
    footer: 'bg-neutral-800',
    box: 'border-neutral-600 focus-within:border-neutral-400',
    boxDivider: 'border-neutral-600',
    field: '!text-neutral-50 placeholder:!text-neutral-500',
    divider: 'bg-neutral-600',
    attach: '!text-neutral-200',
    send: '!text-neutral-50',
  },
  primary: {
    footer: 'bg-primary-base',
    box: 'border-primary-sub-base focus-within:border-static-white',
    boxDivider: 'border-primary-sub-base',
    field: '!text-static-white placeholder:!text-static-white/70',
    divider: 'bg-primary-sub-base',
    attach: '!text-static-white',
    send: '!text-static-white',
  },
};

/**
 * Takeoff scrollbar thumb (tokens `takeoff-scrollbar` mixin) for a scroll
 * container, on a transparent track so no strip shows beside the content. Chromium 121+ and Firefox use the standard `scrollbar-*`
 * properties, so they get the colours on a thin native scrollbar; Safari
 * uses the `::-webkit-scrollbar` rules, which also carry the 4px size and
 * the rounded thumb. The standard properties are `!important` so a global
 * `* { scrollbar-color }` rule in the app's base CSS cannot override them.
 */
const scrollbar =
  '![scrollbar-color:var(--secondary-sub-base)_transparent] ![scrollbar-width:thin] [&::-webkit-scrollbar]:size-1 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-secondary-sub-base [&::-webkit-scrollbar-thumb:hover]:bg-secondary-dark [&::-webkit-scrollbar-track]:bg-transparent';

/** Messages and the typing indicator fade in when they are added. */
const enter = 'motion-safe:transition-[opacity,translate] motion-safe:duration-300 motion-safe:starting:translate-y-2 motion-safe:starting:opacity-0';

/**
 * True while an IME composition is open. Safari reports the keydown that
 * commits a composition with `isComposing === false`, so also check the
 * legacy 229 key code it uses for composition events.
 */
function isComposing(event: { nativeEvent: globalThis.KeyboardEvent; keyCode: number }) {
  return event.nativeEvent.isComposing || event.keyCode === 229;
}

/**
 * The Takeoff bot mark (Figma `chatbot-icon`). Colour follows `currentColor`:
 * `text-primary-base`, `text-neutral-900`, `text-neutral-200` or
 * `text-static-white` give the primary, dark, light and white types. The face
 * is cut out, so it shows the surface behind the mark; pass a fill class as
 * `face` (e.g. `fill-static-white`) to fill it instead. Size it with `size-8`
 * (small), `size-10` (base) or `size-12` (large).
 */
export function ChatbotIcon({ face, ...props }: SVGProps<SVGSVGElement> & { face?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" aria-hidden="true" {...props}>
      {face && <circle cx="20" cy="20" r="13.5" className={face} />}
      <path d="M36.67 0H20C14.48 0 9.48 2.24 5.86 5.86A19.94 19.94 0 0 0 0 20c0 11.05 8.95 20 20 20s20-8.95 20-20V3.33C40 1.5 38.5 0 36.67 0Zm-7.24 29.43A13.29 13.29 0 0 1 20 33.33c-7.37 0-13.33-5.96-13.33-13.33 0-3.68 1.49-7.01 3.9-9.43A13.29 13.29 0 0 1 20 6.67c3.68 0 7.02 1.49 9.43 3.9a13.3 13.3 0 0 1 3.9 9.43c0 3.68-1.49 7.02-3.9 9.43Z" />
      <path d="M15.37 19.37c-.38.64-.87.5-1.61.3a6.81 6.81 0 0 0-1.85-.3c-.75 0-1.35.17-1.84.3-.75.2-1.23.34-1.61-.3-.62-1.02 1.08-3.54 3.45-3.54 2.38 0 4.07 2.52 3.46 3.54Z" />
      <path d="M29.93 19.67c.74.2 1.23.34 1.61-.3.61-1.02-1.08-3.54-3.45-3.54-2.38 0-4.07 2.52-3.46 3.54.38.64.87.5 1.61.3.49-.13 1.09-.3 1.84-.3.76 0 1.36.17 1.85.3Z" />
      <path d="M20 24.17c-1.33 0-2.21-1.15-2.25-1.2a.65.65 0 0 1 .08-.86.55.55 0 0 1 .8.09c.01.01.59.73 1.37.73.78 0 1.36-.73 1.37-.74a.55.55 0 0 1 .8-.09c.24.22.28.6.08.87-.04.05-.92 1.2-2.25 1.2Z" />
    </svg>
  );
}

/** Vertical three-dot icon for the more button. */
function MoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

function UserAvatar({ avatar }: { avatar?: string | ReactNode }) {
  return (
    <span className="flex size-8 shrink-0 items-end justify-center overflow-hidden rounded-full border border-static-white bg-background-light text-text-base" aria-hidden="true">
      {typeof avatar === 'string' ? <img src={avatar} alt="" className="h-7 w-auto" /> : (avatar ?? <PersonIconFilledRounded width={20} height={20} className="mb-1" />)}
    </span>
  );
}

export interface ChatbotHeaderProps {
  type?: ChatbotType;
  title?: string;
  subtitle?: string;
  online?: boolean;
  /** Shows "Typing…" in place of "Online". */
  typing?: boolean;
  /** Id for the title, so a region can be labelled by it. */
  titleId?: string;
  onMenu?: () => void;
  onClose?: () => void;
  className?: string;
}

/** The chatbot header (Figma `Chatbot header`). Render it inside a `Card`. */
export function ChatbotHeader({
  type = 'basic',
  title = DEFAULT_TITLE,
  subtitle = 'Chat with',
  online = true,
  typing = false,
  titleId,
  onMenu,
  onClose,
  className = '',
}: ChatbotHeaderProps) {
  const s = headerStyles[type];

  return (
    <Card.Header headerType={type} className={`!flex-row items-center justify-between gap-3 !p-3 ${className}`}>
      <div className="flex min-w-0 items-center gap-1.5">
        <ChatbotIcon face={s.face} className={`size-10 shrink-0 ${s.avatar}`} />
        <div className="min-w-0">
          <div className={`text-[11px] leading-4 uppercase ${s.subtitle}`}>{subtitle}</div>
          <div className="flex items-center gap-1">
            <Card.Title id={titleId} level={2} className="truncate !text-xl !leading-[30px]">
              {title}
            </Card.Title>
            {online && (
              <Badge variant="success" appearance="filledLight" size="small" rounded startContent={<FlashIconFilledRounded />} className="shrink-0">
                {typing ? 'Typing…' : 'Online'}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onMenu && <Button variant="neutral" appearance="text" aria-label="More options" startContent={<MoreIcon />} onClick={onMenu} classNames={{ content: s.button }} />}
        {onClose && (
          <Button variant="neutral" appearance="text" aria-label="Close chat" startContent={<CloseIconOutlinedRounded />} onClick={onClose} classNames={{ content: s.button }} />
        )}
      </div>
    </Card.Header>
  );
}

function TypingIndicator({ label, surface }: { label: string; surface: string }) {
  return (
    <div className={`flex items-end gap-2 ${enter}`}>
      <ChatbotIcon face="fill-static-white" className="size-8 shrink-0 text-primary-base" />
      <div className={`flex h-10 items-center gap-1 rounded-lg !px-4 !py-0 ${surface}`}>
        <span className="sr-only">{label}</span>
        {[0, 160, 320].map(delay => (
          <span
            key={delay}
            className="size-2 animate-bounce rounded-full bg-current opacity-50 motion-reduce:animate-none"
            style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }}
          />
        ))}
      </div>
    </div>
  );
}

function Attachments({ items }: { items: ChatbotAttachment[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item =>
        item.type.startsWith('image/') ? (
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg !no-underline">
            <img src={item.url} alt={item.name} className="max-h-40 max-w-full object-cover" />
          </a>
        ) : (
          <a
            key={item.id}
            href={item.url}
            download={item.name}
            className="flex max-w-full items-center gap-1.5 rounded-lg bg-background-light px-2 py-1.5 text-text-darkest !no-underline"
          >
            <FileIconOutlinedRounded width={20} height={20} className="shrink-0" />
            <span className="truncate">{item.name}</span>
          </a>
        ),
      )}
    </div>
  );
}

function Message({ message, bubble, userAvatar }: { message: ChatbotMessage; bubble: string; userAvatar?: string | ReactNode }) {
  const isUser = message.role === 'user';
  const hasContent = message.content !== '' && message.content != null;
  const hasMeta = Boolean(message.time || message.status);

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''} ${enter}`}>
      {/* The avatar lines up with the bubble, not with the time below it. */}
      {isUser ? (
        <span className={hasMeta ? 'mb-5' : ''}>
          <UserAvatar avatar={userAvatar} />
        </span>
      ) : (
        <ChatbotIcon face="fill-static-white" className={`size-8 shrink-0 text-primary-base ${hasMeta ? 'mb-5' : ''}`} />
      )}
      <div className={`flex max-w-[80%] min-w-0 flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {(hasContent || Boolean(message.attachments?.length)) && (
          // Keep typed line breaks for plain text only: rendered markdown emits
          // newline text nodes between blocks that pre-wrap would show.
          <div className={`flex flex-col gap-2 rounded-lg text-sm leading-5 break-words ${typeof message.content === 'string' ? 'whitespace-pre-wrap' : ''} ${bubble}`}>
            {message.attachments?.length ? <Attachments items={message.attachments} /> : null}
            {hasContent && <div>{message.content}</div>}
          </div>
        )}
        {message.extra}
        {hasMeta && (
          <div className="flex h-4 items-center gap-1 text-[11px] leading-4 text-text-base">
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

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Files picked in the composer, with a preview URL for each image. */
function usePickedFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<(string | null)[]>([]);
  // Create and revoke the object URLs in one effect, so each URL is revoked
  // exactly once, also under StrictMode's double effects.
  useEffect(() => {
    const urls = files.map(file => (file.type.startsWith('image/') ? URL.createObjectURL(file) : null));
    setPreviews(urls);
    return () => urls.forEach(url => url && URL.revokeObjectURL(url));
  }, [files]);
  return { files, previews, setFiles };
}

export function Chatbot({
  messages,
  onSubmit,
  typing = false,
  type = 'basic',
  assistantBubble = type,
  userBubble = type,
  title = DEFAULT_TITLE,
  subtitle = 'Chat with',
  online = true,
  placeholder = 'Type your message here',
  userAvatar,
  allowAttachments = true,
  attachmentOptions = defaultAttachmentOptions,
  onMenu,
  onClose,
  emptyState,
  className = '',
}: ChatbotProps) {
  const f = footerStyles[type];
  const titleId = useId();
  const [draft, setDraft] = useState('');
  const { files, previews, setFiles } = usePickedFiles();
  const logRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Input.Field types its ref for both the input and textarea forms.
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  const canSend = draft.trim() !== '' || files.length > 0;

  // Follow new messages only while the reader is already at the bottom, so
  // scrolling up to re-read an earlier answer is never interrupted.
  useEffect(() => {
    const log = logRef.current;
    if (log && stickToBottom.current) {
      log.scrollTop = log.scrollHeight;
    }
  }, [messages, typing]);

  // Sizes also change without new messages: the log when a hidden launcher
  // panel is shown or the composer grows, and the content when an image
  // loads or a message renders late. Stay pinned to the bottom through those.
  useEffect(() => {
    const log = logRef.current;
    const content = contentRef.current;
    if (!log || !content || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (stickToBottom.current) {
        log.scrollTop = log.scrollHeight;
      }
    });
    observer.observe(log);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const handleScroll = () => {
    const log = logRef.current;
    if (log) {
      stickToBottom.current = log.scrollHeight - log.scrollTop - log.clientHeight < 24;
    }
  };

  const send = () => {
    if (!canSend) return;
    stickToBottom.current = true;
    onSubmit(draft.trim(), files);
    setDraft('');
    setFiles([]);
    // Sending disables the Send button; keep keyboard focus in the composer.
    fieldRef.current?.focus();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    send();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds a line. Never send while an IME
    // composition (e.g. Japanese or Korean input) is still open.
    if (event.key === 'Enter' && !event.shiftKey && !isComposing(event)) {
      event.preventDefault();
      send();
    }
  };

  const pickFiles = (option: ChatbotAttachmentOption) => {
    const input = fileRef.current;
    if (!input) return;
    input.accept = option.accept ?? '';
    input.click();
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.currentTarget.files ?? []);
    setFiles(current => [...current, ...picked]);
    // Clear the input so picking the same file again still fires `change`.
    event.currentTarget.value = '';
    fieldRef.current?.focus();
  };

  const removeFile = (index: number) => {
    setFiles(current => current.filter((_, i) => i !== index));
    fieldRef.current?.focus();
  };

  return (
    <Card
      as="section"
      aria-labelledby={titleId}
      className={`flex h-[560px] max-h-full w-full max-w-[400px] flex-col overflow-hidden !rounded-xl !shadow-1-default-base ${className}`}
    >
      <ChatbotHeader
        type={type}
        title={title}
        subtitle={subtitle}
        online={online}
        typing={typing}
        titleId={titleId}
        onMenu={onMenu}
        onClose={onClose}
        className="relative z-10 !shadow-2-default-lg"
      />

      <div
        ref={logRef}
        role="log"
        aria-relevant="additions"
        aria-label={`Conversation with ${title}`}
        tabIndex={0}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto bg-frames-lightest focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-base ${scrollbar}`}
      >
        {/* Messages stack from the bottom, as in a chat app. */}
        <div ref={contentRef} className="flex min-h-full flex-col justify-end gap-6 px-3 py-6">
          {messages.length === 0 && !typing
            ? emptyState
            : messages.map(message => (
                <Message key={message.id} message={message} bubble={bubbleStyles[message.role === 'user' ? userBubble : assistantBubble][message.role]} userAvatar={userAvatar} />
              ))}
          {typing && <TypingIndicator label={`${title} is typing`} surface={bubbleStyles[assistantBubble].assistant} />}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`p-3 ${f.footer}`}>
        {/* One composer box: picked files sit in their own tray above the
            text field, split off by a divider, so they never read as part
            of the conversation. */}
        <div className={`overflow-hidden rounded-lg border transition-colors ${f.box}`}>
          {files.length > 0 && (
            <ul aria-label="Attachments" className={`!m-0 flex list-none gap-2 overflow-x-auto border-b !p-2 !pt-3 ${f.boxDivider} ${scrollbar}`}>
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="relative !m-0 shrink-0">
                  {previews[index] ? (
                    <img src={previews[index]} alt={file.name} className="block size-14 rounded-md object-cover" />
                  ) : (
                    <span className="flex h-14 w-44 items-center gap-2 rounded-md bg-background-light px-2 text-text-darkest">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-base text-static-white">
                        <FileIconOutlinedRounded width={20} height={20} />
                      </span>
                      <span className="flex min-w-0 flex-col text-xs leading-4">
                        <span className="truncate font-medium">{file.name}</span>
                        <span className="text-text-base">{formatSize(file.size)}</span>
                      </span>
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeFile(index)}
                    className="absolute -top-1.5 -right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full border-2 border-solid border-frames-lightest bg-neutral-900 p-0 text-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-base"
                  >
                    <CloseIconOutlinedRounded width={12} height={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Input className="!items-end !gap-2 !rounded-none !border-0 !bg-transparent !p-1 !shadow-none !outline-none">
            {allowAttachments && (
              <>
                <input ref={fileRef} type="file" multiple onChange={handleFiles} className="hidden" tabIndex={-1} aria-hidden="true" />
                {attachmentOptions.length === 1 ? (
                  <Button
                    variant="neutral"
                    appearance="text"
                    size="small"
                    aria-label="Attach files"
                    startContent={<AddCircleIconFilledTk className={f.attach} />}
                    onClick={() => pickFiles(attachmentOptions[0])}
                  />
                ) : (
                  <Dropdown size="small">
                    <Dropdown.Trigger
                      as={Button}
                      variant="neutral"
                      appearance="text"
                      size="small"
                      aria-label="Attach files"
                      startContent={<AddCircleIconFilledTk className={f.attach} />}
                    />
                    <Dropdown.Content side="top" align="start">
                      {attachmentOptions.map(option => (
                        <Dropdown.Item key={option.label} textValue={option.label} onSelect={() => pickFiles(option)}>
                          <span className="flex items-center gap-2">
                            {option.icon && (
                              <span className="flex size-5 shrink-0 text-text-base [&_svg]:size-5" aria-hidden="true">
                                {option.icon}
                              </span>
                            )}
                            {option.label}
                          </span>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Content>
                  </Dropdown>
                )}
                <span className={`h-6 w-px shrink-0 self-center ${f.divider}`} aria-hidden="true" />
              </>
            )}
            <Input.Field
              ref={fieldRef}
              as="textarea"
              rows={1}
              value={draft}
              onChange={event => setDraft(event.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label="Message"
              className={`max-h-32 !resize-none self-center !py-1.5 [field-sizing:content] ${scrollbar} ${f.field}`}
            />
            <Button
              type="submit"
              variant="neutral"
              appearance="text"
              size="small"
              aria-label="Send message"
              startContent={<SendIconFilledRounded />}
              disabled={!canSend}
              className="disabled:opacity-40"
              classNames={{ content: f.send }}
            />
          </Input>
        </div>
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

/** A floating action button (Figma `chatbot-fab`) that opens the chatbot in a panel above it. */
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

  const rootRef = useRef<HTMLDivElement>(null);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // React bubbles events from portals, so an Escape that closes a menu or
    // popover inside the panel (its content is portaled out of this DOM)
    // reaches this handler too. Close only for Escapes from the launcher's
    // own DOM that nothing else has handled.
    if (event.key !== 'Escape' || !open || event.defaultPrevented || isComposing(event)) return;
    if (!rootRef.current?.contains(event.target as Node)) return;
    close();
  };

  return (
    <div ref={rootRef} className={`z-50 flex flex-col items-end gap-3 ${positionClassName}`} onKeyDown={handleKeyDown}>
      {/* Kept mounted so the draft survives closing. Closing scales and fades
          the panel into the launcher, then makes it invisible and inert.
          Capped so the header stays on short screens. */}
      <div
        id={panelId}
        ref={panelRef}
        inert={!open}
        className={`h-[min(560px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] origin-bottom-right transition-[opacity,scale,translate,visibility] duration-200 ease-out motion-reduce:transition-none ${
          open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible translate-y-2 scale-95 opacity-0'
        }`}
      >
        <Chatbot {...chatbotProps} onClose={close} className={`!h-full ${chatbotProps.className ?? ''}`} />
      </div>
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? 'Hide chat' : `Chat with ${chatbotProps.title ?? DEFAULT_TITLE}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : openPanel())}
        className="flex size-12 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-primary-base transition-[color,box-shadow,scale] duration-150 hover:text-primary-dark hover:shadow-1-hover-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-base active:scale-95 active:text-primary-base motion-reduce:transition-none"
      >
        <ChatbotIcon face="fill-static-white" className="size-12" />
      </button>
    </div>
  );
}
