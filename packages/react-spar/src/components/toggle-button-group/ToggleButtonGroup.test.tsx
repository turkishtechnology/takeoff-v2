import userEvent from '@testing-library/user-event';
import { createRef, useState, type HTMLAttributes } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { ToggleButtonGroup, type ToggleButtonGroupProps, type ToggleButtonGroupValue } from './index';

const Icon = () => <svg aria-hidden="true" data-testid="icon" />;

const View = (props: Partial<ToggleButtonGroupProps>) => (
  <ToggleButtonGroup aria-label="View" {...props}>
    <ToggleButtonGroup.Item value="list">List</ToggleButtonGroup.Item>
    <ToggleButtonGroup.Item value="grid">Grid</ToggleButtonGroup.Item>
    <ToggleButtonGroup.Item value="map" disabled>
      Map
    </ToggleButtonGroup.Item>
  </ToggleButtonGroup>
);

const button = (name: string) => screen.getByRole('button', { name });

describe('ToggleButtonGroup (compound)', () => {
  describe('rendering', () => {
    it('renders a named group of toggle buttons with the canonical anatomy', () => {
      render(<View />);

      const group = screen.getByRole('group', { name: 'View' });
      expect(group).toHaveClass('tk-toggle-button-group');
      expect(group).toHaveAttribute('data-slot', 'root');

      const item = button('List');
      expect(item.tagName).toBe('BUTTON');
      expect(item).toHaveClass('tk-toggle-button-group-item');
      expect(item).toHaveAttribute('data-slot', 'root');
      expect(item).toHaveAttribute('aria-pressed', 'false');
      const label = item.querySelector('[data-slot="label"]');
      expect(label).toHaveClass('tk-toggle-button-group-item-label');
      expect(label).toHaveTextContent('List');
      expect(item.querySelector('[data-slot="content"]')).toBeNull();
    });

    it('emits the default visual data attributes on the group and every item', () => {
      render(<View />);

      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('data-type', 'basic');
      expect(group).toHaveAttribute('data-size', 'base');
      expect(group).toHaveAttribute('data-orientation', 'horizontal');
      expect(group).not.toHaveAttribute('data-rounded');
      expect(group).not.toHaveAttribute('data-multiple');

      const item = button('List');
      expect(item).toHaveAttribute('data-size', 'base');
      expect(item).toHaveAttribute('data-variant', 'neutral');
      expect(item).toHaveAttribute('data-type', 'filled');
      expect(item).not.toHaveAttribute('data-icon-only');
    });

    it('reflects root props, cascades them to items and lets an item override them', () => {
      render(
        <ToggleButtonGroup aria-label="Format" type="light" rounded size="large" variant="primary" appearance="outlined" orientation="vertical" multiple disabled>
          <ToggleButtonGroup.Item value="bold">Bold</ToggleButtonGroup.Item>
          <ToggleButtonGroup.Item value="italic" size="small" variant="neutral" appearance="raised">
            Italic
          </ToggleButtonGroup.Item>
        </ToggleButtonGroup>,
      );

      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('data-type', 'light');
      expect(group).toHaveAttribute('data-size', 'large');
      expect(group).toHaveAttribute('data-rounded', '');
      expect(group).toHaveAttribute('data-orientation', 'vertical');
      expect(group).toHaveAttribute('data-multiple', '');
      expect(group).toHaveAttribute('data-disabled', '');
      for (const attribute of ['type', 'rounded', 'size', 'variant', 'appearance']) {
        expect(group).not.toHaveAttribute(attribute);
      }

      expect(button('Bold')).toHaveAttribute('data-size', 'large');
      expect(button('Bold')).toHaveAttribute('data-variant', 'primary');
      expect(button('Bold')).toHaveAttribute('data-type', 'outlined');
      expect(button('Bold')).toBeDisabled();
      expect(button('Italic')).toHaveAttribute('data-size', 'small');
      expect(button('Italic')).toHaveAttribute('data-variant', 'neutral');
      expect(button('Italic')).toHaveAttribute('data-type', 'raised');
      for (const attribute of ['size', 'variant', 'appearance']) {
        expect(button('Italic')).not.toHaveAttribute(attribute);
      }
    });

    it('renders start and end content and marks icon-only items', () => {
      render(
        <ToggleButtonGroup aria-label="Align">
          <ToggleButtonGroup.Item value="left" startContent={<Icon />} endContent={<Icon />}>
            Left
          </ToggleButtonGroup.Item>
          <ToggleButtonGroup.Item value="center" aria-label="Center" startContent={<Icon />} />
        </ToggleButtonGroup>,
      );

      const left = button('Left');
      expect(Array.from(left.children, child => child.getAttribute('data-slot'))).toEqual(['content', 'label', 'content']);
      expect(left.querySelector('[data-slot="content"]')).toHaveClass('tk-toggle-button-group-item-content');
      expect(left).not.toHaveAttribute('data-icon-only');
      expect(button('Center')).toHaveAttribute('data-icon-only', '');
      expect(button('Center').querySelector('[data-slot="label"]')).toBeNull();
    });

    it('renders both parts as another element through as', () => {
      render(
        <ToggleButtonGroup as="section" aria-label="View">
          <ToggleButtonGroup.Item as="div" value="list">
            List
          </ToggleButtonGroup.Item>
        </ToggleButtonGroup>,
      );

      expect(screen.getByRole('group').tagName).toBe('SECTION');
      expect(button('List').tagName).toBe('DIV');
    });

    it('forwards refs to the DOM node of both parts', () => {
      const groupRef = createRef<HTMLDivElement>();
      const itemRef = createRef<HTMLButtonElement>();
      render(
        <ToggleButtonGroup aria-label="View" ref={groupRef}>
          <ToggleButtonGroup.Item value="list" ref={itemRef}>
            List
          </ToggleButtonGroup.Item>
        </ToggleButtonGroup>,
      );

      expect(groupRef.current).toBe(screen.getByRole('group'));
      expect(itemRef.current).toBe(button('List'));
    });

    it('throws a descriptive error when an item renders outside the group', () => {
      expect(() => render(<ToggleButtonGroup.Item value="list">List</ToggleButtonGroup.Item>)).toThrow(/ToggleButtonGroup\.Item must be used within ToggleButtonGroupProvider/);
    });

    it('sets the dotted displayNames', () => {
      expect(ToggleButtonGroup.displayName).toBe('ToggleButtonGroup');
      expect(ToggleButtonGroup.Item.displayName).toBe('ToggleButtonGroup.Item');
    });
  });

  describe('selection', () => {
    it('presses one item at a time and reports a string (uncontrolled)', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<View defaultValue="list" onValueChange={onValueChange} />);

      expect(button('List')).toHaveAttribute('aria-pressed', 'true');
      expect(button('List')).toHaveAttribute('data-pressed', '');
      await user.click(button('Grid'));
      expect(button('Grid')).toHaveAttribute('aria-pressed', 'true');
      expect(button('List')).toHaveAttribute('aria-pressed', 'false');
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith('grid');
    });

    it('releases the pressed item with an empty string, unless deselectable is false', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { rerender } = render(<View defaultValue="list" onValueChange={onValueChange} />);

      await user.click(button('List'));
      expect(onValueChange).toHaveBeenLastCalledWith('');
      expect(button('List')).toHaveAttribute('aria-pressed', 'false');

      onValueChange.mockClear();
      rerender(<View value="grid" deselectable={false} onValueChange={onValueChange} />);
      await user.click(button('Grid'));
      expect(onValueChange).not.toHaveBeenCalled();
      expect(button('Grid')).toHaveAttribute('aria-pressed', 'true');
    });

    it('toggles items independently and reports an array with multiple', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<View multiple defaultValue={['list']} onValueChange={onValueChange} />);

      await user.click(button('Grid'));
      expect(onValueChange).toHaveBeenLastCalledWith(['list', 'grid']);
      await user.click(button('List'));
      expect(onValueChange).toHaveBeenLastCalledWith(['grid']);
      expect(onValueChange).toHaveBeenCalledTimes(2);
    });

    it('keeps the pressed item pinned to value until the parent updates it (controlled)', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { rerender } = render(<View value="list" onValueChange={onValueChange} />);

      await user.click(button('Grid'));
      expect(onValueChange).toHaveBeenCalledWith('grid');
      expect(button('List')).toHaveAttribute('aria-pressed', 'true');

      rerender(<View value="grid" onValueChange={onValueChange} />);
      expect(button('Grid')).toHaveAttribute('aria-pressed', 'true');
    });

    it('round-trips the value through parent state', async () => {
      const user = userEvent.setup();
      const Controlled = () => {
        const [value, setValue] = useState<ToggleButtonGroupValue>([]);
        return (
          <>
            <View multiple value={value} onValueChange={setValue} />
            <output>{JSON.stringify(value)}</output>
          </>
        );
      };
      render(<Controlled />);

      await user.click(button('Grid'));
      await user.click(button('List'));
      expect(screen.getByRole('status')).toHaveTextContent('["grid","list"]');
    });

    it('ignores a disabled item', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<View onValueChange={onValueChange} />);

      expect(button('Map')).toBeDisabled();
      expect(button('Map')).toHaveAttribute('data-disabled', '');
      await user.click(button('Map'));
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('keyboard', () => {
    it('is one tab stop on the pressed item and moves focus with the arrow keys, skipping disabled items', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <>
          <View defaultValue="grid" onValueChange={onValueChange} />
          <button type="button">After</button>
        </>,
      );

      expect(button('Grid')).toHaveAttribute('tabindex', '0');
      expect(button('List')).toHaveAttribute('tabindex', '-1');

      await user.tab();
      expect(button('Grid')).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(button('List')).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(button('Grid')).toHaveFocus();
      await user.keyboard('{Home}');
      expect(button('List')).toHaveFocus();
      await user.keyboard('{End}');
      expect(button('Grid')).toHaveFocus();
      expect(onValueChange).not.toHaveBeenCalled();

      await user.tab();
      expect(button('After')).toHaveFocus();
    });

    it('navigates with Up/Down when vertical and presses with Space and Enter', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<View multiple orientation="vertical" onValueChange={onValueChange} />);

      await user.tab();
      await user.keyboard(' ');
      expect(onValueChange).toHaveBeenLastCalledWith(['list']);
      await user.keyboard('{ArrowDown}{Enter}');
      expect(button('Grid')).toHaveFocus();
      expect(onValueChange).toHaveBeenLastCalledWith(['list', 'grid']);
    });
  });

  describe('customization', () => {
    it('merges className, classNames and slotProps onto the owner node of each slot', () => {
      render(
        <ToggleButtonGroup aria-label="View" className="root-extra" classNames={{ root: 'root-slot' }} slotProps={{ root: { title: 'group' } }}>
          <ToggleButtonGroup.Item
            value="list"
            startContent={<Icon />}
            className="item-extra"
            classNames={{ root: 'item-slot', content: 'content-slot', label: 'label-slot' }}
            slotProps={{ root: { title: 'item' }, content: { title: 'content' }, label: { title: 'label' } }}
          >
            List
          </ToggleButtonGroup.Item>
        </ToggleButtonGroup>,
      );

      const group = screen.getByRole('group');
      expect(group).toHaveClass('tk-toggle-button-group', 'root-extra', 'root-slot');
      expect(group).toHaveAttribute('title', 'group');

      const item = button('List');
      expect(item).toHaveClass('tk-toggle-button-group-item', 'item-extra', 'item-slot');
      expect(item).toHaveAttribute('title', 'item');
      expect(item.querySelector('[data-slot="content"]')).toHaveClass('content-slot');
      expect(item.querySelector('[data-slot="content"]')).toHaveAttribute('title', 'content');
      expect(item.querySelector('[data-slot="label"]')).toHaveClass('label-slot');
      expect(item.querySelector('[data-slot="label"]')).toHaveAttribute('title', 'label');
    });

    it('keeps canonical slot hooks and visual attributes when slotProps try to override them', () => {
      const hijack = { 'data-slot': 'hijacked', 'data-size': 'small', 'data-type': 'text' } as HTMLAttributes<HTMLElement>;
      render(
        <ToggleButtonGroup aria-label="View" type="divided" size="large" slotProps={{ root: hijack }}>
          <ToggleButtonGroup.Item value="list" slotProps={{ root: hijack }}>
            List
          </ToggleButtonGroup.Item>
        </ToggleButtonGroup>,
      );

      const group = screen.getByRole('group');
      expect(group).toHaveAttribute('data-slot', 'root');
      expect(group).toHaveAttribute('data-type', 'divided');
      expect(group).toHaveAttribute('data-size', 'large');
      expect(button('List')).toHaveAttribute('data-slot', 'root');
      expect(button('List')).toHaveAttribute('data-type', 'filled');
      expect(button('List')).toHaveAttribute('data-size', 'large');
    });

    it('applies provider theme layers beneath instance props', () => {
      render(
        <TakeoffSparProvider
          components={{
            ToggleButtonGroup: { className: 'theme-root', defaultProps: { type: 'light', variant: 'primary' } },
            ToggleButtonGroupItem: { classNames: { root: 'theme-item', label: 'theme-label' }, defaultProps: { appearance: 'text' } },
          }}
        >
          <ToggleButtonGroup aria-label="View" type="divided" className="instance-root">
            <ToggleButtonGroup.Item value="list">List</ToggleButtonGroup.Item>
          </ToggleButtonGroup>
        </TakeoffSparProvider>,
      );

      const group = screen.getByRole('group');
      expect(group).toHaveClass('tk-toggle-button-group', 'theme-root', 'instance-root');
      expect(group).toHaveAttribute('data-type', 'divided');

      const item = button('List');
      expect(item).toHaveClass('theme-item');
      expect(item).toHaveAttribute('data-variant', 'primary');
      expect(item).toHaveAttribute('data-type', 'text');
      expect(item.querySelector('[data-slot="label"]')).toHaveClass('theme-label');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations across the documented anatomy and states', async () => {
      const { container } = render(
        <>
          <View defaultValue="list" type="divided" rounded />
          <ToggleButtonGroup aria-label="Format" multiple orientation="vertical" defaultValue={['bold']} variant="primary" appearance="filledLight">
            <ToggleButtonGroup.Item value="bold" aria-label="Bold" startContent={<Icon />} />
            <ToggleButtonGroup.Item value="italic" aria-label="Italic" startContent={<Icon />} />
          </ToggleButtonGroup>
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
