import type { ElementType, MouseEvent, Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel, visuallyHidden } from '../../utils';

import { ChatConversationBase } from './base';
import { ChatAvatar } from './ChatAvatar';
import { useChatContext } from './context';
import { formatListTime, slotAttrsFor, toTime } from './helpers';
import type { ChatConversationOwnProps, ChatConversationProps } from './types';

type ChatConversationResolvedProps = Omit<ChatConversationOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  ref?: Ref<Element>;
  type?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export const ChatConversation = <T extends ElementType = 'button'>(props: ChatConversationProps<T>) => {
  const theme = useComponentTheme('ChatConversation');
  const { conversationId, setConversationId, labels, locale, now } = useChatContext('Chat.Conversation');

  const { conversation } = props as ChatConversationProps<'button'>;
  const selected = conversation.id === conversationId;
  const unread = conversation.unreadCount ?? 0;

  const { rootAttrs, rest } = composeRootAttrs(ChatConversationBase, props as ChatConversationProps<'button'>, theme, {
    stateAttrs: () => ({
      'data-selected': selected ? '' : undefined,
      'data-unread': unread > 0 ? '' : undefined,
    }),
  });
  const { as, conversation: _conversation, ref, type, onClick, ...nativeProps } = rest as ChatConversationResolvedProps;
  const slot = slotAttrsFor(ChatConversationBase, theme, props);

  const Component = (as ?? 'button') as ElementType;
  const isButton = Component === 'button';
  const updatedAt = conversation.updatedAt === undefined ? undefined : toTime(conversation.updatedAt);

  return (
    <Component
      {...nativeProps}
      type={isButton ? (type ?? 'button') : type}
      aria-current={selected ? 'true' : undefined}
      onClick={(event: MouseEvent<HTMLElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) setConversationId(conversation.id);
      }}
      {...rootAttrs}
      ref={ref}
    >
      <ChatAvatar {...slot('avatar')} name={conversation.title} avatar={conversation.avatar} />
      <span {...slot('body')}>
        <span {...slot('title')}>{conversation.title}</span>
        {conversation.preview != null && <span {...slot('preview')}>{conversation.preview}</span>}
      </span>
      {updatedAt !== undefined && (
        <time {...slot('time')} dateTime={new Date(updatedAt).toISOString()}>
          {formatListTime(updatedAt, now, locale, labels)}
        </time>
      )}
      {unread > 0 && (
        <span {...slot('unread')}>
          <span aria-hidden="true">{unread > 99 ? '99+' : unread}</span>
          <span style={visuallyHidden}>{formatLabel(labels.unread, { count: unread })}</span>
        </span>
      )}
    </Component>
  );
};

ChatConversation.displayName = 'Chat.Conversation';
