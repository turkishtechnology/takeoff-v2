import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type Ref,
} from 'react';

import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { ClockIconOutlinedRounded } from '@takeoff-icons/react/clock';
import { DoneAllIconOutlinedRounded } from '@takeoff-icons/react/done-all';
import { KeepIconOutlinedRounded } from '@takeoff-icons/react/keep';
import { WarningCircleIconOutlinedRounded } from '@takeoff-icons/react/warning-circle';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { visuallyHidden } from '../../utils';
import { Button } from '../button';

import { ChatMessageBase } from './base';
import { ChatAttachments } from './ChatAttachments';
import { ChatAvatar } from './ChatAvatar';
import { ChatMessageActions, ChatMessageItemContext } from './ChatMessageActions';
import { ChatRowContext, useChatContext, useObserveRow } from './context';
import { LONG_PRESS_MOVE_PX, LONG_PRESS_MS } from './defaults';
import { describeQuote, formatTime, slotAttrsFor, toTime } from './helpers';
import type { ChatMessageOwnProps, ChatMessageProps, ChatMessageStatus } from './types';

type ChatMessageResolvedProps = Omit<ChatMessageOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  ref?: Ref<Element>;
};

const STATUS_ICON: Record<ChatMessageStatus, ReactNode> = {
  sending: <ClockIconOutlinedRounded aria-hidden="true" focusable="false" />,
  sent: <CheckIconOutlinedRounded aria-hidden="true" focusable="false" />,
  delivered: <DoneAllIconOutlinedRounded aria-hidden="true" focusable="false" />,
  read: <DoneAllIconOutlinedRounded aria-hidden="true" focusable="false" />,
  failed: <WarningCircleIconOutlinedRounded aria-hidden="true" focusable="false" />,
};

const assignRef = <E,>(ref: Ref<E> | undefined, value: E | null) => {
  if (typeof ref === 'function') ref(value);
  else if (ref) (ref as { current: E | null }).current = value;
};

/** Splits a composed `Chat.MessageActions` out of the bubble content, through fragments. */
const partition = (children: ReactNode, content: ReactNode[] = [], actions: ReactNode[] = []) => {
  Children.forEach(children, child => {
    if (isValidElement(child) && child.type === Fragment) partition((child.props as { children?: ReactNode }).children, content, actions);
    else if (isValidElement(child) && child.type === ChatMessageActions) actions.push(child);
    else content.push(child);
  });
  return { content, actions };
};

type BubbleHandlers = {
  onContextMenu?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

/** Text the reader has selected inside `element`; a right click on it keeps the browser's menu for copying. */
const hasSelectionIn = (element: Element) => {
  const selection = window.getSelection();
  return Boolean(selection && !selection.isCollapsed && selection.anchorNode && element.contains(selection.anchorNode));
};

/**
 * Opens the row's menu on a right click or a touch held still for
 * `LONG_PRESS_MS`, the gestures people expect from a message. Handlers the
 * consumer passes to the bubble run first and can cancel it.
 */
const useMenuGestures = (enabled: boolean, open: () => void, own: BubbleHandlers) => {
  const press = useRef<{ x: number; y: number; timer: ReturnType<typeof setTimeout> } | null>(null);
  const cancel = useCallback(() => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
  }, []);
  useEffect(() => cancel, [cancel]);

  return {
    onContextMenu: (event: ReactMouseEvent<HTMLDivElement>) => {
      own.onContextMenu?.(event);
      if (!enabled || event.defaultPrevented || hasSelectionIn(event.currentTarget)) return;
      event.preventDefault();
      open();
    },
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
      own.onPointerDown?.(event);
      cancel();
      if (!enabled || event.defaultPrevented || event.pointerType !== 'touch') return;
      press.current = { x: event.clientX, y: event.clientY, timer: setTimeout(open, LONG_PRESS_MS) };
    },
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
      own.onPointerMove?.(event);
      if (press.current && Math.hypot(event.clientX - press.current.x, event.clientY - press.current.y) > LONG_PRESS_MOVE_PX) cancel();
    },
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
      own.onPointerUp?.(event);
      cancel();
    },
    onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => {
      own.onPointerCancel?.(event);
      cancel();
    },
  };
};

