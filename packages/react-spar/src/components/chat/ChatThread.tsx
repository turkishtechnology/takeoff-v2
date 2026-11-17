import type { ElementType, ReactNode, Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ChatThreadBase } from './base';
import { useChatContext } from './context';
import type { ChatThreadOwnProps, ChatThreadProps } from './types';

type ChatThreadResolvedProps = Omit<ChatThreadOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
};

export const ChatThread = <T extends ElementType = 'div'>(props: ChatThreadProps<T>) => {
  const theme = useComponentTheme('ChatThread');
  useChatContext('Chat.Thread');

  const { rootAttrs, rest } = composeRootAttrs(ChatThreadBase, props as ChatThreadProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest as ChatThreadResolvedProps;

  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

ChatThread.displayName = 'Chat.Thread';
