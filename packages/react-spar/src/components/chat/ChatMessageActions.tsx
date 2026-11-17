import { createContext, useContext, type ElementType, type ReactNode, type Ref } from 'react';

import { DeleteIconOutlinedRounded } from '@takeoff-icons/react/delete';
import { EditIconOutlinedRounded } from '@takeoff-icons/react/edit';

import { composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';
import { Dropdown } from '../dropdown';

import { ChatMessageActionsBase } from './base';
import { useChatContext } from './context';
import type { ChatMessage, ChatMessageActionsOwnProps, ChatMessageActionsProps } from './types';

type ChatMessageActionsResolvedProps = Omit<ChatMessageActionsOwnProps, 'classNames' | 'slotProps'> & {
  as?: ElementType;
  children?: ReactNode;
  ref?: Ref<Element>;
};

/**
 * Published by `Chat.Message` for its `Chat.MessageActions`: the message, and
 * the menu's open state, which the row opens on a long press or right click.
 */
export interface ChatMessageItemContextValue {
  message: ChatMessage;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export const ChatMessageItemContext = createContext<ChatMessageItemContextValue | null>(null);

// Takeoff icons ship no "more" glyph yet; three vertical dots.
const MoreIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

export const ChatMessageActions = <T extends ElementType = 'div'>(props: ChatMessageActionsProps<T>) => {
  const theme = useComponentTheme('ChatMessageActions');
  const { canEdit, canDelete, startEditing, deleteMessage, focusComposer, focusUndo, labels } = useChatContext('Chat.MessageActions');
  const item = useContext(ChatMessageItemContext);
  if (!item) throw new Error('Chat.MessageActions must be used within Chat.Message');
  const { message, menuOpen, setMenuOpen } = item;

  const { rootAttrs, rest } = composeRootAttrs(ChatMessageActionsBase, props as ChatMessageActionsProps<'div'>, theme);
  const { as, children, ref, ...nativeProps } = rest as ChatMessageActionsResolvedProps;

  const editable = canEdit(message);
  const deletable = canDelete(message);
  const hasExtra = isRenderableNode(children);
  if (!editable && !deletable && !hasExtra) return null;

  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...nativeProps} {...rootAttrs} ref={ref}>
      <Dropdown size="small" open={menuOpen} onOpenChange={setMenuOpen}>
        <Dropdown.Trigger as={Button} variant="neutral" appearance="text" size="small" rounded aria-label={labels.messageActions} startContent={<MoreIcon />} />
        <Dropdown.Content>
          {editable && (
            <Dropdown.Item data-action="edit" onSelect={() => startEditing(message)}>
              <EditIconOutlinedRounded aria-hidden="true" focusable="false" />
              {labels.edit}
            </Dropdown.Item>
          )}
          {deletable && (
            <Dropdown.Item
              data-action="delete"
              onSelect={() => {
                const undoable = deleteMessage(message);
                // The row's menu button goes away with the message's actions;
                // wait for the menu to hand focus back before moving it — to
                // the Undo button while the delete can still be undone.
                setTimeout(() => (undoable ? focusUndo(message.id) : focusComposer()));
              }}
            >
              <DeleteIconOutlinedRounded aria-hidden="true" focusable="false" />
              {labels.delete}
            </Dropdown.Item>
          )}
          {children}
        </Dropdown.Content>
      </Dropdown>
    </Component>
  );
};

ChatMessageActions.displayName = 'Chat.MessageActions';
