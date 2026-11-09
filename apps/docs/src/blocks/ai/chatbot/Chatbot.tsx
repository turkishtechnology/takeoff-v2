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
import {
  type ChangeEvent,
  type FormEvent,
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  type SVGProps,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Badge, Button, Card, Chip, Dropdown, Input, Skeleton } from '@takeoff-ui/react-spar';
import { AddCircleIconFilledTk } from '@takeoff-icons/react/add-circle';
import { ArrowBottomIconOutlinedRounded } from '@takeoff-icons/react/arrow-bottom';
import { AttachIconOutlinedRounded } from '@takeoff-icons/react/attach';
import { CameraIconOutlinedRounded } from '@takeoff-icons/react/camera';
import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { ClockIconOutlinedRounded } from '@takeoff-icons/react/clock';
import { CloseIconOutlinedRounded } from '@takeoff-icons/react/close';
import { CopyIconOutlinedRounded } from '@takeoff-icons/react/copy';
import { DoneAllIconOutlinedRounded } from '@takeoff-icons/react/done-all';
import { FileIconOutlinedRounded } from '@takeoff-icons/react/file';
import { FlashIconFilledRounded } from '@takeoff-icons/react/flash';
import { HistoryIconOutlinedRounded } from '@takeoff-icons/react/history';
import { MaximizeIconOutlinedRounded } from '@takeoff-icons/react/maximize';
import { MicIconFilledRounded, MicIconOutlinedRounded } from '@takeoff-icons/react/mic';
import { MinimizeIconOutlinedRounded } from '@takeoff-icons/react/minimize';
import { OpenIconOutlinedRounded } from '@takeoff-icons/react/open';
import { PdfIconOutlinedRounded } from '@takeoff-icons/react/pdf';
import { PersonIconFilledRounded } from '@takeoff-icons/react/person';
import { RefreshRightIconOutlinedRounded } from '@takeoff-icons/react/refresh-right';
import { SendIconFilledRounded } from '@takeoff-icons/react/send';
import { StarIconFilledRounded, StarIconOutlinedRounded } from '@takeoff-icons/react/star';
import { ThumbDownIconFilledRounded, ThumbDownIconOutlinedRounded } from '@takeoff-icons/react/thumb-down';
import { ThumbUpIconFilledRounded, ThumbUpIconOutlinedRounded } from '@takeoff-icons/react/thumb-up';
import { WarningCircleIconFilledRounded } from '@takeoff-icons/react/warning-circle';

const DEFAULT_TITLE = 'Takeoff bot';

/**
 * Every text the block shows or announces. Pass a partial object as `labels`
 * to translate it; anything left out stays in English.
 */
export interface ChatbotLabels {
  subtitle: string;
  online: string;
  offline: string;
  typing: string;
  moreOptions: string;
  closeChat: string;
  expand: string;
  collapse: string;
  conversation: (title: string) => string;
  isTyping: (name: string) => string;
  offlineNotice: string;
  placeholder: string;
  listening: string;
  message: string;
  send: string;
  attachFiles: string;
  attachments: string;
  removeFile: (name: string) => string;
  voiceInput: string;
  stopVoiceInput: string;
  characters: (count: number, max: number) => string;
  sending: string;
  sent: string;
  read: string;
  notDelivered: string;
  notSent: string;
  retry: string;
  undo: string;
  retracted: string;
  somethingWentWrong: string;
  copy: string;
  copied: string;
  copiedToClipboard: string;
  goodResponse: string;
  badResponse: string;
  regenerate: string;
  suggestions: string;
  sources: string;
  newMessages: (count: number) => string;
  newMessagesDivider: string;
  loadOlder: string;
  loading: string;
  startChat: string;
  openChat: (title: string, unread: number) => string;
  hideChat: string;
  dismissGreeting: string;
  rating: (value: number, max: number) => string;
  ratingThanks: string;
}

export const defaultLabels: ChatbotLabels = {
  subtitle: 'Chat with',
  online: 'Online',
  offline: 'Offline',
  typing: 'Typing…',
  moreOptions: 'More options',
  closeChat: 'Close chat',
  expand: 'Full screen',
  collapse: 'Exit full screen',
  conversation: title => `Conversation with ${title}`,
  isTyping: name => `${name} is typing`,
  offlineNotice: 'We are offline right now. Please come back later.',
  placeholder: 'Type your message here',
  listening: 'Listening…',
  message: 'Message',
  send: 'Send message',
  attachFiles: 'Attach files',
  attachments: 'Attachments',
  removeFile: name => `Remove ${name}`,
  voiceInput: 'Voice input',
  stopVoiceInput: 'Stop voice input',
  characters: (count, max) => `${count} of ${max} characters`,
  sending: 'Sending',
  sent: 'Sent',
  read: 'Read',
  notDelivered: 'Not delivered',
  notSent: 'Not sent',
  retry: 'Retry',
  undo: 'Undo',
  retracted: 'You retracted this message',
  somethingWentWrong: 'Something went wrong',
  copy: 'Copy',
  copied: 'Copied',
  copiedToClipboard: 'Copied to clipboard',
  goodResponse: 'Good response',
  badResponse: 'Bad response',
  regenerate: 'Regenerate response',
  suggestions: 'Suggested questions',
  sources: 'Sources',
  newMessages: count => (count === 1 ? '1 new message' : `${count} new messages`),
  newMessagesDivider: 'New messages',
  loadOlder: 'Load older messages',
  loading: 'Loading messages',
  startChat: 'Start chat',
  openChat: (title, unread) => (unread > 0 ? `Chat with ${title}, ${unread} unread ${unread === 1 ? 'message' : 'messages'}` : `Chat with ${title}`),
  hideChat: 'Hide chat',
  dismissGreeting: 'Dismiss message',
  rating: (value, max) => `${value} of ${max} stars`,
  ratingThanks: 'Thanks for your feedback!',
};

export type ChatbotType = 'basic' | 'divided' | 'light' | 'dark' | 'primary';

/** Figma `chatbot-icon` types. `white` is for dark or coloured surfaces. */
export type ChatbotIconType = 'primary' | 'dark' | 'light' | 'white';

/** Mark colour and face fill of each icon type. */
export const chatbotIconStyles: Record<ChatbotIconType, { mark: string; face?: string }> = {
  primary: { mark: 'text-primary-base', face: 'fill-frames-lightest' },
  // Flips to near-white in dark mode, so the mark stays visible on dark surfaces.
  dark: { mark: 'text-neutral-900 in-data-[theme=dark]:text-neutral-100', face: 'fill-frames-lightest' },
  light: { mark: 'text-neutral-200', face: 'fill-frames-lightest' },
  white: { mark: 'text-static-white' },
};

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

/** Who wrote an assistant message when it is not the bot, e.g. a human agent after a handoff. */
export interface ChatbotAuthor {
  name: string;
  /** Image URL or element. */
  avatar: string | ReactNode;
}

/** A page an answer is based on, shown as a link under the answer. */
export interface ChatbotSource {
  title: string;
  url: string;
}

