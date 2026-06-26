import { type ElementType } from 'react';
import { useAccordionItemContext } from '@turkish-technology/spar';

import { composeRootAttrs, resolveDisclosureIndicator } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionIndicatorBase } from './base';
import type { AccordionIndicatorProps } from './types';

export const AccordionIndicator = <T extends ElementType = 'span'>(props: AccordionIndicatorProps<T>) => {
  const theme = useComponentTheme('AccordionIndicator');
  const { isOpen } = useAccordionItemContext();

  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(AccordionIndicatorBase, props as AccordionIndicatorProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  // Default chevron flips with the open state; the `tk-accordion-item-indicator`
  // recipe drives its size/color (the glyph is `1em` + `currentColor`).
  const resolved = resolveDisclosureIndicator(children, isOpen);

  return (
    <Component {...rendered} ref={ref} aria-hidden="true" {...rootAttrs}>
      {resolved}
    </Component>
  );
};

AccordionIndicator.displayName = 'Accordion.Indicator';
