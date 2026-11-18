import type { ElementType, ReactNode, Ref } from 'react';

import { ArrowLeftIconOutlinedRounded } from '@takeoff-icons/react/arrow-left';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';

import { ChatHeaderBase } from './base';
import { useChatContext } from './context';
import { slotAttrsFor } from './helpers';
import type { ChatHeaderOwnProps, ChatHeaderProps } from './types';

type ChatHeaderResolvedProps = Omit<ChatHeaderOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
};

export const ChatHeader = <T extends ElementType = 'div'>(props: ChatHeaderProps<T>) => {
  const theme = useComponentTheme('ChatHeader');
  const { hasConversationList, setConversationId, labels } = useChatContext('Chat.Header');

  const { rootAttrs, rest } = composeRootAttrs(ChatHeaderBase, props as ChatHeaderProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest as ChatHeaderResolvedProps;
  const slot = slotAttrsFor(ChatHeaderBase, theme, props);

  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      {/* Only next to a conversation list; the recipe shows it when the
          chat is too narrow to show the list beside the thread. */}
      {hasConversationList && (
        <Button
          {...slot('back')}
          type="button"
          variant="neutral"
          appearance="text"
          size="small"
          rounded
          aria-label={labels.back}
          startContent={<ArrowLeftIconOutlinedRounded aria-hidden="true" focusable="false" />}
          onClick={() => setConversationId(null)}
        />
      )}
      {children}
    </Component>
  );
};

ChatHeader.displayName = 'Chat.Header';
