import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type ElementType, type Ref, type RefObject, type UIEvent } from 'react';

import { ArrowBottomIconOutlinedRounded } from '@takeoff-icons/react/arrow-bottom';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel, visuallyHidden } from '../../utils';
import { Button } from '../button';

import { ChatMessagesBase } from './base';
import { ChatMessage } from './ChatMessage';
import { ChatMessagesContext, ChatRowContext, useChatContext, type ObserveRow } from './context';
import { LOAD_OLDER_THRESHOLD_PX, READ_VISIBILITY_THRESHOLD, STICK_THRESHOLD_PX } from './defaults';
import { continuesGroup, formatDay, isSameDay, listNames, slotAttrsFor, toTime } from './helpers';
import type { ChatMessage as ChatMessageData, ChatMessagesOwnProps, ChatMessagesProps } from './types';

type ChatMessagesResolvedProps = Omit<ChatMessagesOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  ref?: Ref<Element>;
};

const prefersReducedMotion = () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Read tracking: an incoming, unread message counts as read once enough of it
 * is inside the log while the page is visible. Rows register themselves; the
 * messages that became visible in one pass are reported in one `onRead` call.
 */
const useReadTracking = (viewport: RefObject<HTMLDivElement | null>, currentUserId: string, onRead: ((messages: ChatMessageData[]) => void) | undefined) => {
  const onReadRef = useRef(onRead);
  onReadRef.current = onRead;
  const elements = useRef(new Map<string, Element>());
  const byElement = useRef(new Map<Element, ChatMessageData>());
  const visible = useRef(new Map<string, ChatMessageData>());
  const reported = useRef(new Set<string>());
  const observer = useRef<IntersectionObserver | null>(null);
  const flushQueued = useRef(false);

  const flush = useCallback(() => {
    flushQueued.current = false;
    if (document.visibilityState === 'hidden' || visible.current.size === 0) return;
    const batch = [...visible.current.values()].filter(message => !reported.current.has(message.id));
    visible.current.clear();
    if (batch.length === 0) return;
    for (const message of batch) reported.current.add(message.id);
    onReadRef.current?.(batch);
  }, []);

  const queueFlush = useCallback(() => {
    if (flushQueued.current) return;
    flushQueued.current = true;
    queueMicrotask(flush);
  }, [flush]);

  const getObserver = useCallback((): IntersectionObserver | null => {
    if (observer.current || typeof IntersectionObserver === 'undefined') return observer.current;
    observer.current = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const message = byElement.current.get(entry.target);
          if (!message) continue;
          if (entry.isIntersecting) visible.current.set(message.id, message);
          else visible.current.delete(message.id);
        }
        queueFlush();
      },
      { root: viewport.current, threshold: READ_VISIBILITY_THRESHOLD },
    );
    return observer.current;
  }, [viewport, queueFlush]);

  const observeRow: ObserveRow = useCallback(
    (message, element) => {
      // Drop whatever was registered for this message before.
      const previous = elements.current.get(message.id);
      if (previous) {
        observer.current?.unobserve(previous);
        byElement.current.delete(previous);
        elements.current.delete(message.id);
        visible.current.delete(message.id);
      }
      const unread = message.senderId !== currentUserId && !message.deleted && message.status !== 'read';
      if (!element || !unread || !onReadRef.current || reported.current.has(message.id)) return;
      elements.current.set(message.id, element);
      byElement.current.set(element, message);
      const io = getObserver();
      if (io) io.observe(element);
      else {
        // No IntersectionObserver (old browsers, test environments): a
        // rendered message counts as seen.
        visible.current.set(message.id, message);
        queueFlush();
      }
    },
    [currentUserId, getObserver, queueFlush],
  );

  // Messages that became visible while the tab was in the background are
  // reported when the user comes back to it.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') flush();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      observer.current?.disconnect();
      observer.current = null;
    };
  }, [flush]);

  return observeRow;
};

