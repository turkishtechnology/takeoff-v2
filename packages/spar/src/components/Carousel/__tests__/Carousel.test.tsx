import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Carousel, CarouselAutoplayTrigger, CarouselIndicator, CarouselNextTrigger, CarouselPrevTrigger, CarouselSlide, CarouselViewport, useCarouselContext } from '../index';

type RootProps = Partial<React.ComponentProps<typeof Carousel>> & { count?: number };

const Indicators = () => {
  const { pageCount } = useCarouselContext();
  return (
    <>
      {Array.from({ length: pageCount }, (_, index) => (
        <CarouselIndicator key={index} index={index} aria-label={`Go to slide ${index + 1}`} />
      ))}
    </>
  );
};

const Basic = ({ count = 4, ...props }: RootProps) => (
  <Carousel aria-label="Gallery" {...props}>
    <CarouselViewport>
      {Array.from({ length: count }, (_, index) => (
        <CarouselSlide key={index}>
          <a href={`#slide-${index}`}>Slide {index + 1}</a>
        </CarouselSlide>
      ))}
    </CarouselViewport>
    <CarouselPrevTrigger aria-label="Previous slide" />
    <CarouselNextTrigger aria-label="Next slide" />
    <CarouselAutoplayTrigger>{({ isPlaying }) => (isPlaying ? 'Pause' : 'Play')}</CarouselAutoplayTrigger>
    <Indicators />
  </Carousel>
);

const slides = () => screen.getAllByRole('group');
const activeLabels = () =>
  slides()
    .filter(slide => slide.hasAttribute('data-active'))
    .map(slide => slide.getAttribute('aria-label'));

const setReducedMotion = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({ matches, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn() })),
  });
};

