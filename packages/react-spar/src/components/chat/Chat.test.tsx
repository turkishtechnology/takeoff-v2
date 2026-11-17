import { useState, type ReactNode } from 'react';
import { act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { renderWithProvider as render, screen, within } from '../../test-utils';
import { Dropdown } from '../dropdown';

import { formatDay, initials, isComposing, listNames, nextWindowClose } from './helpers';
import { Chat, type ChatConversation, type ChatMessage, type ChatParticipant, type ChatProps } from './index';

// A fixed "now" — noon on a Tuesday — so times and day dividers are stable.
const NOW = new Date(2026, 2, 10, 12, 0, 0).getTime();
const MINUTE = 60_000;
const at = (minutesAgo: number) => new Date(NOW - minutesAgo * MINUTE);

const ME = 'me';
const ayse: ChatParticipant = { id: 'ayse', name: 'Ayşe Yılmaz' };
const mehmet: ChatParticipant = { id: 'mehmet', name: 'Mehmet Kaya', avatar: 'https://example.com/m.png' };

const msg = (id: string, over: Partial<ChatMessage> = {}): ChatMessage => ({ id, senderId: ME, text: `text ${id}`, createdAt: at(1), status: 'sent', ...over });

type TestChatProps = Partial<ChatProps> & { composer?: ReactNode; header?: ReactNode };

const TestChat = ({ composer, header, children, ...props }: TestChatProps) => (
  <Chat messages={[]} currentUserId={ME} participants={[ayse]} {...props}>
    {header ?? (
      <Chat.Header>
        <Chat.Title>Ayşe</Chat.Title>
      </Chat.Header>
    )}
    <Chat.Messages />
    <Chat.Empty>No messages yet</Chat.Empty>
    {composer ?? <Chat.Composer />}
    {children}
  </Chat>
);

const field = () => screen.getByRole('textbox') as HTMLTextAreaElement;
const log = () => screen.getByRole('log');
const row = (text: string) =>
  screen
    .getAllByText(text)
    .map(node => node.closest('.tk-chat-message'))
    .find(Boolean) as HTMLElement;

const openActions = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  await user.click(within(row(text)).getByRole('button', { name: 'Message actions' }));
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  Element.prototype.scrollTo = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Chat (compound)', () => {
  describe('rendering', () => {
    it('renders a section labelled by its title, in the single layout', () => {
      render(<TestChat />);
      const region = screen.getByRole('region', { name: 'Ayşe' });
      expect(region).toHaveClass('tk-chat');
      expect(region).toHaveAttribute('data-slot', 'root');
      expect(region).toHaveAttribute('data-layout', 'single');
      expect(screen.getByRole('heading', { name: 'Ayşe' })).toHaveClass('tk-chat-title');
    });

    it('drops aria-labelledby without a title and keeps an explicit one', () => {
      const { container, rerender } = render(<TestChat header={<Chat.Header />} />);
      expect(container.querySelector('.tk-chat')).not.toHaveAttribute('aria-labelledby');
      rerender(<TestChat header={<Chat.Header />} aria-labelledby="outside" />);
      expect(container.querySelector('.tk-chat')).toHaveAttribute('aria-labelledby', 'outside');
    });

    it('keeps a title id the consumer sets', () => {
      render(<TestChat header={<Chat.Title id="custom">Room</Chat.Title>} />);
      expect(screen.getByRole('region', { name: 'Room' })).toHaveAttribute('aria-labelledby', 'custom');
    });

    it('renders the empty state only without messages', () => {
      const { rerender } = render(<TestChat />);
      expect(screen.getByText('No messages yet')).toHaveClass('tk-chat-empty');
      expect(screen.queryByRole('log')).not.toBeInTheDocument();
      rerender(<TestChat messages={[msg('1')]} />);
      expect(screen.queryByText('No messages yet')).not.toBeInTheDocument();
      rerender(<TestChat hasOlder />);
      expect(screen.queryByText('No messages yet')).not.toBeInTheDocument();
    });

    it('marks disabled and read-only roots', () => {
      const { container, rerender } = render(<TestChat disabled />);
      expect(container.querySelector('.tk-chat')).toHaveAttribute('data-disabled', '');
      rerender(<TestChat readOnly />);
      expect(container.querySelector('.tk-chat')).toHaveAttribute('data-readonly', '');
    });

    it('renders as another element', () => {
      const { container } = render(
        <Chat as="div" messages={[]} currentUserId={ME}>
          <Chat.Messages />
        </Chat>,
      );
      expect(container.querySelector('div.tk-chat')).toBeInTheDocument();
    });

    it('throws when a part is used outside Chat', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<Chat.Messages />)).toThrow(/Chat.Messages/);
      expect(() => render(<Chat.Thread />)).toThrow(/Chat.Thread/);
      expect(() =>
        render(
          <Chat messages={[]} currentUserId={ME}>
            <Chat.MessageActions />
          </Chat>,
        ),
      ).toThrow(/Chat.Message/);
      spy.mockRestore();
    });
  });

  describe('messages', () => {
    it('renders own and incoming messages with time and delivery status', () => {
      render(
        <TestChat
          messages={[
            msg('1', { senderId: 'ayse', text: 'Hi', status: undefined, createdAt: at(10) }),
            msg('2', { text: 'Sending one', status: 'sending' }),
            msg('3', { text: 'Sent one', status: 'sent', createdAt: NOW - 30_000 }),
            msg('4', { text: 'Delivered one', status: 'delivered', createdAt: (at(0.4) as Date).toISOString() }),
            msg('5', { text: 'Read one', status: 'read' }),
            msg('6', { text: 'Failed one', status: 'failed' }),
          ]}
        />,
      );
      expect(row('Hi')).not.toHaveAttribute('data-own');
      expect(row('Sending one')).toHaveAttribute('data-own', '');
      expect(within(row('Hi')).queryByText('Sent')).not.toBeInTheDocument();
      for (const [text, status, label] of [
        ['Sending one', 'sending', 'Sending'],
        ['Sent one', 'sent', 'Sent'],
        ['Delivered one', 'delivered', 'Delivered'],
        ['Read one', 'read', 'Read'],
        ['Failed one', 'failed', 'Not delivered'],
      ]) {
        expect(row(text)).toHaveAttribute('data-status', status);
        const statusNode = row(text).querySelector('.tk-chat-message-status');
        expect(statusNode).toHaveTextContent(label);
        expect(statusNode).toHaveAttribute('title', label);
      }
      const time = row('Hi').querySelector('time');
      expect(time).toHaveAttribute('dateTime', at(10).toISOString());
      expect(time).toHaveClass('tk-chat-message-time');
    });

    it('shows the edited note and replaces deleted messages', () => {
      render(<TestChat messages={[msg('1', { text: 'Changed', editedAt: at(0) }), msg('2', { text: 'Gone', deleted: true, editedAt: at(0), status: 'read' })]} />);
      expect(within(row('Changed')).getByText('Edited')).toHaveClass('tk-chat-message-edited');
      const deleted = row('This message was deleted');
      expect(deleted).toHaveAttribute('data-deleted', '');
      expect(deleted).not.toHaveAttribute('data-status');
      expect(within(deleted).queryByText('Edited')).not.toBeInTheDocument();
      expect(screen.queryByText('Gone')).not.toBeInTheDocument();
    });

    it('adds day dividers for today, yesterday and older dates', () => {
      render(
        <TestChat
          messages={[
            msg('1', { text: 'Last year', createdAt: new Date(2025, 11, 31, 9) }),
            msg('2', { text: 'This year', createdAt: new Date(2026, 0, 15, 9) }),
            msg('3', { text: 'Yesterday msg', createdAt: new Date(2026, 2, 9, 9) }),
            msg('4', { text: 'Today msg', createdAt: at(5) }),
            msg('5', { text: 'Today again', createdAt: at(4) }),
          ]}
          locale="en-US"
        />,
      );
      const dividers = [...document.querySelectorAll('.tk-chat-divider')].map(node => node.textContent);
      expect(dividers).toEqual(['December 31, 2025', 'January 15', 'Yesterday', 'Today']);
    });

    it('groups consecutive messages from one sender', () => {
      render(
        <TestChat
          messages={[
            msg('1', { text: 'First', createdAt: at(20) }),
            msg('2', { text: 'Second', createdAt: at(19) }),
            msg('3', { text: 'Much later', createdAt: at(2) }),
            msg('4', { text: 'Other sender', senderId: 'ayse', createdAt: at(1) }),
          ]}
        />,
      );
      expect(row('First')).not.toHaveAttribute('data-grouped');
      expect(row('Second')).toHaveAttribute('data-grouped', '');
      expect(row('Much later')).not.toHaveAttribute('data-grouped');
      expect(row('Other sender')).not.toHaveAttribute('data-grouped');
    });

    it('shows author and avatar for incoming messages in a group chat', () => {
      render(
        <TestChat
          participants={[{ id: ME, name: 'Me' }, ayse, mehmet, { id: 'zeynep', name: 'Zeynep', avatar: <svg data-testid="z-avatar" /> }]}
          messages={[
            msg('1', { senderId: 'ayse', text: 'From Ayşe', createdAt: at(3) }),
            msg('2', { senderId: 'ayse', text: 'Again Ayşe', createdAt: at(2) }),
            msg('3', { senderId: 'mehmet', text: 'From Mehmet' }),
            msg('4', { senderId: 'zeynep', text: 'From Zeynep' }),
            msg('5', { senderId: 'ghost', text: 'From ghost' }),
            msg('6', { text: 'Mine' }),
          ]}
        />,
      );
      expect(within(row('From Ayşe')).getByText('Ayşe Yılmaz')).toHaveClass('tk-chat-message-author');
      expect(row('From Ayşe').querySelector('.tk-chat-message-avatar')).toHaveTextContent('AY');
      expect(within(row('Again Ayşe')).queryByText('Ayşe Yılmaz')).not.toBeInTheDocument();
      expect(row('Again Ayşe').querySelector('.tk-chat-message-avatar')).toHaveAttribute('aria-hidden', 'true');
      expect(row('From Mehmet').querySelector('.tk-chat-message-avatar img')).toHaveAttribute('src', 'https://example.com/m.png');
      expect(within(row('From Zeynep')).getByTestId('z-avatar')).toBeInTheDocument();
      expect(within(row('From ghost')).getByText('ghost')).toBeInTheDocument();
      expect(row('Mine').querySelector('.tk-chat-message-avatar')).not.toBeInTheDocument();
    });

    it('hides author and avatar in a one-to-one chat', () => {
      render(<TestChat participants={[{ id: ME, name: 'Me' }, ayse]} messages={[msg('1', { senderId: 'ayse', text: 'Hello' })]} />);
      expect(row('Hello').querySelector('.tk-chat-message-avatar')).not.toBeInTheDocument();
      expect(screen.queryByText('Ayşe Yılmaz')).not.toBeInTheDocument();
    });

    it('renders custom rows and bubble content', () => {
      render(
        <Chat messages={[msg('1', { text: 'plain' }), msg('2', { text: 'rich' })]} currentUserId={ME}>
          <Chat.Messages>
            {message =>
              message.id === '1' ? (
                <Chat.Message message={message} data-testid="custom-row" />
              ) : (
                <Chat.Message message={message}>
                  <>
                    <strong>Rich content</strong>
                  </>
                </Chat.Message>
              )
            }
          </Chat.Messages>
        </Chat>,
      );
      expect(screen.getByTestId('custom-row')).toHaveTextContent('plain');
      expect(screen.getByText('Rich content').closest('.tk-chat-message-bubble')).toBeInTheDocument();
      expect(screen.queryByText('rich')).not.toBeInTheDocument();
    });

    it('falls back to the text when children render nothing', () => {
      render(
        <Chat messages={[msg('1', { text: 'fallback' })]} currentUserId={ME}>
          <Chat.Messages>{message => <Chat.Message message={message}>{false}</Chat.Message>}</Chat.Messages>
        </Chat>,
      );
      expect(screen.getByText('fallback')).toHaveClass('tk-chat-message-text');
    });

    it('forwards object and function refs on a message row', () => {
      const objectRef = { current: null as HTMLDivElement | null };
      const fnRef = vi.fn();
      render(
        <Chat messages={[msg('1'), msg('2')]} currentUserId={ME}>
          <Chat.Messages>{message => <Chat.Message message={message} ref={message.id === '1' ? objectRef : fnRef} />}</Chat.Messages>
        </Chat>,
      );
      expect(objectRef.current).toHaveClass('tk-chat-message');
      expect(fnRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('offers retry under failed own messages when onRetry is set', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      const failed = msg('1', { text: 'Oops', status: 'failed' });
      const { rerender } = render(<TestChat messages={[failed]} onRetry={onRetry} />);
      await user.click(within(row('Oops')).getByRole('button', { name: 'Retry' }));
      expect(onRetry).toHaveBeenCalledWith(failed);
      rerender(<TestChat messages={[failed]} onRetry={onRetry} disabled />);
      expect(within(row('Oops')).queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
      rerender(<TestChat messages={[failed]} />);
      expect(within(row('Oops')).queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });

    it('renders the typing line for one or several participants', () => {
      const { rerender } = render(<TestChat messages={[msg('1')]} typing={['ayse', ME]} />);
      expect(screen.getByText('Ayşe Yılmaz is typing…')).toHaveClass('tk-chat-typing');
      rerender(<TestChat messages={[msg('1')]} participants={[ayse, mehmet]} typing={['ayse', 'mehmet']} locale="en" />);
      expect(screen.getByText('Ayşe Yılmaz and Mehmet Kaya are typing…')).toBeInTheDocument();
      rerender(<TestChat typing={['unknown']} />);
      expect(screen.getByText('unknown is typing…')).toBeInTheDocument();
      expect(screen.queryByText('No messages yet')).toBeInTheDocument();
    });
  });

  describe('sending', () => {
    it('sends the trimmed draft with Enter and clears the field', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<TestChat onSend={onSend} />);
      const send = screen.getByRole('button', { name: 'Send message' });
      expect(send).toBeDisabled();
      await user.type(field(), '  Hello  ');
      expect(send).toBeEnabled();
      await user.keyboard('{Enter}');
      expect(onSend).toHaveBeenCalledExactlyOnceWith('Hello');
      expect(field()).toHaveValue('');
      expect(field()).toHaveFocus();
    });

    it('adds a line with Shift+Enter and sends with the button', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const onSubmit = vi.fn();
      render(<TestChat onSend={onSend} composer={<Chat.Composer onSubmit={onSubmit} />} />);
      await user.type(field(), 'one{Shift>}{Enter}{/Shift}two');
      expect(onSend).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Send message' }));
      expect(onSend).toHaveBeenCalledWith('one\ntwo');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('does not send while an IME composition is open', () => {
      const onSend = vi.fn();
      render(<TestChat onSend={onSend} composer={<Chat.Composer defaultValue="にほん" />} />);
      fireEvent.keyDown(field(), { key: 'Enter', isComposing: true });
      fireEvent.keyDown(field(), { key: 'Enter', keyCode: 229 });
      expect(onSend).not.toHaveBeenCalled();
    });

    it('keeps the draft when there is no onSend', async () => {
      const user = userEvent.setup();
      render(<TestChat />);
      await user.type(field(), 'kept{Enter}');
      expect(field()).toHaveValue('kept');
    });

    it('supports a controlled draft', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const onValueChange = vi.fn();
      const Controlled = () => {
        const [draft, setDraft] = useState('start');
        return (
          <TestChat
            onSend={onSend}
            composer={
              <Chat.Composer
                value={draft}
                onValueChange={value => {
                  onValueChange(value);
                  setDraft(value);
                }}
              />
            }
          />
        );
      };
      render(<Controlled />);
      expect(field()).toHaveValue('start');
      await user.type(field(), '!{Enter}');
      expect(onSend).toHaveBeenCalledWith('start!');
      expect(onValueChange).toHaveBeenLastCalledWith('');
    });

    it('passes placeholder, maxLength and extra controls', () => {
      render(
        <TestChat
          composer={<Chat.Composer placeholder="Mesaj yaz" maxLength={10} startContent={<button type="button">Attach</button>} endContent={<button type="button">Emoji</button>} />}
        />,
      );
      expect(screen.getByRole('textbox', { name: 'Mesaj yaz' })).toHaveAttribute('maxLength', '10');
      const controls = document.querySelector('.tk-chat-composer-controls') as HTMLElement;
      expect(
        within(controls)
          .getAllByRole('button')
          .map(button => button.textContent || button.getAttribute('aria-label')),
      ).toEqual(['Attach', 'Emoji', 'Send message']);
    });

    it('disables the composer and hides it when read-only', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const { rerender } = render(<TestChat onSend={onSend} disabled composer={<Chat.Composer defaultValue="hi" />} />);
      expect(field()).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
      fireEvent.submit(document.querySelector('form') as HTMLFormElement);
      expect(onSend).not.toHaveBeenCalled();
      rerender(<TestChat onSend={onSend} readOnly />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      await user.keyboard('{Enter}');
      expect(onSend).not.toHaveBeenCalled();
    });

    it('pins the log to the bottom when the user sends', async () => {
      const user = userEvent.setup();
      const Sending = () => {
        const [messages, setMessages] = useState([msg('1', { text: 'first' })]);
        return <TestChat messages={messages} onSend={text => setMessages(list => [...list, msg(String(list.length + 1), { text })])} />;
      };
      render(<Sending />);
      const viewport = log();
      Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: 900 });
      Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 300 });
      viewport.scrollTop = 100;
      fireEvent.scroll(viewport);
      await user.type(field(), 'second{Enter}');
      expect(viewport.scrollTop).toBe(900);
      expect(screen.queryByRole('button', { name: /new/ })).not.toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('edits an own message from its menu and saves the new text', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const original = msg('1', { text: 'Helo' });
      render(<TestChat messages={[original]} onEdit={onEdit} composer={<Chat.Composer defaultValue="my draft" />} />);
      await openActions(user, 'Helo');
      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
      expect(field()).toHaveValue('Helo');
      expect(document.querySelector('.tk-chat-composer-editing')).toHaveTextContent('Editing message');
      expect(field()).toHaveAccessibleName('Editing message');
      expect(document.querySelector('.tk-chat-composer')).toHaveAttribute('data-editing', '');
      expect(row('Helo')).toHaveAttribute('data-editing', '');
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled();
      await vi.waitFor(() => expect(field()).toHaveFocus());

      await user.clear(field());
      await user.type(field(), 'Hello{Enter}');
      expect(onEdit).toHaveBeenCalledExactlyOnceWith(original, 'Hello');
      expect(field()).toHaveValue('my draft');
      expect(document.querySelector('.tk-chat-composer-editing')).not.toBeInTheDocument();
    });

    it('does not report an edit that changed nothing', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<TestChat messages={[msg('1', { text: 'Same' })]} onEdit={onEdit} />);
      await user.click(field());
      await user.keyboard('{ArrowUp}');
      expect(field()).toHaveValue('Same');
      await user.keyboard('{Enter}');
      expect(onEdit).not.toHaveBeenCalled();
      expect(field()).toHaveValue('');
    });

    it('edits the last editable message with ArrowUp in an empty field', async () => {
      const user = userEvent.setup();
      render(
        <TestChat
          onEdit={vi.fn()}
          messages={[msg('1', { text: 'older' }), msg('2', { text: 'newest' }), msg('3', { text: 'pending', status: 'sending' }), msg('4', { senderId: 'ayse', text: 'theirs' })]}
        />,
      );
      await user.click(field());
      await user.keyboard('{ArrowUp}');
      expect(field()).toHaveValue('newest');
      // Already editing: ArrowUp moves the caret as usual.
      await user.keyboard('{ArrowUp}');
      expect(field()).toHaveValue('newest');
    });

    it('ignores ArrowUp with a draft or nothing to edit', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<TestChat onEdit={vi.fn()} messages={[msg('1', { text: 'mine' })]} composer={<Chat.Composer defaultValue="x" />} />);
      await user.click(field());
      await user.keyboard('{ArrowUp}');
      expect(field()).toHaveValue('x');
      rerender(<TestChat messages={[msg('1', { text: 'mine' })]} composer={<Chat.Composer key="b" />} />);
      await user.click(field());
      await user.keyboard('{ArrowUp}');
      expect(field()).toHaveValue('');
    });

    it('cancels editing with Escape or the cancel button and restores the draft', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      render(
        <div onKeyDown={onKeyDown}>
          <TestChat onEdit={vi.fn()} messages={[msg('1', { text: 'mine' })]} />
        </div>,
      );
      await user.type(field(), 'draft');
      await user.clear(field());
      await user.keyboard('{ArrowUp}');
      expect(field()).toHaveValue('mine');
      await user.keyboard('{Escape}');
      expect(field()).toHaveValue('');
      // Escape stayed inside the chat, so a surrounding Drawer stays open.
      expect(onKeyDown).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
      await user.keyboard('{ArrowUp}');
      await user.click(screen.getByRole('button', { name: 'Cancel editing' }));
      expect(field()).toHaveValue('');
      expect(field()).toHaveFocus();
      // Escape outside editing is left alone.
      await user.keyboard('{Escape}');
      expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
    });

    it('offers edit only on own, delivered, live messages', () => {
      render(
        <TestChat
          onEdit={vi.fn()}
          messages={[
            msg('1', { text: 'theirs', senderId: 'ayse' }),
            msg('2', { text: 'sending', status: 'sending' }),
            msg('3', { text: 'failed', status: 'failed' }),
            msg('4', { text: 'deleted', deleted: true }),
          ]}
        />,
      );
      expect(screen.queryByRole('button', { name: 'Message actions' })).not.toBeInTheDocument();
    });

    it('closes the edit window on time and ends an edit in progress', () => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);
      render(<TestChat onEdit={vi.fn()} editWindow={5 * MINUTE} messages={[msg('1', { text: 'recent', createdAt: at(4) }), msg('2', { text: 'old', createdAt: at(6) })]} />);
      expect(within(row('recent')).getByRole('button', { name: 'Message actions' })).toBeInTheDocument();
      expect(within(row('old')).queryByRole('button', { name: 'Message actions' })).not.toBeInTheDocument();
      fireEvent.keyDown(field(), { key: 'ArrowUp' });
      expect(field()).toHaveValue('recent');
      act(() => vi.advanceTimersByTime(MINUTE + 10));
      expect(within(row('recent')).queryByRole('button', { name: 'Message actions' })).not.toBeInTheDocument();
      expect(field()).toHaveValue('');
      expect(document.querySelector('.tk-chat-composer-editing')).not.toBeInTheDocument();
    });

    it('starts no edit from outside when the message cannot be edited', async () => {
      const user = userEvent.setup();
      render(
        <TestChat onEdit={vi.fn()} disabled messages={[msg('1', { text: 'mine' })]}>
          <Chat.Messages>{message => <Chat.Message message={message} />}</Chat.Messages>
        </TestChat>,
      );
      await user.keyboard('{ArrowUp}');
      expect(screen.queryByRole('button', { name: 'Message actions' })).not.toBeInTheDocument();
    });
  });

  describe('deleting', () => {
    it('deletes an own message from its menu at once without an undo window', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const mine = msg('1', { text: 'remove me' });
      render(<TestChat messages={[mine]} onDelete={onDelete} undoWindow={0} />);
      await openActions(user, 'remove me');
      expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
      expect(onDelete).toHaveBeenCalledExactlyOnceWith(mine);
      await vi.waitFor(() => expect(field()).toHaveFocus());
    });

    it('ends the edit of a message that is deleted', async () => {
      const user = userEvent.setup();
      const mine = msg('1', { text: 'both' });
      const onDelete = vi.fn();
      render(<TestChat messages={[mine]} onDelete={onDelete} onEdit={vi.fn()} undoWindow={0} />);
      await openActions(user, 'both');
      await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
      expect(field()).toHaveValue('both');
      await openActions(user, 'both');
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
      expect(onDelete).toHaveBeenCalledWith(mine);
      expect(field()).toHaveValue('');
    });

    it('holds a delete for the undo window, then calls onDelete', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const mine = msg('1', { text: 'second thoughts' });
      render(<TestChat messages={[mine]} onDelete={onDelete} undoWindow={80} />);
      await openActions(user, 'second thoughts');
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

      const pendingRow = row('This message was deleted');
      expect(pendingRow).toHaveAttribute('data-deleted');
      expect(pendingRow).toHaveAttribute('data-deleting');
      expect(within(pendingRow).queryByRole('button', { name: 'Message actions' })).not.toBeInTheDocument();
      expect(onDelete).not.toHaveBeenCalled();
      const undo = within(pendingRow).getByRole('button', { name: 'Undo' });
      expect(undo).toHaveClass('tk-chat-message-undo');
      await vi.waitFor(() => expect(undo).toHaveFocus());

      await vi.waitFor(() => expect(onDelete).toHaveBeenCalledExactlyOnceWith(mine));
      expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
      expect(field()).toHaveFocus();
    });

    it('restores a message with Undo and never calls onDelete', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(<TestChat messages={[msg('1', { text: 'keep me' })]} onDelete={onDelete} undoWindow={80} />);
      await openActions(user, 'keep me');
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
      await user.click(screen.getByRole('button', { name: 'Undo' }));

      expect(row('keep me')).not.toHaveAttribute('data-deleting');
      expect(within(row('keep me')).getByRole('button', { name: 'Message actions' })).toBeInTheDocument();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(field()).toHaveFocus();
      await new Promise(resolve => setTimeout(resolve, 120));
      expect(onDelete).not.toHaveBeenCalled();
    });

    it('calls onDelete for a pending delete when the chat unmounts', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const mine = msg('1', { text: 'closing' });
      const { unmount } = render(<TestChat messages={[mine]} onDelete={onDelete} undoWindow={60_000} />);
      await openActions(user, 'closing');
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
      expect(onDelete).not.toHaveBeenCalled();
      unmount();
      expect(onDelete).toHaveBeenCalledExactlyOnceWith(mine);
    });

    it('uses the latest onDelete when the window ends', async () => {
      const user = userEvent.setup();
      const first = vi.fn();
      const second = vi.fn();
      const mine = msg('1', { text: 'swap' });
      const { rerender } = render(<TestChat messages={[mine]} onDelete={first} undoWindow={80} />);
      await openActions(user, 'swap');
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
      rerender(<TestChat messages={[mine]} onDelete={second} undoWindow={80} />);
      // Focus left the Undo button: the commit leaves it where it is.
      act(() => log().focus());
      await vi.waitFor(() => expect(second).toHaveBeenCalledWith(mine));
      expect(first).not.toHaveBeenCalled();
    });

    it('closes the delete window on time', () => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);
      render(<TestChat onDelete={vi.fn()} deleteWindow={2 * MINUTE} messages={[msg('1', { text: 'fresh', createdAt: at(1) })]} />);
      expect(screen.getByRole('button', { name: 'Message actions' })).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(MINUTE + 10));
      expect(screen.queryByRole('button', { name: 'Message actions' })).not.toBeInTheDocument();
    });

    it('allows deleting failed messages but not ones still sending', () => {
      render(<TestChat onDelete={vi.fn()} messages={[msg('1', { text: 'failed', status: 'failed' }), msg('2', { text: 'sending', status: 'sending' })]} />);
      expect(within(row('failed')).getByRole('button', { name: 'Message actions' })).toBeInTheDocument();
      expect(within(row('sending')).queryByRole('button', { name: 'Message actions' })).not.toBeInTheDocument();
    });

    it('lists extra actions on any message', async () => {
      const user = userEvent.setup();
      const onReply = vi.fn();
      render(
        <Chat messages={[msg('1', { senderId: 'ayse', text: 'theirs' })]} currentUserId={ME} onDelete={vi.fn()}>
          <Chat.Messages>
            {message => (
              <Chat.Message message={message}>
                <Chat.MessageActions data-testid="actions">
                  <Dropdown.Item onSelect={() => onReply(message)}>Reply</Dropdown.Item>
                </Chat.MessageActions>
              </Chat.Message>
            )}
          </Chat.Messages>
        </Chat>,
      );
      expect(screen.getByTestId('actions')).toHaveClass('tk-chat-message-actions');
      await openActions(user, 'theirs');
      expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('menuitem', { name: 'Reply' }));
      expect(onReply).toHaveBeenCalled();
    });
  });

  describe('menu gestures', () => {
    const bubble = (text: string) => row(text).querySelector('.tk-chat-message-bubble') as HTMLElement;
    const touch = (type: string, element: HTMLElement, x = 10, y = 10) => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
      Object.defineProperty(event, 'pointerType', { value: 'touch' });
      act(() => {
        element.dispatchEvent(event);
      });
    };

    it('opens the actions menu on a right click', () => {
      render(<TestChat messages={[msg('1', { text: 'right click me' })]} onDelete={vi.fn()} />);
      const event = fireEvent.contextMenu(bubble('right click me'));
      expect(event).toBe(false);
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
    });

    it('keeps the browser menu over selected text and on messages without actions', () => {
      render(<TestChat messages={[msg('1', { text: 'copy me' }), msg('2', { senderId: 'ayse', text: 'theirs' })]} onDelete={vi.fn()} />);
      expect(fireEvent.contextMenu(bubble('theirs'))).toBe(true);

      const text = within(bubble('copy me')).getByText('copy me');
      const range = document.createRange();
      range.selectNodeContents(text);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      expect(fireEvent.contextMenu(bubble('copy me'))).toBe(true);
      window.getSelection()?.removeAllRanges();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('leaves a right click the consumer handled alone', () => {
      const onContextMenu = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
      render(
        <Chat messages={[msg('1', { text: 'custom' })]} currentUserId={ME} onDelete={vi.fn()}>
          <Chat.Messages>{message => <Chat.Message message={message} slotProps={{ bubble: { onContextMenu } }} />}</Chat.Messages>
        </Chat>,
      );
      fireEvent.contextMenu(bubble('custom'));
      expect(onContextMenu).toHaveBeenCalled();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('opens the actions menu on a long press, not on a scroll or a mouse press', () => {
      vi.useFakeTimers();
      render(<TestChat messages={[msg('1', { text: 'hold me' })]} onDelete={vi.fn()} />);
      const target = bubble('hold me');

      fireEvent.pointerDown(target, { pointerType: 'mouse' });
      act(() => vi.advanceTimersByTime(600));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      touch('pointerdown', target);
      touch('pointermove', target, 10, 40);
      act(() => vi.advanceTimersByTime(600));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      touch('pointerdown', target);
      touch('pointerup', target);
      act(() => vi.advanceTimersByTime(600));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      touch('pointerdown', target);
      touch('pointercancel', target);
      act(() => vi.advanceTimersByTime(600));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();

      touch('pointerdown', target);
      touch('pointermove', target, 12, 12);
      act(() => vi.advanceTimersByTime(500));
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
    });
  });

  describe('read tracking', () => {
    it('reports incoming unread messages once when no IntersectionObserver exists', async () => {
      vi.stubGlobal('IntersectionObserver', undefined);
      const onRead = vi.fn();
      const messages = [
        msg('1', { senderId: 'ayse', text: 'unread a', status: 'delivered' }),
        msg('2', { senderId: 'ayse', text: 'unread b', status: undefined }),
        msg('3', { senderId: 'ayse', text: 'already read', status: 'read' }),
        msg('4', { senderId: 'ayse', text: 'deleted', deleted: true }),
        msg('5', { text: 'mine' }),
      ];
      const { rerender } = render(<TestChat messages={messages} onRead={onRead} />);
      await vi.waitFor(() => expect(onRead).toHaveBeenCalledTimes(1));
      expect(onRead.mock.calls[0][0].map((message: ChatMessage) => message.id)).toEqual(['1', '2']);
      rerender(<TestChat messages={[...messages]} onRead={onRead} />);
      await Promise.resolve();
      expect(onRead).toHaveBeenCalledTimes(1);
    });

    it('does nothing without onRead', async () => {
      vi.stubGlobal('IntersectionObserver', undefined);
      render(<TestChat messages={[msg('1', { senderId: 'ayse', status: 'delivered' })]} />);
      await Promise.resolve();
      expect(row('text 1')).toBeInTheDocument();
    });

    it('reports messages as they scroll into view, and waits for a visible page', async () => {
      const instances: { callback: IntersectionObserverCallback; observed: Element[]; disconnect: () => void }[] = [];
      class FakeObserver {
        observed: Element[] = [];
        constructor(public callback: IntersectionObserverCallback) {
          instances.push(this);
        }
        observe(element: Element) {
          this.observed.push(element);
        }
        unobserve(element: Element) {
          this.observed = this.observed.filter(item => item !== element);
        }
        disconnect = vi.fn();
      }
      vi.stubGlobal('IntersectionObserver', FakeObserver);
      const onRead = vi.fn();
      const messages = [msg('1', { senderId: 'ayse', text: 'one', status: 'delivered' }), msg('2', { senderId: 'ayse', text: 'two', status: 'delivered' })];
      const { unmount } = render(<TestChat messages={messages} onRead={onRead} />);
      const observer = instances[0];
      expect(observer.observed).toHaveLength(2);
      const entry = (target: Element, isIntersecting: boolean) => ({ target, isIntersecting }) as IntersectionObserverEntry;

      act(() => observer.callback([entry(row('one'), true), entry(document.body, true)], observer as unknown as IntersectionObserver));
      await vi.waitFor(() => expect(onRead).toHaveBeenCalledWith([messages[0]]));

      const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
      act(() => observer.callback([entry(row('two'), true)], observer as unknown as IntersectionObserver));
      await Promise.resolve();
      expect(onRead).toHaveBeenCalledTimes(1);
      visibility.mockReturnValue('visible');
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(onRead).toHaveBeenLastCalledWith([messages[1]]);

      // A message that leaves the view before the page is visible is not reported.
      visibility.mockReturnValue('hidden');
      act(() => observer.callback([entry(row('one'), true), entry(row('one'), false)], observer as unknown as IntersectionObserver));
      visibility.mockReturnValue('visible');
      act(() => {
        document.dispatchEvent(new Event('visibilitychange'));
      });
      expect(onRead).toHaveBeenCalledTimes(2);
      visibility.mockRestore();
      unmount();
      expect(observer.disconnect).toHaveBeenCalled();
    });
  });

  describe('scrolling', () => {
    const sizeLog = (viewport: HTMLElement, scrollHeight: number) => {
      Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: scrollHeight });
      Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 300 });
    };

    it('follows new messages at the bottom and offers a jump button otherwise', async () => {
      const user = userEvent.setup();
      const first = [msg('1', { senderId: 'ayse', text: 'a' })];
      const { rerender } = render(<TestChat messages={first} />);
      const viewport = log();
      expect(viewport).toHaveAttribute('tabindex', '0');
      sizeLog(viewport, 1000);
      rerender(<TestChat messages={[...first, msg('2', { senderId: 'ayse', text: 'b' })]} />);
      expect(viewport.scrollTop).toBe(1000);

      viewport.scrollTop = 200;
      fireEvent.scroll(viewport);
      rerender(<TestChat messages={[...first, msg('2', { senderId: 'ayse', text: 'b' }), msg('3', { senderId: 'ayse', text: 'c' }), msg('4', { text: 'mine' })]} />);
      expect(viewport.scrollTop).toBe(200);
      const jump = screen.getByRole('button', { name: /^1 new ?Jump to latest message$/ });
      expect(jump).toHaveClass('tk-chat-jump');
      await user.click(jump);
      expect(viewport.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
      expect(screen.queryByRole('button', { name: /Jump/ })).not.toBeInTheDocument();
    });

    it('starts a replaced conversation at the bottom', () => {
      const { rerender } = render(<TestChat messages={[msg('1', { senderId: 'ayse' })]} />);
      const viewport = log();
      sizeLog(viewport, 1000);
      viewport.scrollTop = 100;
      fireEvent.scroll(viewport);
      rerender(<TestChat messages={[msg('a', { senderId: 'ayse' }), msg('b', { senderId: 'ayse' })]} />);
      expect(viewport.scrollTop).toBe(1000);
      expect(screen.queryByRole('button', { name: /Jump/ })).not.toBeInTheDocument();
    });

    it('jumps without animation when reduced motion is preferred, and hides the button at the bottom', async () => {
      const user = userEvent.setup();
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
      const { rerender } = render(<TestChat messages={[msg('1')]} />);
      const viewport = log();
      sizeLog(viewport, 1000);
      viewport.scrollTop = 100;
      fireEvent.scroll(viewport);
      rerender(<TestChat messages={[msg('1'), msg('2', { senderId: 'ayse' })]} />);
      viewport.scrollTop = 700;
      fireEvent.scroll(viewport);
      expect(screen.queryByRole('button', { name: /Jump/ })).not.toBeInTheDocument();
      viewport.scrollTop = 100;
      fireEvent.scroll(viewport);
      rerender(<TestChat messages={[msg('1'), msg('2', { senderId: 'ayse' }), msg('3', { senderId: 'ayse' })]} />);
      await user.click(screen.getByRole('button', { name: /Jump/ }));
      expect(viewport.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'auto' });
    });

    it('loads older messages from the button or the top, keeping the reader in place', async () => {
      const user = userEvent.setup();
      const onLoadOlder = vi.fn();
      const recent = [msg('5', { text: 'recent' })];
      const { rerender } = render(<TestChat messages={recent} hasOlder onLoadOlder={onLoadOlder} />);
      await user.click(screen.getByRole('button', { name: 'Load older messages' }));
      expect(onLoadOlder).toHaveBeenCalledTimes(1);

      const viewport = log();
      sizeLog(viewport, 1000);
      viewport.scrollTop = 500;
      fireEvent.scroll(viewport);
      viewport.scrollTop = 10;
      fireEvent.scroll(viewport);
      expect(onLoadOlder).toHaveBeenCalledTimes(2);
      // Staying near the top does not ask again.
      fireEvent.scroll(viewport);
      expect(onLoadOlder).toHaveBeenCalledTimes(2);

      rerender(<TestChat messages={recent} hasOlder isLoadingOlder onLoadOlder={onLoadOlder} />);
      expect(viewport).toHaveAttribute('aria-busy', 'true');
      viewport.scrollTop = 500;
      fireEvent.scroll(viewport);
      viewport.scrollTop = 10;
      fireEvent.scroll(viewport);
      expect(onLoadOlder).toHaveBeenCalledTimes(2);

      sizeLog(viewport, 1600);
      rerender(<TestChat messages={[msg('4', { text: 'older' }), ...recent]} hasOlder={false} onLoadOlder={onLoadOlder} />);
      expect(viewport.scrollTop).toBe(610);
      expect(viewport).not.toHaveAttribute('aria-busy');
    });

    it('stays pinned when the content resizes', () => {
      const callbacks: ResizeObserverCallback[] = [];
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(callback: ResizeObserverCallback) {
            callbacks.push(callback);
          }
          observe() {}
          disconnect() {}
        },
      );
      render(<TestChat messages={[msg('1')]} />);
      const viewport = log();
      sizeLog(viewport, 1200);
      act(() => callbacks[0]([], {} as ResizeObserver));
      expect(viewport.scrollTop).toBe(1200);
      viewport.scrollTop = 0;
      fireEvent.scroll(viewport);
      sizeLog(viewport, 1500);
      act(() => callbacks[0]([], {} as ResizeObserver));
      expect(viewport.scrollTop).toBe(0);
    });
  });

  describe('conversations', () => {
    const conversations: ChatConversation[] = [
      { id: 'ayse', title: 'Ayşe Yılmaz', preview: 'See you', updatedAt: at(5), unreadCount: 3 },
      { id: 'ops', title: 'Ops team', avatar: 'https://example.com/ops.png', updatedAt: new Date(2026, 1, 1, 9), unreadCount: 120 },
      { id: 'mehmet', title: 'Mehmet' },
    ];

    const Split = (props: Partial<ChatProps>) => (
      <Chat messages={[]} currentUserId={ME} locale="en-US" {...props}>
        <Chat.ConversationList>
          {conversations.map(conversation => (
            <Chat.Conversation key={conversation.id} conversation={conversation} />
          ))}
        </Chat.ConversationList>
        <Chat.Thread>
          <Chat.Header>
            <Chat.Title>Thread</Chat.Title>
          </Chat.Header>
          <Chat.Messages />
          <Chat.Composer />
        </Chat.Thread>
      </Chat>
    );

    it('lists conversations and opens one (uncontrolled)', async () => {
      const user = userEvent.setup();
      const onConversationChange = vi.fn();
      const { container } = render(<Split onConversationChange={onConversationChange} />);
      const root = container.querySelector('.tk-chat');
      expect(root).toHaveAttribute('data-layout', 'split');
      expect(root).toHaveAttribute('data-view', 'list');
      const nav = screen.getByRole('navigation', { name: 'Conversations' });
      expect(nav).toHaveClass('tk-chat-conversation-list');
      expect(container.querySelector('.tk-chat-thread')).toBeInTheDocument();

      const ayseButton = within(nav).getByRole('button', { name: /Ayşe Yılmaz/ });
      expect(ayseButton).toHaveAttribute('type', 'button');
      expect(ayseButton).toHaveAttribute('data-unread', '');
      expect(ayseButton).toHaveTextContent('3 unread messages');
      expect(ayseButton.querySelector('.tk-chat-conversation-preview')).toHaveTextContent('See you');
      expect(ayseButton.querySelector('.tk-chat-conversation-time')).toHaveTextContent('11:55');
      const ops = within(nav).getByRole('button', { name: /Ops team/ });
      expect(ops.querySelector('.tk-chat-conversation-time')).toHaveTextContent('February 1');
      expect(ops.querySelector('.tk-chat-conversation-unread [aria-hidden]')).toHaveTextContent('99+');
      expect(ops.querySelector('.tk-chat-conversation-avatar img')).toHaveAttribute('src', 'https://example.com/ops.png');
      const plain = within(nav).getByRole('button', { name: /Mehmet/ });
      expect(plain.querySelector('.tk-chat-conversation-time')).not.toBeInTheDocument();
      expect(plain).not.toHaveAttribute('data-unread');

      await user.click(ayseButton);
      expect(onConversationChange).toHaveBeenCalledWith('ayse');
      expect(ayseButton).toHaveAttribute('aria-current', 'true');
      expect(ayseButton).toHaveAttribute('data-selected', '');
      expect(root).toHaveAttribute('data-view', 'thread');

      await user.click(screen.getByRole('button', { name: 'Back to conversations' }));
      expect(onConversationChange).toHaveBeenLastCalledWith(null);
      expect(root).toHaveAttribute('data-view', 'list');
    });

    it('follows a controlled conversation id', async () => {
      const user = userEvent.setup();
      const onConversationChange = vi.fn();
      const { rerender } = render(<Split conversationId="ops" onConversationChange={onConversationChange} />);
      expect(screen.getByRole('button', { name: /Ops team/ })).toHaveAttribute('aria-current', 'true');
      await user.click(screen.getByRole('button', { name: /Mehmet/ }));
      expect(onConversationChange).toHaveBeenCalledWith('mehmet');
      expect(screen.getByRole('button', { name: /Mehmet/ })).not.toHaveAttribute('aria-current');
      rerender(<Split conversationId="mehmet" onConversationChange={onConversationChange} />);
      expect(screen.getByRole('button', { name: /Mehmet/ })).toHaveAttribute('aria-current', 'true');
    });

    it('starts from a default conversation and respects a prevented click', async () => {
      const user = userEvent.setup();
      render(
        <Chat messages={[]} currentUserId={ME} defaultConversationId="mehmet">
          <Chat.ConversationList aria-label="Chats" as="div">
            <Chat.Conversation conversation={conversations[0]} onClick={event => event.preventDefault()} />
            <Chat.Conversation conversation={conversations[2]} as="div" role="button" tabIndex={0} />
          </Chat.ConversationList>
        </Chat>,
      );
      const ayseButton = screen.getByRole('button', { name: /Ayşe/ });
      await user.click(ayseButton);
      expect(ayseButton).not.toHaveAttribute('aria-current');
      const mehmetItem = screen.getByRole('button', { name: /Mehmet/ });
      expect(mehmetItem).toHaveAttribute('aria-current', 'true');
      expect(mehmetItem).not.toHaveAttribute('type');
      expect(document.querySelector('.tk-chat-conversation-list')).toHaveAttribute('aria-label', 'Chats');
    });

    it('leaves the split layout when the list unmounts', () => {
      const { container, rerender } = render(<Split />);
      expect(container.querySelector('.tk-chat')).toHaveAttribute('data-layout', 'split');
      rerender(
        <Chat messages={[]} currentUserId={ME}>
          <Chat.Header />
        </Chat>,
      );
      expect(container.querySelector('.tk-chat')).toHaveAttribute('data-layout', 'single');
      expect(screen.queryByRole('button', { name: 'Back to conversations' })).not.toBeInTheDocument();
    });
  });

  describe('customization', () => {
    it('merges labels from the provider and the instance', () => {
      render(
        <TakeoffSparProvider components={{ Chat: { defaultProps: { labels: { placeholder: 'Mesaj yazın…', send: 'Gönder' } } } }}>
          <Chat messages={[msg('1', { text: 'x', editedAt: at(0) })]} currentUserId={ME} labels={{ send: 'Yolla', edited: 'Düzenlendi', placeholder: '' }}>
            <Chat.Messages />
            <Chat.Composer />
          </Chat>
        </TakeoffSparProvider>,
      );
      expect(screen.getByRole('textbox', { name: 'Mesaj yazın…' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Yolla' })).toBeInTheDocument();
      expect(screen.getByText('Düzenlendi')).toBeInTheDocument();
    });

    it('lands classNames and slotProps on the slot owners', () => {
      render(
        <Chat messages={[msg('1', { text: 'styled', editedAt: at(0) })]} currentUserId={ME} typing={['ayse']} hasOlder classNames={{ root: 'my-chat' }} participants={[ayse]}>
          <Chat.Header classNames={{ root: 'my-header' }} />
          <Chat.Messages
            classNames={{ viewport: 'my-viewport', divider: 'my-divider', typing: 'my-typing', loadOlder: 'my-older' }}
            slotProps={{ viewport: { 'data-testid': 'viewport' } as object }}
          >
            {message => <Chat.Message message={message} classNames={{ bubble: 'my-bubble', time: 'my-time' }} slotProps={{ text: { 'data-testid': 'text' } as object }} />}
          </Chat.Messages>
          <Chat.Composer classNames={{ controls: 'my-controls', send: 'my-send' }} />
        </Chat>,
      );
      expect(document.querySelector('.tk-chat')).toHaveClass('my-chat');
      expect(document.querySelector('.tk-chat-header')).toHaveClass('my-header');
      expect(screen.getByTestId('viewport')).toHaveClass('tk-chat-messages-viewport', 'my-viewport');
      expect(document.querySelector('.tk-chat-divider')).toHaveClass('my-divider');
      expect(document.querySelector('.tk-chat-typing')).toHaveClass('my-typing');
      expect(document.querySelector('.tk-chat-load-older')).toHaveClass('my-older');
      expect(document.querySelector('.tk-chat-message-bubble')).toHaveClass('my-bubble');
      expect(document.querySelector('.tk-chat-message-time')).toHaveClass('my-time');
      expect(screen.getByTestId('text')).toHaveTextContent('styled');
      expect(document.querySelector('.tk-chat-composer-controls')).toHaveClass('my-controls');
      expect(document.querySelector('.tk-chat-composer-send')).toHaveClass('my-send');
    });
  });

  describe('helpers', () => {
    it('formats days, initials and name lists', () => {
      const labels = { today: 'Today', yesterday: 'Yesterday' };
      expect(formatDay(NOW, NOW, 'en-US', labels)).toBe('Today');
      expect(initials('  ayşe   nur yılmaz ')).toBe('AN');
      expect(listNames(['A', 'B', 'C'], 'en')).toBe('A, B, and C');
      vi.stubGlobal('Intl', { ...Intl, ListFormat: undefined });
      expect(listNames(['A', 'B'], 'en')).toBe('A, B');
    });

    it('finds the next closing window', () => {
      const messages = [msg('1', { createdAt: at(1) }), msg('2', { createdAt: at(3) })];
      expect(nextWindowClose(messages, [undefined, 2 * MINUTE], NOW)).toBe(NOW + MINUTE);
      expect(nextWindowClose(messages, [undefined], NOW)).toBeUndefined();
      expect(nextWindowClose(messages, [MINUTE / 2], NOW)).toBeUndefined();
    });

    it('recognises IME keydowns', () => {
      expect(isComposing({ nativeEvent: { isComposing: false }, keyCode: 13 } as never)).toBe(false);
    });
  });

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <TestChat
          participants={[ayse, mehmet]}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          typing={['ayse']}
          messages={[msg('1', { senderId: 'ayse', text: 'Hi' }), msg('2', { text: 'Hello', status: 'read', editedAt: at(0) })]}
        />,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
