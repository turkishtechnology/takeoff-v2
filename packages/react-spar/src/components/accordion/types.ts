import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import type {
  AccordionContentProps as SparAccordionContentProps,
  AccordionHeaderProps as SparAccordionHeaderProps,
  AccordionItemProps as SparAccordionItemProps,
  AccordionProps as SparAccordionProps,
  AccordionTriggerProps as SparAccordionTriggerProps,
} from '@turkish-technology/spar';

export type AccordionType = 'grouped' | 'divided' | 'compact';
export type AccordionSize = 'base' | 'large';

export type AccordionProps<T extends ElementType = 'div'> = SparAccordionProps<T> & {
  type?: AccordionType;
  size?: AccordionSize;
};
export type AccordionItemProps<T extends ElementType = 'div'> = SparAccordionItemProps<T>;
export type AccordionHeaderProps<T extends ElementType = 'h3'> = SparAccordionHeaderProps<T>;
export type AccordionTriggerProps<T extends ElementType = 'button'> = SparAccordionTriggerProps<T>;
export type AccordionContentProps<T extends ElementType = 'div'> = SparAccordionContentProps<T>;
export type AccordionArrowProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  children?: ReactNode;
};