describe('Carousel', () => {
  afterEach(() => {
    // @ts-expect-error — reset the jsdom default (no matchMedia)
    delete window.matchMedia;
  });

  describe('structure and ARIA', () => {
    it('renders a labelled region with slide groups', () => {
      render(<Basic />);
      const region = screen.getByRole('region', { name: 'Gallery' });
      expect(region).toHaveAttribute('aria-roledescription', 'carousel');
      expect(region).toHaveAttribute('data-orientation', 'horizontal');
      expect(slides()).toHaveLength(4);
      expect(slides()[1]).toHaveAttribute('aria-roledescription', 'slide');
      expect(slides()[1]).toHaveAttribute('aria-label', '2 of 4');
    });

    it('marks off-window slides inert and wires controls to the viewport', () => {
      render(<Basic id="c1" />);
      const viewport = document.getElementById('c1-viewport');
      expect(viewport).toHaveAttribute('aria-live', 'polite');
      expect(slides()[0]).not.toHaveAttribute('inert');
      expect(slides()[1]).toHaveAttribute('inert');
      expect(screen.getByRole('button', { name: 'Next slide' })).toHaveAttribute('aria-controls', 'c1-viewport');
      expect(screen.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute('aria-current', 'true');
      expect(screen.getByRole('button', { name: 'Go to slide 2' })).not.toHaveAttribute('aria-current');
    });

    it('uses a custom slide label builder and lets props override root ARIA', () => {
      render(<Basic getSlideLabel={(index, count) => `Slayt ${index + 1}/${count}`} aria-roledescription="karusel" />);
      expect(screen.getByRole('region')).toHaveAttribute('aria-roledescription', 'karusel');
      expect(slides()[0]).toHaveAttribute('aria-label', 'Slayt 1/4');
    });

    it('supports render-prop slide children', () => {
      render(
        <Carousel aria-label="R">
          <CarouselViewport>
            <CarouselSlide>{({ index, isActive }) => `${index}:${String(isActive)}`}</CarouselSlide>
            <CarouselSlide>{({ index, isActive }) => `${index}:${String(isActive)}`}</CarouselSlide>
          </CarouselViewport>
        </Carousel>,
      );
      expect(screen.getByText('0:true')).toBeInTheDocument();
      expect(screen.getByText('1:false')).toBeInTheDocument();
    });

    it('throws outside a Carousel', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<CarouselSlide />)).toThrow('Carousel components must be used within a Carousel');
      spy.mockRestore();
    });
  });

  describe('navigation', () => {
    it('steps with prev/next and loops by default', () => {
      const onValueChange = jest.fn();
      render(<Basic onValueChange={onValueChange} />);
      fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
      expect(onValueChange).toHaveBeenLastCalledWith(3);
      expect(activeLabels()).toEqual(['4 of 4']);
      fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(onValueChange).toHaveBeenLastCalledWith(0);
      fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(activeLabels()).toEqual(['2 of 4']);
    });

    it('clamps and disables the end triggers without loop', () => {
      const onValueChange = jest.fn();
      render(<Basic loop={false} count={3} onValueChange={onValueChange} />);
      const prev = screen.getByRole('button', { name: 'Previous slide' });
      const next = screen.getByRole('button', { name: 'Next slide' });
      expect(prev).toBeDisabled();
      fireEvent.click(next);
      fireEvent.click(next);
      expect(next).toBeDisabled();
      expect(prev).not.toBeDisabled();
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
      expect(onValueChange).toHaveBeenCalledTimes(2);
    });

    it('selects a page from an indicator and ignores the current one', () => {
      const onValueChange = jest.fn();
      render(<Basic onValueChange={onValueChange} />);
      fireEvent.click(screen.getByRole('button', { name: 'Go to slide 1' }));
      expect(onValueChange).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }));
      expect(onValueChange).toHaveBeenCalledWith(2);
      expect(screen.getByRole('button', { name: 'Go to slide 3' })).toHaveAttribute('data-active', '');
    });

    it('builds the page model from slidesPerView', () => {
      render(<Basic count={5} slidesPerView={2} />);
      expect(screen.getAllByRole('button', { name: /Go to slide/ })).toHaveLength(4);
      expect(activeLabels()).toEqual(['1 of 5', '2 of 5']);
      fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
      expect(activeLabels()).toEqual(['4 of 5', '5 of 5']);
    });

    it('disables navigation when every slide fits', () => {
      render(<Basic count={2} slidesPerView={3} />);
      expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
      expect(screen.getAllByRole('button', { name: /Go to slide/ })).toHaveLength(1);
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
      expect(activeLabels()).toEqual(['1 of 2', '2 of 2']);
    });

    it('honours a consumer preventDefault and a disabled prop on triggers', () => {
      const onValueChange = jest.fn();
      render(
        <Carousel aria-label="P" onValueChange={onValueChange}>
          <CarouselViewport>
            <CarouselSlide />
            <CarouselSlide />
          </CarouselViewport>
          <CarouselPrevTrigger aria-label="prev" onClick={event => event.preventDefault()} />
          <CarouselNextTrigger aria-label="next" disabled />
          <CarouselIndicator index={1} aria-label="two" onClick={event => event.preventDefault()} />
        </Carousel>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'prev' }));
      fireEvent.click(screen.getByRole('button', { name: 'two' }));
      expect(screen.getByRole('button', { name: 'next' })).toBeDisabled();
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('works controlled', () => {
      const Controlled = () => {
        const [value, setValue] = React.useState(1);
        return (
          <>
            <output>{value}</output>
            <Basic value={value} onValueChange={setValue} />
          </>
        );
      };
      render(<Controlled />);
      expect(activeLabels()).toEqual(['2 of 4']);
      fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
      expect(screen.getByText('2', { selector: 'output' })).toBeInTheDocument();
      expect(activeLabels()).toEqual(['3 of 4']);
    });

    it('clamps an out-of-range value', () => {
      render(<Basic value={10} />);
      expect(activeLabels()).toEqual(['4 of 4']);
    });

    it('starts from defaultValue', () => {
      render(<Basic defaultValue={2} />);
      expect(activeLabels()).toEqual(['3 of 4']);
    });
  });

  describe('keyboard', () => {
    it('steps with ArrowLeft / ArrowRight when horizontal', () => {
      render(<Basic />);
      const region = screen.getByRole('region');
      fireEvent.keyDown(region, { key: 'ArrowRight' });
      expect(activeLabels()).toEqual(['2 of 4']);
      fireEvent.keyDown(region, { key: 'ArrowLeft' });
      expect(activeLabels()).toEqual(['1 of 4']);
      fireEvent.keyDown(region, { key: 'ArrowDown' });
      expect(activeLabels()).toEqual(['1 of 4']);
    });

    it('steps with ArrowUp / ArrowDown when vertical', () => {
      render(<Basic orientation="vertical" />);
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('data-orientation', 'vertical');
      fireEvent.keyDown(region, { key: 'ArrowDown' });
      expect(activeLabels()).toEqual(['2 of 4']);
      fireEvent.keyDown(region, { key: 'ArrowUp' });
      expect(activeLabels()).toEqual(['1 of 4']);
      fireEvent.keyDown(region, { key: 'ArrowRight' });
      expect(activeLabels()).toEqual(['1 of 4']);
    });

    it('flips the horizontal arrows in RTL', () => {
      render(<Basic style={{ direction: 'rtl' }} />);
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' });
      expect(activeLabels()).toEqual(['2 of 4']);
    });

    it('leaves arrows to editable targets and to a consumer preventDefault', () => {
      const onKeyDown = jest.fn((event: React.KeyboardEvent) => {
        if (event.key === 'ArrowLeft') event.preventDefault();
      });
      render(
        <Carousel aria-label="K" onKeyDown={onKeyDown}>
          <CarouselViewport>
            <CarouselSlide>
              <input aria-label="field" />
              <div contentEditable suppressContentEditableWarning data-testid="editable" />
            </CarouselSlide>
            <CarouselSlide />
            <CarouselSlide />
          </CarouselViewport>
        </Carousel>,
      );
      fireEvent.keyDown(screen.getByLabelText('field'), { key: 'ArrowRight' });
      const editable = screen.getByTestId('editable');
      Object.defineProperty(editable, 'isContentEditable', { value: true });
      fireEvent.keyDown(editable, { key: 'ArrowRight' });
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowLeft' });
      expect(onKeyDown).toHaveBeenCalledTimes(3);
      expect(activeLabels()).toEqual(['1 of 3']);
    });
  });

  describe('autoplay', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('advances on the interval and loops', () => {
      render(<Basic count={2} autoplay autoplayInterval={1000} />);
      expect(document.querySelector('[aria-live]')).toHaveAttribute('aria-live', 'off');
      act(() => jest.advanceTimersByTime(1000));
      expect(activeLabels()).toEqual(['2 of 2']);
      act(() => jest.advanceTimersByTime(1000));
      expect(activeLabels()).toEqual(['1 of 2']);
    });

    it('uses a 3000ms default interval', () => {
      render(<Basic autoplay />);
      act(() => jest.advanceTimersByTime(2999));
      expect(activeLabels()).toEqual(['1 of 4']);
      act(() => jest.advanceTimersByTime(1));
      expect(activeLabels()).toEqual(['2 of 4']);
    });

    it('stops on the last page without loop', () => {
      const onPlayingChange = jest.fn();
      render(<Basic count={2} autoplay loop={false} autoplayInterval={500} onPlayingChange={onPlayingChange} />);
      act(() => jest.advanceTimersByTime(500));
      expect(activeLabels()).toEqual(['2 of 2']);
      act(() => jest.advanceTimersByTime(500));
      expect(onPlayingChange).toHaveBeenCalledWith(false);
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
      expect(document.querySelector('[aria-live]')).toHaveAttribute('aria-live', 'polite');
    });

    it('pauses while hovered and resumes on leave', () => {
      render(<Basic autoplay autoplayInterval={500} />);
      const region = screen.getByRole('region');
      fireEvent.pointerEnter(region);
      act(() => jest.advanceTimersByTime(1500));
      expect(activeLabels()).toEqual(['1 of 4']);
      fireEvent.pointerLeave(region);
      act(() => jest.advanceTimersByTime(500));
      expect(activeLabels()).toEqual(['2 of 4']);
    });

    it('pauses while focus is inside and resumes when it leaves', () => {
      render(
        <>
          <Basic autoplay autoplayInterval={500} />
          <button type="button">outside</button>
        </>,
      );
      const next = screen.getByRole('button', { name: 'Next slide' });
      const prev = screen.getByRole('button', { name: 'Previous slide' });
      fireEvent.focus(next);
      fireEvent.blur(next, { relatedTarget: prev });
      act(() => jest.advanceTimersByTime(1500));
      expect(activeLabels()).toEqual(['1 of 4']);
      fireEvent.blur(prev, { relatedTarget: screen.getByRole('button', { name: 'outside' }) });
      act(() => jest.advanceTimersByTime(500));
      expect(activeLabels()).toEqual(['2 of 4']);
    });

    it('stops for good from the autoplay control and restarts on play', () => {
      const onPlayingChange = jest.fn();
      render(<Basic autoplay autoplayInterval={500} onPlayingChange={onPlayingChange} />);
      fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
      expect(onPlayingChange).toHaveBeenLastCalledWith(false);
      act(() => jest.advanceTimersByTime(2000));
      expect(activeLabels()).toEqual(['1 of 4']);
      const play = screen.getByRole('button', { name: 'Play' });
      // Focus and hover are inside the region, yet play starts rotation now.
      fireEvent.pointerEnter(screen.getByRole('region'));
      fireEvent.focus(play);
      fireEvent.click(play);
      expect(onPlayingChange).toHaveBeenLastCalledWith(true);
      act(() => jest.advanceTimersByTime(500));
      expect(activeLabels()).toEqual(['2 of 4']);
    });

    it('resets the timer after manual navigation', () => {
      render(<Basic autoplay autoplayInterval={1000} />);
      act(() => jest.advanceTimersByTime(800));
      fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
      act(() => jest.advanceTimersByTime(800));
      expect(activeLabels()).toEqual(['2 of 4']);
      act(() => jest.advanceTimersByTime(200));
      expect(activeLabels()).toEqual(['3 of 4']);
    });

    it('starts stopped under prefers-reduced-motion', () => {
      setReducedMotion(true);
      render(<Basic autoplay autoplayInterval={500} />);
      act(() => jest.advanceTimersByTime(1500));
      expect(activeLabels()).toEqual(['1 of 4']);
      expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    });

    it('plays when motion is allowed and respects defaultPlaying', () => {
      setReducedMotion(false);
      const { unmount } = render(<Basic autoplay autoplayInterval={500} />);
      act(() => jest.advanceTimersByTime(500));
      expect(activeLabels()).toEqual(['2 of 4']);
      unmount();
      render(<Basic autoplay autoplayInterval={500} defaultPlaying={false} />);
      act(() => jest.advanceTimersByTime(1500));
      expect(activeLabels()).toEqual(['1 of 4']);
    });

    it('follows a controlled isPlaying', () => {
      const { rerender } = render(<Basic autoplay autoplayInterval={500} isPlaying={false} />);
      act(() => jest.advanceTimersByTime(1000));
      expect(activeLabels()).toEqual(['1 of 4']);
      rerender(<Basic autoplay autoplayInterval={500} isPlaying />);
      act(() => jest.advanceTimersByTime(500));
      expect(activeLabels()).toEqual(['2 of 4']);
    });

    it('does nothing without autoplay and hides the autoplay control', () => {
      render(<Basic autoplayInterval={500} />);
      act(() => jest.advanceTimersByTime(2000));
      expect(activeLabels()).toEqual(['1 of 4']);
      expect(screen.queryByRole('button', { name: /Play|Pause/ })).not.toBeInTheDocument();
    });

    it('calls consumer pointer, focus and click handlers', () => {
      const handlers = { onPointerEnter: jest.fn(), onPointerLeave: jest.fn(), onFocus: jest.fn(), onBlur: jest.fn() };
      const onClick = jest.fn();
      render(
        <Carousel aria-label="H" autoplay {...handlers}>
          <CarouselViewport>
            <CarouselSlide />
            <CarouselSlide />
          </CarouselViewport>
          <CarouselAutoplayTrigger onClick={onClick}>toggle</CarouselAutoplayTrigger>
        </Carousel>,
      );
      const region = screen.getByRole('region');
      const toggle = screen.getByRole('button', { name: 'toggle' });
      fireEvent.pointerEnter(region);
      fireEvent.pointerLeave(region);
      fireEvent.focus(toggle);
      fireEvent.blur(toggle);
      fireEvent.click(toggle);
      Object.values(handlers).forEach(handler => expect(handler).toHaveBeenCalledTimes(1));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  it('exposes the compound namespace', () => {
    expect(Carousel.Root).toBe(Carousel);
    expect(Carousel.Slide).toBe(CarouselSlide);
    expect(Carousel.Viewport).toBe(CarouselViewport);
    expect(Carousel.PrevTrigger).toBe(CarouselPrevTrigger);
    expect(Carousel.NextTrigger).toBe(CarouselNextTrigger);
    expect(Carousel.Indicator).toBe(CarouselIndicator);
    expect(Carousel.AutoplayTrigger).toBe(CarouselAutoplayTrigger);
  });
});
