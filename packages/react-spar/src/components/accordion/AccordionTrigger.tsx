import { type ElementType, type ReactNode } from 'react';

import { AccordionTrigger as SparAccordionTrigger, useAccordionItemContext } from '@turkish-technology/spar';

import { buildSlotAttrs, composeRootAttrs } from '../../core';
import { hasChildOfType } from '../../hooks';
import { useComponentTheme } from '../../provider';

import { AccordionTriggerBase, AccordionTriggerTitleBase } from './base';
import { useAccordionOwnContext } from './context';
import type { AccordionTriggerProps, AccordionTriggerTitleProps } from './types';

const DEFAULT_EXPAND_ICON: ReactNode = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DEFAULT_COLLAPSE_ICON: ReactNode = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AccordionTriggerTitle = <T extends ElementType = 'span'>(props: AccordionTriggerTitleProps<T>) => {
  const theme = useComponentTheme('AccordionTriggerTitle');
  const { rootAttrs, rest } = composeRootAttrs(AccordionTriggerTitleBase, props as AccordionTriggerTitleProps<'span'>, theme);
  const { children, ref, ...spar } = rest;

  return (
    <span {...spar} {...rootAttrs} ref={ref}>
      {children}
    </span>
  );
};

AccordionTriggerTitle.displayName = 'Accordion.Trigger.Title';

const AccordionTriggerRoot = <T extends ElementType = 'button'>(props: AccordionTriggerProps<T>) => {
  const theme = useComponentTheme('AccordionTrigger');
  const { arrowPosition, hideArrows, expandIcon, collapseIcon } = useAccordionOwnContext('Accordion.Trigger');
  const { isOpen } = useAccordionItemContext();

  const { rootAttrs, rest } = composeRootAttrs(AccordionTriggerBase, props as AccordionTriggerProps<'button'>, theme);
  const { children, icon, ref, ...spar } = rest;

  const childHasTitle = hasChildOfType(children, AccordionTriggerTitle);

  const iconNode = icon !== undefined && icon !== null && (
    <span
      {...buildSlotAttrs(AccordionTriggerBase.getSlotProps('icon'), 'icon', {
        themeSlotProps: theme?.slotProps,
        themeClassNames: theme?.classNames,
        instanceSlotProps: props.slotProps,
        instanceClassNames: props.classNames,
      })}
    >
      {icon}
    </span>
  );

  const titleNode = childHasTitle ? children : <AccordionTriggerTitle>{children}</AccordionTriggerTitle>;

  const arrowNode = !hideArrows && (
    <span
      {...buildSlotAttrs(AccordionTriggerBase.getSlotProps('arrow'), 'arrow', {
        themeSlotProps: theme?.slotProps,
        themeClassNames: theme?.classNames,
        instanceSlotProps: props.slotProps,
        instanceClassNames: props.classNames,
      })}
      aria-hidden="true"
    >
      {isOpen ? (collapseIcon ?? DEFAULT_COLLAPSE_ICON) : (expandIcon ?? DEFAULT_EXPAND_ICON)}
    </span>
  );

  return (
    <SparAccordionTrigger {...spar} {...rootAttrs} ref={ref}>
      {arrowPosition === 'left' && arrowNode}
      {iconNode}
      {titleNode}
      {arrowPosition === 'right' && arrowNode}
    </SparAccordionTrigger>
  );
};

AccordionTriggerRoot.displayName = 'Accordion.Trigger';

export const AccordionTrigger = Object.assign(AccordionTriggerRoot, {
  Title: AccordionTriggerTitle,
});
