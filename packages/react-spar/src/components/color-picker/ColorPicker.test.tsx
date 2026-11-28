import { useState } from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { renderWithProvider as render, screen, within } from '../../test-utils';
import { Field } from '../field';

import { ColorPicker } from './index';

const area = () => screen.getByRole('slider', { name: 'Color' });
const hue = () => screen.getByRole('slider', { name: 'Hue' });
const opacity = () => screen.getByRole('slider', { name: 'Opacity' });
const field = () => screen.getByRole('textbox', { name: 'Brand' });

const Inline = (props: Parameters<typeof ColorPicker>[0]) => (
  <ColorPicker {...props}>
    <ColorPicker.Panel />
  </ColorPicker>
);

const measure = (element: Element, width = 200, height = 100) => {
  (element as HTMLElement).getBoundingClientRect = () => ({ left: 0, top: 0, width, height, right: width, bottom: height, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
};

// jsdom ships no ResizeObserver; the format Select and Floating UI observe nodes.
const OriginalResizeObserver = globalThis.ResizeObserver;
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});
afterAll(() => {
  globalThis.ResizeObserver = OriginalResizeObserver;
});

afterEach(() => {
  delete (window as { EyeDropper?: unknown }).EyeDropper;
});

describe('ColorPicker', () => {
  describe('default anatomy', () => {
    it('renders the trigger field and opens the full panel from the chevron', async () => {
      const user = userEvent.setup();
      render(
        <Field>
          <Field.Label>Brand</Field.Label>
          <ColorPicker defaultValue="#326fd1" />
        </Field>,
      );
      expect(field()).toHaveValue('#326fd1');
      expect(screen.getByRole('button', { name: 'Open color picker' })).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('group', { name: 'Brand' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Open color picker' }));

      const panel = await screen.findByRole('group', { name: 'Brand' });
      expect(screen.getByRole('button', { name: 'Open color picker' })).toHaveAttribute('aria-expanded', 'true');
      expect(within(panel).getByRole('slider', { name: 'Color' })).toHaveAttribute('aria-valuetext', 'Saturation 76%, Brightness 82%');
      expect(within(panel).getByRole('slider', { name: 'Hue' })).toHaveAttribute('aria-valuenow', '217');
      expect(within(panel).getByRole('slider', { name: 'Opacity' })).toHaveAttribute('aria-valuenow', '100');
      expect(within(panel).getByRole('textbox', { name: 'Hex' })).toHaveValue('326fd1');
      expect(within(panel).getByRole('combobox', { name: 'Color format' })).toBeInTheDocument();
      expect(within(panel).getAllByRole('button', { name: /^Select color/ })).toHaveLength(11);
      expect(within(panel).getByRole('button', { name: 'Select color #326FD1' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('starts empty, shows the placeholder and falls back to black', async () => {
      const user = userEvent.setup();
      render(<ColorPicker aria-label="Picker" placeholder="Pick a color" defaultOpen />);
      expect(screen.getByPlaceholderText('Pick a color')).toHaveValue('');
      await screen.findByRole('group', { name: 'Color picker' });
      expect(area()).toHaveAttribute('aria-valuetext', 'Saturation 0%, Brightness 0%');
      expect(screen.getByRole('button', { name: 'Select color #326FD1' })).toHaveAttribute('aria-pressed', 'false');
      await user.keyboard('{Escape}');
    });

    it('emits the shared state hooks on the root', () => {
      const { container } = render(<Inline defaultValue="#fff" orientation="horizontal" defaultFormat="rgb" disabled readOnly invalid className="extra" />);
      const root = container.querySelector('.tk-color-picker')!;
      expect(root).toHaveAttribute('data-layout', 'horizontal');
      expect(root).toHaveAttribute('data-format', 'rgb');
      expect(root).toHaveAttribute('data-disabled', '');
      expect(root).toHaveAttribute('data-readonly', '');
      expect(root).toHaveAttribute('data-invalid', '');
      expect(root).toHaveClass('extra');
      expect(container.querySelector('.tk-color-picker-panel')).toHaveAttribute('data-layout', 'horizontal');
    });

    it('has no axe violations, inline and open', async () => {
      const { container, unmount } = render(<Inline defaultValue="#326fd180" />);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
      render(
        <Field>
          <Field.Label>Brand</Field.Label>
          <ColorPicker defaultValue="#326fd1" defaultOpen />
        </Field>,
      );
      await screen.findByRole('group', { name: 'Brand' });
      // The portalled panel sits outside any landmark in this bare test page.
      expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    });
  });

  describe('area', () => {
    it('moves saturation and brightness from the keyboard', () => {
      const onValueChange = vi.fn();
      const onValueChangeEnd = vi.fn();
      render(<Inline defaultValue="hsl(0, 100%, 50%)" onValueChange={onValueChange} onValueChangeEnd={onValueChangeEnd} />);
      const thumb = area();
      fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
      expect(thumb).toHaveAttribute('aria-valuenow', '99');
      fireEvent.keyDown(thumb, { key: 'ArrowLeft', shiftKey: true });
      expect(thumb).toHaveAttribute('aria-valuenow', '89');
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });
      expect(thumb).toHaveAttribute('aria-valuenow', '90');
      fireEvent.keyDown(thumb, { key: 'ArrowDown' });
      expect(thumb).toHaveAttribute('aria-valuetext', 'Saturation 90%, Brightness 99%');
      fireEvent.keyDown(thumb, { key: 'ArrowUp' });
      fireEvent.keyDown(thumb, { key: 'PageDown' });
      expect(thumb).toHaveAttribute('aria-valuetext', 'Saturation 90%, Brightness 90%');
      fireEvent.keyDown(thumb, { key: 'PageUp' });
      fireEvent.keyDown(thumb, { key: 'Home' });
      expect(thumb).toHaveAttribute('aria-valuenow', '0');
      fireEvent.keyDown(thumb, { key: 'End' });
      expect(thumb).toHaveAttribute('aria-valuenow', '100');
      fireEvent.keyDown(thumb, { key: 'ArrowRight' });
      fireEvent.keyDown(thumb, { key: 'a' });
      expect(onValueChange).toHaveBeenLastCalledWith('#ff0000');
      expect(onValueChangeEnd).toHaveBeenCalledTimes(onValueChange.mock.calls.length);
    });

    it('drags with the pointer and settles once', () => {
      const onValueChange = vi.fn();
      const onValueChangeEnd = vi.fn();
      const { container } = render(<Inline defaultValue="#ff0000" alpha={false} onValueChange={onValueChange} onValueChangeEnd={onValueChangeEnd} />);
      const plane = container.querySelector('.tk-color-picker-area')!;
      measure(plane);
      fireEvent.pointerDown(plane, { button: 0, pointerId: 1, clientX: 100, clientY: 50 });
      expect(area()).toHaveFocus();
      expect(area()).toHaveAttribute('data-dragging', '');
      fireEvent.pointerMove(plane, { pointerId: 2, clientX: 0, clientY: 0 });
      fireEvent.pointerMove(plane, { pointerId: 1, clientX: 400, clientY: 120 });
      expect(area()).toHaveAttribute('aria-valuetext', 'Saturation 100%, Brightness 0%');
      expect(onValueChangeEnd).not.toHaveBeenCalled();
      fireEvent.pointerUp(plane, { pointerId: 2 });
      fireEvent.pointerUp(plane, { pointerId: 1 });
      expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
      expect(onValueChangeEnd).toHaveBeenCalledWith('#000000');
      expect(onValueChange).toHaveBeenCalledWith('#804040');
      expect(area()).not.toHaveAttribute('data-dragging');
    });

    it('ends a drag on pointer cancel or lost capture, and ignores non-primary buttons', () => {
      const onValueChangeEnd = vi.fn();
      const onPointerDown = vi.fn();
      const { container } = render(
        <ColorPicker defaultValue="#ff0000" onValueChangeEnd={onValueChangeEnd}>
          <ColorPicker.Panel>
            <ColorPicker.Area onPointerDown={onPointerDown} />
          </ColorPicker.Panel>
        </ColorPicker>,
      );
      const plane = container.querySelector('.tk-color-picker-area')!;
      measure(plane, 0, 0);
      fireEvent.pointerDown(plane, { button: 2, pointerId: 1 });
      expect(area()).not.toHaveAttribute('data-dragging');
      fireEvent.pointerDown(plane, { button: 0, pointerId: 1, clientX: 10, clientY: 10 });
      fireEvent.pointerCancel(plane, { pointerId: 1 });
      expect(onValueChangeEnd).toHaveBeenCalledWith('#ffffff');
      fireEvent.pointerDown(plane, { button: 0, pointerId: 3 });
      fireEvent(plane, new Event('lostpointercapture', { bubbles: true }));
      fireEvent.lostPointerCapture(plane, { pointerId: 9 });
      fireEvent.lostPointerCapture(plane, { pointerId: 3 });
      expect(area()).not.toHaveAttribute('data-dragging');
      expect(onPointerDown).toHaveBeenCalled();
    });

    it('respects a consumer preventDefault and an unmounted node', () => {
      const onValueChange = vi.fn();
      const { container } = render(
        <ColorPicker onValueChange={onValueChange}>
          <ColorPicker.Panel>
            <ColorPicker.Area onPointerDown={event => event.preventDefault()} />
          </ColorPicker.Panel>
        </ColorPicker>,
      );
      fireEvent.pointerDown(container.querySelector('.tk-color-picker-area')!, { button: 0, pointerId: 1 });
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('tracks focus and stays still while disabled or read-only', () => {
      const onValueChange = vi.fn();
      const { container, rerender } = render(<Inline defaultValue="#ff0000" readOnly onValueChange={onValueChange} />);
      const thumb = area();
      fireEvent.focus(thumb);
      expect(thumb).toHaveAttribute('data-focus', '');
      fireEvent.blur(thumb);
      expect(thumb).not.toHaveAttribute('data-focus');
      fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
      fireEvent.pointerDown(container.querySelector('.tk-color-picker-area')!, { button: 0, pointerId: 1 });
      expect(thumb).toHaveAttribute('aria-readonly', 'true');
      rerender(<Inline defaultValue="#ff0000" disabled onValueChange={onValueChange} />);
      expect(area()).toHaveAttribute('aria-disabled', 'true');
      expect(area()).toHaveAttribute('tabindex', '-1');
      expect(container.querySelector('.tk-color-picker-area')).toHaveAttribute('data-disabled', '');
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('forwards refs on the area', () => {
      const objectRef = { current: null as HTMLDivElement | null };
      const fnRef = vi.fn();
      const { rerender } = render(
        <ColorPicker>
          <ColorPicker.Panel>
            <ColorPicker.Area ref={objectRef} />
          </ColorPicker.Panel>
        </ColorPicker>,
      );
      expect(objectRef.current).toHaveClass('tk-color-picker-area');
      rerender(
        <ColorPicker>
          <ColorPicker.Panel>
            <ColorPicker.Area ref={fnRef} />
          </ColorPicker.Panel>
        </ColorPicker>,
      );
      expect(fnRef).toHaveBeenCalled();
    });
  });

  describe('hue and alpha sliders', () => {
    it('change hue and alpha, keeping the rest of the color', () => {
      const onValueChange = vi.fn();
      const onValueChangeEnd = vi.fn();
      render(<Inline defaultValue="#ff0000" onValueChange={onValueChange} onValueChangeEnd={onValueChangeEnd} />);
      fireEvent.keyDown(hue(), { key: 'End' });
      expect(hue()).toHaveAttribute('aria-valuetext', '360°');
      fireEvent.keyDown(hue(), { key: 'Home' });
      fireEvent.keyDown(hue(), { key: 'PageUp' });
      expect(onValueChange).toHaveBeenLastCalledWith('#ff2a00');
      fireEvent.keyDown(opacity(), { key: 'PageDown' });
      expect(opacity()).toHaveAttribute('aria-valuetext', '90%');
      expect(onValueChange).toHaveBeenLastCalledWith('#ff2a00e6');
      expect(onValueChangeEnd).toHaveBeenLastCalledWith('#ff2a00e6');
    });

    it('stand upright in the horizontal layout', () => {
      render(<Inline orientation="horizontal" />);
      expect(hue()).toHaveAttribute('aria-orientation', 'vertical');
      expect(opacity()).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('drops the alpha controls and forces opacity with alpha off', () => {
      const onValueChange = vi.fn();
      render(<Inline defaultValue="#ff000080" alpha={false} onValueChange={onValueChange} />);
      expect(screen.queryByRole('slider', { name: 'Opacity' })).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: 'Opacity' })).not.toBeInTheDocument();
      fireEvent.keyDown(area(), { key: 'ArrowLeft' });
      expect(onValueChange).toHaveBeenLastCalledWith('#ff0303');
    });

    it('take their names from the picker, not a surrounding Field', () => {
      render(
        <Field>
          <Field.Label>Brand</Field.Label>
          <Inline />
        </Field>,
      );
      expect(hue()).not.toHaveAttribute('aria-labelledby');
      expect(screen.getByRole('textbox', { name: 'Hex' })).toBeInTheDocument();
    });
  });

  describe('channel fields', () => {
    it('commits hex on Enter and blur, rejects junk, and reverts on Escape', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Inline defaultValue="#ff0000" onValueChange={onValueChange} />);
      const hex = screen.getByRole('textbox', { name: 'Hex' });
      await user.clear(hex);
      await user.type(hex, '00f{Enter}');
      expect(onValueChange).toHaveBeenLastCalledWith('#0000ff');
      await user.clear(hex);
      await user.type(hex, 'zz{Enter}');
      expect(hex).toHaveValue('0000ff');
      await user.clear(hex);
      await user.type(hex, '#0f08');
      await user.tab();
      expect(onValueChange).toHaveBeenLastCalledWith('#00ff0088');
      await user.click(hex);
      await user.keyboard('{Backspace}1');
      await user.keyboard('{Escape}');
      expect(hex).toHaveValue('00ff00');
      await user.clear(hex);
      await user.tab();
      expect(hex).toHaveValue('00ff00');
      await user.click(hex);
      await user.keyboard('{Escape}');
    });

    it('keeps alpha when a six-digit hex is typed', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Inline defaultValue="#ff000080" onValueChange={onValueChange} />);
      const hex = screen.getByRole('textbox', { name: 'Hex' });
      await user.clear(hex);
      await user.type(hex, '00ff00{Enter}');
      expect(onValueChange).toHaveBeenLastCalledWith('#00ff0080');
    });

    it('edits RGB channels by typing and stepping', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Inline defaultValue="#000000" format="rgb" onValueChange={onValueChange} />);
      const red = screen.getByRole('textbox', { name: 'Red' });
      await user.clear(red);
      await user.type(red, '300{Enter}');
      expect(onValueChange).toHaveBeenLastCalledWith('rgb(255, 0, 0)');
      await user.clear(red);
      await user.type(red, 'abc{Enter}');
      expect(red).toHaveValue('255');
      const green = screen.getByRole('textbox', { name: 'Green' });
      fireEvent.keyDown(green, { key: 'ArrowUp', shiftKey: true });
      expect(onValueChange).toHaveBeenLastCalledWith('rgb(255, 10, 0)');
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Blue' }), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Blue' }), { key: 'ArrowUp' });
      expect(onValueChange).toHaveBeenLastCalledWith('rgb(255, 10, 1)');
      const alpha = screen.getByRole('textbox', { name: 'Opacity' });
      await user.clear(alpha);
      await user.type(alpha, '50%{Enter}');
      expect(onValueChange).toHaveBeenLastCalledWith('rgba(255, 10, 1, 0.5)');
    });

    it('edits HSL channels and keeps a typed hue on a grey', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Inline defaultValue="hsl(0, 0%, 50%)" format="hsl" onValueChange={onValueChange} />);
      const h = screen.getByRole('textbox', { name: 'Hue' });
      await user.clear(h);
      await user.type(h, '120°{Enter}');
      expect(hue()).toHaveAttribute('aria-valuenow', '120');
      const s = screen.getByRole('textbox', { name: 'Saturation' });
      await user.clear(s);
      await user.type(s, '100{Enter}');
      expect(onValueChange).toHaveBeenLastCalledWith('hsl(120, 100%, 50%)');
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Lightness' }), { key: 'ArrowDown' });
      expect(onValueChange).toHaveBeenLastCalledWith('hsl(120, 100%, 49%)');
    });

    it('does not step while read-only', () => {
      const onValueChange = vi.fn();
      render(<Inline defaultValue="#000" format="rgb" readOnly onValueChange={onValueChange} />);
      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Red' }), { key: 'ArrowUp' });
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('format', () => {
    it('re-serializes the value when the select changes the notation', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onFormatChange = vi.fn();
      const onValueChangeEnd = vi.fn();
      const { container } = render(<Inline defaultValue="#ff0000" onValueChange={onValueChange} onFormatChange={onFormatChange} onValueChangeEnd={onValueChangeEnd} />);
      await user.click(screen.getByRole('combobox', { name: 'Color format' }));
      await user.click(await screen.findByRole('option', { name: 'RGB' }));
      expect(onFormatChange).toHaveBeenCalledWith('rgb');
      expect(onValueChange).toHaveBeenCalledWith('rgb(255, 0, 0)');
      expect(onValueChangeEnd).toHaveBeenCalledWith('rgb(255, 0, 0)');
      expect(container.querySelector('.tk-color-picker')).toHaveAttribute('data-format', 'rgb');
      await user.click(screen.getByRole('combobox', { name: 'Color format' }));
      await user.click(await screen.findByRole('option', { name: 'RGB' }));
      expect(onFormatChange).toHaveBeenCalledTimes(1);
    });

    it('keeps an empty value empty when the notation changes', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Inline onValueChange={onValueChange} />);
      await user.click(screen.getByRole('combobox', { name: 'Color format' }));
      await user.click(await screen.findByRole('option', { name: 'HSL' }));
      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole('textbox', { name: 'Lightness' })).toHaveValue('0');
    });

    it('re-serializes when a controlled format changes and the color matches already', () => {
      const onValueChangeEnd = vi.fn();
      const Demo = () => {
        const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
        return (
          <>
            <button type="button" onClick={() => setFormat('hsl')}>
              hsl
            </button>
            <Inline defaultValue="#ff0000" format={format} onValueChangeEnd={onValueChangeEnd} />
          </>
        );
      };
      render(<Demo />);
      fireEvent.click(screen.getByText('hsl'));
      expect(screen.getByRole('textbox', { name: 'Hue' })).toHaveValue('0');
      expect(onValueChangeEnd).toHaveBeenCalledWith('hsl(0, 100%, 50%)');
    });
  });

  it('leaves the value alone when a controlled format declines the select', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onFormatChange = vi.fn();
    render(<Inline defaultValue="#ff0000" format="rgb" onValueChange={onValueChange} onFormatChange={onFormatChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Color format' }));
    await user.click(await screen.findByRole('option', { name: 'HSL' }));
    expect(onFormatChange).toHaveBeenCalledWith('hsl');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Red' })).toHaveValue('255');
  });

  describe('value model', () => {
    it('follows a controlled value and keeps hue through grey', () => {
      const { rerender } = render(<Inline value="hsl(200, 50%, 50%)" />);
      expect(hue()).toHaveAttribute('aria-valuenow', '200');
      rerender(<Inline value="#808080" />);
      expect(hue()).toHaveAttribute('aria-valuenow', '200');
      rerender(<Inline value="not a color" />);
      expect(hue()).toHaveAttribute('aria-valuenow', '200');
      rerender(<Inline value="#00ff00" />);
      expect(hue()).toHaveAttribute('aria-valuenow', '120');
    });

    it('snaps back when a controlled parent declines a change', () => {
      const onValueChange = vi.fn();
      render(<Inline value="#ff0000" onValueChange={onValueChange} />);
      fireEvent.keyDown(area(), { key: 'Home' });
      expect(onValueChange).toHaveBeenCalledWith('#ffffff');
      expect(area()).toHaveAttribute('aria-valuenow', '100');
    });

    it('commits nothing when a change serializes to the same value', () => {
      const onValueChange = vi.fn();
      const onValueChangeEnd = vi.fn();
      render(<Inline defaultValue="#ff0000" onValueChange={onValueChange} onValueChangeEnd={onValueChangeEnd} />);
      fireEvent.keyDown(area(), { key: 'End' });
      expect(onValueChange).not.toHaveBeenCalled();
      expect(onValueChangeEnd).not.toHaveBeenCalled();
    });

    it('submits through a hidden input, and nothing while disabled', () => {
      const { container, rerender } = render(<Inline defaultValue="#ff0000" name="brand" form="f" />);
      const hidden = container.querySelector('input[type="hidden"]')!;
      expect(hidden).toHaveAttribute('name', 'brand');
      expect(hidden).toHaveValue('#ff0000');
      expect(hidden).toHaveAttribute('form', 'f');
      rerender(<Inline defaultValue="#ff0000" name="brand" disabled />);
      expect(container.querySelector('input[type="hidden"]')).toBeNull();
    });

    it('takes labels from the provider and the instance, ignoring blanks', () => {
      render(
        <TakeoffSparProvider components={{ ColorPicker: { defaultProps: { labels: { hue: 'Ton' } } } }}>
          <Inline labels={{ area: 'Renk', alpha: ' ' }} />
        </TakeoffSparProvider>,
      );
      expect(screen.getByRole('slider', { name: 'Renk' })).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: 'Ton' })).toBeInTheDocument();
      expect(opacity()).toBeInTheDocument();
    });
  });

  describe('trigger field and popover', () => {
    const Picker = (props: Parameters<typeof ColorPicker>[0]) => (
      <Field>
        <Field.Label>Brand</Field.Label>
        <ColorPicker {...props} />
      </Field>
    );

    it('commits typed text in any notation and rejects junk', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Picker defaultValue="#ff0000" onValueChange={onValueChange} />);
      await user.clear(field());
      await user.type(field(), 'rgb(0, 0, 255){Enter}');
      expect(onValueChange).toHaveBeenLastCalledWith('#0000ff');
      expect(field()).toHaveValue('#0000ff');
      await user.clear(field());
      await user.type(field(), 'nope{Enter}');
      expect(field()).toHaveValue('#0000ff');
      await user.keyboard('x');
      await user.keyboard('{Escape}');
      expect(field()).toHaveValue('#0000ff');
      await user.clear(field());
      await user.tab();
      expect(field()).toHaveValue('#0000ff');
    });

    it('opens from a click keeping focus in the field, and stays open on field clicks', async () => {
      const user = userEvent.setup();
      render(<Picker defaultValue="#ff0000" />);
      await user.click(field());
      await screen.findByRole('group', { name: 'Brand' });
      expect(field()).toHaveFocus();
      await user.click(field());
      expect(screen.getByRole('group', { name: 'Brand' })).toBeInTheDocument();
      fireEvent.click(field(), { button: 1 });
      await user.click(document.body);
      await waitFor(() => expect(screen.queryByRole('group', { name: 'Brand' })).not.toBeInTheDocument());
    });

    it('opens with ArrowDown and moves focus into the panel from the chevron', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<Picker defaultValue="#ff0000" onOpenChange={onOpenChange} />);
      field().focus();
      await user.keyboard('{ArrowDown}');
      expect(onOpenChange).toHaveBeenCalledWith(true);
      await user.keyboard('{ArrowDown}');
      expect(onOpenChange).toHaveBeenCalledTimes(1);
    });

    it('restores the opened value on Escape', async () => {
      const user = userEvent.setup();
      const onValueChangeEnd = vi.fn();
      render(<Picker defaultValue="#ff0000" onValueChangeEnd={onValueChangeEnd} />);
      await user.click(screen.getByRole('button', { name: 'Open color picker' }));
      await screen.findByRole('group', { name: 'Brand' });
      fireEvent.keyDown(area(), { key: 'Home' });
      expect(field()).toHaveValue('#ffffff');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('group', { name: 'Brand' })).not.toBeInTheDocument());
      expect(field()).toHaveValue('#ff0000');
      expect(area).toThrow();
      expect(onValueChangeEnd).toHaveBeenLastCalledWith('#ff0000');
    });

    it('closes on Escape without restoring when nothing changed, and keeps consumer vetoes', async () => {
      const user = userEvent.setup();
      const onValueChangeEnd = vi.fn();
      const onEscapeKeyDown = vi.fn((event: KeyboardEvent) => event.preventDefault());
      const { rerender } = render(
        <ColorPicker defaultValue="#ff0000" onValueChangeEnd={onValueChangeEnd} defaultOpen aria-label="x">
          <ColorPicker.Input aria-label="Field" />
          <ColorPicker.Content onEscapeKeyDown={onEscapeKeyDown} onOpenAutoFocus={vi.fn()} onInteractOutside={vi.fn()}>
            <ColorPicker.Panel aria-label="Custom panel" />
          </ColorPicker.Content>
        </ColorPicker>,
      );
      await screen.findByRole('group', { name: 'Custom panel' });
      await user.keyboard('{Escape}');
      expect(screen.getByRole('group', { name: 'Custom panel' })).toBeInTheDocument();
      rerender(
        <ColorPicker defaultValue="#ff0000" onValueChangeEnd={onValueChangeEnd} defaultOpen>
          <ColorPicker.Input />
          <ColorPicker.Content>
            <ColorPicker.Panel aria-labelledby="nowhere" />
          </ColorPicker.Content>
        </ColorPicker>,
      );
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('group')).not.toBeInTheDocument());
      expect(onValueChangeEnd).not.toHaveBeenCalled();
    });

    it('cannot open while read-only or disabled, and a disabled Field closes it', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Picker defaultValue="#ff0000" readOnly />);
      await user.click(field());
      await user.click(screen.getByRole('button', { name: 'Open color picker' }));
      expect(screen.queryByRole('group', { name: 'Brand' })).not.toBeInTheDocument();
      rerender(
        <Field disabled>
          <Field.Label>Brand</Field.Label>
          <ColorPicker defaultValue="#ff0000" open />
        </Field>,
      );
      expect(field()).toBeDisabled();
      expect(screen.queryByRole('group', { name: 'Brand' })).not.toBeInTheDocument();
    });

    it('inherits invalid and required from the Field', () => {
      render(
        <Field invalid required>
          <Field.Label>Brand</Field.Label>
          <ColorPicker />
        </Field>,
      );
      expect(field()).toHaveAttribute('aria-invalid', 'true');
      expect(field()).toBeRequired();
    });

    it('forwards refs and paints the preview dot', () => {
      const objectRef = { current: null as HTMLDivElement | null };
      const fnRef = vi.fn();
      const { container, rerender } = render(
        <ColorPicker defaultValue="#ff000080">
          <ColorPicker.Input ref={objectRef} aria-label="a" />
        </ColorPicker>,
      );
      expect(objectRef.current).toHaveClass('tk-color-picker-input');
      expect((container.querySelector('.tk-color-picker-input-preview') as HTMLElement).style.getPropertyValue('--tk-color-picker-color')).toBe('rgba(255, 0, 0, 0.5)');
      rerender(
        <ColorPicker>
          <ColorPicker.Input ref={fnRef} aria-label="a" />
        </ColorPicker>,
      );
      expect(fnRef).toHaveBeenCalled();
    });
  });

  describe('swatches', () => {
    it('select their color and mark it pressed', async () => {
      const user = userEvent.setup();
      const onValueChangeEnd = vi.fn();
      const onClick = vi.fn();
      render(
        <ColorPicker onValueChangeEnd={onValueChangeEnd}>
          <ColorPicker.Panel>
            <ColorPicker.Swatches>
              <ColorPicker.Swatch value="#00ff00" onClick={onClick} />
              <ColorPicker.Swatch value="#0000ff" onClick={event => event.preventDefault()} />
              <ColorPicker.Swatch value="bogus" />
            </ColorPicker.Swatches>
          </ColorPicker.Panel>
        </ColorPicker>,
      );
      await user.click(screen.getByRole('button', { name: 'Select color #00ff00' }));
      expect(onValueChangeEnd).toHaveBeenCalledWith('#00ff00');
      expect(onClick).toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Select color #00ff00' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Select color #00ff00' })).toHaveAttribute('data-selected', '');
      await user.click(screen.getByRole('button', { name: 'Select color #0000ff' }));
      expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Select color bogus' })).toBeDisabled();
    });

    it('take the root list, render nothing for an empty one, and disable with the picker', () => {
      const { container, rerender } = render(<Inline swatches={['#123456']} disabled />);
      expect(screen.getByRole('button', { name: 'Select color #123456' })).toBeDisabled();
      rerender(<Inline swatches={[]} />);
      expect(container.querySelector('.tk-color-picker-swatches')).toBeNull();
    });
  });

  describe('eyedropper', () => {
    it('renders nothing without the EyeDropper API', () => {
      const { container } = render(<Inline />);
      expect(container.querySelector('.tk-color-picker-eye-dropper')).toBeNull();
    });

    it('commits the picked color and ignores a dismissed picker', async () => {
      const open = vi.fn().mockResolvedValueOnce({ sRGBHex: '#123456' }).mockRejectedValueOnce(new Error('AbortError'));
      (window as { EyeDropper?: unknown }).EyeDropper = class {
        open = open;
      };
      const user = userEvent.setup();
      const onValueChangeEnd = vi.fn();
      render(<Inline onValueChangeEnd={onValueChangeEnd} />);
      const button = await screen.findByRole('button', { name: 'Pick a color from the screen' });
      await user.click(button);
      await waitFor(() => expect(onValueChangeEnd).toHaveBeenCalledWith('#123456'));
      await act(async () => {
        await user.click(button);
      });
      expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
    });

    it('honours a consumer preventDefault, custom content and disabled state', async () => {
      const open = vi.fn();
      (window as { EyeDropper?: unknown }).EyeDropper = class {
        open = open;
      };
      const user = userEvent.setup();
      const { rerender } = render(
        <ColorPicker>
          <ColorPicker.Panel>
            <ColorPicker.EyeDropper onClick={event => event.preventDefault()}>pick</ColorPicker.EyeDropper>
          </ColorPicker.Panel>
        </ColorPicker>,
      );
      await user.click(await screen.findByRole('button', { name: 'Pick a color from the screen' }));
      expect(open).not.toHaveBeenCalled();
      rerender(
        <ColorPicker readOnly>
          <ColorPicker.Panel>
            <ColorPicker.EyeDropper />
          </ColorPicker.Panel>
        </ColorPicker>,
      );
      expect(screen.getByRole('button', { name: 'Pick a color from the screen' })).toBeDisabled();
    });
  });

  it('throws when a part is used outside the root', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ColorPicker.Preview />)).toThrow(/ColorPicker.Preview must be used within ColorPicker/);
    vi.restoreAllMocks();
  });
});
