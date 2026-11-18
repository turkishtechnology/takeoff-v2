import { useEffect, type ElementType, type ReactNode, type Ref } from 'react';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { ChatTitleBase } from './base';
import { useChatContext } from './context';
import type { ChatTitleOwnProps, ChatTitleProps } from './types';

type ChatTitleResolvedProps = Omit<ChatTitleOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
  id?: string;
};

export const ChatTitle = <T extends ElementType = 'h2'>(props: ChatTitleProps<T>) => {
  const theme = useComponentTheme('ChatTitle');
  const { titleId, setLabelledBy } = useChatContext('Chat.Title');

  const { rootAttrs, rest } = composeRootAttrs(ChatTitleBase, props as ChatTitleProps<'h2'>, theme);
  const { as, children, ref, id, ...nativeProps } = rest as ChatTitleResolvedProps;

  // The root points `aria-labelledby` here only while a title is mounted, so
  // it never references an id that is not in the document.
  const resolvedId = id ?? titleId;
  useEffect(() => {
    setLabelledBy(resolvedId);
    return () => setLabelledBy(null);
  }, [setLabelledBy, resolvedId]);

  const Component = (as ?? 'h2') as ElementType;

  return (
    <Component {...nativeProps} id={resolvedId} {...rootAttrs} ref={ref}>
      {children}
    </Component>
  );
};

ChatTitle.displayName = 'Chat.Title';
