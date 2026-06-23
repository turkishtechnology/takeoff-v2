import { type ElementType } from 'react';
import { useAccordionItemContext } from '@turkish-technology/spar';
import { ChevronBottomIconOutlinedRounded } from '@takeoff-icons/react/chevron-bottom';
import { ChevronTopIconOutlinedRounded } from '@takeoff-icons/react/chevron-top';

import { composeRootAttrs } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionIndicatorBase } from './base';
import type { AccordionIndicatorProps } from './types';

// Default disclosure chevrons from the official Takeoff icon set
// (`@takeoff-icons/react`, outlined/rounded — the design system default
// variant). The icons size to `1em` and paint with `currentColor`, so the
// `tk-accordion-item-indicator` recipe drives their size and color.
const DEFAULT_EXPAND_ICON = <ChevronBottomIconOutlinedRounded />;
const DEFAULT_COLLAPSE_ICON = <ChevronTopIconOutlinedRounded />;

export const AccordionIndicator = <T extends ElementType = 'span'>(props: AccordionIndicatorProps<T>) => {
  const theme = useComponentTheme('AccordionIndicator');
  const { isOpen } = useAccordionItemContext();

  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(AccordionIndicatorBase, props as AccordionIndicatorProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  const resolved = typeof children === 'function' ? children({ isOpen }) : (children ?? (isOpen ? DEFAULT_COLLAPSE_ICON : DEFAULT_EXPAND_ICON));

  return (
    <Component {...rendered} ref={ref} aria-hidden="true" {...rootAttrs}>
      {resolved}
    </Component>
  );
};

AccordionIndicator.displayName = 'Accordion.Indicator';
