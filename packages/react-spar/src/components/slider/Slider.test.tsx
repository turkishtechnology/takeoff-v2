import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProvider as render, screen } from '../../test-utils';

import { Field } from '../field';

import { Slider } from './index';

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

      thumbs[1].focus();
      await user.keyboard('{ArrowRight}');

      // The middle handle's value must survive the commit — the whole array is
      // reported, not just the outer pair.
      expect(onChange).toHaveBeenCalledWith([20, 60, 80]);
    });

    it('clamps a middle thumb between both of its neighbours', async () => {
      const user = userEvent.setup();
      render(<Slider range min={0} max={100} step={10} defaultValue={[30, 40, 50]} />);

      const [, middle] = screen.getAllByRole('slider');
      middle.focus();

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
      screen.getByRole('slider').focus();
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
      first.focus();

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
      screen.getByRole('slider').focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
      unmount();

      render(<Slider defaultValue={30} readOnly onValueChange={onChange} />);
      screen.getByRole('slider').focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('commits internally and reports the committed number when uncontrolled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider min={0} max={100} step={10} defaultValue={20} onValueChange={onChange} />);

      screen.getByRole('slider').focus();
      await user.keyboard('{ArrowRight}');

      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(30);
    });

    it('reports a tuple for a range slider', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider range min={0} max={100} step={10} defaultValue={[20, 80]} onValueChange={onChange} />);

      screen.getAllByRole('slider')[1].focus();
      await user.keyboard('{ArrowLeft}');

      expect(onChange).toHaveBeenCalledWith([20, 70]);
    });

    it('does not move a controlled slider on its own', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider min={0} max={100} step={10} value={40} onValueChange={onChange} />);

      screen.getByRole('slider').focus();
      await user.keyboard('{ArrowRight}');

      expect(onChange).toHaveBeenCalledWith(50);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '40');
    });

    it('fires once per committed change and never for a no-op', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Slider min={0} max={100} step={10} defaultValue={100} onValueChange={onChange} />);

      screen.getByRole('slider').focus();
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

      fireEvent.pointerMove(document, { clientX: 120 });
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
      fireEvent.pointerMove(document, { clientX: 120 });
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
      fireEvent.pointerMove(document, { clientX: 190 });

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

    it('drags upward from the bottom edge', () => {
      const { container } = render(<Slider orientation="vertical" min={0} max={100} step={1} defaultValue={0} />);
      measureVerticalTrack(container);

      const thumb = screen.getByRole('slider');
      // The bottom edge is `min`, so grabbing there leaves the value alone.
      fireEvent.pointerDown(thumb, { clientY: 200, button: 0 });
      expect(thumb).toHaveAttribute('aria-valuenow', '0');

      fireEvent.pointerMove(document, { clientY: 50 });
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

      screen.getByRole('slider').focus();
      await user.keyboard('{ArrowRight}');

      expect(onValueChange).toHaveBeenCalledWith(30);
      expect(onValueChangeEnd).toHaveBeenCalledTimes(1);
      expect(onValueChangeEnd).toHaveBeenCalledWith(30);
    });

    it('does not fire for a no-op keystroke at the bound', async () => {
      const user = userEvent.setup();
      const onValueChangeEnd = vi.fn();
      render(<Slider min={0} max={100} step={10} defaultValue={100} onValueChangeEnd={onValueChangeEnd} />);

      screen.getByRole('slider').focus();
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
      fireEvent.pointerMove(document, { clientX: 80 });
      fireEvent.pointerMove(document, { clientX: 120 });
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
      first.focus();
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
      fireEvent.pointerMove(document, { clientX: 190 });

      const [a, b] = screen.getAllByRole('slider');
      // Stops 10 below the upper thumb rather than crossing it.
      expect(a).toHaveAttribute('aria-valuenow', '70');
      expect(b).toHaveAttribute('aria-valuenow', '80');
      fireEvent.pointerUp(document);
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

      first.focus();
      await user.keyboard('{ArrowRight}');
      expect(first).toHaveAttribute('aria-valuenow', '20');
      expect(onValueChangeEnd).not.toHaveBeenCalled();

      second.focus();
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
      fireEvent.pointerMove(document, { clientX: 190 });

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
});
