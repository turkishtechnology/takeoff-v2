import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type FormEvent, type HTMLAttributes } from 'react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import type { ComponentsThemeMap } from '../../core';
import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { Button, type ButtonAppearance, type ButtonSize, type ButtonVariant } from './index';

const slotNames = (element: HTMLElement) => Array.from(element.children, child => child.getAttribute('data-slot'));
const getSlot = (element: HTMLElement, slot: string) => element.querySelector<HTMLElement>(`[data-slot="${slot}"]`);

const StartIcon = () => <svg aria-hidden="true" data-testid="start-icon" />;
const EndIcon = () => <svg aria-hidden="true" data-testid="end-icon" />;

const ToggleHarness = () => {
  const [pressed, setPressed] = useState(false);
  return (
    <Button pressed={pressed} onPressedChange={setPressed}>
      {pressed ? 'On' : 'Off'}
    </Button>
  );
};

describe('Button', () => {
  describe('rendering', () => {
    it('renders a native type="button" root carrying the canonical class and data-slot', () => {
      render(<Button>Save</Button>);

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveClass('tk-button');
      expect(button).toHaveAttribute('data-slot', 'root');
    });

    it('wraps children in the label slot', () => {
      render(<Button>Save</Button>);

      const button = screen.getByRole('button');
      const label = screen.getByText('Save');
      expect(label.tagName).toBe('SPAN');
      expect(label).toHaveClass('tk-button-label');
      expect(label).toHaveAttribute('data-slot', 'label');
      expect(label.parentElement).toBe(button);
      expect(slotNames(button)).toEqual(['label']);
    });

    it('wraps startContent and endContent in content slots around the label', () => {
      render(
        <Button startContent={<StartIcon />} endContent={<EndIcon />}>
          Continue
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Continue' });
      expect(slotNames(button)).toEqual(['content', 'label', 'content']);

      const [start, label, end] = Array.from(button.children);
      expect(start).toHaveClass('tk-button-content');
      expect(start).toContainElement(screen.getByTestId('start-icon'));
      expect(label).toHaveClass('tk-button-label');
      expect(label).toHaveTextContent('Continue');
      expect(end).toHaveClass('tk-button-content');
      expect(end).toContainElement(screen.getByTestId('end-icon'));
    });

    it('renders a numeric zero as label content', () => {
      render(<Button>{0}</Button>);

      const button = screen.getByRole('button', { name: '0' });
      expect(getSlot(button, 'label')).toHaveTextContent('0');
    });

    it('skips slot wrappers for non-renderable content', () => {
      render(
        <Button aria-label="Empty action" startContent={null} endContent={false}>
          {''}
        </Button>,
      );

      expect(screen.getByRole('button', { name: 'Empty action' })).toBeEmptyDOMElement();
    });

    it('forwards a native type override so the button can submit its form', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());

      render(
        <form onSubmit={onSubmit}>
          <Button type="submit">Submit</Button>
        </form>,
      );

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('type', 'submit');

      await user.click(button);
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('renders as a custom element through the as prop, keeping the styling contract', () => {
      render(
        <Button as="a" href="/flights" variant="secondary">
          Flights
        </Button>,
      );

      const link = screen.getByRole('button', { name: 'Flights' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/flights');
      expect(link).not.toHaveAttribute('type');
      expect(link).toHaveClass('tk-button');
      expect(link).toHaveAttribute('data-slot', 'root');
      expect(link).toHaveAttribute('data-variant', 'secondary');
      expect(slotNames(link)).toEqual(['label']);
    });

    it('forwards the ref and native attributes to the rendered element', () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <Button ref={ref} id="save-button" title="Save changes" aria-describedby="save-hint">
          Save
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(ref.current).toBe(button);
      expect(button).toHaveAttribute('id', 'save-button');
      expect(button).toHaveAttribute('title', 'Save changes');
      expect(button).toHaveAttribute('aria-describedby', 'save-hint');
    });

    it('keeps visual and state props off the DOM', () => {
      render(
        <Button variant="danger" appearance="outlined" size="large" rounded loading={false} pressed={false} startContent={<StartIcon />} endContent={<EndIcon />}>
          Delete
        </Button>,
      );

      const button = screen.getByRole('button');
      for (const attribute of ['variant', 'appearance', 'size', 'rounded', 'loading', 'pressed', 'startcontent', 'endcontent', 'isloading', 'ispressed']) {
        expect(button).not.toHaveAttribute(attribute);
      }
    });

    it('defaults to type="button" so activating it does not submit an enclosing form', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
      const onClick = vi.fn();

      render(
        <form onSubmit={onSubmit}>
          <Button onClick={onClick}>Cancel</Button>
        </form>,
      );

      const button = screen.getByRole('button', { name: 'Cancel' });
      await user.click(button);
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(2);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('data attributes', () => {
    it('emits the default variant, appearance and size and no state hooks', () => {
      render(<Button>Save</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'primary');
      expect(button).toHaveAttribute('data-type', 'filled');
      expect(button).toHaveAttribute('data-size', 'base');
      for (const attribute of ['data-rounded', 'data-icon-only', 'data-loading', 'data-disabled', 'data-pressed']) {
        expect(button).not.toHaveAttribute(attribute);
      }
    });

    it.each<{ variant: ButtonVariant; appearance: ButtonAppearance; size: ButtonSize }>([
      { variant: 'secondary', appearance: 'filledLight', size: 'small' },
      { variant: 'warning', appearance: 'outlined', size: 'base' },
      { variant: 'black', appearance: 'text', size: 'large' },
    ])('reflects variant=$variant, appearance=$appearance and size=$size', ({ variant, appearance, size }) => {
      render(
        <Button variant={variant} appearance={appearance} size={size}>
          Save
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', variant);
      expect(button).toHaveAttribute('data-type', appearance);
      expect(button).toHaveAttribute('data-size', size);
    });

    it('emits data-rounded only when rounded', () => {
      const { rerender } = render(<Button rounded>Save</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-rounded', '');

      rerender(<Button rounded={false}>Save</Button>);
      expect(button).not.toHaveAttribute('data-rounded');
    });

    it('flags icon-only buttons when start or end content exists without children', () => {
      const { rerender } = render(<Button aria-label="Favorite" startContent={<StartIcon />} />);
      const button = screen.getByRole('button', { name: 'Favorite' });
      expect(button).toHaveAttribute('data-icon-only', '');
      expect(slotNames(button)).toEqual(['content']);

      rerender(<Button aria-label="Next" endContent={<EndIcon />} />);
      expect(button).toHaveAttribute('data-icon-only', '');

      rerender(<Button startContent={<StartIcon />}>Favorite</Button>);
      expect(button).not.toHaveAttribute('data-icon-only');

      rerender(<Button>Favorite</Button>);
      expect(button).not.toHaveAttribute('data-icon-only');
    });
  });

  describe('loading', () => {
    it('renders the spinner slot and swaps out start/end content while keeping the label', () => {
      render(
        <Button loading startContent={<StartIcon />} endContent={<EndIcon />}>
          Saving
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Saving' });
      expect(slotNames(button)).toEqual(['spinner', 'label']);

      const spinner = getSlot(button, 'spinner');
      expect(spinner?.tagName).toBe('SPAN');
      expect(spinner).toHaveClass('tk-button-spinner');
      expect(screen.queryByTestId('start-icon')).toBeNull();
      expect(screen.queryByTestId('end-icon')).toBeNull();
    });

    it('skips the spinner slot when not loading', () => {
      render(<Button startContent={<StartIcon />}>Save</Button>);

      const button = screen.getByRole('button');
      expect(button.querySelector('.tk-button-spinner')).toBeNull();
      expect(slotNames(button)).toEqual(['content', 'label']);
    });

    it('announces the busy state and emits data-loading while staying focusable', () => {
      render(<Button loading>Saving</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('aria-live', 'polite');
      expect(button).toHaveAttribute('data-loading', '');
      expect(button).toBeEnabled();
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('blocks pointer and keyboard activation while loading and restores it when loading ends', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      const { rerender } = render(
        <Button loading onClick={onClick} startContent={<StartIcon />}>
          Save
        </Button>,
      );
      const button = screen.getByRole('button');

      await user.click(button);
      await user.keyboard('{Enter}');
      expect(button).toHaveFocus();
      expect(onClick).not.toHaveBeenCalled();

      rerender(
        <Button loading={false} onClick={onClick} startContent={<StartIcon />}>
          Save
        </Button>,
      );

      expect(button).not.toHaveAttribute('aria-busy');
      expect(button).not.toHaveAttribute('data-loading');
      expect(slotNames(button)).toEqual(['content', 'label']);

      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('blocks Space and Enter activation while loading but still forwards onKeyDown', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onKeyDown = vi.fn();
      render(
        <Button loading onClick={onClick} onKeyDown={onKeyDown}>
          Saving
        </Button>,
      );

      await user.tab();
      const button = screen.getByRole('button', { name: 'Saving' });
      expect(button).toHaveFocus();

      await user.keyboard(' ');
      await user.keyboard('{Enter}');

      expect(onClick).not.toHaveBeenCalled();
      expect(onKeyDown).toHaveBeenCalledTimes(2);
      expect(onKeyDown).toHaveBeenLastCalledWith(expect.objectContaining({ key: 'Enter' }));
    });

    it('replaces the content slot with the spinner slot on an icon-only loading button', () => {
      const { rerender } = render(<Button aria-label="Refresh" loading startContent={<StartIcon />} />);
      const button = screen.getByRole('button', { name: 'Refresh' });

      expect(slotNames(button)).toEqual(['spinner']);
      expect(screen.queryByTestId('start-icon')).toBeNull();

      rerender(<Button aria-label="Refresh" startContent={<StartIcon />} />);

      expect(slotNames(button)).toEqual(['content']);
      expect(getSlot(button, 'content')).toContainElement(screen.getByTestId('start-icon'));
    });
  });

  describe('disabled', () => {
    it('disables the native button, emits data-disabled and leaves the tab order', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Button disabled>Delete</Button>
          <Button>Cancel</Button>
        </>,
      );

      const deleteButton = screen.getByRole('button', { name: 'Delete' });
      expect(deleteButton).toBeDisabled();
      expect(deleteButton).toHaveAttribute('data-disabled', '');
      expect(deleteButton).toHaveAttribute('tabindex', '-1');

      await user.tab();
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    });

    it('does not fire onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Delete
        </Button>,
      );

      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('simulates disabled semantics on a non-native element', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button as="span" disabled onClick={onClick}>
          Delete
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Delete' });
      expect(button.tagName).toBe('SPAN');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('data-disabled', '');
      expect(button).toHaveAttribute('tabindex', '-1');
      expect(button).not.toHaveAttribute('disabled');

      await user.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('blocks Enter and Space activation on a focused, disabled non-native element', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button as="span" disabled onClick={onClick}>
          Delete
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Delete' });
      await user.click(button);
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onClick).not.toHaveBeenCalled();
    });

    it('simulates disabled semantics on an anchor instead of a native disabled attribute', () => {
      render(
        <Button as="a" href="#flights" disabled>
          Flights
        </Button>,
      );

      const link = screen.getByRole('button', { name: 'Flights' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('data-disabled', '');
      expect(link).toHaveAttribute('tabindex', '-1');
      expect(link).not.toHaveAttribute('disabled');
      expect(link).not.toHaveAttribute('type');
    });

    it('removes navigation from a disabled or loading anchor and restores it once interactive', () => {
      const onClick = vi.fn();
      const onClickCapture = vi.fn();
      const anchor = (state: { disabled?: boolean; loading?: boolean }) => (
        <Button as="a" href="#flights" onClick={onClick} onClickCapture={onClickCapture} {...state}>
          Flights
        </Button>
      );
      const { rerender } = render(anchor({ disabled: true }));
      const link = screen.getByRole('button', { name: 'Flights' });

      expect(link).not.toHaveAttribute('href');
      // `fireEvent` returns false when the click's default action was cancelled.
      expect(fireEvent.click(link)).toBe(false);
      expect(onClick).not.toHaveBeenCalled();
      expect(onClickCapture).toHaveBeenCalledTimes(1);

      rerender(anchor({ loading: true }));
      expect(link).not.toHaveAttribute('href');
      expect(fireEvent.click(link)).toBe(false);
      expect(onClick).not.toHaveBeenCalled();
      expect(onClickCapture).toHaveBeenCalledTimes(2);

      rerender(anchor({}));
      expect(link).toHaveAttribute('href', '#flights');
      expect(fireEvent.click(link)).toBe(true);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClickCapture).toHaveBeenCalledTimes(3);
    });
  });

  describe('interaction', () => {
    it('calls onClick once per click with the click event', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Save</Button>);

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
    });

    it('activates with Enter and Space from the keyboard', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Save</Button>);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('activates a non-native element with Enter and Space and forwards onKeyDown', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onKeyDown = vi.fn();
      render(
        <Button as="div" onClick={onClick} onKeyDown={onKeyDown}>
          Save
        </Button>,
      );

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toHaveAttribute('tabindex', '0');

      await user.tab();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(2);

      await user.keyboard('a');
      expect(onClick).toHaveBeenCalledTimes(2);
      expect(onKeyDown).toHaveBeenCalledTimes(3);
    });
  });

  describe('toggle (pressed)', () => {
    it('is not a toggle when pressed is undefined', async () => {
      const user = userEvent.setup();
      render(<Button>Bold</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toHaveAttribute('aria-pressed');

      await user.click(button);
      expect(button).not.toHaveAttribute('aria-pressed');
      expect(button).not.toHaveAttribute('data-pressed');
    });

    it('reflects the controlled pressed value through aria-pressed and data-pressed', () => {
      const { rerender } = render(<Button pressed>Bold</Button>);

      const button = screen.getByRole('button', { name: 'Bold', pressed: true });
      expect(button).toHaveAttribute('data-pressed', '');

      rerender(<Button pressed={false}>Bold</Button>);
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).not.toHaveAttribute('data-pressed');
    });

    it('calls onPressedChange with the next pressed state without flipping on its own', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();

      const { rerender } = render(
        <Button pressed={false} onPressedChange={onPressedChange}>
          Bold
        </Button>,
      );
      const button = screen.getByRole('button');

      await user.click(button);
      expect(onPressedChange).toHaveBeenCalledTimes(1);
      expect(onPressedChange).toHaveBeenLastCalledWith(true);
      // Controlled: the parent did not accept the change, so the state holds.
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(
        <Button pressed onPressedChange={onPressedChange}>
          Bold
        </Button>,
      );

      await user.click(button);
      expect(onPressedChange).toHaveBeenCalledTimes(2);
      expect(onPressedChange).toHaveBeenLastCalledWith(false);
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('keeps a pressed value fixed when no onPressedChange handler is provided', async () => {
      const user = userEvent.setup();
      render(<Button pressed>Bold</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('data-pressed', '');
    });

    it('round-trips the pressed state through a stateful parent with pointer and keyboard', async () => {
      const user = userEvent.setup();
      render(<ToggleHarness />);

      await user.click(screen.getByRole('button', { name: 'Off', pressed: false }));
      expect(screen.getByRole('button', { name: 'On', pressed: true })).toHaveAttribute('data-pressed', '');

      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Off', pressed: false })).not.toHaveAttribute('data-pressed');
    });

    it('fires onClick alongside onPressedChange in toggle mode', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onPressedChange = vi.fn();
      render(
        <Button pressed={false} onClick={onClick} onPressedChange={onPressedChange}>
          Bold
        </Button>,
      );

      await user.click(screen.getByRole('button'));

      expect(onPressedChange).toHaveBeenCalledTimes(1);
      expect(onPressedChange).toHaveBeenCalledWith(true);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it.each<{ state: string; props: { disabled?: boolean; loading?: boolean } }>([
      { state: 'disabled', props: { disabled: true } },
      { state: 'loading', props: { loading: true } },
    ])('does not toggle while $state', async ({ props }) => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onPressedChange = vi.fn();
      render(
        <Button pressed={false} onClick={onClick} onPressedChange={onPressedChange} {...props}>
          Bold
        </Button>,
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onPressedChange).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('reports the next pressed state exactly once per Space or Enter activation', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();
      render(
        <Button pressed={false} onPressedChange={onPressedChange}>
          Bold
        </Button>,
      );

      await user.tab();
      expect(screen.getByRole('button', { name: 'Bold', pressed: false })).toHaveFocus();

      await user.keyboard(' ');
      expect(onPressedChange).toHaveBeenCalledTimes(1);

      await user.keyboard('{Enter}');
      expect(onPressedChange).toHaveBeenCalledTimes(2);
      // Controlled at false: every activation proposes `true` as the single argument.
      expect(onPressedChange.mock.calls).toEqual([[true], [true]]);
    });

    it('toggles a non-native element from the keyboard', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();
      render(
        <Button as="div" pressed onPressedChange={onPressedChange}>
          Italic
        </Button>,
      );

      await user.tab();
      const button = screen.getByRole('button', { name: 'Italic', pressed: true });
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onPressedChange).toHaveBeenCalledTimes(1);
      expect(onPressedChange).toHaveBeenLastCalledWith(false);
    });

    it('does not toggle from the keyboard while loading', async () => {
      const user = userEvent.setup();
      const onPressedChange = vi.fn();
      render(
        <Button loading pressed onPressedChange={onPressedChange}>
          Bold
        </Button>,
      );

      await user.tab();
      const button = screen.getByRole('button', { name: 'Bold', pressed: true });
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(onPressedChange).not.toHaveBeenCalled();
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(button).toHaveAttribute('data-pressed', '');
    });
  });

  describe('classNames and slotProps', () => {
    it('keeps the documented state hooks when slotProps.root tries to override them', () => {
      const hijack = { 'data-loading': 'hijacked', 'data-disabled': 'hijacked', 'data-variant': 'hijacked' } as HTMLAttributes<HTMLElement>;
      const { rerender } = render(
        <Button loading slotProps={{ root: hijack }}>
          Save
        </Button>,
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('data-loading', '');
      expect(button).toHaveAttribute('data-variant', 'primary');
      expect(button).toHaveAttribute('aria-busy', 'true');

      rerender(
        <Button disabled slotProps={{ root: hijack }}>
          Save
        </Button>,
      );
      expect(button).toHaveAttribute('data-disabled', '');
      expect(button).toBeDisabled();
    });

    it('merges className and classNames onto their owner nodes', () => {
      const classNames = { root: 'custom-root', content: 'custom-content', label: 'custom-label', spinner: 'custom-spinner' };

      const { rerender } = render(
        <Button className="instance-root" classNames={classNames} startContent={<StartIcon />}>
          Save
        </Button>,
      );
      const button = screen.getByRole('button');
      const [content, label] = Array.from(button.children);

      expect(button).toHaveClass('tk-button', 'instance-root', 'custom-root');
      expect(button).not.toHaveClass('custom-label');
      expect(content).toHaveClass('tk-button-content', 'custom-content');
      expect(content).not.toHaveClass('custom-label');
      expect(label).toHaveClass('tk-button-label', 'custom-label');
      expect(label).not.toHaveClass('custom-content');
      expect(label).not.toHaveClass('custom-root');

      rerender(
        <Button className="instance-root" classNames={classNames} startContent={<StartIcon />} loading>
          Save
        </Button>,
      );

      const spinner = getSlot(button, 'spinner');
      expect(spinner).toHaveClass('tk-button-spinner', 'custom-spinner');
      expect(spinner).not.toHaveClass('custom-content');
      expect(getSlot(button, 'label')).not.toHaveClass('custom-spinner');
    });

    it('forwards slotProps to their owner nodes', () => {
      const slotProps = {
        root: { title: 'Root title' },
        content: { title: 'Content title' },
        label: { title: 'Label title' },
        spinner: { title: 'Spinner title' },
      };

      const { rerender } = render(
        <Button slotProps={slotProps} startContent={<StartIcon />} endContent={<EndIcon />}>
          Save
        </Button>,
      );
      const button = screen.getByRole('button');
      const [start, label, end] = Array.from(button.children);

      expect(button).toHaveAttribute('title', 'Root title');
      expect(start).toHaveAttribute('title', 'Content title');
      expect(label).toHaveAttribute('title', 'Label title');
      expect(end).toHaveAttribute('title', 'Content title');

      rerender(
        <Button slotProps={slotProps} loading>
          Save
        </Button>,
      );

      expect(getSlot(button, 'spinner')).toHaveAttribute('title', 'Spinner title');
    });

    it('keeps canonical slot hooks and state attributes over slotProps overrides', () => {
      const rootOverrides = { 'title': 'Root title', 'data-slot': 'hijacked', 'data-variant': 'hijacked', 'data-size': 'hijacked' };
      const labelOverrides = { 'title': 'Label title', 'data-slot': 'hijacked' };

      render(
        <Button size="small" slotProps={{ root: rootOverrides, label: labelOverrides }}>
          Save
        </Button>,
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('title', 'Root title');
      expect(button).toHaveAttribute('data-slot', 'root');
      expect(button).toHaveAttribute('data-variant', 'primary');
      expect(button).toHaveAttribute('data-size', 'small');
      expect(screen.getByText('Save')).toHaveAttribute('data-slot', 'label');
      expect(screen.getByText('Save')).toHaveAttribute('title', 'Label title');
    });

    it('keeps canonical data-slot on the content and spinner slots over slotProps overrides', () => {
      const contentOverrides = { 'title': 'Content title', 'data-slot': 'hijacked' };
      const spinnerOverrides = { 'title': 'Spinner title', 'data-slot': 'hijacked' };

      const { rerender } = render(
        <Button slotProps={{ content: contentOverrides, spinner: spinnerOverrides }} startContent={<StartIcon />} endContent={<EndIcon />}>
          Save
        </Button>,
      );
      const button = screen.getByRole('button');

      expect(slotNames(button)).toEqual(['content', 'label', 'content']);
      expect(button.children[0]).toHaveAttribute('title', 'Content title');

      rerender(
        <Button loading slotProps={{ content: contentOverrides, spinner: spinnerOverrides }}>
          Save
        </Button>,
      );

      expect(slotNames(button)).toEqual(['spinner', 'label']);
      expect(getSlot(button, 'spinner')).toHaveAttribute('title', 'Spinner title');
      expect(button.querySelector('[data-slot="hijacked"]')).toBeNull();
    });

    it('lands classNames.content on both the start and end content wrappers only', () => {
      render(
        <Button classNames={{ content: 'custom-content' }} startContent={<StartIcon />} endContent={<EndIcon />}>
          Save
        </Button>,
      );
      const button = screen.getByRole('button');
      const [start, label, end] = Array.from(button.children);

      expect(start).toHaveClass('tk-button-content', 'custom-content');
      expect(end).toHaveClass('tk-button-content', 'custom-content');
      expect(label).not.toHaveClass('custom-content');
      expect(button).not.toHaveClass('custom-content');
    });
  });

  describe('provider theme', () => {
    it('applies theme defaultProps below instance props', () => {
      const components: ComponentsThemeMap = { Button: { defaultProps: { variant: 'danger', appearance: 'outlined', size: 'small', rounded: true } } };

      const { rerender } = render(
        <TakeoffSparProvider components={components}>
          <Button>Delete</Button>
        </TakeoffSparProvider>,
      );
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('data-variant', 'danger');
      expect(button).toHaveAttribute('data-type', 'outlined');
      expect(button).toHaveAttribute('data-size', 'small');
      expect(button).toHaveAttribute('data-rounded', '');

      rerender(
        <TakeoffSparProvider components={components}>
          <Button size="large" rounded={false}>
            Delete
          </Button>
        </TakeoffSparProvider>,
      );

      expect(button).toHaveAttribute('data-variant', 'danger');
      expect(button).toHaveAttribute('data-size', 'large');
      expect(button).not.toHaveAttribute('data-rounded');
    });

    it('concatenates canonical, theme and instance classes and layers instance slotProps over theme slotProps', () => {
      const components: ComponentsThemeMap = {
        Button: {
          className: 'theme-root',
          classNames: { label: 'theme-label', content: 'theme-content' },
          slotProps: { root: { title: 'Theme root' }, label: { id: 'theme-label-id', title: 'Theme label' } },
        },
      };

      render(
        <TakeoffSparProvider components={components}>
          <Button className="instance-root" classNames={{ label: 'instance-label' }} slotProps={{ label: { title: 'Instance label' } }} startContent={<StartIcon />}>
            Save
          </Button>
        </TakeoffSparProvider>,
      );
      const button = screen.getByRole('button');
      const [content, label] = Array.from(button.children);

      expect(button).toHaveClass('tk-button', 'theme-root', 'instance-root');
      expect(button).toHaveAttribute('title', 'Theme root');
      expect(content).toHaveClass('tk-button-content', 'theme-content');
      expect(content).not.toHaveClass('theme-label');
      expect(label).toHaveClass('tk-button-label', 'theme-label', 'instance-label');
      expect(label).toHaveAttribute('title', 'Instance label');
      expect(label).toHaveAttribute('id', 'theme-label-id');
    });

    it('applies a theme loading default and lets the instance switch it off', () => {
      const components: ComponentsThemeMap = { Button: { defaultProps: { loading: true } } };

      const { rerender } = render(
        <TakeoffSparProvider components={components}>
          <Button startContent={<StartIcon />}>Save</Button>
        </TakeoffSparProvider>,
      );
      const button = screen.getByRole('button', { name: 'Save' });

      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toHaveAttribute('data-loading', '');
      expect(slotNames(button)).toEqual(['spinner', 'label']);

      rerender(
        <TakeoffSparProvider components={components}>
          <Button loading={false} startContent={<StartIcon />}>
            Save
          </Button>
        </TakeoffSparProvider>,
      );

      expect(button).not.toHaveAttribute('aria-busy');
      expect(button).not.toHaveAttribute('data-loading');
      expect(slotNames(button)).toEqual(['content', 'label']);
    });

    it('layers theme spinner and root overrides below the instance and keeps the theme className on the root only', () => {
      const components: ComponentsThemeMap = {
        Button: {
          className: 'theme-root',
          classNames: { spinner: 'theme-spinner' },
          slotProps: { root: { title: 'Theme root', lang: 'tr' }, spinner: { title: 'Theme spinner', id: 'theme-spinner-id' } },
        },
      };

      render(
        <TakeoffSparProvider components={components}>
          <Button loading classNames={{ spinner: 'instance-spinner' }} slotProps={{ root: { title: 'Instance root' }, spinner: { title: 'Instance spinner' } }}>
            Save
          </Button>
        </TakeoffSparProvider>,
      );
      const button = screen.getByRole('button');
      const spinner = getSlot(button, 'spinner');
      const label = getSlot(button, 'label');

      expect(button).toHaveClass('tk-button', 'theme-root');
      expect(button).toHaveAttribute('title', 'Instance root');
      expect(button).toHaveAttribute('lang', 'tr');
      expect(spinner).toHaveClass('tk-button-spinner', 'theme-spinner', 'instance-spinner');
      expect(spinner).not.toHaveClass('theme-root');
      expect(spinner).toHaveAttribute('title', 'Instance spinner');
      expect(spinner).toHaveAttribute('id', 'theme-spinner-id');
      expect(label).not.toHaveClass('theme-root');
      expect(label).not.toHaveClass('theme-spinner');
    });
  });

  describe('accessibility', () => {
    it('has no axe violations for a labelled button with icons', async () => {
      const { container } = render(
        <Button startContent={<StartIcon />} endContent={<EndIcon />}>
          Continue
        </Button>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations for an icon-only button named by aria-label', async () => {
      const { container } = render(<Button aria-label="Add to favorites" rounded startContent={<StartIcon />} />);

      expect(screen.getByRole('button', { name: 'Add to favorites' })).toHaveAttribute('data-icon-only', '');
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no axe violations in the loading, disabled and pressed states', async () => {
      const { container } = render(
        <div>
          <Button loading>Saving</Button>
          <Button disabled>Delete</Button>
          <Button pressed>Bold</Button>
        </div>,
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
