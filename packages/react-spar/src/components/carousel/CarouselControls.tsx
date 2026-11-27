import type { ElementType } from 'react';

import { composeRootAttrs, isRenderableNode } from '../../core';
import { useComponentTheme } from '../../provider';

import { CarouselAutoplayTrigger } from './CarouselAutoplayTrigger';
import { CarouselControlsBase } from './base';
import { useCarouselOwnContext } from './context';
import { CarouselIndicators } from './CarouselIndicators';
import { CarouselNextTrigger, CarouselPrevTrigger } from './CarouselTriggers';
import type { CarouselControlsProps } from './types';

/**
 * Navigation holder, laid out by the root's `controlsPosition`. Without
 * children it renders Core's set: Prev · Indicators (with the autoplay
 * control in front, when autoplaying) · Next.
 */
export const CarouselControls = <T extends ElementType = 'div'>(props: CarouselControlsProps<T>) => {
  const theme = useComponentTheme('CarouselControls');
  useCarouselOwnContext('Carousel.Controls');

  const { rootAttrs, rest } = composeRootAttrs(CarouselControlsBase, props as CarouselControlsProps<'div'>, theme);
  const { as, children, ref, ...divProps } = rest;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component {...divProps} {...rootAttrs} ref={ref}>
      {isRenderableNode(children) ? (
        children
      ) : (
        <>
          <CarouselPrevTrigger />
          <CarouselIndicators>
            <CarouselAutoplayTrigger />
          </CarouselIndicators>
          <CarouselNextTrigger />
        </>
      )}
    </Component>
  );
};

CarouselControls.displayName = 'Carousel.Controls';
