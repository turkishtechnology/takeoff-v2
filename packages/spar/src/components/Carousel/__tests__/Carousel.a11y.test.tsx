import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Carousel, CarouselAutoplayTrigger, CarouselIndicator, CarouselNextTrigger, CarouselPrevTrigger, CarouselSlide, CarouselViewport } from '../index';

expect.extend(toHaveNoViolations);

const Example = (props: Partial<React.ComponentProps<typeof Carousel>>) => (
  <Carousel aria-label="Featured" {...props}>
    <CarouselAutoplayTrigger>{({ isPlaying }) => (isPlaying ? 'Stop automatic slide show' : 'Start automatic slide show')}</CarouselAutoplayTrigger>
    <CarouselPrevTrigger aria-label="Previous slide" />
    <CarouselNextTrigger aria-label="Next slide" />
    <CarouselViewport>
      {[1, 2, 3].map(n => (
        <CarouselSlide key={n}>
          <img src={`/slide-${n}.png`} alt={`Destination ${n}`} />
          <a href={`#d${n}`}>Book destination {n}</a>
        </CarouselSlide>
      ))}
    </CarouselViewport>
    {[0, 1, 2].map(index => (
      <CarouselIndicator key={index} index={index} aria-label={`Go to slide ${index + 1}`} />
    ))}
  </Carousel>
);

describe('Carousel accessibility', () => {
  it('has no axe violations', async () => {
    const { container } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no axe violations when autoplaying and vertical', async () => {
    const { container } = render(<Example autoplay orientation="vertical" slidesPerView={2} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
