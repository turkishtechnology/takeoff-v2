import userEvent from '@testing-library/user-event';
import { createRef, useState, type HTMLAttributes, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { Chip, type ChipAppearance, type ChipProps, type ChipSize, type ChipVariant } from './index';

const chipRoot = (container: HTMLElement) => container.querySelector('.tk-chip') as HTMLElement | null;

const asAttrs = (attrs: Record<string, unknown>) => attrs as HTMLAttributes<HTMLElement>;

const ParentOwnedFilters = () => {
  const [tags, setTags] = useState(['Cabin bag', 'Window seat', 'Meal']);

  return (
    <div>
      {tags.map(tag => (
        <Chip autoDismiss={false} key={tag} onRemove={() => setTags(prev => prev.filter(t => t !== tag))} removable slotProps={{ remove: { 'aria-label': `Remove ${tag}` } }}>
          {tag}
        </Chip>
      ))}
    </div>
  );
};

describe('Chip', () => {
  describe('rendering', () => {
    it('renders a static span root with the canonical slot contract and default data attributes', () => {
      const { container } = render(<Chip>Economy</Chip>);

      const root = chipRoot(container) as HTMLElement;
      expect(root.tagName).toBe('SPAN');
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-variant', 'primary');
      expect(root).toHaveAttribute('data-type', 'filled');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(root).not.toHaveAttribute('data-clickable');
      expect(root).not.toHaveAttribute('data-disabled');
      expect(root).not.toHaveAttribute('data-removable');

      // A static chip is not an interactive widget.
      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('tabindex');
      expect(root).not.toHaveAttribute('aria-disabled');
      expect(container.querySelector('.tk-chip-remove')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders children inside the label slot', () => {
      const { container } = render(<Chip>Business class</Chip>);

      const label = screen.getByText('Business class');
      expect(label.tagName).toBe('SPAN');
      expect(label).toHaveClass('tk-chip-label');
      expect(label).toHaveAttribute('data-slot', 'label');
      expect(label.parentElement).toBe(chipRoot(container));
    });

    it.each<[string, ReactNode]>([
      ['undefined', undefined],
      ['false', false],
      ['null', null],
      ['an empty string', ''],
    ])('skips the label slot when children is %s', (_, children) => {
      const { container } = render(<Chip removable>{children}</Chip>);

      expect(chipRoot(container)).toBeInTheDocument();
      expect(container.querySelector('.tk-chip-label')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    });

    it('keeps the label slot for a renderable falsy child such as 0', () => {
      const { container } = render(<Chip>{0}</Chip>);

      expect(container.querySelector('.tk-chip-label')).toHaveTextContent('0');
    });

    it.each<ChipVariant>(['primary', 'secondary', 'neutral', 'info', 'success', 'danger', 'warning', 'verified', 'purple', 'cyan', 'business', 'teal', 'white', 'dark'])(
      'reflects variant="%s" into data-variant',
      variant => {
        const { container } = render(<Chip variant={variant}>Chip</Chip>);

        expect(chipRoot(container)).toHaveAttribute('data-variant', variant);
      },
    );

    it.each<ChipAppearance>(['filled', 'filledLight', 'outlined'])('reflects appearance="%s" into data-type', appearance => {
      const { container } = render(<Chip appearance={appearance}>Chip</Chip>);

      expect(chipRoot(container)).toHaveAttribute('data-type', appearance);
    });

    it.each<ChipSize>(['small', 'base', 'large'])('reflects size="%s" into data-size', size => {
      const { container } = render(<Chip size={size}>Chip</Chip>);

      expect(chipRoot(container)).toHaveAttribute('data-size', size);
    });

    it('emits presence data attributes for clickable, disabled and removable', () => {
      const { container } = render(
        <Chip clickable disabled removable>
          Chip
        </Chip>,
      );

      const root = chipRoot(container) as HTMLElement;
      expect(root).toHaveAttribute('data-clickable', '');
      expect(root).toHaveAttribute('data-disabled', '');
      expect(root).toHaveAttribute('data-removable', '');
    });

    it('does not leak its own props onto the root element', () => {
      const { container } = render(
        <Chip appearance="outlined" autoDismiss={false} clickable disabled onRemove={() => {}} removable size="small" variant="danger">
          Chip
        </Chip>,
      );

      const root = chipRoot(container) as HTMLElement;
      for (const attribute of ['variant', 'appearance', 'size', 'clickable', 'removable', 'disabled', 'autoDismiss', 'onRemove']) {
        expect(root).not.toHaveAttribute(attribute);
      }
    });

    it('forwards the ref and native attributes to the root span', () => {
      const ref = createRef<HTMLSpanElement>();
      const { container } = render(
        <Chip id="fare-chip" lang="tr" ref={ref} title="Fare family">
          Ekonomi
        </Chip>,
      );

      const root = chipRoot(container);
      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current).toBe(root);
      expect(root).toHaveAttribute('id', 'fare-chip');
      expect(root).toHaveAttribute('lang', 'tr');
      expect(root).toHaveAttribute('title', 'Fare family');
    });
  });

  describe('removable', () => {
    it('renders a labelled, non-submitting remove button with a decorative icon after the label', () => {
      const { container } = render(<Chip removable>Cabin bag</Chip>);

      const root = chipRoot(container) as HTMLElement;
      expect(root).toHaveAttribute('data-removable', '');

      const removeButton = screen.getByRole('button', { name: 'Remove' });
      expect(removeButton).toHaveAttribute('type', 'button');
      expect(removeButton).toHaveClass('tk-chip-remove');
      expect(removeButton).toHaveAttribute('data-slot', 'remove');
      expect(removeButton).toBeEnabled();
      expect(removeButton.parentElement).toBe(root);
      expect(root.firstElementChild).toHaveClass('tk-chip-label');
      expect(root.lastElementChild).toBe(removeButton);
      expect(removeButton.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('dismisses itself and calls onRemove once without arguments when the remove button is pressed', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const { container } = render(
        <Chip onRemove={onRemove} removable>
          Cabin bag
        </Chip>,
      );

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onRemove).toHaveBeenCalledWith();
      expect(chipRoot(container)).not.toBeInTheDocument();
      expect(screen.queryByText('Cabin bag')).not.toBeInTheDocument();
    });

    it('stays dismissed when the parent re-renders it', async () => {
      const user = userEvent.setup();
      const { container, rerender } = render(<Chip removable>Cabin bag</Chip>);

      await user.click(screen.getByRole('button', { name: 'Remove' }));
      expect(chipRoot(container)).not.toBeInTheDocument();

      rerender(
        <Chip removable variant="success">
          Cabin bag
        </Chip>,
      );
      expect(chipRoot(container)).not.toBeInTheDocument();
    });

    it('keeps the chip mounted and reports every remove request when autoDismiss is false', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(
        <Chip autoDismiss={false} onRemove={onRemove} removable>
          Cabin bag
        </Chip>,
      );

      const removeButton = screen.getByRole('button', { name: 'Remove' });
      await user.click(removeButton);
      await user.click(removeButton);

      expect(onRemove).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Cabin bag')).toBeInTheDocument();
    });

    it('lets a parent-owned list drive removal through onRemove', async () => {
      const user = userEvent.setup();
      const { container } = render(<ParentOwnedFilters />);

      await user.click(screen.getByRole('button', { name: 'Remove Window seat' }));

      expect(Array.from(container.querySelectorAll('.tk-chip-label'), label => label.textContent)).toEqual(['Cabin bag', 'Meal']);

      await user.click(screen.getByRole('button', { name: 'Remove Cabin bag' }));

      expect(Array.from(container.querySelectorAll('.tk-chip-label'), label => label.textContent)).toEqual(['Meal']);
    });

    it('keeps the root non-interactive and exposes the remove button as the tab stop', async () => {
      const user = userEvent.setup();
      const { container } = render(<Chip removable>Cabin bag</Chip>);

      const root = chipRoot(container) as HTMLElement;
      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('tabindex');

      await user.tab();
      expect(screen.getByRole('button', { name: 'Remove' })).toHaveFocus();

      await user.tab();
      expect(document.body).toHaveFocus();
    });

    it.each([
      ['Enter', '{Enter}'],
      ['Space', ' '],
    ])('removes the chip when %s is pressed on the focused remove button', async (_, key) => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(
        <Chip onRemove={onRemove} removable>
          Cabin bag
        </Chip>,
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'Remove' })).toHaveFocus();

      await user.keyboard(key);

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('Cabin bag')).not.toBeInTheDocument();
    });

    it('lets a remove click bubble to ancestor handlers', async () => {
      const user = userEvent.setup();
      const onListClick = vi.fn();
      render(
        <div onClick={onListClick}>
          <Chip autoDismiss={false} removable>
            Cabin bag
          </Chip>
        </div>,
      );

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(onListClick).toHaveBeenCalledTimes(1);
    });

    it('does not submit an enclosing form', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <form
          onSubmit={event => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <Chip autoDismiss={false} removable>
            Cabin bag
          </Chip>
        </form>,
      );

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('runs a slotProps.remove onClick with the click event before removing', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const onRemoveSlotClick = vi.fn();
      render(
        <Chip onRemove={onRemove} removable slotProps={{ remove: { onClick: onRemoveSlotClick } }}>
          Cabin bag
        </Chip>,
      );

      const removeButton = screen.getByRole('button', { name: 'Remove' });
      await user.click(removeButton);

      expect(onRemoveSlotClick).toHaveBeenCalledTimes(1);
      expect(onRemoveSlotClick.mock.calls[0][0]).toMatchObject({ type: 'click', target: removeButton });
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onRemoveSlotClick.mock.invocationCallOrder[0]).toBeLessThan(onRemove.mock.invocationCallOrder[0]);
      expect(screen.queryByText('Cabin bag')).not.toBeInTheDocument();
    });

    it('lets a slotProps.remove onClick cancel the removal with preventDefault', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const cancelRemoval = vi.fn((event: ReactMouseEvent<HTMLElement>) => event.preventDefault());
      render(
        <Chip onRemove={onRemove} removable slotProps={{ remove: { onClick: cancelRemoval } }}>
          Cabin bag
        </Chip>,
      );

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(cancelRemoval).toHaveBeenCalledTimes(1);
      expect(onRemove).not.toHaveBeenCalled();
      expect(screen.getByText('Cabin bag')).toBeInTheDocument();
    });

    it('lets slotProps.remove override the default remove label', () => {
      render(
        <Chip removable slotProps={{ remove: { 'aria-label': 'Remove Cabin bag' } }}>
          Cabin bag
        </Chip>,
      );

      expect(screen.getByRole('button', { name: 'Remove Cabin bag' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    });
  });

  describe('clickable', () => {
    it('turns the root into a focusable button-like widget', async () => {
      const user = userEvent.setup();
      const { container } = render(<Chip clickable>Economy</Chip>);

      const chip = screen.getByRole('button', { name: 'Economy' });
      expect(chip).toBe(chipRoot(container));
      expect(chip).toHaveAttribute('tabindex', '0');
      expect(chip).toHaveAttribute('data-clickable', '');
      expect(chip).not.toHaveAttribute('aria-disabled');

      await user.tab();
      expect(chip).toHaveFocus();
    });

    it('calls onClick once with the click event when the chip is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Chip clickable onClick={onClick}>
          Economy
        </Chip>,
      );

      const chip = screen.getByRole('button', { name: 'Economy' });
      await user.click(chip);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click', target: chip });
    });

    it.each([
      ['Enter', '{Enter}'],
      ['Space', ' '],
    ])('activates onClick once when %s is pressed on the focused chip', async (_, key) => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Chip clickable onClick={onClick}>
          Economy
        </Chip>,
      );

      await user.tab();
      await user.keyboard(key);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click', target: screen.getByRole('button', { name: 'Economy' }) });
    });

    it('ignores other keys, including Backspace and Delete when the chip is not removable', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRemove = vi.fn();
      render(
        <Chip clickable onClick={onClick} onRemove={onRemove}>
          Economy
        </Chip>,
      );

      await user.tab();
      await user.keyboard('a{Escape}{ArrowRight}{Backspace}{Delete}');

      expect(onClick).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Economy' })).toBeInTheDocument();
    });

    it('passes a consumer tabIndex and role through', () => {
      render(
        <>
          <Chip aria-checked={false} clickable role="switch" tabIndex={-1}>
            Window seat
          </Chip>
          <Chip tabIndex={0}>Focusable metadata</Chip>
        </>,
      );

      const toggle = screen.getByRole('switch', { name: 'Window seat' });
      expect(toggle).toHaveAttribute('tabindex', '-1');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByText('Focusable metadata').parentElement).toHaveAttribute('tabindex', '0');
    });

    it('runs the consumer and slotProps.root click and keydown handlers', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onKeyDown = vi.fn();
      const onSlotClick = vi.fn();
      const onSlotKeyDown = vi.fn();
      render(
        <Chip clickable onClick={onClick} onKeyDown={onKeyDown} slotProps={{ root: { onClick: onSlotClick, onKeyDown: onSlotKeyDown } }}>
          Economy
        </Chip>,
      );

      const chip = screen.getByRole('button', { name: 'Economy' });
      await user.click(chip);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onSlotClick).toHaveBeenCalledTimes(1);
      expect(chip).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyDown.mock.calls[0][0]).toMatchObject({ type: 'keydown', key: 'Enter' });
      expect(onSlotKeyDown).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(2);
      expect(onSlotClick).toHaveBeenCalledTimes(2);
    });

    it('lets a consumer onKeyDown cancel the built-in activation and removal keys with preventDefault', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRemove = vi.fn();
      const { container } = render(
        <Chip autoDismiss={false} clickable onClick={onClick} onKeyDown={event => event.preventDefault()} onRemove={onRemove} removable>
          Economy
        </Chip>,
      );

      await user.tab();
      expect(chipRoot(container)).toHaveFocus();

      await user.keyboard('{Enter} {Backspace}{Delete}');

      expect(onClick).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
    });

    it('keeps activation working when a slotProps.root keydown handler only prevents an unrelated key', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onSlotKeyDown = vi.fn((event: ReactKeyboardEvent<HTMLElement>) => {
        if (event.key === 'ArrowLeft') event.preventDefault();
      });
      render(
        <Chip clickable onClick={onClick} slotProps={{ root: { onKeyDown: onSlotKeyDown } }}>
          Economy
        </Chip>,
      );

      await user.tab();
      await user.keyboard('{ArrowLeft}{Enter}');

      expect(onSlotKeyDown).toHaveBeenCalledTimes(2);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('keeps a static chip out of the tab order and inert to activation keys', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <>
          <Chip>Metadata</Chip>
          <Chip onClick={onClick} tabIndex={0}>
            Focusable metadata
          </Chip>
          <button type="button">After</button>
        </>,
      );

      const focusable = screen.getByText('Focusable metadata').parentElement as HTMLElement;

      await user.tab();
      expect(focusable).toHaveFocus();

      await user.keyboard('{Enter} ');
      expect(onClick).not.toHaveBeenCalled();

      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('does not activate a clickable chip or reach ancestors when its remove button is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRemove = vi.fn();
      const onListClick = vi.fn();
      const { container } = render(
        <div onClick={onListClick}>
          <Chip clickable onClick={onClick} onRemove={onRemove} removable>
            Economy
          </Chip>
        </div>,
      );

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
      expect(onListClick).not.toHaveBeenCalled();
      expect(chipRoot(container)).not.toBeInTheDocument();
    });

    it.each([
      ['Backspace', '{Backspace}'],
      ['Delete', '{Delete}'],
    ])('requests removal with %s while a clickable removable chip is focused', async (_, key) => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRemove = vi.fn();
      const { container } = render(
        <Chip clickable onClick={onClick} onRemove={onRemove} removable>
          Economy
        </Chip>,
      );

      await user.tab();
      expect(chipRoot(container)).toHaveFocus();

      await user.keyboard(key);

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onRemove).toHaveBeenCalledWith();
      expect(onClick).not.toHaveBeenCalled();
      expect(chipRoot(container)).not.toBeInTheDocument();
    });

    it.each([
      ['Backspace', '{Backspace}'],
      ['Delete', '{Delete}'],
    ])('keeps a parent-owned clickable chip mounted and focused while reporting every %s removal request', async (_, key) => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRemove = vi.fn();
      const { container } = render(
        <Chip autoDismiss={false} clickable onClick={onClick} onRemove={onRemove} removable>
          Economy
        </Chip>,
      );

      await user.tab();
      await user.keyboard(key);
      await user.keyboard(key);

      expect(onRemove).toHaveBeenCalledTimes(2);
      expect(onRemove).toHaveBeenNthCalledWith(1);
      expect(onRemove).toHaveBeenNthCalledWith(2);
      expect(onClick).not.toHaveBeenCalled();
      expect(chipRoot(container)).toBeInTheDocument();
      expect(chipRoot(container)).toHaveFocus();
    });

    it('puts the clickable root and then its remove button in the tab sequence', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <>
          <Chip clickable removable>
            Economy
          </Chip>
          <button type="button">After</button>
        </>,
      );

      await user.tab();
      expect(chipRoot(container)).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Remove' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('prevents the default browser action only for the keys a focused clickable removable chip handles', async () => {
      const user = userEvent.setup();
      const seen: Array<[string, boolean]> = [];
      const { container } = render(
        <div onKeyDown={event => seen.push([event.key, event.defaultPrevented])}>
          <Chip autoDismiss={false} clickable removable>
            Economy
          </Chip>
        </div>,
      );

      await user.tab();
      expect(chipRoot(container)).toHaveFocus();

      await user.keyboard('{Enter} {Backspace}{Delete}a{ArrowRight}{Escape}');

      expect(seen).toEqual([
        ['Enter', true],
        [' ', true],
        ['Backspace', true],
        ['Delete', true],
        ['a', false],
        ['ArrowRight', false],
        ['Escape', false],
      ]);
    });

    it('lets a slotProps.root keydown handler cancel the built-in activation and removal keys with preventDefault', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRemove = vi.fn();
      const cancelKeys = vi.fn((event: ReactKeyboardEvent<HTMLElement>) => event.preventDefault());
      const { container } = render(
        <Chip autoDismiss={false} clickable onClick={onClick} onRemove={onRemove} removable slotProps={{ root: { onKeyDown: cancelKeys } }}>
          Economy
        </Chip>,
      );

      await user.tab();
      await user.keyboard('{Enter} {Backspace}{Delete}');

      expect(cancelKeys).toHaveBeenCalledTimes(4);
      expect(onClick).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
      expect(chipRoot(container)).toBeInTheDocument();
    });

    it('lets a slotProps.remove onClick cancel removal on a clickable chip without activating the chip', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRemove = vi.fn();
      const cancelRemoval = vi.fn((event: ReactMouseEvent<HTMLElement>) => event.preventDefault());
      render(
        <Chip clickable onClick={onClick} onRemove={onRemove} removable slotProps={{ remove: { onClick: cancelRemoval } }}>
          Economy
        </Chip>,
      );

      const removeButton = screen.getByRole('button', { name: 'Remove' });
      await user.click(removeButton);

      expect(cancelRemoval).toHaveBeenCalledTimes(1);
      expect(cancelRemoval.mock.calls[0][0]).toMatchObject({ type: 'click', target: removeButton });
      expect(onRemove).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
      expect(screen.getByText('Economy')).toBeInTheDocument();
    });

    it('forwards pointer clicks on a static chip to onClick and slotProps.root onClick without making it a widget', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onSlotClick = vi.fn();
      const { container } = render(
        <Chip onClick={onClick} slotProps={{ root: { onClick: onSlotClick } }}>
          Metadata
        </Chip>,
      );

      const root = chipRoot(container) as HTMLElement;
      await user.click(root);

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick.mock.calls[0][0]).toMatchObject({ type: 'click', target: root });
      expect(onSlotClick).toHaveBeenCalledTimes(1);
      expect(onClick.mock.invocationCallOrder[0]).toBeLessThan(onSlotClick.mock.invocationCallOrder[0]);
      expect(root).not.toHaveAttribute('role');
      expect(root).not.toHaveAttribute('tabindex');
    });
  });

  describe('disabled', () => {
    it('marks a disabled chip with aria-disabled and data-disabled', () => {
      const { container } = render(<Chip disabled>Economy</Chip>);

      const root = chipRoot(container);
      expect(root).toHaveAttribute('aria-disabled', 'true');
      expect(root).toHaveAttribute('data-disabled', '');
    });

    it('removes a disabled clickable chip from the tab order and blocks pointer and keyboard handlers', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onKeyDown = vi.fn();
      const onSlotClick = vi.fn();
      const onSlotKeyDown = vi.fn();
      render(
        <>
          <Chip clickable disabled onClick={onClick} onKeyDown={onKeyDown} slotProps={{ root: { onClick: onSlotClick, onKeyDown: onSlotKeyDown } }} tabIndex={0}>
            Economy
          </Chip>
          <button type="button">After</button>
        </>,
      );

      const chip = screen.getByRole('button', { name: 'Economy' });
      expect(chip).toHaveAttribute('tabindex', '-1');
      expect(chip).toHaveAttribute('aria-disabled', 'true');

      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();

      await user.click(chip);
      expect(chip).toHaveFocus();
      await user.keyboard('{Enter} ');

      expect(onClick).not.toHaveBeenCalled();
      expect(onSlotClick).not.toHaveBeenCalled();
      expect(onKeyDown).not.toHaveBeenCalled();
      expect(onSlotKeyDown).not.toHaveBeenCalled();
    });

    it('disables the remove button of a disabled removable chip and never removes it', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(
        <Chip disabled onRemove={onRemove} removable>
          Cabin bag
        </Chip>,
      );

      const removeButton = screen.getByRole('button', { name: 'Remove' });
      expect(removeButton).toBeDisabled();

      await user.click(removeButton);
      await user.tab();

      expect(removeButton).not.toHaveFocus();
      expect(onRemove).not.toHaveBeenCalled();
      expect(screen.getByText('Cabin bag')).toBeInTheDocument();
    });

    it('ignores Backspace and Delete on a disabled clickable removable chip', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const { container } = render(
        <Chip clickable disabled onRemove={onRemove} removable>
          Cabin bag
        </Chip>,
      );

      const chip = chipRoot(container) as HTMLElement;
      await user.click(chip);
      expect(chip).toHaveFocus();

      await user.keyboard('{Backspace}{Delete}');

      expect(onRemove).not.toHaveBeenCalled();
      expect(chipRoot(container)).toBeInTheDocument();
    });

    it('keeps every part of a disabled clickable removable chip out of the tab sequence', async () => {
      const user = userEvent.setup();
      render(
        <>
          <button type="button">Before</button>
          <Chip clickable disabled removable>
            Economy
          </Chip>
          <button type="button">After</button>
        </>,
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('blocks onClick and slotProps.root onClick on a disabled static chip', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onSlotClick = vi.fn();
      const { container } = render(
        <Chip disabled onClick={onClick} slotProps={{ root: { onClick: onSlotClick } }}>
          Metadata
        </Chip>,
      );

      await user.click(chipRoot(container) as HTMLElement);

      expect(onClick).not.toHaveBeenCalled();
      expect(onSlotClick).not.toHaveBeenCalled();
    });

    it('keeps data-disabled, aria-disabled and the other presence attributes on top of slotProps.root', () => {
      const { container } = render(
        <Chip clickable disabled removable slotProps={{ root: asAttrs({ 'data-clickable': 'no', 'data-disabled': 'false', 'data-removable': 'no', 'aria-disabled': 'false' }) }}>
          Economy
        </Chip>,
      );

      const root = chipRoot(container) as HTMLElement;
      expect(root).toHaveAttribute('data-clickable', '');
      expect(root).toHaveAttribute('data-disabled', '');
      expect(root).toHaveAttribute('data-removable', '');
      expect(root).toHaveAttribute('aria-disabled', 'true');
      expect(root).toHaveAttribute('tabindex', '-1');
    });

    it('applies disabled from provider defaultProps to semantics and interaction', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRemove = vi.fn();
      const { container } = render(
        <TakeoffSparProvider components={{ Chip: { defaultProps: { clickable: true, disabled: true, removable: true } } }}>
          <Chip onClick={onClick} onRemove={onRemove}>
            Economy
          </Chip>
        </TakeoffSparProvider>,
      );

      const root = chipRoot(container) as HTMLElement;
      expect(root).toHaveAttribute('aria-disabled', 'true');
      expect(root).toHaveAttribute('data-disabled', '');
      expect(root).toHaveAttribute('tabindex', '-1');
      expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled();

      await user.click(root);
      await user.keyboard('{Enter} {Backspace}{Delete}');

      expect(onClick).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
      expect(chipRoot(container)).toBeInTheDocument();
    });
  });

  describe('customization', () => {
    it('merges className and classNames on the root, label and remove slots', () => {
      const { container } = render(
        <Chip className="instance-root" classNames={{ root: 'classnames-root', label: 'classnames-label', remove: 'classnames-remove' }} removable>
          Cabin bag
        </Chip>,
      );

      const root = chipRoot(container) as HTMLElement;
      expect(root).toHaveClass('tk-chip', 'instance-root', 'classnames-root');
      expect(root).not.toHaveClass('classnames-label');

      const label = screen.getByText('Cabin bag');
      expect(label).toHaveClass('tk-chip-label', 'classnames-label');
      expect(label).not.toHaveClass('instance-root');

      expect(screen.getByRole('button', { name: 'Remove' })).toHaveClass('tk-chip-remove', 'classnames-remove');
    });

    it('applies slotProps to the owner node of each slot', () => {
      const { container } = render(
        <Chip removable slotProps={{ root: { title: 'Root title' }, label: { id: 'chip-label' }, remove: { title: 'Remove title' } }}>
          Cabin bag
        </Chip>,
      );

      expect(chipRoot(container)).toHaveAttribute('title', 'Root title');
      expect(screen.getByText('Cabin bag')).toHaveAttribute('id', 'chip-label');
      expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute('title', 'Remove title');
    });

    it('keeps data-slot and the state data attributes on top of slotProps', () => {
      const { container } = render(
        <Chip
          removable
          slotProps={{
            root: asAttrs({ 'data-slot': 'hijacked', 'data-variant': 'danger', 'data-type': 'outlined', 'data-size': 'large' }),
            label: asAttrs({ 'data-slot': 'hijacked' }),
            remove: asAttrs({ 'data-slot': 'hijacked' }),
          }}
        >
          Cabin bag
        </Chip>,
      );

      const root = chipRoot(container) as HTMLElement;
      expect(root).toHaveAttribute('data-slot', 'root');
      expect(root).toHaveAttribute('data-variant', 'primary');
      expect(root).toHaveAttribute('data-type', 'filled');
      expect(root).toHaveAttribute('data-size', 'base');
      expect(screen.getByText('Cabin bag')).toHaveAttribute('data-slot', 'label');
      expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute('data-slot', 'remove');
    });

    it('keeps the remove button type and disabled state over slotProps.remove', () => {
      render(
        <Chip disabled removable slotProps={{ remove: asAttrs({ type: 'submit', disabled: false }) }}>
          Cabin bag
        </Chip>,
      );

      const removeButton = screen.getByRole('button', { name: 'Remove' });
      expect(removeButton).toHaveAttribute('type', 'button');
      expect(removeButton).toBeDisabled();
    });

    it('applies provider defaultProps below instance props', () => {
      const components = { Chip: { defaultProps: { variant: 'success', appearance: 'outlined', size: 'small', removable: true } satisfies Partial<ChipProps> } };

      const inherited = render(
        <TakeoffSparProvider components={components}>
          <Chip>Themed</Chip>
        </TakeoffSparProvider>,
      );

      const inheritedRoot = chipRoot(inherited.container) as HTMLElement;
      expect(inheritedRoot).toHaveAttribute('data-variant', 'success');
      expect(inheritedRoot).toHaveAttribute('data-type', 'outlined');
      expect(inheritedRoot).toHaveAttribute('data-size', 'small');
      expect(inheritedRoot).toHaveAttribute('data-removable', '');
      expect(inheritedRoot.querySelector('.tk-chip-remove')).toBeInTheDocument();

      const overridden = render(
        <TakeoffSparProvider components={components}>
          <Chip appearance="filledLight" removable={false} size="large" variant="danger">
            Instance
          </Chip>
        </TakeoffSparProvider>,
      );

      const overriddenRoot = chipRoot(overridden.container) as HTMLElement;
      expect(overriddenRoot).toHaveAttribute('data-variant', 'danger');
      expect(overriddenRoot).toHaveAttribute('data-type', 'filledLight');
      expect(overriddenRoot).toHaveAttribute('data-size', 'large');
      expect(overriddenRoot).not.toHaveAttribute('data-removable');
      expect(overriddenRoot.querySelector('.tk-chip-remove')).not.toBeInTheDocument();
    });

    it('drives interaction from provider defaultProps, not only the data attributes', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      const { container } = render(
        <TakeoffSparProvider components={{ Chip: { defaultProps: { clickable: true, removable: true, autoDismiss: false } } }}>
          <Chip onRemove={onRemove}>Economy</Chip>
        </TakeoffSparProvider>,
      );

      const root = chipRoot(container) as HTMLElement;
      expect(root).toHaveAttribute('role', 'button');
      expect(root).toHaveAttribute('tabindex', '0');

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(chipRoot(container)).toBeInTheDocument();
    });

    it('layers provider className, classNames and slotProps under the instance on each slot', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Chip: {
              className: 'theme-root',
              classNames: { label: 'theme-label', remove: 'theme-remove' },
              slotProps: { root: { title: 'Theme root' }, label: { title: 'Theme label' }, remove: { 'aria-label': 'Theme remove', 'title': 'Theme remove title' } },
            },
          }}
        >
          <Chip classNames={{ root: 'instance-root', remove: 'instance-remove' }} removable slotProps={{ remove: { 'aria-label': 'Remove Cabin bag' } }}>
            Cabin bag
          </Chip>
        </TakeoffSparProvider>,
      );

      const root = chipRoot(container) as HTMLElement;
      expect(root).toHaveClass('tk-chip', 'theme-root', 'instance-root');
      expect(root).toHaveAttribute('title', 'Theme root');

      const label = screen.getByText('Cabin bag');
      expect(label).toHaveClass('tk-chip-label', 'theme-label');
      expect(label).toHaveAttribute('title', 'Theme label');

      const removeButton = screen.getByRole('button', { name: 'Remove Cabin bag' });
      expect(removeButton).toHaveClass('tk-chip-remove', 'theme-remove', 'instance-remove');
      expect(removeButton).toHaveAttribute('title', 'Theme remove title');
    });

    it('scopes the provider className shorthand to the root and lets instance slotProps win over the theme on every slot', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Chip: {
              className: 'theme-root',
              slotProps: { root: { title: 'Theme root' }, label: { title: 'Theme label' }, remove: { title: 'Theme remove' } },
            },
          }}
        >
          <Chip removable slotProps={{ root: { title: 'Instance root' }, label: { title: 'Instance label' }, remove: { title: 'Instance remove' } }}>
            Cabin bag
          </Chip>
        </TakeoffSparProvider>,
      );

      const root = chipRoot(container) as HTMLElement;
      expect(root).toHaveClass('tk-chip', 'theme-root');
      expect(root).toHaveAttribute('title', 'Instance root');

      const label = screen.getByText('Cabin bag');
      expect(label).not.toHaveClass('theme-root');
      expect(label).toHaveAttribute('title', 'Instance label');

      const removeButton = screen.getByRole('button', { name: 'Remove' });
      expect(removeButton).not.toHaveClass('theme-root');
      expect(removeButton).toHaveAttribute('title', 'Instance remove');
    });

    it('keeps per-slot classNames on their own owner node only', () => {
      const { container } = render(
        <Chip classNames={{ root: 'only-root', label: 'only-label', remove: 'only-remove' }} removable>
          Cabin bag
        </Chip>,
      );

      const root = chipRoot(container) as HTMLElement;
      const label = screen.getByText('Cabin bag');
      const removeButton = screen.getByRole('button', { name: 'Remove' });

      expect(root).not.toHaveClass('only-remove');
      expect(label).not.toHaveClass('only-root');
      expect(label).not.toHaveClass('only-remove');
      expect(removeButton).not.toHaveClass('only-root');
      expect(removeButton).not.toHaveClass('only-label');
    });
  });

  describe('accessibility', () => {
    it.each<[string, Partial<ChipProps>]>([
      ['static', {}],
      ['clickable', { clickable: true }],
      ['removable', { removable: true }],
      ['disabled clickable', { clickable: true, disabled: true }],
      ['disabled removable', { disabled: true, removable: true }],
    ])('has no axe violations for a %s chip', async (_, props) => {
      const { container } = render(<Chip {...props}>Cabin bag</Chip>);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for a group of selectable filter chips', async () => {
      const { container } = render(
        <div>
          {['Economy', 'Business', 'Miles'].map(option => (
            <Chip appearance={option === 'Economy' ? 'filled' : 'outlined'} clickable key={option} variant={option === 'Economy' ? 'primary' : 'secondary'}>
              {option}
            </Chip>
          ))}
        </div>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