export interface ChatbotMessage {
  id: string;
  /** Day label, e.g. "Today". A divider with it is shown above the first message of each day. */
  day?: string;
  /** `system` renders a centred note in the log, e.g. "Ayşe joined the chat". */
  role: 'assistant' | 'user' | 'system';
  content: ReactNode;
  /** Files sent with the message. */
  attachments?: ChatbotAttachment[];
  /** Rendered in the bubble under the content: suggestion chips, buttons, a card. */
  extra?: ReactNode;
  /** Shown under the bubble, e.g. `20:13`. */
  time?: string;
  /**
   * Delivery state. User messages show a clock while `sending`, one tick when
   * `sent` and a double tick when `read`. `failed` marks either side as not
   * delivered and offers Retry when `onRetry` is set.
   */
  status?: 'sending' | 'sent' | 'read' | 'failed';
  /** Replaces the user's message with a "retracted" note. */
  retracted?: boolean;
  /** Offers Undo under the user's message while true, when `onUndo` is set. Clear it when the undo window ends. */
  undoable?: boolean;
  /** The reader's rating of an assistant message. */
  feedback?: 'up' | 'down';
  /** Shows this author's avatar instead of the bot icon. */
  author?: ChatbotAuthor;
  /** Set while a reply is still streaming in; hides the answer actions until it is complete. */
  streaming?: boolean;
  /** Pages the answer is based on, shown as links under the answer. */
  sources?: ChatbotSource[];
  /** Follow-up questions shown as chips under the answer while it is the last message. Pressing one sends it. */
  suggestions?: string[];
}

/** An item of the more (⋮) menu in the header. */
export interface ChatbotMenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
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
  /** Icon type of the bot avatar next to messages. */
  iconType?: ChatbotIconType;
  /** Bubble style of user messages. Defaults to `type`. */
  userBubble?: ChatbotType;
  title?: string;
  /** Defaults to `labels.subtitle`. */
  subtitle?: string;
  /** Texts of the block, e.g. a translation. Anything left out stays in English. */
  labels?: Partial<ChatbotLabels>;
  /** A human agent who took over the chat: the header shows their name and avatar. */
  agent?: ChatbotAuthor;
  /** `false` shows an "Offline" badge, disables the composer and shows `offlineNotice`. */
  online?: boolean;
  /** Shown above the disabled composer while offline. Defaults to `labels.offlineNotice`. */
  offlineNotice?: ReactNode;
  /** Disables the composer while online, e.g. after a rate limit. Say why with `notice`. */
  disabled?: boolean;
  /** Shown above the composer, e.g. why it is disabled. */
  notice?: ReactNode;
  /** Shown under the composer, e.g. that answers are written by AI. */
  disclaimer?: ReactNode;
  /** Defaults to `labels.placeholder`. */
  placeholder?: string;
  /** Longest message the user can send. A counter shows near the limit and Send turns off over it. */
  maxLength?: number;
  /**
   * Asks for consent before the chat starts, e.g. a privacy notice. While
   * set, it replaces the composer with this content and a Start chat button
   * that calls `onAcceptConsent`; clear it once accepted.
   */
  consent?: ReactNode;
  onAcceptConsent?: () => void;
  /** Shows skeleton messages in place of the log, e.g. while the history loads. */
  loading?: boolean;
  /** Shows a Load older messages button at the top of the log, which calls `onLoadOlder`. Scrolling to the top calls it too. */
  hasOlder?: boolean;
  /** Shows a placeholder in place of the Load older messages button while they load. */
  loadingOlder?: boolean;
  /** Prepend older messages to `messages`; the reader's place in the log is kept. */
  onLoadOlder?: () => void;
  /** Shows a microphone button in the composer that calls this. */
  onVoiceInput?: () => void;
  /** Shows the microphone button as recording. */
  listening?: boolean;
  /** Shows a full screen button in the header. The launcher sets these when `expandable` is on. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Draws the card's rounded corners, border and shadow. Turn it off when
   * the chatbot fills a frame of its own, e.g. a drawer or a full screen
   * panel. `'desktop'` turns it off on screens narrower than 640px only.
   */
  framed?: boolean | 'desktop';
  /** Rendered at the end of the log, after the messages, e.g. a `ChatbotRating` when the chat ends. */
  endContent?: ReactNode;
  /** Image URL or element for the user's avatar. Defaults to a person icon. */
  userAvatar?: string | ReactNode;
  /** Shows the attach button. Set to `false` to hide it. */
  allowAttachments?: boolean;
  /**
   * Choices of the attach menu that the plus button opens. With a single
   * option, the plus button opens the file picker directly.
   */
  attachmentOptions?: ChatbotAttachmentOption[];
  /** Items of the more (⋮) menu. The button is shown when there is at least one. */
  menuItems?: ChatbotMenuItem[];
  /** Renders the close button and calls this when it is pressed. */
  onClose?: () => void;
  /** Offers Retry on `failed` messages. */
  onRetry?: (message: ChatbotMessage) => void;
  /** Offers Undo on user messages that are `undoable`. */
  onUndo?: (message: ChatbotMessage) => void;
  /** Shows thumbs up and down under assistant messages. `value` is undefined when a rating is taken back. */
  onFeedback?: (message: ChatbotMessage, value: ChatbotMessage['feedback']) => void;
  /** Shows a regenerate button under assistant messages. */
  onRegenerate?: (message: ChatbotMessage) => void;
  /** Shows a copy button under assistant messages, which copies the message text. */
  copyable?: boolean;
  /** Content shown when there are no messages, e.g. prompt starters. */
  emptyState?: ReactNode;
  className?: string;
}

