import { createRef, type KeyboardEvent, type PointerEvent } from 'react';
import { act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { renderWithProvider as render, screen } from '../../test-utils';

import { Field } from '../field';

import { Slider } from './index';
import { resetSliderDevWarnings } from './Slider';
import { resetSliderTicksDevWarnings } from './SliderTicks';

// The two dev warnings dedupe through module-level sets, so a warning fired in
// one case would otherwise silently no-op in the next. Reset before each case
// so the console-warn assertions stay independent of test order.
beforeEach(() => {
  resetSliderDevWarnings();
  resetSliderTicksDevWarnings();
});

// jsdom gives every element a zero-sized box, so the pointer path needs a
// measurable rail before a clientX can map onto the value scale.
const measureTrack = (container: HTMLElement, width = 200) => {
  const track = container.querySelector('.tk-slider-track') as HTMLElement;
  track.getBoundingClientRect = () =>
    ({
      left: 0,
      width,
      right: width,
      top: 0,
      bottom: 10,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
  return track;
};

// A vertical rail runs bottom-to-top, so the stub puts its bottom edge at 200
// and its top at 0 — a clientY of 50 is therefore 75% of the way up.
const measureVerticalTrack = (container: HTMLElement, height = 200) => {
  const track = container.querySelector('.tk-slider-track') as HTMLElement;
  track.getBoundingClientRect = () =>
    ({
      left: 0,
      width: 10,
      right: 10,
      top: 0,
      bottom: height,
      height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
  return track;
};

describe('Slider (compound)', () => {
  describe('rendering', () => {
    it('renders the default anatomy — track wrapping the range and one thumb', () => {
      const { container } = render(<Slider defaultValue={40} />);

      const root = container.querySelector('.tk-slider');
      expect(root).toHaveAttribute('data-slot', 'root');

      const track = root?.querySelector('div.tk-slider-track[data-slot="root"]');
      expect(track?.parentElement).toBe(root);

      expect(track?.querySelector('span.tk-slider-range[data-slot="root"]')).not.toBeNull();
      expect(track?.querySelectorAll('span.tk-slider-thumb[data-slot="root"]')).toHaveLength(1);
    });

    it('renders two thumbs and groups them when range is set', () => {
      render(<Slider range defaultValue={[20, 60]} />);

      expect(screen.getAllByRole('slider')).toHaveLength(2);
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('renders no indicator below the track by default', () => {
      const { container } = render(<Slider min={10} max={90} />);

      expect(container.querySelector('.tk-slider-ticks')).toBeNull();
      // The track is the whole default anatomy.
      expect(container.querySelector('.tk-slider')?.children).toHaveLength(1);
    });

    it('renders ticks when they are composed in', () => {
      const { container } = render(
        <Slider min={0} max={40} step={10}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb />
          </Slider.Track>
          <Slider.Ticks />
        </Slider>,
      );

      expect(container.querySelectorAll('.tk-slider-tick')).toHaveLength(5);
    });

    it('supports an explicitly composed anatomy', () => {
      const { container } = render(
        <Slider defaultValue={30}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>,
      );

      expect(container.querySelector('.tk-slider-track .tk-slider-thumb')).not.toBeNull();
      expect(screen.getAllByRole('slider')).toHaveLength(1);
    });

    it('spans the fill across the outermost thumbs of a multi-thumb range', () => {
      const { container } = render(<Slider range defaultValue={[20, 50, 90]} />);

      const fill = container.querySelector('.tk-slider-range') as HTMLElement;
      expect(fill.style.insetInlineStart).toBe('20%');
      expect(fill.style.width).toBe('70%');
    });

    it('writes the thumb offset and the range geometry inline', () => {
      const { container } = render(<Slider range defaultValue={[25, 75]} />);

      const range = container.querySelector('.tk-slider-range') as HTMLElement;
      expect(range.style.insetInlineStart).toBe('25%');
      expect(range.style.width).toBe('50%');

      const [first, second] = screen.getAllByRole('slider');
      expect(first.style.insetInlineStart).toBe('25%');
      expect(second.style.insetInlineStart).toBe('75%');
    });

    it('keeps the tick at max when a decimal step divides the range', () => {
      const { container } = render(
        <Slider min={0} max={1} step={0.1}>
          <Slider.Ticks />
        </Slider>,
      );

      // 0, 0.1, … 1.0 = 11 marks. IEEE-754 error in (max - min) / step
      // (1 / 0.1 === 9.999999999999998) must not drop the last tick at `max`.
      expect(container.querySelectorAll('.tk-slider-tick')).toHaveLength(11);
    });

    it('drops ticks past the density cap with a dev warning', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { container } = render(
        <Slider min={0} max={100} step={0.1}>
          <Slider.Ticks />
        </Slider>,
      );

      expect(container.querySelectorAll('.tk-slider-tick')).toHaveLength(0);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('at most'));
      warn.mockRestore();
    });

    it('floors an off-grid max to the last whole step rather than rounding past it', () => {
      const { container } = render(
        <Slider min={0} max={10} step={4}>
          <Slider.Ticks />
        </Slider>,
      );

      // 10 / 4 = 2.5 steps: only 0, 4 and 8 sit on the grid, so no mark is drawn
      // past the last reachable step (a rounded count would add a fourth at 12).
      const ticks = container.querySelectorAll<HTMLElement>('.tk-slider-tick');
      expect(Array.from(ticks, tick => tick.style.insetInlineStart)).toEqual(['0%', '40%', '80%']);
    });

    it('warns about a too-dense grid once, however often the slider re-renders', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { container, rerender } = render(
        <Slider min={0} max={100} step={0.1}>
          <Slider.Ticks />
        </Slider>,
      );
      rerender(
        <Slider min={0} max={100} step={0.05}>
          <Slider.Ticks />
        </Slider>,
      );

      expect(container.querySelectorAll('.tk-slider-tick')).toHaveLength(0);
      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });

    it('forwards refs to the track and thumb without detaching the internal wiring', () => {
      const trackRef = createRef<HTMLDivElement>();
      const thumbRef = vi.fn();
      const onChange = vi.fn();
      const { container, unmount } = render(
        <Slider min={0} max={100} step={1} defaultValue={0} onValueChange={onChange}>
          <Slider.Track ref={trackRef}>
            <Slider.Range />
            <Slider.Thumb ref={thumbRef} />
          </Slider.Track>
        </Slider>,
      );

      expect(trackRef.current).toBe(container.querySelector('.tk-slider-track'));
      expect(thumbRef).toHaveBeenCalledWith(screen.getByRole('slider'));

      // The consumer ref sits beside the root's own measurement ref rather than
      // replacing it: press-to-seek still reads the rail.
      fireEvent.pointerDown(measureTrack(container), { clientX: 150, button: 0 });
      fireEvent.pointerUp(document);
      expect(onChange).toHaveBeenCalledWith(75);
      unmount();

      // The other ref form on each part.
      const trackCallback = vi.fn();
      const thumbObject = createRef<HTMLSpanElement>();
      const { container: swapped } = render(
        <Slider defaultValue={10}>
          <Slider.Track ref={trackCallback}>
            <Slider.Thumb ref={thumbObject} />
          </Slider.Track>
        </Slider>,
      );

      expect(trackCallback).toHaveBeenCalledWith(swapped.querySelector('.tk-slider-track'));
      expect(thumbObject.current).toBe(screen.getByRole('slider'));
    });
  });

  describe('value model', () => {
    it('clamps and snaps an out-of-range, off-grid value', () => {
      render(<Slider min={0} max={100} step={10} defaultValue={137} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '100');

      render(<Slider min={0} max={100} step={10} defaultValue={23} />);
      expect(screen.getAllByRole('slider')[1]).toHaveAttribute('aria-valuenow', '20');
    });

    it('orders a reversed range tuple ascending', () => {
      render(<Slider range defaultValue={[80, 20]} />);

      const [first, second] = screen.getAllByRole('slider');
      expect(first).toHaveAttribute('aria-valuenow', '20');
      expect(second).toHaveAttribute('aria-valuenow', '80');
    });

    it('renders one thumb per value and commits every entry', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider range min={0} max={100} step={10} defaultValue={[20, 50, 80]} onValueChange={onChange} />);

      const thumbs = screen.getAllByRole('slider');
      expect(thumbs).toHaveLength(3);
      expect(thumbs.map(t => t.getAttribute('aria-valuenow'))).toEqual(['20', '50', '80']);

      act(() => thumbs[1].focus());
      await user.keyboard('{ArrowRight}');

      // The middle handle's value must survive the commit — the whole array is
      // reported, not just the outer pair.
      expect(onChange).toHaveBeenCalledWith([20, 60, 80]);
    });

    it('clamps a middle thumb between both of its neighbours', async () => {
      const user = userEvent.setup();
      render(<Slider range min={0} max={100} step={10} defaultValue={[30, 40, 50]} />);

      const [, middle] = screen.getAllByRole('slider');
      act(() => middle.focus());

      await user.keyboard('{End}');
      expect(middle).toHaveAttribute('aria-valuenow', '50');

      await user.keyboard('{Home}');
      expect(middle).toHaveAttribute('aria-valuenow', '30');
    });

    it('sorts an unordered multi-thumb seed ascending', () => {
      render(<Slider range defaultValue={[70, 10, 40]} />);

      expect(screen.getAllByRole('slider').map(t => t.getAttribute('aria-valuenow'))).toEqual(['10', '40', '70']);
    });

    it('names handles positionally past two, and marks only the outer ones', () => {
      render(<Slider range defaultValue={[20, 50, 80]} />);
      const thumbs = screen.getAllByRole('slider');

      expect(thumbs[0]).toHaveAccessibleName('Value 1');
      expect(thumbs[1]).toHaveAccessibleName('Value 2');

      expect(thumbs[0]).toHaveAttribute('data-thumb', 'min');
      expect(thumbs[2]).toHaveAttribute('data-thumb', 'max');
      // A middle handle is neither end, so it carries no misleading value.
      expect(thumbs[1]).not.toHaveAttribute('data-thumb');
    });

    it('keeps the minimum/maximum naming for a two-handle range', () => {
      render(<Slider range defaultValue={[20, 80]} />);
      const [first, second] = screen.getAllByRole('slider');

      expect(first).toHaveAccessibleName('Minimum');
      expect(second).toHaveAccessibleName('Maximum');
    });

    it('bounds each range thumb by its neighbour in the ARIA surface', () => {
      render(<Slider range min={0} max={100} defaultValue={[30, 70]} />);

      const [first, second] = screen.getAllByRole('slider');
      expect(first).toHaveAttribute('aria-valuemin', '0');
      expect(first).toHaveAttribute('aria-valuemax', '70');
      expect(second).toHaveAttribute('aria-valuemin', '30');
      expect(second).toHaveAttribute('aria-valuemax', '100');
    });

    it('falls back to a valid range when max is not above min', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<Slider min={50} max={10} />);

      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemax', '150');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('must be greater than'));
      warn.mockRestore();
    });

    it('warns about an inverted range once, however often the slider re-renders', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { rerender } = render(<Slider min={50} max={10} />);
      rerender(<Slider min={50} max={20} />);
      rerender(<Slider min={50} max={30} />);

      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemax', '150');
      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });

    it('falls back to the defaults for a non-finite min, a non-positive step, and a non-finite value', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<Slider min={Number.NaN} max={50} step={0} defaultValue={7.4} />);

      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuemin', '0');
      expect(thumb).toHaveAttribute('aria-valuemax', '50');
      // Snapped onto the default step of 1, which the keyboard then moves by.
      expect(thumb).toHaveAttribute('aria-valuenow', '7');
      act(() => thumb.focus());
      await user.keyboard('{ArrowRight}');
      expect(thumb).toHaveAttribute('aria-valuenow', '8');
      unmount();

      // A non-finite value never reaches the ARIA surface or the offsets.
      render(<Slider min={10} max={50} defaultValue={Number.NaN} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '10');
      expect(screen.getByRole('slider').style.insetInlineStart).toBe('0%');
    });

    it('keeps the precision of a tiny step that stringifies in exponent form', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Slider aria-label="Coarse" min={0} max={0.000001} step={1e-7} defaultValue={3e-7} />
          <Slider aria-label="Fine" min={0} max={0.000001} step={2.5e-7} defaultValue={5e-7} />
        </>,
      );

      // `1e-7` has no decimal point to count, so reading the precision off the
      // plain notation alone would round every value on this grid down to 0.
      expect(screen.getByRole('slider', { name: 'Coarse' })).toHaveAttribute('aria-valuenow', '3e-7');

      const fine = screen.getByRole('slider', { name: 'Fine' });
      expect(fine).toHaveAttribute('aria-valuenow', '5e-7');
      act(() => fine.focus());
      await user.keyboard('{ArrowRight}');
      expect(fine).toHaveAttribute('aria-valuenow', '7.5e-7');
    });

    it('renders the committed value through Slider.Value', () => {
      const { container } = render(
        <Slider defaultValue={40}>
          <Slider.Track>
            <Slider.Thumb />
          </Slider.Track>
          <Slider.Value />
        </Slider>,
      );

      const readout = container.querySelector('.tk-slider-value');
      expect(readout).toHaveTextContent('40');
      // Decorative — the value is announced through the thumb instead.
      expect(readout).toHaveAttribute('aria-hidden', 'true');
    });

    it('joins both range values and applies formatValue in the readout', () => {
      const { container } = render(
        <Slider range defaultValue={[20, 80]} formatValue={value => `$${value}`}>
          <Slider.Value />
        </Slider>,
      );

      expect(container.querySelector('.tk-slider-value')).toHaveTextContent('$20 – $80');
    });

    it('hands the live values to Slider.Value function-children', async () => {
      const user = userEvent.setup();
      render(
        <Slider min={0} max={100} step={10} defaultValue={30}>
          <Slider.Track>
            <Slider.Thumb />
          </Slider.Track>
          <Slider.Value>{({ values, range }) => `${values[0]}${range ? '+' : ''} of 100`}</Slider.Value>
        </Slider>,
      );

      expect(screen.getByText('30 of 100')).toBeInTheDocument();

      // The readout tracks an uncontrolled slider without the consumer
      // holding the value — the gap this part exists to close.
      act(() => screen.getByRole('slider').focus());
      await user.keyboard('{ArrowRight}');
      expect(screen.getByText('40 of 100')).toBeInTheDocument();
    });

    it('renders the default value bubble parented to the thumb', () => {
      const { container } = render(<Slider defaultValue={40} formatValue={value => `${value}%`} />);

      // The default bubble is a CSS-positioned node inside the thumb (not a
      // portalled Tooltip). It stays in the DOM and the recipe reveals it on
      // drag/focus, so it is queried by class and is deliberately aria-hidden.
      const bubble = container.querySelector('.tk-slider-tooltip');
      expect(bubble).toHaveAttribute('data-slot', 'tooltip');
      expect(bubble).toHaveAttribute('aria-hidden', 'true');
      expect(bubble).toHaveTextContent('40%');
      expect(bubble?.parentElement).toBe(screen.getByRole('slider'));
    });

    it('replaces the bubble content with a plain node, keeping the handle and chrome', () => {
      const { container } = render(
        <Slider defaultValue={40}>
          <Slider.Track>
            <Slider.Thumb>
              <span data-testid="custom">custom</span>
            </Slider.Thumb>
          </Slider.Track>
        </Slider>,
      );

      const bubble = container.querySelector('.tk-slider-tooltip');
      // The bubble chrome (and its aria-hidden) survives; only the content swaps.
      expect(bubble).toHaveAttribute('aria-hidden', 'true');
      expect(bubble?.querySelector('[data-testid="custom"]')).toHaveTextContent('custom');
      // The handle still works.
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '40');
    });

    it('feeds the thumb state to a function child and reacts to the drag', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Slider min={0} max={100} step={5} defaultValue={40} formatValue={value => `${value}%`}>
          <Slider.Track>
            <Slider.Thumb>{({ formatted, index, isFocused }) => `${formatted}/${index}/${String(isFocused)}`}</Slider.Thumb>
          </Slider.Track>
        </Slider>,
      );

      const bubble = container.querySelector('.tk-slider-tooltip');
      expect(bubble).toHaveTextContent('40%/0/false');

      const thumb = screen.getByRole('slider');
      await user.tab();
      expect(thumb).toHaveFocus();
      expect(bubble).toHaveTextContent('40%/0/true');

      await user.keyboard('{ArrowRight}');
      expect(thumb).toHaveAttribute('aria-valuenow', '45');
      expect(bubble).toHaveTextContent('45%/0/true');
    });

    it('formats the default bubble and aria-valuetext through formatValue', () => {
      const { container } = render(<Slider defaultValue={40} formatValue={value => `%${value}`} />);

      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '%40');
      expect(container.querySelector('.tk-slider-tooltip')).toHaveTextContent('%40');
    });
  });

  describe('keyboard', () => {
    it('moves by step, page, and to the bounds', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider min={0} max={100} step={5} defaultValue={50} onValueChange={onChange} />);

      const thumb = screen.getByRole('slider');
      await user.tab();
      expect(thumb).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(thumb).toHaveAttribute('aria-valuenow', '55');

      await user.keyboard('{ArrowLeft}{ArrowLeft}');
      expect(thumb).toHaveAttribute('aria-valuenow', '45');

      await user.keyboard('{PageUp}');
      expect(thumb).toHaveAttribute('aria-valuenow', '95');

      await user.keyboard('{PageDown}');
      expect(thumb).toHaveAttribute('aria-valuenow', '45');

      await user.keyboard('{Home}');
      expect(thumb).toHaveAttribute('aria-valuenow', '0');

      await user.keyboard('{End}');
      expect(thumb).toHaveAttribute('aria-valuenow', '100');
    });

    it('does not move past a neighbouring thumb', async () => {
      const user = userEvent.setup();
      render(<Slider range min={0} max={100} step={10} defaultValue={[40, 50]} />);

      const [first] = screen.getAllByRole('slider');
      act(() => first.focus());

      await user.keyboard('{ArrowRight}');
      expect(first).toHaveAttribute('aria-valuenow', '50');

      // Already resting against its neighbour — the next press is a no-op.
      await user.keyboard('{ArrowRight}');
      expect(first).toHaveAttribute('aria-valuenow', '50');

      await user.keyboard('{End}');
      expect(first).toHaveAttribute('aria-valuenow', '50');
    });

    it('stays put while disabled or read-only', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      const { unmount } = render(<Slider defaultValue={30} disabled onValueChange={onChange} />);
      act(() => screen.getByRole('slider').focus());
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
      unmount();

      render(<Slider defaultValue={30} readOnly onValueChange={onChange} />);
      act(() => screen.getByRole('slider').focus());
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('moves with ArrowUp / ArrowDown on a horizontal slider', async () => {
      const user = userEvent.setup();
      render(<Slider min={0} max={100} step={5} defaultValue={50} />);

      const thumb = screen.getByRole('slider');
      act(() => thumb.focus());

      await user.keyboard('{ArrowUp}');
      expect(thumb).toHaveAttribute('aria-valuenow', '55');

      await user.keyboard('{ArrowDown}{ArrowDown}');
      expect(thumb).toHaveAttribute('aria-valuenow', '45');
    });

    it('runs a consumer onKeyDown and honours its preventDefault', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn((event: KeyboardEvent) => event.preventDefault());
      render(
        <Slider min={0} max={100} step={10} defaultValue={30}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb onKeyDown={onKeyDown} />
          </Slider.Track>
        </Slider>,
      );

      const thumb = screen.getByRole('slider');
      act(() => thumb.focus());
      await user.keyboard('{ArrowRight}');

      // The consumer handler ran, and because it preventDefault-ed, the slider's
      // own key handling bailed and the value never moved.
      expect(onKeyDown).toHaveBeenCalled();
      expect(thumb).toHaveAttribute('aria-valuenow', '30');
    });

    it('chains a consumer onKeyDown without swallowing the default move', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      render(
        <Slider min={0} max={100} step={10} defaultValue={30}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb onKeyDown={onKeyDown} />
          </Slider.Track>
        </Slider>,
      );

      const thumb = screen.getByRole('slider');
      act(() => thumb.focus());
      await user.keyboard('{ArrowRight}');

      expect(onKeyDown).toHaveBeenCalled();
      expect(thumb).toHaveAttribute('aria-valuenow', '40');
    });

    it('leaves keys it does not map to the page, value untouched', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onWrapperKeyDown = vi.fn();
      render(
        <div onKeyDown={event => onWrapperKeyDown(event.key, event.defaultPrevented)}>
          <Slider min={0} max={100} step={10} defaultValue={30} onValueChange={onChange} />
        </div>,
      );

      const thumb = screen.getByRole('slider');
      act(() => thumb.focus());
      await user.keyboard('{Enter}a');

      expect(onWrapperKeyDown).toHaveBeenCalledWith('Enter', false);
      expect(onWrapperKeyDown).toHaveBeenCalledWith('a', false);
      expect(thumb).toHaveAttribute('aria-valuenow', '30');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('commits internally and reports the committed number when uncontrolled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider min={0} max={100} step={10} defaultValue={20} onValueChange={onChange} />);

      act(() => screen.getByRole('slider').focus());
      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(30);
    });

    it('reports a tuple for a range slider', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider range min={0} max={100} step={10} defaultValue={[20, 80]} onValueChange={onChange} />);

      act(() => screen.getAllByRole('slider')[1].focus());
      await user.keyboard('{ArrowLeft}');

      expect(onChange).toHaveBeenCalledWith([20, 70]);
    });

    it('does not move a controlled slider on its own', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider min={0} max={100} step={10} value={40} onValueChange={onChange} />);

      act(() => screen.getByRole('slider').focus());
      await user.keyboard('{ArrowRight}');

      expect(onChange).toHaveBeenCalledWith(50);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '40');
    });

    it('fires once per committed change and never for a no-op', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider min={0} max={100} step={10} defaultValue={100} onValueChange={onChange} />);

      act(() => screen.getByRole('slider').focus());
      await user.keyboard('{ArrowRight}{End}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('pointer', () => {
    it('seeks the thumb when the rail is pressed', () => {
      const onChange = vi.fn();
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={0} onValueChange={onChange} />);
      const track = measureTrack(container);

      fireEvent.pointerDown(track, { clientX: 150, button: 0 });

      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '75');
      expect(onChange).toHaveBeenCalledWith(75);
    });

    it('drags the grabbed thumb and marks it while dragging', () => {
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={10} />);
      measureTrack(container);

      const thumb = screen.getByRole('slider');
      fireEvent.pointerDown(thumb, { clientX: 20, button: 0 });
      expect(thumb).toHaveAttribute('data-dragging', '');

      fireEvent.pointerMove(document, { clientX: 120, buttons: 1 });
      expect(thumb).toHaveAttribute('aria-valuenow', '60');

      fireEvent.pointerUp(document);
      expect(thumb).not.toHaveAttribute('data-dragging');
    });

    it('grabs a thumb in place without seeking it to the press point', () => {
      const onChange = vi.fn();
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={50} onValueChange={onChange} />);
      measureTrack(container);

      const thumb = screen.getByRole('slider');
      // Press the handle well off its centre (75% of the rail). A grab must not
      // jump the value to the press point — clicking a thumb leaves it put and a
      // drag then continues from there.
      fireEvent.pointerDown(thumb, { clientX: 150, button: 0 });
      expect(thumb).toHaveAttribute('data-dragging', '');
      expect(thumb).toHaveAttribute('aria-valuenow', '50');
      expect(onChange).not.toHaveBeenCalled();

      // Only pointer movement moves it.
      fireEvent.pointerMove(document, { clientX: 120, buttons: 1 });
      expect(thumb).toHaveAttribute('aria-valuenow', '60');
      fireEvent.pointerUp(document);
    });

    it('grabs the closest thumb of a range', () => {
      const { container } = render(<Slider range min={0} max={100} step={1} defaultValue={[20, 80]} />);
      const track = measureTrack(container);

      // 35% of the rail sits nearer the lower thumb.
      fireEvent.pointerDown(track, { clientX: 70, button: 0 });

      const [first, second] = screen.getAllByRole('slider');
      expect(first).toHaveAttribute('aria-valuenow', '35');
      expect(second).toHaveAttribute('aria-valuenow', '80');
    });

    it('swaps the thumbs when a drag crosses its neighbour', () => {
      const onChange = vi.fn();
      const { container } = render(<Slider range min={0} max={100} step={1} defaultValue={[20, 80]} onValueChange={onChange} />);
      measureTrack(container);

      const [first] = screen.getAllByRole('slider');
      fireEvent.pointerDown(first, { clientX: 40, button: 0 });
      fireEvent.pointerMove(document, { clientX: 190, buttons: 1 });

      // The dragged handle passed its partner, so the committed tuple stays
      // ascending with the partner now holding the lower value.
      expect(onChange).toHaveBeenLastCalledWith([80, 95]);
      fireEvent.pointerUp(document);
    });

    it('ignores pointer interaction while disabled', () => {
      const onChange = vi.fn();
      const { container } = render(<Slider defaultValue={10} disabled onValueChange={onChange} />);
      const track = measureTrack(container);

      fireEvent.pointerDown(track, { clientX: 150, button: 0 });

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '10');
    });

    it('runs a consumer onPointerDown and honours its preventDefault', () => {
      const onChange = vi.fn();
      const onPointerDown = vi.fn((event: PointerEvent) => event.preventDefault());
      const { container } = render(
        <Slider min={0} max={100} step={1} defaultValue={50} onValueChange={onChange}>
          <Slider.Track onPointerDown={onPointerDown}>
            <Slider.Range />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>,
      );
      const track = measureTrack(container);

      fireEvent.pointerDown(track, { clientX: 150, button: 0 });

      // The handler ran; its preventDefault stopped the press-to-seek.
      expect(onPointerDown).toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
    });

    it('recovers a stuck drag when a move arrives with no button held', () => {
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={10} />);
      measureTrack(container);

      const thumb = screen.getByRole('slider');
      fireEvent.pointerDown(thumb, { clientX: 20, button: 0, pointerId: 1 });
      expect(thumb).toHaveAttribute('data-dragging', '');

      // A pointerup released outside the window is never delivered; the next move
      // reports no button held, so the drag settles instead of following the
      // bare cursor.
      fireEvent.pointerMove(document, { clientX: 120, buttons: 0, pointerId: 1 });
      expect(thumb).not.toHaveAttribute('data-dragging');
      // The value stays where it was before the button-less move.
      expect(thumb).toHaveAttribute('aria-valuenow', '10');
    });

    it('ignores a second pointer while one already owns the drag', () => {
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={10} />);
      measureTrack(container);

      const thumb = screen.getByRole('slider');
      fireEvent.pointerDown(thumb, { clientX: 20, button: 0, pointerId: 1 });

      // A second finger's move (different pointerId) must not drive the handle.
      fireEvent.pointerMove(document, { clientX: 180, buttons: 1, pointerId: 2 });
      expect(thumb).toHaveAttribute('aria-valuenow', '10');

      // The owning pointer still controls it.
      fireEvent.pointerMove(document, { clientX: 120, buttons: 1, pointerId: 1 });
      expect(thumb).toHaveAttribute('aria-valuenow', '60');
      fireEvent.pointerUp(document, { pointerId: 1 });
    });

    it('ignores a non-primary (right-click) rail press', () => {
      const onChange = vi.fn();
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={10} onValueChange={onChange} />);
      const track = measureTrack(container);

      fireEvent.pointerDown(track, { clientX: 150, button: 2 });

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '10');
    });

    it('blocks the pointer path while read-only', () => {
      const onChange = vi.fn();
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={10} readOnly onValueChange={onChange} />);
      const track = measureTrack(container);

      fireEvent.pointerDown(track, { clientX: 150, button: 0 });

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '10');
    });

    it('swaps downward when the upper handle is dragged below its neighbour, carrying focus with it', () => {
      const onChange = vi.fn();
      const { container } = render(<Slider range min={0} max={100} step={1} defaultValue={[20, 80]} onValueChange={onChange} />);
      measureTrack(container);

      const [, upper] = screen.getAllByRole('slider');
      fireEvent.pointerDown(upper, { clientX: 160, button: 0 });
      fireEvent.pointerMove(document, { clientX: 20, buttons: 1 });

      expect(onChange).toHaveBeenLastCalledWith([10, 20]);
      // The pointer now drives the lower handle, and so does the keyboard.
      const [lower] = screen.getAllByRole('slider');
      expect(lower).toHaveAttribute('aria-valuenow', '10');
      expect(lower).toHaveAttribute('data-dragging', '');
      expect(lower).toHaveFocus();
      fireEvent.pointerUp(document);
    });

    it('keeps the drag alive when a pointer that does not own it is released', () => {
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={10} />);
      measureTrack(container);

      const thumb = screen.getByRole('slider');
      fireEvent.pointerDown(thumb, { clientX: 20, button: 0, pointerId: 1 });

      // A second finger lifting must not end the gesture the first one runs.
      fireEvent.pointerUp(document, { pointerId: 2 });
      expect(thumb).toHaveAttribute('data-dragging', '');
      fireEvent.pointerMove(document, { clientX: 120, buttons: 1, pointerId: 1 });
      expect(thumb).toHaveAttribute('aria-valuenow', '60');

      fireEvent.pointerUp(document, { pointerId: 1 });
      expect(thumb).not.toHaveAttribute('data-dragging');
    });

    it('does not grab a thumb on a non-primary or consumer-vetoed press', () => {
      const onPointerDown = vi.fn((event: PointerEvent) => event.preventDefault());
      const { container } = render(
        <Slider range min={0} max={100} step={1} defaultValue={[20, 80]}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb index={0} />
            <Slider.Thumb index={1} onPointerDown={onPointerDown} />
          </Slider.Track>
        </Slider>,
      );
      measureTrack(container);
      const [first, second] = screen.getAllByRole('slider');

      fireEvent.pointerDown(first, { clientX: 40, button: 2 });
      expect(first).not.toHaveAttribute('data-dragging');

      fireEvent.pointerDown(second, { clientX: 160, button: 0 });
      expect(onPointerDown).toHaveBeenCalledTimes(1);
      expect(second).not.toHaveAttribute('data-dragging');

      // Nothing was grabbed, so a following move drives neither handle.
      fireEvent.pointerMove(document, { clientX: 100, buttons: 1 });
      expect(first).toHaveAttribute('aria-valuenow', '20');
      expect(second).toHaveAttribute('aria-valuenow', '80');
    });
  });

  describe('state and styling hooks', () => {
    it('emits the canonical root data attributes', () => {
      const { container } = render(<Slider range size="large" variant="success" step={25} invalid required readOnly />);
      const root = container.querySelector('.tk-slider');

      expect(root).toHaveAttribute('data-size', 'large');
      expect(root).toHaveAttribute('data-variant', 'success');
      expect(root).toHaveAttribute('data-orientation', 'horizontal');
      expect(root).toHaveAttribute('data-range', '');
      expect(root).toHaveAttribute('data-invalid', '');
      expect(root).toHaveAttribute('data-required', '');
      expect(root).toHaveAttribute('data-readonly', '');
      expect(root).not.toHaveAttribute('data-disabled');
    });

    it('marks each range thumb and tracks focus', async () => {
      const user = userEvent.setup();
      render(<Slider range defaultValue={[20, 60]} />);

      const [first, second] = screen.getAllByRole('slider');
      expect(first).toHaveAttribute('data-thumb', 'min');
      expect(second).toHaveAttribute('data-thumb', 'max');

      await user.tab();
      expect(first).toHaveAttribute('data-focus', '');
      expect(second).not.toHaveAttribute('data-focus');
    });

    it('applies classNames and slotProps to the owner nodes', () => {
      const { container } = render(
        <Slider defaultValue={10} classNames={{ root: 'custom-root' }} slotProps={{ root: { title: 'root-slot' } }}>
          <Slider.Track>
            <Slider.Thumb classNames={{ tooltip: 'custom-tooltip' }} slotProps={{ tooltip: { title: 'tooltip-slot' } }} />
          </Slider.Track>
        </Slider>,
      );

      const root = container.querySelector('.tk-slider');
      expect(root).toHaveClass('custom-root');
      expect(root).toHaveAttribute('title', 'root-slot');

      // The `tooltip` slot lands on the default bubble node.
      const tooltip = container.querySelector('.tk-slider-tooltip');
      expect(tooltip).toHaveClass('custom-tooltip');
      expect(tooltip).toHaveAttribute('title', 'tooltip-slot');
    });

    it('submits hidden inputs only when named and enabled', () => {
      const { container: single } = render(<Slider name="volume" defaultValue={30} />);
      const input = single.querySelector('input[name="volume"]') as HTMLInputElement;
      expect(input.value).toBe('30');
      // The field renders through Spar's `InputField`, which resolves `type`
      // itself — pin `hidden` so it can never fall back to a focusable text
      // input and double the slider's tab stops.
      expect(input).toHaveAttribute('type', 'hidden');
      expect(input.className).toBe('');

      const { container: ranged } = render(<Slider range name="price" defaultValue={[10, 90]} />);
      expect((ranged.querySelector('input[name="price-min"]') as HTMLInputElement).value).toBe('10');
      expect((ranged.querySelector('input[name="price-max"]') as HTMLInputElement).value).toBe('90');

      const { container: off } = render(<Slider name="muted" defaultValue={30} disabled />);
      expect(off.querySelector('input[name="muted"]')).toBeNull();
    });

    it('reflects the tooltip visibility mode on the root', () => {
      const { container: auto } = render(<Slider defaultValue={40} />);
      expect(auto.querySelector('.tk-slider')).toHaveAttribute('data-tooltip', 'auto');

      const { container: always } = render(<Slider defaultValue={40} tooltip="always" />);
      expect(always.querySelector('.tk-slider')).toHaveAttribute('data-tooltip', 'always');

      const { container: never } = render(<Slider defaultValue={40} tooltip="never" />);
      expect(never.querySelector('.tk-slider')).toHaveAttribute('data-tooltip', 'never');
    });

    it('submits every handle of a 3+ thumb range under positional names', () => {
      const { container } = render(<Slider range name="stops" min={0} max={100} step={5} defaultValue={[20, 50, 80]} />);

      // Every value reaches the form — no handle is silently dropped, and `-max`
      // is not misused for a middle thumb.
      expect((container.querySelector('input[name="stops-1"]') as HTMLInputElement).value).toBe('20');
      expect((container.querySelector('input[name="stops-2"]') as HTMLInputElement).value).toBe('50');
      expect((container.querySelector('input[name="stops-3"]') as HTMLInputElement).value).toBe('80');
      // The two-handle `-min` / `-max` scheme is reserved for actual pairs.
      expect(container.querySelector('input[name="stops-min"]')).toBeNull();
      expect(container.querySelector('input[name="stops-max"]')).toBeNull();
    });
  });

  describe('field integration', () => {
    it('inherits disabled and wires the label to the first thumb', () => {
      render(
        <Field disabled>
          <Field.Label>Budget</Field.Label>
          <Slider defaultValue={30} />
        </Field>,
      );

      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-disabled', 'true');
      expect(thumb).toHaveAttribute('tabindex', '-1');
      expect(thumb).toHaveAccessibleName('Budget');
    });

    it('lets a direct prop override the inherited state', () => {
      render(
        <Field disabled>
          <Field.Label>Budget</Field.Label>
          <Slider defaultValue={30} disabled={false} />
        </Field>,
      );

      expect(screen.getByRole('slider')).not.toHaveAttribute('aria-disabled');
    });

    it('keeps the two range handles distinctly named inside a Field', () => {
      render(
        <Field>
          <Field.Label>Price</Field.Label>
          <Slider range defaultValue={[20, 80]} />
        </Field>,
      );

      const [first, second] = screen.getAllByRole('slider');
      // The group carries the Field label; each thumb keeps its own name, so the
      // two handles are not both announced as "Price".
      expect(first).toHaveAccessibleName('Minimum');
      expect(second).toHaveAccessibleName('Maximum');
      expect(screen.getByRole('group')).toHaveAccessibleName('Price');
    });
  });

  describe('context boundaries', () => {
    it.each([
      ['Slider.Track', <Slider.Track key="track" />],
      ['Slider.Range', <Slider.Range key="range" />],
      ['Slider.Thumb', <Slider.Thumb key="thumb" />],
      ['Slider.Ticks', <Slider.Ticks key="ticks" />],
      ['Slider.Value', <Slider.Value key="value" />],
    ])('%s raises outside the root', (_name, element) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(element)).toThrow();
      error.mockRestore();
    });

    it.each([
      ['Slider.Track', <Slider.Track key="track" />],
      ['Slider.Range', <Slider.Range key="range" />],
      ['Slider.Thumb', <Slider.Thumb key="thumb" />],
      ['Slider.Ticks', <Slider.Ticks key="ticks" />],
      ['Slider.Value', <Slider.Value key="value" />],
    ])('%s names itself and the missing provider in the error', (name, element) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(element)).toThrow(`${name} must be used within SliderProvider`);
      error.mockRestore();
    });
  });

  describe('vertical orientation', () => {
    it('defaults to horizontal', () => {
      const { container } = render(<Slider defaultValue={40} />);

      expect(container.querySelector('.tk-slider')).toHaveAttribute('data-orientation', 'horizontal');
      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'horizontal');
      expect(screen.getByRole('slider').style.insetInlineStart).toBe('40%');
    });

    it('reflects the axis on the root and the thumb', () => {
      const { container } = render(<Slider orientation="vertical" defaultValue={40} />);

      expect(container.querySelector('.tk-slider')).toHaveAttribute('data-orientation', 'vertical');
      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('writes the geometry along the block axis instead of the inline one', () => {
      const { container } = render(<Slider orientation="vertical" range defaultValue={[25, 75]} />);

      const fill = container.querySelector('.tk-slider-range') as HTMLElement;
      expect(fill.style.insetBlockEnd).toBe('25%');
      expect(fill.style.height).toBe('50%');
      // The horizontal properties must not be written at all, or the two axes
      // would fight inside the same inline style.
      expect(fill.style.insetInlineStart).toBe('');
      expect(fill.style.width).toBe('');

      expect(screen.getAllByRole('slider')[0].style.insetBlockEnd).toBe('25%');
    });

    it('moves with ArrowUp / ArrowDown — the primary keys for a vertical slider', async () => {
      const user = userEvent.setup();
      render(<Slider orientation="vertical" min={0} max={100} step={5} defaultValue={50} />);

      const thumb = screen.getByRole('slider');
      act(() => thumb.focus());

      await user.keyboard('{ArrowUp}');
      expect(thumb).toHaveAttribute('aria-valuenow', '55');

      await user.keyboard('{ArrowDown}{ArrowDown}');
      expect(thumb).toHaveAttribute('aria-valuenow', '45');
    });

    it('drags upward from the bottom edge', () => {
      const { container } = render(<Slider orientation="vertical" min={0} max={100} step={1} defaultValue={0} />);
      measureVerticalTrack(container);

      const thumb = screen.getByRole('slider');
      // The bottom edge is `min`, so grabbing there leaves the value alone.
      fireEvent.pointerDown(thumb, { clientY: 200, button: 0 });
      expect(thumb).toHaveAttribute('aria-valuenow', '0');

      fireEvent.pointerMove(document, { clientY: 50, buttons: 1 });
      expect(thumb).toHaveAttribute('aria-valuenow', '75');

      fireEvent.pointerUp(document);
    });

    it('seeks on a rail press using the vertical axis', () => {
      const onChange = vi.fn();
      const { container } = render(<Slider orientation="vertical" min={0} max={100} step={1} defaultValue={0} onValueChange={onChange} />);
      const track = measureVerticalTrack(container);

      fireEvent.pointerDown(track, { clientY: 100, button: 0 });

      expect(onChange).toHaveBeenCalledWith(50);
    });

    it('positions ticks along the block axis', () => {
      const { container } = render(
        <Slider orientation="vertical" min={0} max={100} step={25}>
          <Slider.Ticks />
        </Slider>,
      );

      const ticks = container.querySelectorAll<HTMLElement>('.tk-slider-tick');
      expect(ticks).toHaveLength(5);
      expect(ticks[1].style.insetBlockEnd).toBe('25%');
      expect(ticks[1].style.insetInlineStart).toBe('');
    });

    it('has no a11y violations', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Altitude</Field.Label>
          <Slider orientation="vertical" defaultValue={40} />
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('accessibility', () => {
    it('has no violations for a single slider', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Volume</Field.Label>
          <Slider defaultValue={40} />
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('keeps the default bubble out of the accessibility tree', () => {
      const { container } = render(
        <Field>
          <Field.Label>Volume</Field.Label>
          <Field.Description>Pick a level.</Field.Description>
          <Slider defaultValue={40} formatValue={value => `${value}%`} />
        </Field>,
      );

      const thumb = screen.getByRole('slider');
      const bubble = container.querySelector('.tk-slider-tooltip');

      // The value is announced once, through the thumb — the bubble is
      // aria-hidden and the thumb's aria-describedby points at the Field
      // description, never at the bubble.
      expect(bubble).toHaveAttribute('aria-hidden', 'true');
      expect(thumb.getAttribute('aria-describedby')).not.toBe(bubble?.id);
      expect(thumb).toHaveAttribute('aria-describedby');
    });

    it('has no violations while a thumb is focused', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Field>
          <Field.Label>Volume</Field.Label>
          <Slider defaultValue={40} formatValue={value => `${value}%`} />
        </Field>,
      );

      await user.tab();
      expect(screen.getByRole('slider')).toHaveFocus();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no violations for a range slider', async () => {
      const { container } = render(
        <Field>
          <Field.Label>Price</Field.Label>
          <Slider range defaultValue={[20, 80]} />
        </Field>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });

    it('names a bare single thumb from the root aria-label', () => {
      const { container } = render(<Slider aria-label="Volume" defaultValue={40} />);

      // The name reaches the role="slider" thumb, not the roleless wrapper.
      expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
      expect(container.querySelector('.tk-slider')).not.toHaveAttribute('aria-label');
    });

    it('names the single thumb from a root aria-labelledby', () => {
      render(
        <>
          <span id="vol-label">Volume</span>
          <Slider aria-labelledby="vol-label" defaultValue={40} />
        </>,
      );

      expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
    });

    it('has no violations for a bare single slider named by aria-label', async () => {
      const { container } = render(<Slider aria-label="Brightness" defaultValue={40} />);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('track fill mode', () => {
    it('defaults to a normal fill from the start to the thumb', () => {
      const { container } = render(<Slider defaultValue={40} />);
      expect(container.querySelector('.tk-slider')).toHaveAttribute('data-track', 'normal');

      const fill = container.querySelector('.tk-slider-range') as HTMLElement;
      expect(fill.style.insetInlineStart).toBe('0%');
      expect(fill.style.width).toBe('40%');
    });

    it('keeps the normal band geometry when inverted (recoloured via the recipe)', () => {
      const { container } = render(<Slider defaultValue={40} track="inverted" />);
      expect(container.querySelector('.tk-slider')).toHaveAttribute('data-track', 'inverted');

      // inverted is a pure recolour (the rail shows the fill, the band shows the
      // rail), so the band geometry is unchanged from a normal single slider.
      const fill = container.querySelector('.tk-slider-range') as HTMLElement;
      expect(fill.style.insetInlineStart).toBe('0%');
      expect(fill.style.width).toBe('40%');
    });

    it('supports inverted for a range, keeping the between-thumbs band', () => {
      const { container } = render(<Slider range defaultValue={[20, 60]} track="inverted" />);
      expect(container.querySelector('.tk-slider')).toHaveAttribute('data-track', 'inverted');

      const fill = container.querySelector('.tk-slider-range') as HTMLElement;
      expect(fill.style.insetInlineStart).toBe('20%');
      expect(fill.style.width).toBe('40%');
    });

    it('reflects track="none" on the root for the recipe to hide the rail', () => {
      const { container } = render(<Slider defaultValue={40} track="none" />);
      expect(container.querySelector('.tk-slider')).toHaveAttribute('data-track', 'none');
    });
  });

  describe('onValueChangeEnd', () => {
    it('fires once per committed keystroke with the settled value', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onValueChangeEnd = vi.fn();
      render(<Slider min={0} max={100} step={10} defaultValue={20} onValueChange={onValueChange} onValueChangeEnd={onValueChangeEnd} />);

      act(() => screen.getByRole('slider').focus());
      await user.keyboard('{ArrowRight}');

      expect(onValueChange).toHaveBeenCalledWith(30);
      expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
      expect(onValueChangeEnd).toHaveBeenCalledWith(30);
    });

    it('does not fire for a no-op keystroke at the bound', async () => {
      const user = userEvent.setup();
      const onValueChangeEnd = vi.fn();
      render(<Slider min={0} max={100} step={10} defaultValue={100} onValueChangeEnd={onValueChangeEnd} />);

      act(() => screen.getByRole('slider').focus());
      await user.keyboard('{ArrowRight}{End}');
      expect(onValueChangeEnd).not.toHaveBeenCalled();
    });

    it('streams onValueChange during a drag but settles onValueChangeEnd once on release', () => {
      const onValueChange = vi.fn();
      const onValueChangeEnd = vi.fn();
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={10} onValueChange={onValueChange} onValueChangeEnd={onValueChangeEnd} />);
      measureTrack(container);

      const thumb = screen.getByRole('slider');
      fireEvent.pointerDown(thumb, { clientX: 20, button: 0 });
      fireEvent.pointerMove(document, { clientX: 80, buttons: 1 });
      fireEvent.pointerMove(document, { clientX: 120, buttons: 1 });
      expect(onValueChange.mock.calls.length).toBeGreaterThan(1);
      expect(onValueChangeEnd).not.toHaveBeenCalled();

      fireEvent.pointerUp(document);
      expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
      expect(onValueChangeEnd).toHaveBeenCalledWith(60);
    });

    it('does not settle on a release that never moved the value', () => {
      const onValueChangeEnd = vi.fn();
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={10} onValueChangeEnd={onValueChangeEnd} />);
      measureTrack(container);

      const thumb = screen.getByRole('slider');
      // Press the thumb at its own position (10% of 200 = 20) and release.
      fireEvent.pointerDown(thumb, { clientX: 20, button: 0 });
      fireEvent.pointerUp(document);
      expect(onValueChangeEnd).not.toHaveBeenCalled();
    });
  });

  describe('minDistance', () => {
    it('keeps a gap between range thumbs on the keyboard', async () => {
      const user = userEvent.setup();
      render(<Slider range min={0} max={100} step={5} defaultValue={[20, 50]} minDistance={20} />);

      const [first] = screen.getAllByRole('slider');
      act(() => first.focus());
      // End targets the max, but the thumb stops 20 below its neighbour (50).
      await user.keyboard('{End}');
      expect(first).toHaveAttribute('aria-valuenow', '30');
    });

    it('offsets the ARIA bounds by the gap so a thumb never announces a value it cannot reach', () => {
      render(<Slider range min={0} max={100} step={5} defaultValue={[20, 50]} minDistance={20} />);

      const [first, second] = screen.getAllByRole('slider');
      // The clamp keeps the handles 20 apart, so the announced bounds do too:
      // the lower thumb tops out at 30 (50 - 20), the upper bottoms at 40 (20 + 20).
      expect(first).toHaveAttribute('aria-valuemax', '30');
      expect(second).toHaveAttribute('aria-valuemin', '40');
    });

    it('clamps against the neighbour instead of swapping on a drag', () => {
      const { container } = render(<Slider range min={0} max={100} step={1} defaultValue={[20, 80]} minDistance={10} />);
      measureTrack(container);

      const [first] = screen.getAllByRole('slider');
      fireEvent.pointerDown(first, { clientX: 40, button: 0 });
      fireEvent.pointerMove(document, { clientX: 190, buttons: 1 });

      const [a, b] = screen.getAllByRole('slider');
      // Stops 10 below the upper thumb rather than crossing it.
      expect(a).toHaveAttribute('aria-valuenow', '70');
      expect(b).toHaveAttribute('aria-valuenow', '80');
      fireEvent.pointerUp(document);
    });

    it('keeps the value ascending when minDistance exceeds the neighbour gap', async () => {
      const user = userEvent.setup();
      render(<Slider range min={0} max={10} step={1} minDistance={10} defaultValue={[2, 5, 8]} />);

      const middle = screen.getAllByRole('slider')[1];

      // The 10-unit gap can't be honoured between neighbours only 3 apart, so the
      // ARIA bounds fall back to the hard neighbour range [2, 8] instead of
      // inverting to an unreachable min 12 / max -2.
      expect(middle).toHaveAttribute('aria-valuemin', '2');
      expect(middle).toHaveAttribute('aria-valuemax', '8');

      // A keyboard nudge stays inside [2, 8] and keeps the array ascending —
      // never the [2, -2, 8] the unguarded clamp produced.
      act(() => middle.focus());
      await user.keyboard('{ArrowRight}');
      expect(middle).toHaveAttribute('aria-valuenow', '6');
      const values = screen.getAllByRole('slider').map(thumb => Number(thumb.getAttribute('aria-valuenow')));
      expect(values).toEqual([...values].sort((x, y) => x - y));
    });
  });

  describe('per-thumb disabled', () => {
    it('marks a disabled handle and blocks only its interaction', async () => {
      const user = userEvent.setup();
      const onValueChangeEnd = vi.fn();
      render(
        <Slider range min={0} max={100} step={10} defaultValue={[20, 80]} onValueChangeEnd={onValueChangeEnd}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb index={0} disabled />
            <Slider.Thumb index={1} />
          </Slider.Track>
        </Slider>,
      );

      const [first, second] = screen.getAllByRole('slider');
      expect(first).toHaveAttribute('aria-disabled', 'true');
      expect(first).toHaveAttribute('tabindex', '-1');
      expect(first).toHaveAttribute('data-disabled', '');

      act(() => first.focus());
      await user.keyboard('{ArrowRight}');
      expect(first).toHaveAttribute('aria-valuenow', '20');
      expect(onValueChangeEnd).not.toHaveBeenCalled();

      act(() => second.focus());
      await user.keyboard('{ArrowLeft}');
      expect(second).toHaveAttribute('aria-valuenow', '70');
    });

    it('stops a dragged neighbour against a disabled thumb instead of pushing it', () => {
      const { container } = render(
        <Slider range min={0} max={100} step={1} defaultValue={[20, 80]}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb index={0} />
            <Slider.Thumb index={1} disabled />
          </Slider.Track>
        </Slider>,
      );
      measureTrack(container);

      const [first] = screen.getAllByRole('slider');
      fireEvent.pointerDown(first, { clientX: 40, button: 0 });
      fireEvent.pointerMove(document, { clientX: 190, buttons: 1 });

      const [a, b] = screen.getAllByRole('slider');
      expect(a).toHaveAttribute('aria-valuenow', '80');
      expect(b).toHaveAttribute('aria-valuenow', '80');
      fireEvent.pointerUp(document);
    });

    it('grabs the nearest movable thumb on a track press when the closest one is disabled', () => {
      const { container } = render(
        <Slider range min={0} max={100} step={1} defaultValue={[20, 80]}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb index={0} disabled />
            <Slider.Thumb index={1} />
          </Slider.Track>
        </Slider>,
      );
      const track = measureTrack(container);

      // 25% sits nearest the disabled lower thumb; the press must not dead-end on
      // it — the enabled upper thumb is grabbed and seeks to the press instead.
      fireEvent.pointerDown(track, { clientX: 50, button: 0 });

      const [first, second] = screen.getAllByRole('slider');
      expect(first).toHaveAttribute('aria-valuenow', '20');
      expect(second).toHaveAttribute('aria-valuenow', '25');
    });

    it('ignores a track press when every thumb is individually disabled', () => {
      const onChange = vi.fn();
      const { container } = render(
        <Slider range min={0} max={100} step={1} defaultValue={[20, 80]} onValueChange={onChange}>
          <Slider.Track>
            <Slider.Range />
            <Slider.Thumb index={0} disabled />
            <Slider.Thumb index={1} disabled />
          </Slider.Track>
        </Slider>,
      );
      const track = measureTrack(container);

      // No movable handle to fall back on: the press lands on the nearest one,
      // whose own disabled state turns it into a no-op.
      fireEvent.pointerDown(track, { clientX: 150, button: 0 });
      fireEvent.pointerMove(document, { clientX: 180, buttons: 1 });

      const [first, second] = screen.getAllByRole('slider');
      expect(first).toHaveAttribute('aria-valuenow', '20');
      expect(second).toHaveAttribute('aria-valuenow', '80');
      expect(second).not.toHaveAttribute('data-dragging');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('runtime bounds changes', () => {
    it('re-clamps a stored uncontrolled value when max is lowered under it', () => {
      const { rerender } = render(<Slider min={0} max={100} step={1} defaultValue={90} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '90');

      // Lowering max below the stored value must pull the value back into range,
      // not leave aria-valuenow stranded above aria-valuemax.
      rerender(<Slider min={0} max={50} step={1} defaultValue={90} />);
      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-valuemax', '50');
      expect(thumb).toHaveAttribute('aria-valuenow', '50');
    });
  });
  describe('state semantics on the thumbs', () => {
    it('exposes read-only, invalid and required on every thumb, and none of them by default', () => {
      const { unmount } = render(<Slider range defaultValue={[20, 80]} readOnly invalid required />);
      const thumbs = screen.getAllByRole('slider');
      expect(thumbs).toHaveLength(2);
      for (const thumb of thumbs) {
        expect(thumb).toHaveAttribute('aria-readonly', 'true');
        expect(thumb).toHaveAttribute('aria-invalid', 'true');
        expect(thumb).toHaveAttribute('aria-required', 'true');
        // Read-only keeps the handle reachable; only disabled drops it from the tab order.
        expect(thumb).toHaveAttribute('tabindex', '0');
        expect(thumb).not.toHaveAttribute('aria-disabled');
      }
      unmount();

      render(<Slider defaultValue={20} />);
      const thumb = screen.getByRole('slider');
      for (const attribute of ['aria-readonly', 'aria-invalid', 'aria-required', 'aria-disabled', 'data-disabled']) {
        expect(thumb).not.toHaveAttribute(attribute);
      }
    });

    it('marks the root and every thumb disabled and takes the thumbs out of the tab order', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <>
          <Slider range disabled defaultValue={[20, 80]} />
          <button type="button">After</button>
        </>,
      );

      expect(container.querySelector('.tk-slider')).toHaveAttribute('data-disabled', '');
      for (const thumb of screen.getAllByRole('slider')) {
        expect(thumb).toHaveAttribute('aria-disabled', 'true');
        expect(thumb).toHaveAttribute('data-disabled', '');
        expect(thumb).toHaveAttribute('tabindex', '-1');
      }

      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('inherits invalid and required from a Field and describes the thumb with the error message', () => {
      const { container } = render(
        <Field invalid required>
          <Field.Label>Budget</Field.Label>
          <Slider defaultValue={30} />
          <Field.Description>Pick an amount.</Field.Description>
          <Field.ErrorMessage>Too high</Field.ErrorMessage>
        </Field>,
      );

      const root = container.querySelector('.tk-slider');
      expect(root).toHaveAttribute('data-invalid', '');
      expect(root).toHaveAttribute('data-required', '');

      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveAttribute('aria-invalid', 'true');
      expect(thumb).toHaveAttribute('aria-required', 'true');
      // While invalid the error message replaces the description.
      expect(thumb).toHaveAccessibleDescription('Too high');
    });
  });

  describe('controlled updates', () => {
    it('follows a controlled value when the parent changes it', () => {
      const { rerender } = render(<Slider min={0} max={100} step={10} value={40} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '40');

      rerender(<Slider min={0} max={100} step={10} value={70} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '70');
      expect(screen.getByRole('slider').style.insetInlineStart).toBe('70%');
    });

    it('reports a keyboard move on a controlled range but moves nothing until the parent commits it', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { rerender } = render(<Slider range min={0} max={100} step={10} value={[20, 80]} onValueChange={onValueChange} />);
      const values = () => screen.getAllByRole('slider').map(thumb => thumb.getAttribute('aria-valuenow'));

      act(() => screen.getAllByRole('slider')[0].focus());
      await user.keyboard('{ArrowRight}');

      expect(onValueChange).toHaveBeenCalledExactlyOnceWith([30, 80]);
      expect(values()).toEqual(['20', '80']);

      rerender(<Slider range min={0} max={100} step={10} value={[30, 80]} onValueChange={onValueChange} />);
      expect(values()).toEqual(['30', '80']);
    });
  });

  describe('gesture settling', () => {
    it('settles a rail press once on release, with the value it sought', () => {
      const onValueChange = vi.fn();
      const onValueChangeEnd = vi.fn();
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={0} onValueChange={onValueChange} onValueChangeEnd={onValueChangeEnd} />);

      fireEvent.pointerDown(measureTrack(container), { clientX: 150, button: 0 });

      const thumb = screen.getByRole('slider');
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(75);
      expect(onValueChangeEnd).not.toHaveBeenCalled();
      // The press hands focus to the handle it grabbed, so the arrow keys drive it next.
      expect(thumb).toHaveFocus();
      expect(thumb).toHaveAttribute('data-dragging', '');

      fireEvent.pointerUp(document);
      expect(onValueChangeEnd).toHaveBeenCalledExactlyOnceWith(75);
      expect(thumb).not.toHaveAttribute('data-dragging');
    });

    it('ends a drag on pointercancel and stops following the pointer', () => {
      const onValueChangeEnd = vi.fn();
      const { container } = render(<Slider min={0} max={100} step={1} defaultValue={10} onValueChangeEnd={onValueChangeEnd} />);
      measureTrack(container);
      const thumb = screen.getByRole('slider');

      fireEvent.pointerDown(thumb, { clientX: 20, button: 0 });
      fireEvent.pointerMove(document, { clientX: 120, buttons: 1 });
      fireEvent.pointerCancel(document);

      expect(thumb).not.toHaveAttribute('data-dragging');
      expect(onValueChangeEnd).toHaveBeenCalledExactlyOnceWith(60);

      fireEvent.pointerMove(document, { clientX: 180, buttons: 1 });
      expect(thumb).toHaveAttribute('aria-valuenow', '60');
    });

    it('still reports the settled value when the slider unmounts mid-drag', () => {
      const onValueChangeEnd = vi.fn();
      const { container, unmount } = render(<Slider min={0} max={100} step={1} defaultValue={10} onValueChangeEnd={onValueChangeEnd} />);
      measureTrack(container);

      fireEvent.pointerDown(screen.getByRole('slider'), { clientX: 20, button: 0 });
      fireEvent.pointerMove(document, { clientX: 120, buttons: 1 });
      expect(onValueChangeEnd).not.toHaveBeenCalled();

      unmount();
      expect(onValueChangeEnd).toHaveBeenCalledExactlyOnceWith(60);
    });

    it('reports nothing on unmount when the interrupted drag never moved the value', () => {
      const onValueChangeEnd = vi.fn();
      const { container, unmount } = render(<Slider min={0} max={100} step={1} defaultValue={10} onValueChangeEnd={onValueChangeEnd} />);
      measureTrack(container);

      fireEvent.pointerDown(screen.getByRole('slider'), { clientX: 20, button: 0 });
      unmount();

      expect(onValueChangeEnd).not.toHaveBeenCalled();
    });
  });

  describe('part customization', () => {
    it('layers provider theme classNames and defaults under instance props on the root and the thumb slots', () => {
      const { container } = render(
        <TakeoffSparProvider
          components={{
            Slider: { defaultProps: { size: 'small', variant: 'danger' }, classNames: { root: 'theme-root' } },
            SliderThumb: { classNames: { root: 'theme-thumb', tooltip: 'theme-tooltip', arrow: 'theme-arrow' } },
          }}
        >
          <Slider defaultValue={40} variant="success" className="instance-root">
            <Slider.Track>
              <Slider.Thumb className="instance-thumb" classNames={{ arrow: 'instance-arrow' }} />
            </Slider.Track>
          </Slider>
        </TakeoffSparProvider>,
      );

      const root = container.querySelector('.tk-slider');
      expect(root).toHaveClass('tk-slider', 'theme-root', 'instance-root');
      expect(root).toHaveAttribute('data-size', 'small');
      expect(root).toHaveAttribute('data-variant', 'success');

      const thumb = screen.getByRole('slider');
      expect(thumb).toHaveClass('tk-slider-thumb', 'theme-thumb', 'instance-thumb');
      expect(thumb.querySelector('.tk-slider-tooltip')).toHaveClass('theme-tooltip');

      const arrow = thumb.querySelector('.tk-slider-arrow');
      expect(arrow).toHaveAttribute('data-slot', 'arrow');
      expect(arrow).toHaveAttribute('aria-hidden', 'true');
      expect(arrow).toHaveClass('theme-arrow', 'instance-arrow');
    });

    it('lands classNames and slotProps on the track, range, ticks and value parts without breaking their invariants', () => {
      const { container } = render(
        <Slider min={0} max={40} step={10} defaultValue={20}>
          <Slider.Track className="track-extra" slotProps={{ root: { title: 'track-slot' } }}>
            <Slider.Range className="range-extra" slotProps={{ root: { 'title': 'range-slot', 'aria-hidden': false, 'style': { width: '5%' } } }} />
            <Slider.Thumb />
          </Slider.Track>
          <Slider.Ticks classNames={{ root: 'ticks-extra', tick: 'tick-extra' }} slotProps={{ tick: { title: 'tick-slot' } }} />
          <Slider.Value className="value-extra" slotProps={{ root: { 'title': 'value-slot', 'aria-hidden': false } }} />
        </Slider>,
      );

      const track = container.querySelector('.tk-slider-track');
      expect(track).toHaveAttribute('data-slot', 'root');
      expect(track).toHaveClass('track-extra');
      expect(track).toHaveAttribute('title', 'track-slot');

      const range = container.querySelector('.tk-slider-range') as HTMLElement;
      expect(range).toHaveClass('range-extra');
      expect(range).toHaveAttribute('title', 'range-slot');
      // Decorative and drawn from the value: neither layer can override those.
      expect(range).toHaveAttribute('aria-hidden', 'true');
      expect(range.style.width).toBe('50%');

      const ticks = container.querySelector('.tk-slider-ticks');
      expect(ticks).toHaveAttribute('data-slot', 'root');
      expect(ticks).toHaveClass('ticks-extra');
      expect(ticks).toHaveAttribute('aria-hidden', 'true');
      const marks = container.querySelectorAll('.tk-slider-tick');
      expect(marks).toHaveLength(5);
      for (const mark of marks) {
        expect(mark).toHaveAttribute('data-slot', 'tick');
        expect(mark).toHaveClass('tick-extra');
        expect(mark).toHaveAttribute('title', 'tick-slot');
      }

      const readout = container.querySelector('.tk-slider-value');
      expect(readout).toHaveAttribute('data-slot', 'root');
      expect(readout).toHaveClass('value-extra');
      expect(readout).toHaveAttribute('title', 'value-slot');
      expect(readout).toHaveAttribute('aria-hidden', 'true');
      expect(readout).toHaveTextContent('20');
    });
  });
});
