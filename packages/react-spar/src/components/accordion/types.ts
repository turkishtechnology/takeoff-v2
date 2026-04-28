import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import type {
  AccordionContentProps as SparAccordionContentProps,
  AccordionHeaderProps as SparAccordionHeaderProps,
  AccordionItemProps as SparAccordionItemProps,
  AccordionProps as SparAccordionProps,
  AccordionTriggerProps as SparAccordionTriggerProps,
} from '@turkish-technology/spar';

/**
 * Visual grouping vocabulary mirrored from Takeoff Core (`tk-accordion`).
 *
 * `'compact'` is supported during the current major as a deprecated alias for
 * `mode='compact'` and triggers a one-time dev warning when used. It will be
 * removed in the next major release per `docs/component-api-audit.md` row 18.
 */
export type AccordionType = 'grouped' | 'divided' | 'compact';

/**
 * Density mode. `'compact'` reduces vertical rhythm; pairs with any
 * {@link AccordionType}. Default `'default'`.
 */
export type AccordionMode = 'default' | 'compact';

export type AccordionSize = 'base' | 'large';

export type AccordionProps<T extends ElementType = 'div'> = Omit<SparAccordionProps<T>, 'type'> & {
  type?: AccordionType;
  mode?: AccordionMode;
  size?: AccordionSize;
};
export type AccordionItemProps<T extends ElementType = 'div'> = SparAccordionItemProps<T>;
export type AccordionHeaderProps<T extends ElementType = 'h3'> = SparAccordionHeaderProps<T>;
export type AccordionTriggerProps<T extends ElementType = 'button'> = SparAccordionTriggerProps<T>;
export type AccordionContentProps<T extends ElementType = 'div'> = SparAccordionContentProps<T>;
export type AccordionArrowProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  children?: ReactNode;
};