// Dark and primary headers stay dark and red in both colour modes, so their
// icons use static white rather than the `white` button variant, which flips.
const headerStyles: Record<ChatbotType, { subtitle: string; avatar: string; face?: string; button: string }> = {
  basic: { subtitle: 'text-text-base', avatar: 'text-primary-base', face: 'fill-frames-lightest', button: '' },
  divided: { subtitle: 'text-text-base', avatar: 'text-primary-base', face: 'fill-frames-lightest', button: '' },
  light: { subtitle: 'text-text-base', avatar: 'text-primary-base', face: 'fill-frames-lightest', button: '' },
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

const footerStyles: Record<ChatbotType, { footer: string; box: string; boxDivider: string; field: string; divider: string; attach: string; send: string; notice: string }> = {
  basic: {
    notice: 'text-text-base',
    footer: 'bg-frames-lightest',
    box: 'border-border-light bg-frames-lightest focus-within:border-primary-base',
    boxDivider: 'border-border-light',
    field: '',
    divider: 'bg-background-light',
    attach: '!text-neutral-600',
    send: '!text-primary-base',
  },
  divided: {
    notice: 'text-text-base',
    footer: 'border-t border-border-light bg-frames-lightest',
    box: 'border-border-light bg-frames-lightest focus-within:border-primary-base',
    boxDivider: 'border-border-light',
    field: '',
    divider: 'bg-background-light',
    attach: '!text-neutral-600',
    send: '!text-primary-base',
  },
  light: {
    notice: 'text-text-base',
    footer: 'border-t border-border-light bg-background-lightest',
    box: 'border-border-light bg-frames-lightest focus-within:border-primary-base',
    boxDivider: 'border-border-light',
    field: '',
    divider: 'bg-background-light',
    attach: '!text-neutral-600',
    send: '!text-primary-base',
  },
  dark: {
    notice: 'text-neutral-300',
    footer: 'bg-neutral-800',
    box: 'border-neutral-600 focus-within:border-neutral-400',
    boxDivider: 'border-neutral-600',
    field: '!text-neutral-50 placeholder:!text-neutral-500',
    divider: 'bg-neutral-600',
    attach: '!text-neutral-200',
    send: '!text-neutral-50',
  },
  primary: {
    notice: 'text-static-white',
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
 * `face` (e.g. `fill-frames-lightest`, which follows the colour mode so the
 * face never glares on a dark page) to fill it instead. Size it with `size-8`
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

/**
 * The launcher mark (Figma `chatbot-fab`). The face changes with the state:
 * eyes down while closed (inactive), a wide smile on hover or keyboard focus,
 * and the open face while the panel is open (active). It reads the state
 * from the button around it (`group`, `aria-expanded`). The faces cross-fade
 * and slide: the closed face sits 5px lower, so the mascot looks up when it
 * wakes and down when it goes back to sleep.
 */
const faceMotion = 'transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none';

function FabIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" className="size-12">
      <circle cx="24" cy="24" r="22" className="fill-frames-lightest" />
      <path d="M44 0H24C17.37 0 11.37 2.685 7.03 7.03 2.685 11.375 0 17.375 0 24c0 13.255 10.745 24 24 24s24-10.745 24-24V4c0-2.205-1.795-4-4-4ZM35.315 35.315A15.95 15.95 0 0 1 24 40c-8.84 0-16-7.16-16-16 0-4.415 1.79-8.415 4.685-11.315A15.95 15.95 0 0 1 24 8c4.42 0 8.42 1.79 11.315 4.685A15.98 15.98 0 0 1 40 24c0 4.415-1.79 8.42-4.685 11.315Z" />
      {/* Inactive: closed and not hovered. */}
      <g
        className={`${faceMotion} group-hover:-translate-y-[5px] group-hover:opacity-0 group-focus-visible:-translate-y-[5px] group-focus-visible:opacity-0 group-aria-expanded:-translate-y-[5px] group-aria-expanded:opacity-0`}
      >
        <path d="M37.84 28.42c-.48.79-1.09.21-2.03-.05-.61-.17-1.36-.37-2.31-.37-.95 0-1.7.2-2.31.37-.94.26-1.55.84-2.03.05-.77-1.28 1.35-4.42 4.34-4.42 2.99 0 5.11 3.14 4.34 4.42Z" />
        <path d="M16.81 28.37c.94.26 1.55.84 2.03.05.77-1.27-1.35-4.42-4.34-4.42-2.99 0-5.11 3.14-4.34 4.42.48.79 1.09.21 2.03-.05.61-.17 1.36-.37 2.31-.37.95 0 1.7.2 2.31.37Z" />
        <path d="M24 34c-1.68 0-2.79-1.56-2.84-1.62-.25-.36-.21-.89.1-1.19.31-.29.76-.24 1.01.12.01.02.74 1.01 1.73 1.01.99 0 1.72-1 1.73-1.01.25-.36.7-.41 1.01-.12.31.29.35.83.1 1.18-.05.07-1.16 1.63-2.84 1.63Z" />
      </g>
      {/* Active: the panel is open. */}
      <g
        className={`${faceMotion} translate-y-[5px] opacity-0 group-aria-expanded:translate-y-0 group-aria-expanded:opacity-100 group-aria-expanded:group-hover:opacity-0 group-aria-expanded:group-focus-visible:opacity-0`}
      >
        <path d="M18.44 23.25c-.46.76-1.04.6-1.93.36a7.89 7.89 0 0 0-2.21-.36c-.9 0-1.62.2-2.21.36-.9.25-1.48.41-1.94-.36-.73-1.23 1.29-4.25 4.15-4.25 2.85 0 4.88 3.02 4.14 4.25Z" />
        <path d="M35.91 23.6c.9.25 1.48.41 1.94-.35.73-1.23-1.29-4.25-4.15-4.25-2.85 0-4.88 3.02-4.14 4.25.46.76 1.04.6 1.93.35.59-.16 1.31-.35 2.21-.35.91 0 1.63.19 2.21.35Z" />
        <path d="M24 29c-1.6 0-2.65-1.37-2.7-1.43a.74.74 0 0 1 .1-1.04.67.67 0 0 1 .96.1c.01.02.7.89 1.64.89.94 0 1.63-.88 1.64-.89a.67.67 0 0 1 .96-.1c.29.26.33.72.1 1.04-.05.06-1.1 1.43-2.7 1.43Z" />
      </g>
      {/* Hover: a wide smile. */}
      <g
        className={`${faceMotion} translate-y-[5px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 group-aria-expanded:translate-y-0`}
      >
        <path d="M37.84 22.42c-.48.79-1.09.62-2.03.37-.61-.17-1.36-.37-2.31-.37-.95 0-1.7.2-2.31.37-.94.25-1.55.42-2.03-.37-.77-1.28 1.35-4.42 4.34-4.42 2.99 0 5.11 3.14 4.34 4.42Z" />
        <path d="M16.81 22.79c.94.25 1.55.42 2.03-.37.77-1.28-1.35-4.42-4.34-4.42-2.99 0-5.11 3.14-4.34 4.42.48.79 1.09.62 2.03.37.61-.17 1.36-.37 2.31-.37.95 0 1.7.2 2.31.37Z" />
        <path d="M24 29c-2.24 0-3.72-2.94-3.78-3.04-.34-.51-.28-1.27.13-1.69.41-.42 1.02-.34 1.35.17.02.03.99.99 2.3.99 1.32 0 2.29-.98 2.3-.99.34-.51.94-.59 1.35-.17.41.42.47 1.18.13 1.69-.06.1-1.54 3.04-3.78 3.04Z" />
      </g>
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

/**
 * A round avatar: an image URL fills it, an element sits in it, nothing shows
 * a person icon. `cover` crops a photo to the circle; without it the image
 * stands on the bottom edge, as the Figma user avatar illustration does.
 */
function Avatar({ avatar, cover = false, className = 'size-8' }: { avatar?: string | ReactNode; cover?: boolean; className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-end justify-center overflow-hidden rounded-full border border-static-white bg-background-light text-text-base ${className}`}
      aria-hidden="true"
    >
      {typeof avatar === 'string' ? (
        <img src={avatar} alt="" className={cover ? 'size-full object-cover' : 'h-[87.5%] w-auto'} />
      ) : (
        (avatar ?? <PersonIconFilledRounded width={20} height={20} className="mb-1" />)
      )}
    </span>
  );
}

export interface ChatbotHeaderProps {
  type?: ChatbotType;
  title?: string;
  subtitle?: string;
  /** Shows this person's avatar in place of the bot icon, e.g. a human agent. */
  avatar?: string | ReactNode;
  /** `true` shows an "Online" badge, `false` an "Offline" one. */
  online?: boolean;
  /** Shows "Typing…" in place of "Online". */
  typing?: boolean;
  /** Id for the title, so a region can be labelled by it. */
  titleId?: string;
  menuItems?: ChatbotMenuItem[];
  /** With `onExpandedChange`, shows a full screen button that toggles this. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onClose?: () => void;
  labels?: Partial<ChatbotLabels>;
  className?: string;
}

/** The chatbot header (Figma `Chatbot header`). Render it inside a `Card`. */
export function ChatbotHeader({
  type = 'basic',
  title = DEFAULT_TITLE,
  subtitle,
  avatar,
  online = true,
  typing = false,
  titleId,
  menuItems = [],
  expanded = false,
  onExpandedChange,
  onClose,
  labels,
  className = '',
}: ChatbotHeaderProps) {
  const s = headerStyles[type];
  const l = { ...defaultLabels, ...labels };

  return (
    <Card.Header headerType={type} className={`!flex-row items-center justify-between gap-3 !p-3 ${className}`}>
      <div className="flex min-w-0 items-center gap-1.5">
        {avatar ? <Avatar avatar={avatar} cover className="size-10" /> : <ChatbotIcon face={s.face} className={`size-10 shrink-0 ${s.avatar}`} />}
        <div className="min-w-0">
          <div className={`text-[11px] leading-4 uppercase ${s.subtitle}`}>{subtitle ?? l.subtitle}</div>
          <div className="flex items-center gap-1">
            <Card.Title id={titleId} level={2} className="truncate !text-xl !leading-[30px]">
              {title}
            </Card.Title>
            {online ? (
              <Badge
                variant="success"
                appearance="filledLight"
                size="small"
                rounded
                startContent={<FlashIconFilledRounded />}
                // Figma draws the bolt at 14px; the small Badge recipe sizes icons at 10px.
                className="shrink-0"
                classNames={{ icon: '!size-3.5' }}
              >
                {typing ? l.typing : l.online}
              </Badge>
            ) : (
              <Badge variant="neutral" appearance="filledLight" size="small" rounded className="shrink-0">
                {l.offline}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {menuItems.length > 0 && (
          <Dropdown size="small">
            {/* Dropdown.Trigger only styles its root, so the icon carries the colour. */}
            <Dropdown.Trigger as={Button} variant="neutral" appearance="text" aria-label={l.moreOptions} startContent={<MoreIcon className={s.button} />} />
            <Dropdown.Content align="end">
              {menuItems.map(item => (
                <Dropdown.Item key={item.label} textValue={item.label} onSelect={item.onSelect}>
                  <span className="flex items-center gap-2">
                    {item.icon && (
                      <span className="flex size-5 shrink-0 text-text-base [&_svg]:size-5" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </span>
                </Dropdown.Item>
              ))}
            </Dropdown.Content>
          </Dropdown>
        )}
        {onExpandedChange && (
          <Button
            variant="neutral"
            appearance="text"
            aria-label={expanded ? l.collapse : l.expand}
            startContent={expanded ? <MinimizeIconOutlinedRounded /> : <MaximizeIconOutlinedRounded />}
            onClick={() => onExpandedChange(!expanded)}
            classNames={{ content: s.button }}
          />
        )}
        {onClose && (
          <Button variant="neutral" appearance="text" aria-label={l.closeChat} startContent={<CloseIconOutlinedRounded />} onClick={onClose} classNames={{ content: s.button }} />
        )}
      </div>
    </Card.Header>
  );
}

function TypingIndicator({ label, surface, icon }: { label: string; surface: string; icon: ChatbotIconType }) {
  return (
    <div className={`flex items-end gap-2 ${enter}`}>
      <ChatbotIcon face={chatbotIconStyles[icon].face} className={`size-8 shrink-0 ${chatbotIconStyles[icon].mark}`} />
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
          <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg !border-0 !no-underline">
            <img src={item.url} alt={item.name} className="max-h-40 max-w-full object-cover" />
          </a>
        ) : (
          <a
            key={item.id}
            href={item.url}
            download={item.name}
            className="flex max-w-full items-center gap-1.5 rounded-lg !border-0 bg-background-light px-2 py-1.5 text-text-darkest !no-underline"
          >
            <FileIconOutlinedRounded width={20} height={20} className="shrink-0" />
            <span className="truncate">{item.name}</span>
          </a>
        ),
      )}
    </div>
  );
}

/** A small text button for the row under a bubble: Retry, Undo. */
function MetaButton({ children, onClick, className = '' }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-0.5 rounded border-0 bg-transparent p-0 font-[inherit] text-[11px] leading-4 font-medium underline decoration-transparent underline-offset-2 transition-[text-decoration-color] duration-200 ease-out hover:decoration-current motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-base ${className}`}
    >
      {children}
    </button>
  );
}

/** Links to the pages an answer is based on, at the bottom of its bubble. */
function Sources({ items, label }: { items: ChatbotSource[]; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] leading-4 font-medium opacity-80">{label}</span>
      <ul className="!m-0 flex list-none flex-wrap gap-1.5 !p-0">
        {items.map((item, index) => (
          <li key={`${index}-${item.url}`} className="!m-0 min-w-0">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex max-w-56 items-center gap-1 rounded-full !border !border-solid !border-current/25 px-2 py-0.5 text-xs leading-4 !text-current !no-underline transition-colors duration-200 ease-out motion-reduce:transition-none hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-base"
            >
              <span className="font-semibold">{index + 1}</span>
              <span className="truncate">{item.title}</span>
              <OpenIconOutlinedRounded width={12} height={12} className="shrink-0" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A line across the log with a label: the day, or where new messages start. */
function LogDivider({ children, className = 'text-text-base' }: { children: ReactNode; className?: string }) {
  return (
    <div role="separator" aria-label={typeof children === 'string' ? children : undefined} className={`flex items-center gap-3 text-[11px] leading-4 font-medium ${className}`}>
      <span className="h-px flex-1 bg-current opacity-25" />
      <span aria-hidden="true">{children}</span>
      <span className="h-px flex-1 bg-current opacity-25" />
    </div>
  );
}

/** Placeholder bubbles while the history loads. */
function MessagesSkeleton({ label }: { label: string }) {
  const rows = [
    { user: false, width: 220, height: 64 },
    { user: true, width: 150, height: 36 },
    { user: false, width: 260, height: 44 },
  ];
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-6">
      {rows.map((row, index) => (
        <div key={index} className={`flex items-end gap-2 ${row.user ? 'flex-row-reverse' : ''}`}>
          <Skeleton shape="circle" height={32} />
          <Skeleton width={row.width} height={row.height} className="max-w-[70%] !rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export interface ChatbotRatingProps {
  question: ReactNode;
  /** The chosen rating, from 1 to `max`. */
  value?: number;
  onChange: (value: number) => void;
  max?: number;
  labels?: Partial<ChatbotLabels>;
  className?: string;
}

/** A star rating card for the end of a chat, e.g. in `endContent`. */
export function ChatbotRating({ question, value = 0, onChange, max = 5, labels, className = '' }: ChatbotRatingProps) {
  const l = { ...defaultLabels, ...labels };
  const questionId = useId();
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div
      role="group"
      aria-labelledby={questionId}
      className={`mx-auto flex w-full max-w-72 flex-col items-center gap-2 rounded-lg border border-solid border-border-light bg-frames-lightest p-4 text-center ${enter} ${className}`}
    >
      <p id={questionId} className="!m-0 text-sm leading-5 font-semibold text-text-darkest">
        {question}
      </p>
      <div className="flex" onMouseLeave={() => setHovered(0)}>
        {Array.from({ length: max }, (_, index) => index + 1).map(star => (
          <button
            key={star}
            type="button"
            aria-label={l.rating(star, max)}
            aria-pressed={value === star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className={`flex size-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 transition-transform duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary-base motion-reduce:transition-none ${
              star <= shown ? 'text-states-warning-base' : 'text-neutral-300 in-data-[theme=dark]:text-neutral-600'
            }`}
          >
            {star <= shown ? <StarIconFilledRounded width={28} height={28} aria-hidden="true" /> : <StarIconOutlinedRounded width={28} height={28} aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p role="status" className="!m-0 min-h-4 text-xs leading-4 text-text-base">
        {value > 0 ? l.ratingThanks : ''}
      </p>
    </div>
  );
}

/** Copy, thumbs up and down and regenerate under an assistant message. */
function MessageActions({
  message,
  bubbleRef,
  copyable,
  onFeedback,
  onRegenerate,
  l,
}: {
  message: ChatbotMessage;
  bubbleRef: RefObject<HTMLDivElement | null>;
  copyable: boolean;
  l: ChatbotLabels;
  onFeedback?: ChatbotProps['onFeedback'];
  onRegenerate?: ChatbotProps['onRegenerate'];
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  // Copies the rendered text, so it also works for markdown or other elements.
  const copy = async () => {
    const text = typeof message.content === 'string' ? message.content : (bubbleRef.current?.innerText ?? '');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard access can be denied, e.g. in an iframe without permission.
    }
  };

  const action = (label: string, icon: ReactNode, onClick: () => void, pressed?: boolean) => (
    <Button
      variant="neutral"
      appearance="text"
      size="small"
      aria-label={label}
      aria-pressed={pressed}
      startContent={icon}
      onClick={onClick}
      classNames={{ content: pressed ? '!text-primary-base' : '!text-text-base' }}
    />
  );

  return (
    <div className="-ml-1.5 flex items-center">
      {copyable && action(copied ? l.copied : l.copy, copied ? <CheckIconOutlinedRounded /> : <CopyIconOutlinedRounded />, copy)}
      {onFeedback && (
        <>
          {action(
            l.goodResponse,
            message.feedback === 'up' ? <ThumbUpIconFilledRounded /> : <ThumbUpIconOutlinedRounded />,
            () => onFeedback(message, message.feedback === 'up' ? undefined : 'up'),
            message.feedback === 'up',
          )}
          {action(
            l.badResponse,
            message.feedback === 'down' ? <ThumbDownIconFilledRounded /> : <ThumbDownIconOutlinedRounded />,
            () => onFeedback(message, message.feedback === 'down' ? undefined : 'down'),
            message.feedback === 'down',
          )}
        </>
      )}
      {onRegenerate && action(l.regenerate, <RefreshRightIconOutlinedRounded />, () => onRegenerate(message))}
      {/* Announce the copy, which has no other visible effect for screen readers. */}
      <span className="sr-only" role="status">
        {copied ? l.copiedToClipboard : ''}
      </span>
    </div>
  );
}

interface MessageProps extends Pick<ChatbotProps, 'onRetry' | 'onUndo' | 'onFeedback' | 'onRegenerate'> {
  message: ChatbotMessage;
  bubble: string;
  icon: ChatbotIconType;
  userAvatar?: string | ReactNode;
  copyable: boolean;
  l: ChatbotLabels;
}

function Message({ message, bubble, icon, userAvatar, copyable, onRetry, onUndo, onFeedback, onRegenerate, l }: MessageProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);

  if (message.role === 'system') {
    return (
      <div role="note" className={`mx-auto max-w-[85%] rounded-full bg-background-light px-3 py-1 text-center text-xs leading-4 text-text-base ${enter}`}>
        {message.content}
      </div>
    );
  }

  const isUser = message.role === 'user';
  const failed = message.status === 'failed';
  const retracted = isUser && message.retracted;
  const hasContent = message.content !== '' && message.content != null;
  const hasBody = retracted || hasContent || Boolean(message.attachments?.length) || Boolean(message.extra);
  const canRetry = failed && Boolean(onRetry);
  const canUndo = isUser && !retracted && message.undoable && Boolean(onUndo);
  // No actions on a message that is still empty (a stream that has not started) or failed.
  const hasActions = !isUser && hasContent && !failed && !message.streaming && (copyable || Boolean(onFeedback) || Boolean(onRegenerate));
  const hasMeta = Boolean(message.time || (isUser && message.status && !retracted) || canRetry || canUndo);

  const bubbleClass = retracted
    ? 'border border-dashed border-border-light px-3 py-2 italic text-text-base'
    : failed && !isUser
      ? 'border border-states-danger-light bg-states-danger-lightest p-3 text-states-danger-darkest'
      : failed
        ? `${bubble} px-3 py-2 !border !border-solid !border-states-danger-light`
        : bubble;

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''} ${enter}`}>
      {/* The avatar lines up with the bubble, not with the rows below it. */}
      {/* Offsets: the meta row is 16px plus a 4px gap, the actions row a
          32px small Button plus a 4px gap. Update them if those sizes change. */}
      <span className="shrink-0" style={{ marginBottom: (hasMeta ? 20 : 0) + (hasActions ? 36 : 0) }}>
        {isUser ? (
          <Avatar avatar={userAvatar} />
        ) : message.author ? (
          <Avatar avatar={message.author.avatar} cover />
        ) : (
          <ChatbotIcon face={chatbotIconStyles[icon].face} className={`block size-8 ${chatbotIconStyles[icon].mark}`} />
        )}
      </span>
      <div className={`flex max-w-[80%] min-w-0 flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {message.author && <span className="text-[11px] leading-4 text-text-base">{message.author.name}</span>}
        {hasBody && (
          <div ref={bubbleRef} className={`flex flex-col gap-3 rounded-lg text-sm leading-5 break-words ${bubbleClass}`}>
            {retracted ? (
              l.retracted
            ) : (
              <>
                {message.attachments?.length ? <Attachments items={message.attachments} /> : null}
                {failed && !isUser && (
                  <span className="flex items-center gap-1.5 font-semibold">
                    <WarningCircleIconFilledRounded width={16} height={16} className="shrink-0" aria-hidden="true" />
                    {l.somethingWentWrong}
                  </span>
                )}
                {/* Keep typed line breaks for plain text only: rendered markdown
                    emits newline text nodes between blocks that pre-wrap would show. */}
                {hasContent && <div className={typeof message.content === 'string' ? 'whitespace-pre-wrap' : ''}>{message.content}</div>}
                {message.extra}
                {message.sources?.length ? <Sources items={message.sources} label={l.sources} /> : null}
              </>
            )}
          </div>
        )}
        {hasMeta && (
          <div className="flex h-4 items-center gap-1 text-[11px] leading-4 text-text-base">
            {message.time && <span>{message.time}</span>}
            {isUser && !retracted && message.status && (
              <>
                {message.status === 'sending' && <ClockIconOutlinedRounded width={14} height={14} aria-hidden="true" />}
                {message.status === 'sent' && <CheckIconOutlinedRounded width={16} height={16} aria-hidden="true" />}
                {message.status === 'read' && <DoneAllIconOutlinedRounded width={16} height={16} className="text-primary-sub-base" aria-hidden="true" />}
                {failed ? (
                  // The bubble's red border marks the failure; the row only names it.
                  <span className="text-states-danger-base">{l.notSent}</span>
                ) : (
                  <span className="sr-only">{{ sending: l.sending, sent: l.sent, read: l.read, failed: l.notDelivered }[message.status]}</span>
                )}
              </>
            )}
            {canUndo && (
              <MetaButton onClick={() => onUndo?.(message)} className="ml-1 text-primary-base">
                {l.undo}
              </MetaButton>
            )}
            {canRetry && (
              <>
                {(message.time || (isUser && !retracted && message.status)) && <span aria-hidden="true">·</span>}
                <MetaButton onClick={() => onRetry?.(message)} className="text-states-danger-base">
                  <RefreshRightIconOutlinedRounded width={14} height={14} aria-hidden="true" />
                  {l.retry}
                </MetaButton>
              </>
            )}
          </div>
        )}
        {hasActions && <MessageActions message={message} bubbleRef={bubbleRef} copyable={copyable} onFeedback={onFeedback} onRegenerate={onRegenerate} l={l} />}
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
  // One URL per image file, kept while the file stays picked, so a preview
  // always belongs to its own file and the others do not reload.
  const urls = useRef(new Map<File, string>());
  const [previews, setPreviews] = useState<ReadonlyMap<File, string>>(new Map());

  // A layout effect, so a new image shows its thumbnail on the first paint
  // instead of flashing the file tile for a frame.
  useLayoutEffect(() => {
    const map = urls.current;
    for (const [file, url] of map) {
      if (!files.includes(file)) {
        URL.revokeObjectURL(url);
        map.delete(file);
      }
    }
    for (const file of files) {
      if (file.type.startsWith('image/') && !map.has(file)) map.set(file, URL.createObjectURL(file));
    }
    setPreviews(new Map(map));
  }, [files]);

  // Revoke what is left on unmount. Under StrictMode the effect above runs
  // again afterwards and creates fresh URLs.
  useEffect(() => {
    const map = urls.current;
    return () => {
      map.forEach(url => URL.revokeObjectURL(url));
      map.clear();
    };
  }, []);

  return { files, previews, setFiles };
}

/**
 * The card's frame. Only one state's classes are applied, so a frameless
 * chatbot never depends on two competing `!important` classes; `on` keeps
 * the Card's own border. The `max-sm:` ones
 * come later in the stylesheet than the plain ones, so they win below 640px.
 */
const frameStyles = {
  on: { card: '!rounded-xl !shadow-1-default-base', header: '' },
  off: { card: '!rounded-none !border-0 !shadow-none', header: '!rounded-none' },
  desktop: { card: '!rounded-xl !shadow-1-default-base max-sm:!rounded-none max-sm:!border-0 max-sm:!shadow-none', header: 'max-sm:!rounded-none' },
};

export function Chatbot({
  messages,
  onSubmit,
  typing = false,
  type = 'basic',
  assistantBubble = type,
  userBubble = type,
  iconType = 'primary',
  title = DEFAULT_TITLE,
  subtitle,
  labels,
  agent,
  online = true,
  offlineNotice,
  disabled = false,
  notice,
  disclaimer,
  placeholder,
  maxLength,
  consent,
  onAcceptConsent,
  loading = false,
  hasOlder = false,
  loadingOlder = false,
  onLoadOlder,
  onVoiceInput,
  listening = false,
  expanded,
  onExpandedChange,
  endContent,
  framed = true,
  userAvatar,
  allowAttachments = true,
  attachmentOptions = defaultAttachmentOptions,
  menuItems,
  onClose,
  onRetry,
  onUndo,
  onFeedback,
  onRegenerate,
  copyable = false,
  emptyState,
  className = '',
}: ChatbotProps) {
  const l = { ...defaultLabels, ...labels };
  const f = footerStyles[type];
  const frame = frameStyles[framed === 'desktop' ? 'desktop' : framed ? 'on' : 'off'];
  const titleId = useId();
  const noticeId = useId();
  const counterId = useId();
  const [draft, setDraft] = useState('');
  const { files, previews, setFiles } = usePickedFiles();
  const logRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Input.Field types its ref for both the input and textarea forms.
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const stickToBottom = useRef(true);
  const offline = !online;
  const blocked = offline || disabled || Boolean(consent);
  const overLimit = maxLength !== undefined && draft.length > maxLength;
  const canSend = !blocked && !overLimit && (draft.trim() !== '' || files.length > 0);
  const composerNotice = offline ? (offlineNotice ?? l.offlineNotice) : notice;
  const showCounter = maxLength !== undefined && draft.length >= maxLength * 0.8;

  // The first message that arrived while the reader was scrolled up. It gets
  // a "New messages" divider, which stays until the reader sends, and the
  // jump button counts from it until the reader reaches the bottom.
  const [unseenId, setUnseenId] = useState<string | null>(null);
  const [jumpShown, setJumpShown] = useState(false);
  const unseenIndex = unseenId ? messages.findIndex(message => message.id === unseenId) : -1;
  const unseenCount = !jumpShown || unseenIndex < 0 ? 0 : messages.slice(unseenIndex).filter(message => message.role !== 'user').length;

  // What the log looked like at the last render, to tell appended messages
  // from prepended (older) ones.
  const last = useRef({ firstId: messages[0]?.id, lastId: messages[messages.length - 1]?.id, height: 0, loading });

  // The log announces what is added to it. Loaded history is not new, so mute
  // the log for a second once it is inserted. The attribute is set in the
  // same task as the insertion, before screen readers are told about it, which
  // works in Chromium but is not guaranteed everywhere. A reply that arrives
  // within that second is not announced either.
  const muteTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(muteTimer.current), []);
  const muteLog = (log: HTMLElement) => {
    log.setAttribute('aria-live', 'off');
    clearTimeout(muteTimer.current);
    muteTimer.current = setTimeout(() => log.removeAttribute('aria-live'), 1000);
  };

  // Follow new messages only while the reader is already at the bottom, so
  // scrolling up to re-read an earlier answer is never interrupted. A layout
  // effect, so the log never paints at the old position first.
  useLayoutEffect(() => {
    const log = logRef.current;
    if (!log) return;
    const previous = last.current;
    const firstId = messages[0]?.id;
    const lastId = messages[messages.length - 1]?.id;
    const prepended = firstId !== previous.firstId && lastId === previous.lastId;
    if (prepended || (previous.loading && !loading)) muteLog(log);

    if (stickToBottom.current) {
      log.scrollTop = log.scrollHeight;
    } else if (prepended) {
      // Older messages were added above: keep the reader on the same message.
      log.scrollTop += log.scrollHeight - previous.height;
    } else if (lastId !== previous.lastId) {
      const from = messages.findIndex(message => message.id === previous.lastId) + 1;
      const added = from > 0 ? messages.slice(from) : [];
      const firstUnseen = added.find(message => message.role !== 'user');
      if (firstUnseen) {
        // A new batch after the reader caught up starts a new divider.
        if (!jumpShown) setUnseenId(firstUnseen.id);
        setJumpShown(true);
      }
    }
    last.current = { firstId, lastId, height: log.scrollHeight, loading };
    // Only messages, typing and loading change the log; `jumpShown` is read, not followed.
  }, [messages, typing, loading]);

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
      last.current.height = log.scrollHeight;
    });
    observer.observe(log);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  // Once consent is given, the composer replaces the Start chat button; move focus there.
  const hadConsent = useRef(Boolean(consent));
  useEffect(() => {
    if (hadConsent.current && !consent) fieldRef.current?.focus();
    hadConsent.current = Boolean(consent);
  }, [consent]);

  const previousScrollTop = useRef(0);
  const handleScroll = () => {
    const log = logRef.current;
    if (!log) return;
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 24;
    stickToBottom.current = atBottom;
    if (atBottom && jumpShown) setJumpShown(false);
    // Reaching the top loads older messages, once per arrival there.
    if (hasOlder && !loadingOlder && log.scrollTop < 40 && previousScrollTop.current >= 40) onLoadOlder?.();
    previousScrollTop.current = log.scrollTop;
  };

  const jumpToLatest = () => {
    const log = logRef.current;
    if (!log) return;
    stickToBottom.current = true;
    setJumpShown(false);
    log.scrollTo({ top: log.scrollHeight, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const sendText = (text: string, picked: File[]) => {
    stickToBottom.current = true;
    setUnseenId(null);
    setJumpShown(false);
    onSubmit(text, picked);
  };

  const send = () => {
    if (!canSend) return;
    sendText(draft.trim(), files);
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

  // Follow-up chips belong to the latest answer only, once it is complete.
  const lastMessage = messages[messages.length - 1];
  const suggestions = !typing && !blocked && lastMessage?.role === 'assistant' && !lastMessage.streaming && lastMessage.status !== 'failed' ? (lastMessage.suggestions ?? []) : [];

  const describedBy = [composerNotice ? noticeId : '', showCounter ? counterId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <Card as="section" aria-labelledby={titleId} className={`flex h-[560px] max-h-full w-full max-w-[400px] flex-col overflow-hidden ${frame.card} ${className}`}>
      <ChatbotHeader
        type={type}
        title={agent?.name ?? title}
        subtitle={subtitle}
        avatar={agent?.avatar}
        online={online}
        typing={typing}
        titleId={titleId}
        menuItems={menuItems}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
        onClose={onClose}
        labels={l}
        className={`relative z-10 !shadow-2-default-lg ${frame.header}`}
      />

      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* Always rendered and outside the busy log, so screen readers
            announce the text when older messages start loading. */}
        <span className="sr-only" role="status">
          {loadingOlder ? l.loading : ''}
        </span>
        <div
          ref={logRef}
          role="log"
          aria-relevant="additions"
          aria-label={l.conversation(title)}
          aria-busy={loading || loadingOlder}
          tabIndex={0}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto bg-frames-lightest focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-base ${scrollbar}`}
        >
          {/* Messages stack from the bottom, as in a chat app. */}
          <div ref={contentRef} className="flex min-h-full flex-col justify-end gap-6 px-3 py-6">
            {hasOlder && !loading && (
              // Styled like the day dividers, so it reads as part of the log's
              // structure, not as a message. One button throughout, so focus
              // stays on it while the older messages load.
              <div className="flex h-6 items-center gap-3 text-text-base">
                <span className="h-px flex-1 bg-current opacity-25" />
                <button
                  type="button"
                  onClick={loadingOlder ? undefined : onLoadOlder}
                  aria-disabled={loadingOlder || undefined}
                  className="flex cursor-pointer items-center gap-1 rounded border-0 bg-transparent px-1 py-0.5 font-[inherit] text-[11px] leading-4 font-medium text-text-base transition-colors duration-200 ease-out motion-reduce:transition-none hover:text-text-darkest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-base aria-disabled:cursor-default aria-disabled:hover:text-text-base"
                >
                  {loadingOlder ? (
                    <>
                      {/* A 14px ring plus a 1px margin: the 16px of the icon it replaces. */}
                      <span
                        className="m-px size-3.5 animate-spin rounded-full border-2 border-solid border-current border-t-transparent motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      {l.loading}
                    </>
                  ) : (
                    <>
                      <HistoryIconOutlinedRounded width={16} height={16} aria-hidden="true" />
                      {l.loadOlder}
                    </>
                  )}
                </button>
                <span className="h-px flex-1 bg-current opacity-25" />
              </div>
            )}
            {loading ? (
              <MessagesSkeleton label={l.loading} />
            ) : messages.length === 0 && !typing ? (
              emptyState
            ) : (
              messages.map((message, index) => (
                <Fragment key={message.id}>
                  {message.day && message.day !== messages[index - 1]?.day && <LogDivider>{message.day}</LogDivider>}
                  {message.id === unseenId && <LogDivider className="text-primary-base">{l.newMessagesDivider}</LogDivider>}
                  <Message
                    message={message}
                    bubble={bubbleStyles[message.role === 'user' ? userBubble : assistantBubble][message.role === 'user' ? 'user' : 'assistant']}
                    icon={iconType}
                    userAvatar={userAvatar}
                    copyable={copyable}
                    onRetry={onRetry}
                    onUndo={onUndo}
                    onFeedback={onFeedback}
                    onRegenerate={onRegenerate}
                    l={l}
                  />
                </Fragment>
              ))
            )}
            {suggestions.length > 0 && (
              // Lined up with the bubbles, past the 32px avatar and its 8px gap.
              <div role="group" aria-label={l.suggestions} className={`-mt-3 flex flex-wrap gap-2 pl-10 ${enter}`}>
                {suggestions.map((text, index) => (
                  <Chip
                    key={`${index}-${text}`}
                    variant="primary"
                    appearance="outlined"
                    clickable
                    onClick={() => {
                      // The chips unmount once the question is sent; keep focus in the composer.
                      fieldRef.current?.focus();
                      sendText(text, []);
                    }}
                    className="!bg-frames-lightest"
                  >
                    {text}
                  </Chip>
                ))}
              </div>
            )}
            {typing && <TypingIndicator label={l.isTyping(agent?.name ?? title)} surface={bubbleStyles[assistantBubble].assistant} icon={iconType} />}
            {endContent}
          </div>
        </div>
        {unseenCount > 0 && (
          // Centred over the bottom of the log; the wrapper lets clicks through beside the button.
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <Button
              variant="primary"
              size="small"
              onClick={jumpToLatest}
              endContent={<ArrowBottomIconOutlinedRounded />}
              className={`pointer-events-auto !rounded-full !shadow-1-default-base ${enter}`}
            >
              {l.newMessages(unseenCount)}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={`flex flex-col gap-2 p-3 ${f.footer}`}>
        {consent ? (
          // Until the reader agrees, the notice and a start button take the composer's place.
          <>
            <div className={`text-xs leading-4 ${f.notice}`}>{consent}</div>
            <Button type="button" variant="primary" onClick={onAcceptConsent} className="!w-full">
              {l.startChat}
            </Button>
          </>
        ) : (
          <>
            {composerNotice && (
              <p id={noticeId} className={`!m-0 text-center text-xs leading-4 ${f.notice}`}>
                {composerNotice}
              </p>
            )}
            {/* One composer box: picked files sit in their own tray above the
                text field, split off by a divider, so they never read as part
                of the conversation. */}
            <div className={`overflow-hidden rounded-lg border transition-colors ${f.box} ${blocked ? 'opacity-50' : ''} ${overLimit ? '!border-states-danger-base' : ''}`}>
              {files.length > 0 && (
                <ul aria-label={l.attachments} className={`!m-0 flex list-none gap-2 overflow-x-auto border-b !p-2 !pt-3 ${f.boxDivider} ${scrollbar}`}>
                  {files.map((file, index) => (
                    <li key={`${file.name}-${index}`} className="relative !m-0 shrink-0">
                      {previews.get(file) ? (
                        <img src={previews.get(file)} alt={file.name} className="block size-14 rounded-md object-cover" />
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
                        aria-label={l.removeFile(file.name)}
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
                        aria-label={l.attachFiles}
                        className="!size-8 shrink-0"
                        disabled={blocked}
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
                          aria-label={l.attachFiles}
                          className="!size-8 shrink-0"
                          disabled={blocked}
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
                    {/* Centred on the buttons, which stay at the bottom as the field grows. */}
                    <span className={`mb-1 h-6 w-px shrink-0 self-end ${f.divider}`} aria-hidden="true" />
                  </>
                )}
                <Input.Field
                  ref={fieldRef}
                  as="textarea"
                  rows={1}
                  value={draft}
                  onChange={event => setDraft(event.currentTarget.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={listening ? l.listening : (placeholder ?? l.placeholder)}
                  // Read-only rather than disabled, so a field that turns off
                  // while focused (e.g. after a rate limit) keeps keyboard focus.
                  readOnly={blocked}
                  aria-disabled={blocked || undefined}
                  aria-describedby={describedBy}
                  aria-invalid={overLimit || undefined}
                  aria-label={l.message}
                  className={`max-h-32 min-w-0 flex-1 !resize-none self-center !py-1.5 [field-sizing:content] ${scrollbar} ${f.field}`}
                />
                {onVoiceInput && (
                  <Button
                    variant="neutral"
                    appearance="text"
                    size="small"
                    aria-label={listening ? l.stopVoiceInput : l.voiceInput}
                    aria-pressed={listening}
                    disabled={blocked}
                    startContent={listening ? <MicIconFilledRounded /> : <MicIconOutlinedRounded />}
                    onClick={onVoiceInput}
                    // While recording, a red mic with a pulsing ring.
                    className={`!size-8 shrink-0 ${listening ? '!rounded-full bg-states-danger-lightest motion-safe:animate-pulse' : ''}`}
                    classNames={{ content: listening ? '!text-states-danger-base' : f.attach }}
                  />
                )}
                <Button
                  type="submit"
                  variant="neutral"
                  appearance="text"
                  size="small"
                  aria-label={l.send}
                  startContent={<SendIconFilledRounded />}
                  disabled={!canSend}
                  className="!size-8 shrink-0 disabled:opacity-40"
                  classNames={{ content: f.send }}
                />
              </Input>
            </div>
            {showCounter && (
              <p id={counterId} className={`!m-0 -mt-1 text-right text-[11px] leading-4 ${overLimit ? 'font-medium text-states-danger-base' : f.notice}`}>
                <span aria-hidden="true">
                  {draft.length}/{maxLength}
                </span>
                <span className="sr-only">{l.characters(draft.length, maxLength)}</span>
              </p>
            )}
          </>
        )}
        {disclaimer && <p className={`!m-0 text-center text-[11px] leading-4 ${f.notice}`}>{disclaimer}</p>}
      </form>
    </Card>
  );
}

export interface ChatbotLauncherProps extends Omit<ChatbotProps, 'onClose' | 'expanded' | 'onExpandedChange'> {
  /** Start open. */
  defaultOpen?: boolean;
  /** Positioning of the launcher. Defaults to the bottom-right of the viewport. */
  positionClassName?: string;
  /** Number of unread messages, shown as a badge on the launcher while the panel is closed. */
  unread?: number;
  /** A short message shown next to the closed launcher, e.g. a greeting. The reader can dismiss it. */
  greeting?: ReactNode;
  /**
   * Opens the panel full screen: `true` always, `'mobile'` (default) on
   * screens narrower than 640px, `false` never.
   */
  fullScreen?: boolean | 'mobile';
  /** Shows a header button that opens the panel full screen on larger screens too. */
  expandable?: boolean;
  /** Called when the panel opens or closes, e.g. to clear `unread`. */
  onOpenChange?: (open: boolean) => void;
}

// The panel covers its containing block: the viewport, or the nearest
// ancestor with a transform, as in the docs preview frame. Full screen, the
// card drops its frame, which would only draw a border along the edges.
const fullScreenStyles = {
  always: { panel: 'fixed inset-0 z-10 !h-full !w-full', card: '!max-w-full', framed: false },
  mobile: { panel: 'max-sm:fixed max-sm:inset-0 max-sm:z-10 max-sm:!h-full max-sm:!w-full', card: 'max-sm:!max-w-full', framed: 'desktop' },
  never: { panel: '', card: '', framed: true },
} as const;

/** A floating action button (Figma `chatbot-fab`) that opens the chatbot in a panel above it. */
export function ChatbotLauncher({
  defaultOpen = false,
  positionClassName = 'fixed bottom-6 right-6',
  unread = 0,
  greeting,
  fullScreen = 'mobile',
  expandable = false,
  onOpenChange,
  ...chatbotProps
}: ChatbotLauncherProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [expanded, setExpanded] = useState(false);
  const l = { ...defaultLabels, ...chatbotProps.labels };
  const [greetingDismissed, setGreetingDismissed] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const full = fullScreenStyles[fullScreen === true || expanded ? 'always' : fullScreen === 'mobile' ? 'mobile' : 'never'];
  const title = chatbotProps.agent?.name ?? chatbotProps.title ?? DEFAULT_TITLE;

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
    // Once the chat has been opened, the greeting has done its job.
    setGreetingDismissed(true);
    setOpen(true);
    onOpenChange?.(true);
  };

  const close = () => {
    setOpen(false);
    setExpanded(false);
    onOpenChange?.(false);
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

  const showGreeting = Boolean(greeting) && !open && !greetingDismissed;

  return (
    <div ref={rootRef} className={`z-50 flex flex-col items-end gap-3 ${positionClassName}`} onKeyDown={handleKeyDown}>
      {/* Kept mounted so the draft survives closing. Closing scales and fades
          the panel into the launcher, then makes it invisible and inert.
          Capped so the header stays on short screens. */}
      <div
        id={panelId}
        ref={panelRef}
        inert={!open}
        className={`h-[min(560px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] origin-bottom-right transition-[opacity,scale,translate,visibility] duration-200 ease-out motion-reduce:transition-none ${full.panel} ${
          open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible translate-y-2 scale-95 opacity-0'
        }`}
      >
        <Chatbot
          {...chatbotProps}
          onClose={close}
          expanded={expandable ? expanded : undefined}
          onExpandedChange={expandable ? setExpanded : undefined}
          framed={chatbotProps.framed ?? full.framed}
          className={`!h-full ${full.card} ${chatbotProps.className ?? ''}`}
        />
      </div>
      {showGreeting && (
        <div className={`relative flex max-w-64 items-start gap-1 rounded-xl rounded-br-sm bg-frames-lightest py-2 pr-1 pl-3 shadow-1-default-base ${enter}`}>
          {/* The greeting opens the chat; a separate button dismisses it. */}
          <button
            type="button"
            onClick={openPanel}
            className="cursor-pointer border-0 bg-transparent p-0 py-1 text-left text-sm leading-5 text-text-darkest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-base"
          >
            {greeting}
          </button>
          <Button
            variant="neutral"
            appearance="text"
            size="small"
            aria-label={l.dismissGreeting}
            startContent={<CloseIconOutlinedRounded />}
            onClick={() => setGreetingDismissed(true)}
            classNames={{ content: '!text-text-base' }}
          />
        </div>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? l.hideChat : l.openChat(title, unread)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : openPanel())}
        className="group relative flex size-12 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-primary-base transition-[color,box-shadow,scale,translate] duration-200 ease-out motion-safe:hover:-translate-y-0.5 hover:text-primary-dark hover:shadow-1-hover-base motion-safe:focus-visible:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-base motion-safe:active:translate-y-0 active:scale-95 active:text-primary-base aria-expanded:hover:text-primary-dark motion-reduce:transition-none"
      >
        <FabIcon />
        {unread > 0 && !open && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-states-danger-base px-1 text-[11px] leading-4 font-semibold text-static-white ring-2 ring-frames-lightest"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}
