import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleGroup, ToggleGroupItem, type ToggleGroupProps, type ToggleGroupValue } from '../index';

const Group = ({ itemDisabled, ...props }: Partial<ToggleGroupProps> & { itemDisabled?: string }) => (
  <ToggleGroup aria-label="Alignment" {...props}>
    <ToggleGroupItem value="left">Left</ToggleGroupItem>
    <ToggleGroupItem value="center" disabled={itemDisabled === 'center'}>
      Center
    </ToggleGroupItem>
    <ToggleGroupItem value="right">Right</ToggleGroupItem>
  </ToggleGroup>
);

const button = (name: string) => screen.getByRole('button', { name });

describe('ToggleGroup', () => {
  describe('rendering', () => {
    it('renders a named group of aria-pressed buttons', () => {
      render(<Group />);
      const group = screen.getByRole('group', { name: 'Alignment' });
      expect(group).toHaveAttribute('data-orientation', 'horizontal');
      expect(group).not.toHaveAttribute('data-multiple');
      for (const name of ['Left', 'Center', 'Right']) {
        expect(button(name)).toHaveAttribute('aria-pressed', 'false');
        expect(button(name)).toHaveAttribute('type', 'button');
      }
      expect(button('Left')).toHaveAttribute('data-value', 'left');
    });

    it('emits data-multiple, data-disabled and a custom orientation', () => {
      render(<Group multiple disabled orientation="vertical" />);
      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('data-multiple', '');
      expect(group).toHaveAttribute('data-disabled', '');
      expect(group).toHaveAttribute('data-orientation', 'vertical');
    });

    it('supports polymorphic roots and items', () => {
      render(
        <ToggleGroup as="section" aria-label="Format">
          <ToggleGroupItem as="div" value="bold">
            Bold
          </ToggleGroupItem>
        </ToggleGroup>,
      );
      expect(screen.getByRole('group').tagName).toBe('SECTION');
      expect(button('Bold').tagName).toBe('DIV');
    });

    it('throws a descriptive error for an item outside a group', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<ToggleGroupItem value="x">X</ToggleGroupItem>)).toThrow('ToggleGroupItem must be used within a ToggleGroup');
      spy.mockRestore();
    });

    it('exposes stable displayNames and compound members', () => {
      expect(ToggleGroup.displayName).toBe('ToggleGroup');
      expect(ToggleGroupItem.displayName).toBe('ToggleGroupItem');
      expect(ToggleGroup.Item).toBe(ToggleGroupItem);
      expect(ToggleGroup.Root).toBe(ToggleGroup);
    });
  });

  describe('single selection', () => {
    it('presses one item at a time and reports a string', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<Group defaultValue="left" onValueChange={onValueChange} />);

      expect(button('Left')).toHaveAttribute('aria-pressed', 'true');
      await user.click(button('Right'));
      expect(button('Right')).toHaveAttribute('aria-pressed', 'true');
      expect(button('Left')).toHaveAttribute('aria-pressed', 'false');
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenLastCalledWith('right');
    });

    it('releases the pressed item and reports an empty string', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<Group defaultValue="left" onValueChange={onValueChange} />);

      await user.click(button('Left'));
      expect(button('Left')).toHaveAttribute('aria-pressed', 'false');
      expect(onValueChange).toHaveBeenLastCalledWith('');
    });

    it('keeps the pressed item when deselectable is false', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<Group defaultValue="left" deselectable={false} onValueChange={onValueChange} />);

      await user.click(button('Left'));
      expect(button('Left')).toHaveAttribute('aria-pressed', 'true');
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('takes the last entry of an array value', () => {
      render(<Group defaultValue={['left', 'right']} />);
      expect(button('Right')).toHaveAttribute('aria-pressed', 'true');
      expect(button('Left')).toHaveAttribute('aria-pressed', 'false');
    });

    it('treats an empty array as nothing pressed', () => {
      render(<Group value={[]} />);
      expect(button('Left')).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('multiple selection', () => {
    it('toggles items independently and reports an array', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<Group multiple defaultValue={['left']} onValueChange={onValueChange} />);

      await user.click(button('Right'));
      expect(onValueChange).toHaveBeenLastCalledWith(['left', 'right']);
      await user.click(button('Left'));
      expect(onValueChange).toHaveBeenLastCalledWith(['right']);
      expect(button('Left')).toHaveAttribute('aria-pressed', 'false');
      expect(button('Right')).toHaveAttribute('aria-pressed', 'true');
    });

    it('wraps a string value and treats an empty string as nothing pressed', () => {
      const { unmount } = render(<Group multiple defaultValue="center" />);
      expect(button('Center')).toHaveAttribute('aria-pressed', 'true');
      unmount();
      render(<Group multiple value="" />);
      expect(button('Center')).toHaveAttribute('aria-pressed', 'false');
    });

    it('starts empty without a value', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<Group multiple onValueChange={onValueChange} />);
      await user.click(button('Center'));
      expect(onValueChange).toHaveBeenLastCalledWith(['center']);
    });
  });

  describe('controlled', () => {
    it('follows the value prop and reports requested changes', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      const { rerender } = render(<Group value="left" onValueChange={onValueChange} />);

      await user.click(button('Right'));
      expect(onValueChange).toHaveBeenCalledWith('right');
      // Not applied until the parent updates `value`.
      expect(button('Left')).toHaveAttribute('aria-pressed', 'true');

      rerender(<Group value="right" onValueChange={onValueChange} />);
      expect(button('Right')).toHaveAttribute('aria-pressed', 'true');
    });

    it('round-trips through parent state', async () => {
      const user = userEvent.setup();
      const Controlled = () => {
        const [value, setValue] = React.useState<ToggleGroupValue>(['left']);
        return (
          <>
            <Group multiple value={value} onValueChange={setValue} />
            <output>{JSON.stringify(value)}</output>
          </>
        );
      };
      render(<Controlled />);
      await user.click(button('Right'));
      expect(screen.getByRole('status')).toHaveTextContent('["left","right"]');
    });
  });

  describe('disabled', () => {
    it('blocks every item when the group is disabled', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<Group disabled onValueChange={onValueChange} />);
      expect(button('Left')).toBeDisabled();
      await user.click(button('Left'));
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('blocks a disabled item only', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<Group itemDisabled="center" onValueChange={onValueChange} />);
      expect(button('Center')).toBeDisabled();
      expect(button('Center')).toHaveAttribute('tabindex', '-1');
      await user.click(button('Left'));
      expect(onValueChange).toHaveBeenCalledWith('left');
    });
  });

  describe('keyboard', () => {
    it('is a single tab stop on the first enabled item when nothing is pressed', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Group />
          <button type="button">After</button>
        </>,
      );
      expect(button('Left')).toHaveAttribute('tabindex', '0');
      expect(button('Right')).toHaveAttribute('tabindex', '-1');

      await user.tab();
      expect(button('Left')).toHaveFocus();
      await user.tab();
      expect(button('After')).toHaveFocus();
    });

    it('puts the tab stop on the first pressed item in DOM order', () => {
      render(<Group multiple defaultValue={['right', 'center']} />);
      expect(button('Center')).toHaveAttribute('tabindex', '0');
      expect(button('Right')).toHaveAttribute('tabindex', '-1');
      expect(button('Left')).toHaveAttribute('tabindex', '-1');
    });

    it('skips a pressed item that is disabled', () => {
      render(<Group defaultValue="center" itemDisabled="center" />);
      expect(button('Left')).toHaveAttribute('tabindex', '0');
    });

    it('moves focus with Left/Right, wraps, skips disabled items and does not press', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<Group itemDisabled="center" onValueChange={onValueChange} />);

      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(button('Right')).toHaveFocus();
      expect(button('Right')).toHaveAttribute('tabindex', '0');
      expect(button('Left')).toHaveAttribute('tabindex', '-1');
      await user.keyboard('{ArrowRight}');
      expect(button('Left')).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(button('Right')).toHaveFocus();
      await user.keyboard('{ArrowDown}{ArrowUp}');
      expect(button('Right')).toHaveFocus();
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('uses Up/Down when vertical and Home/End in either orientation', async () => {
      const user = userEvent.setup();
      render(<Group orientation="vertical" />);
      await user.tab();
      await user.keyboard('{ArrowDown}');
      expect(button('Center')).toHaveFocus();
      await user.keyboard('{ArrowUp}{ArrowUp}');
      expect(button('Right')).toHaveFocus();
      await user.keyboard('{Home}');
      expect(button('Left')).toHaveFocus();
      await user.keyboard('{End}');
      expect(button('Right')).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(button('Right')).toHaveFocus();
    });

    it('presses the focused item with Space and Enter', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<Group multiple onValueChange={onValueChange} />);
      await user.tab();
      await user.keyboard(' ');
      expect(onValueChange).toHaveBeenLastCalledWith(['left']);
      await user.keyboard('{ArrowRight}{Enter}');
      expect(onValueChange).toHaveBeenLastCalledWith(['left', 'center']);
    });

    it('enters at the first enabled item when focus starts at the group', async () => {
      const user = userEvent.setup();
      render(<Group itemDisabled="center" tabIndex={-1} />);
      // Arrow keys before any item holds focus start from the first item.
      screen.getByRole('group').focus();
      await user.keyboard('{ArrowRight}');
      expect(button('Left')).toHaveFocus();
    });

    it('lets a consumer onKeyDown veto navigation', async () => {
      const user = userEvent.setup();
      render(<Group onKeyDown={event => event.preventDefault()} />);
      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(button('Left')).toHaveFocus();
    });

    it('ignores navigation while disabled and for unrelated keys', async () => {
      const user = userEvent.setup();
      const onKeyDown = jest.fn();
      render(<Group onKeyDown={onKeyDown} />);
      await user.tab();
      await user.keyboard('a');
      expect(button('Left')).toHaveFocus();
      expect(onKeyDown).toHaveBeenCalled();
    });

    it('resets the tab stop when focus leaves the group and composes onBlur / onFocus', async () => {
      const user = userEvent.setup();
      const onBlur = jest.fn();
      const onFocus = jest.fn();
      render(
        <>
          <ToggleGroup aria-label="Alignment" defaultValue="left" onBlur={onBlur}>
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="right" onFocus={onFocus}>
              Right
            </ToggleGroupItem>
          </ToggleGroup>
          <button type="button">After</button>
        </>,
      );
      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(button('Right')).toHaveAttribute('tabindex', '0');
      await user.tab();
      expect(onBlur).toHaveBeenCalled();
      // Back to the pressed item once focus has left.
      expect(button('Left')).toHaveAttribute('tabindex', '0');
    });

    it('keeps an item registered in DOM order when it toggles disabled', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Group itemDisabled="center" />);
      rerender(<Group />);
      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(button('Center')).toHaveFocus();
    });
  });
});
