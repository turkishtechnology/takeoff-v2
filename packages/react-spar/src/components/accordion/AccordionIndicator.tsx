import { type ElementType } from 'react';
import { useAccordionItemContext } from '@turkish-technology/spar';

import { composeRootAttrs, resolveDisclosureIndicator } from '../../core';
import { useComponentTheme } from '../../provider';

import { AccordionIndicatorBase } from './base';
import { useAccordionOwnContext } from './context';
import type { AccordionIndicatorProps } from './types';

export const AccordionIndicator = <T extends ElementType = 'span'>(props: AccordionIndicatorProps<T>) => {
  const theme = useComponentTheme('AccordionIndicator');
  // Boundary guard only: names the part when rendered outside the root.
  useAccordionOwnContext('Accordion.Indicator');
  const { isOpen } = useAccordionItemContext();

  const Component = (props.as ?? 'span') as ElementType;

  const { rootAttrs, rest } = composeRootAttrs(AccordionIndicatorBase, props as AccordionIndicatorProps<'span'>, theme);

  const { as: _as, children, ref, ...rendered } = rest;

  // Default chevron flips with the open state; the `tk-accordion-item-indicator`
  // recipe drives its size/color (the glyph is `1em` + `currentColor`).
  const resolved = resolveDisclosureIndicator(children, isOpen);

  // The indicator is decorative chrome inside the trigger, so `aria-hidden`
  // is a design-system invariant: it is layered after `rootAttrs` so neither
  // instance props nor `slotProps.root` (instance or provider theme) can
  // expose it to assistive technology.
  return (
    <Component {...rendered} ref={ref} {...rootAttrs} aria-hidden="true">
      {resolved}
    </Component>
  );
};

AccordionIndicator.displayName = 'Accordion.Indicator';