export const ChatMessage = <T extends ElementType = 'div'>(props: ChatMessageProps<T>) => {
  const theme = useComponentTheme('ChatMessage');
  const {
    messages,
    currentUserId,
    participants,
    isGroup,
    labels,
    locale,
    onRetry,
    disabled,
    readOnly,
    editing,
    replying,
    canEdit,
    canDelete,
    canReply,
    canCopy,
    canPin,
    isPinned,
    copiedId,
    pendingDeletes,
    undoDelete,
    registerUndo,
    registerRow,
    showMessage,
    highlightedId,
  } = useChatContext('Chat.Message');
  const { grouped } = useContext(ChatRowContext);
  const observeRow = useObserveRow();

  const { message } = props as ChatMessageProps<'div'>;
  const own = message.senderId === currentUserId;
  // Deleted by the user, but `onDelete` waits for the undo window.
  const deleting = pendingDeletes.has(message.id);
  const deleted = Boolean(message.deleted) || deleting;
  const status = deleted ? undefined : message.status;
  const pinned = !deleted && isPinned(message);

  const { rootAttrs, rest } = composeRootAttrs(ChatMessageBase, props as ChatMessageProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-own': own ? '' : undefined,
      'data-status': status,
      'data-deleted': deleted ? '' : undefined,
      'data-deleting': deleting ? '' : undefined,
      'data-grouped': grouped ? '' : undefined,
      'data-editing': editing?.id === message.id || replying?.id === message.id ? '' : undefined,
      'data-highlighted': highlightedId === message.id ? '' : undefined,
      'data-pinned': pinned ? '' : undefined,
    }),
  });
  const { as, message: _message, children, ref, ...nativeProps } = rest as ChatMessageResolvedProps;
  const slot = slotAttrsFor(ChatMessageBase, theme, props);

  // Rows register with the log for read tracking. The element is kept so the
  // registration can be refreshed when the message's state changes.
  const element = useRef<Element | null>(null);
  const setRef = useCallback(
    (node: Element | null) => {
      element.current = node;
      registerRow(message.id, node);
      assignRef(ref, node);
    },
    [ref, registerRow, message.id],
  );
  useEffect(() => {
    if (!observeRow) return;
    observeRow(message, element.current);
    return () => observeRow(message, null);
  }, [observeRow, message]);

  const undoRef = useCallback((node: HTMLElement | null) => registerUndo(message.id, node), [registerUndo, message.id]);

  const [menuOpen, setMenuOpen] = useState(false);
  const { content, actions } = partition(children);
  // Composed actions may still render nothing; the gestures only need to
  // know a menu can be there, and an empty one never opens.
  const hasMenu = !deleted && (actions.length > 0 || canReply(message) || canCopy(message) || canPin(message) || canEdit(message) || canDelete(message));
  // A menu whose message loses its actions (deleted, window closed) stays
  // closed when they come back, e.g. after Undo.
  useEffect(() => {
    if (!hasMenu) setMenuOpen(false);
  }, [hasMenu]);
  const { onContextMenu, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, ...bubbleAttrs } = slot('bubble') as ReturnType<typeof slot> & BubbleHandlers;
  const gestures = useMenuGestures(hasMenu, () => setMenuOpen(true), { onContextMenu, onPointerDown, onPointerMove, onPointerUp, onPointerCancel });
  // Files open the same menu, so a message with no text still has it.
  const {
    onContextMenu: filesContextMenu,
    onPointerDown: filesPointerDown,
    onPointerMove: filesPointerMove,
    onPointerUp: filesPointerUp,
    onPointerCancel: filesPointerCancel,
    ...filesAttrs
  } = slot('attachments') as ReturnType<typeof slot> & BubbleHandlers;
  const fileGestures = useMenuGestures(hasMenu, () => setMenuOpen(true), {
    onContextMenu: filesContextMenu,
    onPointerDown: filesPointerDown,
    onPointerMove: filesPointerMove,
    onPointerUp: filesPointerUp,
    onPointerCancel: filesPointerCancel,
  });
  const attachments = deleted ? [] : (message.attachments ?? []);
  const hasCustomContent = content.some(node => node != null && node !== false);
  // A files-only message is just its files; anything else keeps its bubble.
  const reply = deleted ? undefined : message.replyTo;
  const original = reply && messages.find(candidate => candidate.id === reply.id);
  const quote = reply && describeQuote(reply, original, { labels, participants, currentUserId });
  const showBubble = deleted || hasCustomContent || message.text !== '' || attachments.length === 0 || Boolean(reply);
  // A loaded original can be jumped to; otherwise the quote is just text.
  const QuoteElement = original ? 'button' : 'div';

  const sender = participants.get(message.senderId);
  const senderName = sender?.name ?? message.senderId;
  const showAuthor = !own && isGroup;
  const time = toTime(message.createdAt);
  const canRetry = own && status === 'failed' && Boolean(onRetry) && !disabled && !readOnly;

  const Component = (as ?? 'div') as ElementType;

  return (
    <ChatMessageItemContext.Provider value={{ message, menuOpen, setMenuOpen }}>
      <Component {...nativeProps} {...rootAttrs} ref={setRef}>
        {showAuthor && <ChatAvatar {...slot('avatar')} name={senderName} avatar={sender?.avatar} />}
        <div {...slot('body')}>
          {showAuthor && !grouped && <span {...slot('author')}>{senderName}</span>}
          {showBubble && (
            <div {...bubbleAttrs} {...gestures}>
              {quote && (
                <QuoteElement {...slot('quote')} {...(original ? { type: 'button', onClick: () => showMessage(original.id) } : {})}>
                  {/* Spaces between the parts keep the accessible name readable. */}
                  <span style={visuallyHidden}>{labels.inReplyTo}</span> <span {...slot('quoteAuthor')}>{quote.author}</span> <span {...slot('quoteText')}>{quote.text}</span>
                </QuoteElement>
              )}
              {deleted ? <p {...slot('text')}>{labels.deleted}</p> : hasCustomContent ? content : message.text !== '' && <p {...slot('text')}>{message.text}</p>}
            </div>
          )}
          {attachments.length > 0 && <ChatAttachments attachments={attachments} root={{ ...filesAttrs, ...fileGestures }} image={slot('image')} />}
          <div {...slot('meta')}>
            {pinned && (
              <span {...slot('pinned')} title={labels.pinned}>
                <KeepIconOutlinedRounded aria-hidden="true" focusable="false" />
                <span style={visuallyHidden}>{labels.pinned}</span>
              </span>
            )}
            <time {...slot('time')} dateTime={new Date(time).toISOString()}>
              {formatTime(time, locale)}
            </time>
            {message.editedAt !== undefined && !deleted && <span {...slot('edited')}>{labels.edited}</span>}
            {own && status && (
              <span {...slot('status')} data-status={status} title={labels[status]}>
                {STATUS_ICON[status]}
                <span style={visuallyHidden}>{labels[status]}</span>
              </span>
            )}
            {/* Visible confirmation; the root's status region reads it out. */}
            {copiedId === message.id && (
              <span {...slot('copied')} aria-hidden="true">
                {labels.copied}
              </span>
            )}
            {canRetry && (
              <Button {...slot('retry')} type="button" variant="danger" appearance="text" size="small" onClick={() => onRetry?.(message)}>
                {labels.retry}
              </Button>
            )}
            {deleting && (
              <Button {...slot('undo')} ref={undoRef} type="button" variant="primary" appearance="text" size="small" onClick={() => undoDelete(message.id)}>
                {labels.undo}
              </Button>
            )}
          </div>
        </div>
        {!deleted && (actions.length > 0 ? actions : <ChatMessageActions />)}
      </Component>
    </ChatMessageItemContext.Provider>
  );
};

ChatMessage.displayName = 'Chat.Message';
