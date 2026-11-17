import { Children, Fragment, isValidElement, useCallback, useContext, useEffect, useRef, type ElementType, type ReactNode, type Ref } from 'react';

import { CheckIconOutlinedRounded } from '@takeoff-icons/react/check';
import { ClockIconOutlinedRounded } from '@takeoff-icons/react/clock';
import { DoneAllIconOutlinedRounded } from '@takeoff-icons/react/done-all';
import { WarningCircleIconOutlinedRounded } from '@takeoff-icons/react/warning-circle';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { visuallyHidden } from '../../utils';
import { Button } from '../button';

import { ChatMessageBase } from './base';
import { ChatAvatar } from './ChatAvatar';
import { ChatMessageActions, ChatMessageItemContext } from './ChatMessageActions';
import { ChatRowContext, useChatContext, useObserveRow } from './context';
import { formatTime, slotAttrsFor, toTime } from './helpers';
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

export const ChatMessage = <T extends ElementType = 'div'>(props: ChatMessageProps<T>) => {
  const theme = useComponentTheme('ChatMessage');
  const { currentUserId, participants, isGroup, labels, locale, onRetry, disabled, readOnly, editing } = useChatContext('Chat.Message');
  const { grouped } = useContext(ChatRowContext);
  const observeRow = useObserveRow();

  const { message } = props as ChatMessageProps<'div'>;
  const own = message.senderId === currentUserId;
  const status = message.deleted ? undefined : message.status;

  const { rootAttrs, rest } = composeRootAttrs(ChatMessageBase, props as ChatMessageProps<'div'>, theme, {
    stateAttrs: () => ({
      'data-own': own ? '' : undefined,
      'data-status': status,
      'data-deleted': message.deleted ? '' : undefined,
      'data-grouped': grouped ? '' : undefined,
      'data-editing': editing?.id === message.id ? '' : undefined,
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
      assignRef(ref, node);
    },
    [ref],
  );
  useEffect(() => {
    if (!observeRow) return;
    observeRow(message, element.current);
    return () => observeRow(message, null);
  }, [observeRow, message]);

  const { content, actions } = partition(children);
  const sender = participants.get(message.senderId);
  const senderName = sender?.name ?? message.senderId;
  const showAuthor = !own && isGroup;
  const time = toTime(message.createdAt);
  const canRetry = own && status === 'failed' && Boolean(onRetry) && !disabled && !readOnly;

  const Component = (as ?? 'div') as ElementType;

  return (
    <ChatMessageItemContext.Provider value={message}>
      <Component {...nativeProps} {...rootAttrs} ref={setRef}>
        {showAuthor && <ChatAvatar {...slot('avatar')} name={senderName} avatar={sender?.avatar} />}
        <div {...slot('body')}>
          {showAuthor && !grouped && <span {...slot('author')}>{senderName}</span>}
          <div {...slot('bubble')}>
            {message.deleted ? (
              <p {...slot('text')}>{labels.deleted}</p>
            ) : content.length > 0 && content.some(node => node != null && node !== false) ? (
              content
            ) : (
              <p {...slot('text')}>{message.text}</p>
            )}
          </div>
          <div {...slot('meta')}>
            <time {...slot('time')} dateTime={new Date(time).toISOString()}>
              {formatTime(time, locale)}
            </time>
            {message.editedAt !== undefined && !message.deleted && <span {...slot('edited')}>{labels.edited}</span>}
            {own && status && (
              <span {...slot('status')} data-status={status} title={labels[status]}>
                {STATUS_ICON[status]}
                <span style={visuallyHidden}>{labels[status]}</span>
              </span>
            )}
            {canRetry && (
              <Button {...slot('retry')} type="button" variant="danger" appearance="text" size="small" onClick={() => onRetry?.(message)}>
                {labels.retry}
              </Button>
            )}
          </div>
        </div>
        {!message.deleted && (actions.length > 0 ? actions : <ChatMessageActions />)}
      </Component>
    </ChatMessageItemContext.Provider>
  );
};

ChatMessage.displayName = 'Chat.Message';