export const ChatMessages = <T extends ElementType = 'div'>(props: ChatMessagesProps<T>) => {
  const theme = useComponentTheme('ChatMessages');
  const { messages, currentUserId, labels, locale, now, typingNames, hasOlder, isLoadingOlder, onLoadOlder, onRead, stickToBottom } = useChatContext('Chat.Messages');

  const { rootAttrs, rest } = composeRootAttrs(ChatMessagesBase, props as ChatMessagesProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest as ChatMessagesResolvedProps;
  const slot = slotAttrsFor(ChatMessagesBase, theme, props);

  const viewport = useRef<HTMLDivElement | null>(null);
  const content = useRef<HTMLDivElement | null>(null);
  const observeRow = useReadTracking(viewport, currentUserId, onRead);

  // Incoming messages that arrived while the reader was scrolled up.
  const [unseen, setUnseen] = useState(0);
  const last = useRef({ firstId: messages[0]?.id, lastId: messages[messages.length - 1]?.id, height: 0 });
  const isEmpty = messages.length === 0 && !hasOlder && typingNames.length === 0;

  // Follow new messages only while the reader is at the bottom, so reading
  // back is never interrupted. A layout effect, so the log never paints at
  // the old position first.
  useLayoutEffect(() => {
    const log = viewport.current;
    if (!log) return;
    const previous = last.current;
    const firstId = messages[0]?.id;
    const lastId = messages[messages.length - 1]?.id;
    const prepended = firstId !== previous.firstId && lastId === previous.lastId && previous.lastId !== undefined;

    // A list that no longer holds the last message seen is another
    // conversation (or a reload): start it at the bottom.
    const replaced = previous.lastId !== undefined && lastId !== previous.lastId && !messages.some(message => message.id === previous.lastId);
    if (replaced) {
      stickToBottom.current = true;
      setUnseen(0);
    }

    if (stickToBottom.current) {
      log.scrollTop = log.scrollHeight;
    } else if (prepended) {
      // Older messages went in above: keep the reader on the same message.
      log.scrollTop += log.scrollHeight - previous.height;
    } else if (lastId !== previous.lastId) {
      const from = messages.findIndex(message => message.id === previous.lastId) + 1;
      const arrived = messages.slice(from).filter(message => message.senderId !== currentUserId).length;
      if (arrived > 0) setUnseen(count => count + arrived);
    }
    last.current = { firstId, lastId, height: log.scrollHeight };
  }, [messages, typingNames.length, stickToBottom, currentUserId, isEmpty]);

  // Sizes also change without new messages — the container is resized, the
  // composer grows, an image loads. Stay pinned to the bottom through those.
  useEffect(() => {
    const log = viewport.current;
    const inner = content.current;
    if (!log || !inner || typeof ResizeObserver === 'undefined') return;
    const resize = new ResizeObserver(() => {
      if (stickToBottom.current) log.scrollTop = log.scrollHeight;
      last.current.height = log.scrollHeight;
    });
    resize.observe(log);
    resize.observe(inner);
    return () => resize.disconnect();
  }, [stickToBottom, isEmpty]);

  const previousScrollTop = useRef(0);
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const log = event.currentTarget;
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < STICK_THRESHOLD_PX;
    stickToBottom.current = atBottom;
    last.current.height = log.scrollHeight;
    if (atBottom) setUnseen(0);
    // Reaching the top loads older messages, once per arrival there.
    if (hasOlder && !isLoadingOlder && log.scrollTop < LOAD_OLDER_THRESHOLD_PX && previousScrollTop.current >= LOAD_OLDER_THRESHOLD_PX) onLoadOlder?.();
    previousScrollTop.current = log.scrollTop;
  };

  const jumpToLatest = () => {
    stickToBottom.current = true;
    setUnseen(0);
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  if (isEmpty) return null;

  const typingLabel = typingNames.length === 0 ? '' : formatLabel(typingNames.length === 1 ? labels.typing : labels.typingMany, { names: listNames(typingNames, locale) });

  const Component = (as ?? 'div') as ElementType;

  return (
    <ChatMessagesContext.Provider value={observeRow}>
      <Component {...nativeProps} {...rootAttrs} ref={ref}>
        <div
          {...slot('viewport')}
          ref={viewport}
          role="log"
          aria-label={labels.messages}
          aria-busy={isLoadingOlder || undefined}
          // Keyboard users scroll the log too.
          tabIndex={0}
          onScroll={handleScroll}
        >
          <div {...slot('content')} ref={content}>
            {hasOlder && (
              <Button {...slot('loadOlder')} type="button" variant="neutral" appearance="outlined" size="small" loading={isLoadingOlder} onClick={() => onLoadOlder?.()}>
                {labels.loadOlder}
              </Button>
            )}
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const time = toTime(message.createdAt);
              const newDay = !previous || !isSameDay(toTime(previous.createdAt), time);
              return (
                <Fragment key={message.id}>
                  {newDay && <div {...slot('divider')}>{formatDay(time, now, locale, labels)}</div>}
                  <ChatRowContext.Provider value={{ grouped: !newDay && continuesGroup(previous, message) }}>
                    {children ? children(message) : <ChatMessage message={message} />}
                  </ChatRowContext.Provider>
                </Fragment>
              );
            })}
            {typingLabel && (
              <div {...slot('typing')}>
                <span {...slot('typingDots')} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                {typingLabel}
              </div>
            )}
          </div>
        </div>
        {unseen > 0 && (
          <Button
            {...slot('jump')}
            type="button"
            variant="primary"
            size="small"
            rounded
            startContent={<ArrowBottomIconOutlinedRounded aria-hidden="true" focusable="false" />}
            onClick={jumpToLatest}
          >
            {formatLabel(labels.newMessages, { count: unseen })} <span style={visuallyHidden}>{labels.jumpToLatest}</span>
          </Button>
        )}
      </Component>
    </ChatMessagesContext.Provider>
  );
};

ChatMessages.displayName = 'Chat.Messages';
