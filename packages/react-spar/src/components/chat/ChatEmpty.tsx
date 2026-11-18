import type { ElementType, ReactNode, Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ChatEmptyBase } from './base';
import { useChatContext } from './context';
import type { ChatEmptyOwnProps, ChatEmptyProps } from './types';

type ChatEmptyResolvedProps = Omit<ChatEmptyOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
};

export const ChatEmpty = <T extends ElementType = 'div'>(props: ChatEmptyProps<T>) => {
  const theme = useComponentTheme('ChatEmpty');
  const { messages, hasOlder } = useChatContext('Chat.Empty');

  const { rootAttrs, rest } = composeRootAttrs(ChatEmptyBase, props as ChatEmptyProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest as ChatEmptyResolvedProps;

  // With older messages still to load the log is not empty, just not loaded.
  if (messages.length > 0 || hasOlder) return null;

  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

ChatEmpty.displayName = 'Chat.Empty';
