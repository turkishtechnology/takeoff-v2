import type { ElementType } from 'react';
import { CarouselAutoplayTrigger as SparCarouselAutoplayTrigger, useCarouselContext } from '@turkish-technology/spar';
import { PauseCircleIconFilledRounded } from '@takeoff-icons/react/pause-circle';
import { PlayCircleIconFilledRounded } from '@takeoff-icons/react/play-circle';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { CarouselAutoplayTriggerBase } from './base';
import { useCarouselOwnContext } from './context';
import type { CarouselAutoplayTriggerProps } from './types';

/**
 * Play/pause control for autoplay (Core's player button). Renders nothing
 * unless the root has `autoplay`. Its name follows the state: `labels.pause`
 * while playing, `labels.play` while stopped.
 */
export const CarouselAutoplayTrigger = <T extends ElementType = 'button'>(props: CarouselAutoplayTriggerProps<T>) => {
  const theme = useComponentTheme('CarouselAutoplayTrigger');
  const { labels } = useCarouselOwnContext('Carousel.AutoplayTrigger');
  const { isPlaying } = useCarouselContext();

  const { rootAttrs, rest } = composeRootAttrs(CarouselAutoplayTriggerBase, props as CarouselAutoplayTriggerProps<'button'>, theme);
  const { children, ref, ...triggerProps } = rest;

  return (
    <SparCarouselAutoplayTrigger aria-label={isPlaying ? labels.pause : labels.play} {...triggerProps} {...rootAttrs} ref={ref}>
      {state => {
        if (typeof children === 'function') return children(state);
        if (children !== undefined && children !== null) return children;
        return state.isPlaying ? <PauseCircleIconFilledRounded aria-hidden="true" /> : <PlayCircleIconFilledRounded aria-hidden="true" />;
      }}
    </SparCarouselAutoplayTrigger>
  );
};

CarouselAutoplayTrigger.displayName = 'Carousel.AutoplayTrigger';
