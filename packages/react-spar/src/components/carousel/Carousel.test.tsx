import { act, fireEvent } from '@testing-library/react';
import { createRef, useState } from 'react';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { TakeoffSparProvider } from '../../provider';
import { render, screen } from '../../test-utils';

import { Carousel, type CarouselProps } from './index';

let consoleError: MockInstance;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error');
});

afterEach(() => {
  try {
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});

const Example = ({ count = 4, ...props }: Partial<CarouselProps> & { count?: number }) => (
  <Carousel aria-label="Destinations" {...props}>
    <Carousel.Viewport>
      {Array.from({ length: count }, (_, index) => (
        <Carousel.Slide key={index}>
          <a href={`#d${index}`}>Destination {index + 1}</a>
        </Carousel.Slide>
      ))}
    </Carousel.Viewport>
    <Carousel.Controls />
  </Carousel>
);

const activeLabels = () =>
  screen
    .getAllByRole('group')
    .filter(slide => slide.hasAttribute('data-active'))
    .map(slide => slide.getAttribute('aria-label'));

describe('Carousel', () => {
  describe('anatomy', () => {
    it('renders the region, slots and default controls', () => {
      render(<Example />);
      const root = screen.getByRole('region', { name: 'Destinations' });
      expect(root).toHaveClass('tk-carousel');
      expect(root).toHaveAttribute('aria-roledescription', 'carousel');
      expect(root).toHaveAttribute('data-orientation', 'horizontal');
      expect(root).toHaveAttribute('data-controls-placement', 'inside');
      expect(root).toHaveAttribute('data-controls-position', 'distributed');

      const viewport = root.querySelector('.tk-carousel-viewport') as HTMLElement;
      expect(viewport.style.getPropertyValue('--tk-carousel-index')).toBe('0');
      expect(viewport.style.getPropertyValue('--tk-carousel-per-view')).toBe('1');
      const track = viewport.querySelector(':scope > .tk-carousel-track');
      expect(track).toHaveAttribute('data-slot', 'track');

      const slides = screen.getAllByRole('group');
      expect(slides[0]).toHaveClass('tk-carousel-slide');
      expect(slides[0]).toHaveAttribute('aria-roledescription', 'slide');
      expect(slides[0]).toHaveAttribute('aria-label', '1 of 4');
      expect(slides[1]).toHaveAttribute('inert');

      const prev = screen.getByRole('button', { name: 'Previous slide' });
      expect(prev).toHaveClass('tk-button', 'tk-carousel-prev');
      expect(prev).toHaveAttribute('data-size', 'small');
      expect(prev).toHaveAttribute('data-icon-only', '');
      expect(screen.getByRole('button', { name: 'Next slide' })).toHaveClass('tk-carousel-next');
      expect(root.querySelector('.tk-carousel-controls')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: /Go to slide/ })).toHaveLength(4);
      expect(screen.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute('aria-current', 'true');
      expect(root.querySelectorAll('.tk-carousel-indicator-dot')).toHaveLength(4);
      // No autoplay → no play/pause control.
      expect(root.querySelector('.tk-carousel-autoplay')).not.toBeInTheDocument();
    });

    it('emits placement, position and vertical glyphs', () => {
      render(<Example orientation="vertical" controlsPlacement="outside" controlsPosition="end" />);
      const root = screen.getByRole('region');
      expect(root).toHaveAttribute('data-orientation', 'vertical');
      expect(root).toHaveAttribute('data-controls-placement', 'outside');
      expect(root).toHaveAttribute('data-controls-position', 'end');
      expect(screen.getByRole('button', { name: 'Previous slide' }).querySelector('svg')).toBeInTheDocument();
    });

    it('forwards refs, classNames and slotProps', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Carousel aria-label="Refs" ref={ref} className="mine" slotProps={{ root: { title: 'root' } }}>
          <Carousel.Viewport classNames={{ track: 'my-track' }} slotProps={{ track: { title: 'track' } }} style={{ height: 200 }}>
            <Carousel.Slide className="my-slide">A</Carousel.Slide>
            <Carousel.Slide>B</Carousel.Slide>
          </Carousel.Viewport>
          <Carousel.Indicators classNames={{ indicator: 'my-dot-button', indicatorDot: 'my-dot' }} />
        </Carousel>,
      );
      expect(ref.current).toBe(screen.getByRole('region'));
      expect(ref.current).toHaveClass('tk-carousel', 'mine');
      expect(ref.current).toHaveAttribute('title', 'root');
      const viewport = ref.current?.querySelector('.tk-carousel-viewport') as HTMLElement;
      expect(viewport.style.height).toBe('200px');
      expect(viewport.querySelector('.tk-carousel-track')).toHaveClass('my-track');
      expect(viewport.querySelector('.tk-carousel-track')).toHaveAttribute('title', 'track');
      expect(screen.getByText('A')).toHaveClass('tk-carousel-slide', 'my-slide');
      expect(screen.getAllByRole('button', { name: /Go to slide/ })[0]).toHaveClass('tk-carousel-indicator', 'my-dot-button');
      expect(ref.current?.querySelector('.tk-carousel-indicator-dot')).toHaveClass('my-dot');
    });

    it('composes custom controls and custom trigger content', () => {
      render(
        <Carousel aria-label="Custom" autoplay defaultPlaying={false}>
          <Carousel.Viewport>
            <Carousel.Slide>{({ index, isActive }) => `slide ${index} ${isActive ? 'on' : 'off'}`}</Carousel.Slide>
            <Carousel.Slide>{({ index, isActive }) => `slide ${index} ${isActive ? 'on' : 'off'}`}</Carousel.Slide>
          </Carousel.Viewport>
          <Carousel.Controls>
            <Carousel.AutoplayTrigger>{({ isPlaying }) => (isPlaying ? 'Pause it' : 'Play it')}</Carousel.AutoplayTrigger>
            <Carousel.PrevTrigger>Back</Carousel.PrevTrigger>
            <Carousel.NextTrigger aria-label="Forward" />
            <Carousel.NextTrigger as="a" href="#x" aria-label="Link next" />
          </Carousel.Controls>
        </Carousel>,
      );
      expect(screen.getByText('slide 0 on')).toBeInTheDocument();
      expect(screen.getByText('slide 1 off')).toBeInTheDocument();
      const back = screen.getByRole('button', { name: 'Back' });
      expect(back).not.toHaveAttribute('aria-label');
      expect(back).not.toHaveAttribute('data-icon-only');
      expect(screen.getByRole('button', { name: 'Forward' })).toBeInTheDocument();
      const link = screen.getByRole('link', { name: 'Link next' });
      expect(link).toHaveClass('tk-carousel-next');
      expect(link).not.toHaveClass('tk-button');
      const toggle = screen.getByRole('button', { name: 'Start automatic slide show' });
      expect(toggle).toHaveTextContent('Play it');
      fireEvent.click(toggle);
      expect(screen.getByRole('button', { name: 'Stop automatic slide show' })).toHaveTextContent('Pause it');
    });

    it('accepts static autoplay trigger content', () => {
      render(
        <Carousel aria-label="Static" autoplay>
          <Carousel.Viewport>
            <Carousel.Slide>A</Carousel.Slide>
            <Carousel.Slide>B</Carousel.Slide>
          </Carousel.Viewport>
          <Carousel.AutoplayTrigger>
            <span>toggle</span>
          </Carousel.AutoplayTrigger>
        </Carousel>,
      );
      expect(screen.getByRole('button', { name: 'Stop automatic slide show' })).toHaveTextContent('toggle');
    });

    it('drops the indicators when every slide fits', () => {
      render(<Example count={2} slidesPerView={2} />);
      expect(screen.queryByRole('button', { name: /Go to slide/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    });

    it('throws outside a Carousel', () => {
      consoleError.mockImplementation(() => {});
      expect(() => render(<Carousel.Slide />)).toThrow();
      consoleError.mockClear();
    });
  });

  describe('navigation', () => {
    it('moves with prev/next, indicators and the CSS position variable', () => {
      const onValueChange = vi.fn();
      render(<Example onValueChange={onValueChange} />);
      const viewport = document.querySelector('.tk-carousel-viewport') as HTMLElement;
      fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(onValueChange).toHaveBeenLastCalledWith(1);
      expect(viewport.style.getPropertyValue('--tk-carousel-index')).toBe('1');
      fireEvent.click(screen.getByRole('button', { name: 'Go to slide 4' }));
      expect(activeLabels()).toEqual(['4 of 4']);
      fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(activeLabels()).toEqual(['1 of 4']);
    });

    it('hides past-the-end triggers without loop (disabled)', () => {
      render(<Example loop={false} count={2} />);
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    });

    it('steps with arrow keys', () => {
      render(<Example />);
      const root = screen.getByRole('region');
      fireEvent.keyDown(root, { key: 'ArrowRight' });
      fireEvent.keyDown(root, { key: 'ArrowRight' });
      expect(activeLabels()).toEqual(['3 of 4']);
      fireEvent.keyDown(root, { key: 'ArrowLeft' });
      expect(activeLabels()).toEqual(['2 of 4']);
    });

    it('steps vertically with ArrowUp / ArrowDown', () => {
      render(<Example orientation="vertical" />);
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowDown' });
      expect(activeLabels()).toEqual(['2 of 4']);
    });

    it('works controlled and shows several slides per view', () => {
      const Controlled = () => {
        const [value, setValue] = useState(0);
        return (
          <>
            <output>{value}</output>
            <Example count={5} slidesPerView={3} value={value} onValueChange={setValue} />
          </>
        );
      };
      render(<Controlled />);
      expect(activeLabels()).toEqual(['1 of 5', '2 of 5', '3 of 5']);
      expect(screen.getAllByRole('button', { name: /Go to slide/ })).toHaveLength(3);
      fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(screen.getByText('1', { selector: 'output' })).toBeInTheDocument();
      expect(activeLabels()).toEqual(['2 of 5', '3 of 5', '4 of 5']);
      expect((document.querySelector('.tk-carousel-viewport') as HTMLElement).style.getPropertyValue('--tk-carousel-per-view')).toBe('3');
    });
  });

  describe('autoplay', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('rotates, pauses on hover and stops from the default play/pause control', () => {
      const onPlayingChange = vi.fn();
      render(<Example autoplay autoplayInterval={1000} onPlayingChange={onPlayingChange} />);
      const root = screen.getByRole('region');
      const pause = screen.getByRole('button', { name: 'Stop automatic slide show' });
      expect(pause).toHaveClass('tk-carousel-autoplay');
      // Core places the player control in front of the dots.
      expect(pause.parentElement).toHaveClass('tk-carousel-indicators');
      expect(pause.querySelector('svg')).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(1000));
      expect(activeLabels()).toEqual(['2 of 4']);

      fireEvent.pointerEnter(root);
      act(() => vi.advanceTimersByTime(3000));
      expect(activeLabels()).toEqual(['2 of 4']);
      fireEvent.pointerLeave(root);

      fireEvent.click(pause);
      expect(onPlayingChange).toHaveBeenCalledWith(false);
      act(() => vi.advanceTimersByTime(3000));
      expect(activeLabels()).toEqual(['2 of 4']);
      expect(screen.getByRole('button', { name: 'Start automatic slide show' }).querySelector('svg')).toBeInTheDocument();
    });

    it('pauses while focus is inside', () => {
      render(<Example autoplay autoplayInterval={500} />);
      fireEvent.focus(screen.getByRole('button', { name: 'Next slide' }));
      act(() => vi.advanceTimersByTime(2000));
      expect(activeLabels()).toEqual(['1 of 4']);
    });
  });

  describe('labels', () => {
    it('localizes every string, per key, with provider defaults underneath', () => {
      render(
        <TakeoffSparProvider components={{ Carousel: { defaultProps: { labels: { previous: 'Önceki slayt', next: 'Sonraki slayt' } } } }}>
          <Example
            autoplay
            labels={{
              next: 'İleri',
              previous: '   ',
              pause: 'Otomatik gösterimi durdur',
              indicator: '{index}. slayta git',
              slide: '{index} / {count}',
              roleDescription: 'karusel',
              slideRoleDescription: 'slayt',
            }}
          />
        </TakeoffSparProvider>,
      );
      expect(screen.getByRole('region')).toHaveAttribute('aria-roledescription', 'karusel');
      expect(screen.getAllByRole('group')[0]).toHaveAttribute('aria-roledescription', 'slayt');
      expect(screen.getAllByRole('group')[1]).toHaveAttribute('aria-label', '2 / 4');
      expect(screen.getByRole('button', { name: 'Önceki slayt' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'İleri' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3. slayta git' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Otomatik gösterimi durdur' })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations (default and autoplaying vertical)', async () => {
      const { container, unmount } = render(<Example />);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
      const second = render(<Example autoplay orientation="vertical" slidesPerView={2} controlsPosition="start" />);
      expect(await axe(second.container)).toHaveNoViolations();
    });
  });
});
