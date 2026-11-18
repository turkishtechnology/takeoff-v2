import { useState, type ElementType, type Ref } from 'react';

import { KeepIconOutlinedRounded } from '@takeoff-icons/react/keep';
import { KeepOffIconOutlinedRounded } from '@takeoff-icons/react/keep-off';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';
import { formatLabel } from '../../utils';
import { Button } from '../button';

import { ChatPinnedBase } from './base';
import { useChatContext } from './context';
import { describeQuote, slotAttrsFor } from './helpers';
import type { ChatMessage, ChatPinnedOwnProps, ChatPinnedProps } from './types';

type ChatPinnedResolvedProps = Omit<ChatPinnedOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  ref?: Ref<Element>;
};

export const ChatPinned = <T extends ElementType = 'div'>(props: ChatPinnedProps<T>) => {
  const theme = useComponentTheme('ChatPinned');
  const { messages, pinnedIds, labels, participants, currentUserId, showMessage, canPin, setPinned } = useChatContext('Chat.Pinned');

  const { rootAttrs, rest } = composeRootAttrs(ChatPinnedBase, props as ChatPinnedProps<'div'>, theme);
  const { as, ref, ...nativeProps } = rest as ChatPinnedResolvedProps;
  const slot = slotAttrsFor(ChatPinnedBase, theme, props);

  // Only pins whose message is loaded and still there can be shown and jumped to.
  const pinned = pinnedIds.map(id => messages.find(message => message.id === id)).filter((message): message is ChatMessage => Boolean(message && !message.deleted));

  // Which pin the bar shows, by id so it survives pins coming and going. It
  // starts at the newest; pressing the bar walks back to older ones.
  const [shownId, setShownId] = useState<string | null>(null);
  if (pinned.length === 0) return null;
  const found = pinned.findIndex(message => message.id === shownId);
  const shownIndex = found === -1 ? pinned.length - 1 : found;
  const shown = pinned[shownIndex];
  const { text } = describeQuote({ id: shown.id }, shown, { labels, participants, currentUserId });

  const jump = () => {
    showMessage(shown.id);
    setShownId(pinned[(shownIndex - 1 + pinned.length) % pinned.length].id);
  };

  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      <button {...slot('jump')} type="button" onClick={jump}>
        <KeepIconOutlinedRounded aria-hidden="true" focusable="false" />
        <span {...slot('label')}>
          {labels.pinned}
          {pinned.length > 1 && ` · ${formatLabel(labels.pinnedPosition, { index: shownIndex + 1, count: pinned.length })}`}
        </span>{' '}
        <span {...slot('text')}>{text}</span>
      </button>
      {canPin(shown) && (
        <Button
          {...slot('unpin')}
          type="button"
          variant="neutral"
          appearance="text"
          size="small"
          rounded
          aria-label={labels.unpin}
          startContent={<KeepOffIconOutlinedRounded aria-hidden="true" focusable="false" />}
          onClick={() => setPinned(shown, false)}
        />
      )}
    </Component>
  );
};

ChatPinned.displayName = 'Chat.Pinned';
