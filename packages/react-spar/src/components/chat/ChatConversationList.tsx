import { useEffect, type ElementType, type ReactNode, type Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ChatConversationListBase } from './base';
import { useChatContext } from './context';
import type { ChatConversationListOwnProps, ChatConversationListProps } from './types';

type ChatConversationListResolvedProps = Omit<ChatConversationListOwnProps, 'classNames' | 'slotProps'> & {
  'as'?: ElementType;
  'children'?: ReactNode;
  'ref'?: Ref<Element>;
  'aria-label'?: string;
};

export const ChatConversationList = <T extends ElementType = 'nav'>(props: ChatConversationListProps<T>) => {
  const theme = useComponentTheme('ChatConversationList');
  const { labels, setHasConversationList } = useChatContext('Chat.ConversationList');

  const { rootAttrs, rest } = composeRootAttrs(ChatConversationListBase, props as ChatConversationListProps<'nav'>, theme);
  const { as, children, ref, 'aria-label': ariaLabel, ...nativeProps } = rest as ChatConversationListResolvedProps;

  // Its presence is what switches the root to the split layout.
  useEffect(() => {
    setHasConversationList(true);
    return () => setHasConversationList(false);
  }, [setHasConversationList]);

  const Component = (as ?? 'nav') as ElementType;

  return (
    <Component {...nativeProps} aria-label={ariaLabel ?? labels.conversations} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

ChatConversationList.displayName = 'Chat.ConversationList';
