import type { ElementType, ReactNode } from 'react';
import { CarouselNextTrigger as SparCarouselNextTrigger, CarouselPrevTrigger as SparCarouselPrevTrigger, useCarouselContext } from '@turkish-technology/spar';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronLeftIconOutlinedRounded } from '@takeoff-icons/react/chevron-left';
import { ChevronRightIconOutlinedRounded } from '@takeoff-icons/react/chevron-right';
import { ChevronTopIconOutlinedRounded } from '@takeoff-icons/react/chevron-top';

import { composeRootAttrs, isRenderableNode, type ComponentBase } from '../../core';
import { useComponentTheme } from '../../provider';
import { Button } from '../button';

import { CarouselNextTriggerBase, CarouselPrevTriggerBase } from './base';
import { useCarouselOwnContext } from './context';
import type { CarouselTriggerProps } from './types';

interface TriggerConfig {
  base: ComponentBase<CarouselTriggerProps, 'root'>;
  themeKey: 'CarouselPrevTrigger' | 'CarouselNextTrigger';
  part: string;
  Spar: typeof SparCarouselPrevTrigger;
  label: (labels: { previous: string; next: string }) => string;
  glyph: (vertical: boolean) => ReactNode;
}

/**
 * Prev/Next share one body: a small icon-only Takeoff `Button` driven by the
 * Spar trigger (step, `disabled` at the ends, `aria-controls`). Custom
 * children replace the glyph; `as` replaces the Button.
 */
const useTriggerElement = <T extends ElementType>(config: TriggerConfig, props: CarouselTriggerProps<T>) => {
  const theme = useComponentTheme(config.themeKey);
  const { labels } = useCarouselOwnContext(config.part);
  const { orientation } = useCarouselContext();

  const { rootAttrs, rest } = composeRootAttrs(config.base, props as CarouselTriggerProps<'button'>, theme);
  const { as, children, ref, 'aria-label': ariaLabel, ...triggerProps } = rest;
  const hasCustomChildren = isRenderableNode(children);
  const Spar = config.Spar;

  const name = ariaLabel ?? (hasCustomChildren ? undefined : config.label(labels));
  const buttonProps = as ? {} : { size: 'small' as const, startContent: hasCustomChildren ? undefined : config.glyph(orientation === 'vertical') };

  return (
    <Spar as={(as ?? Button) as ElementType} {...buttonProps} {...triggerProps} aria-label={name} {...rootAttrs} ref={ref}>
      {children}
    </Spar>
  );
};

export const CarouselPrevTrigger = <T extends ElementType = 'button'>(props: CarouselTriggerProps<T>) =>
  useTriggerElement(
    {
      base: CarouselPrevTriggerBase,
      themeKey: 'CarouselPrevTrigger',
      part: 'Carousel.PrevTrigger',
      Spar: SparCarouselPrevTrigger,
      label: labels => labels.previous,
      glyph: vertical => (vertical ? <ChevronTopIconOutlinedRounded /> : <ChevronLeftIconOutlinedRounded />),
    },
    props,
  );

CarouselPrevTrigger.displayName = 'Carousel.PrevTrigger';

export const CarouselNextTrigger = <T extends ElementType = 'button'>(props: CarouselTriggerProps<T>) =>
  useTriggerElement(
    {
      base: CarouselNextTriggerBase,
      themeKey: 'CarouselNextTrigger',
      part: 'Carousel.NextTrigger',
      Spar: SparCarouselNextTrigger,
      label: labels => labels.next,
      glyph: vertical => (vertical ? <ChevronBottomIconOutlinedRounded /> : <ChevronRightIconOutlinedRounded />),
    },
    props,
  );

CarouselNextTrigger.displayName = 'Carousel.NextTrigger';
