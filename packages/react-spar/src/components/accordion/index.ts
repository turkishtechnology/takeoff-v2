import { Accordion as AccordionRoot } from './Accordion';
import { AccordionItem } from './AccordionItem';
import { AccordionHeader } from './AccordionHeader';
import { AccordionTrigger } from './AccordionTrigger';
import { AccordionIndicator } from './AccordionIndicator';
import { AccordionContent } from './AccordionContent';

const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Indicator: AccordionIndicator,
  Content: AccordionContent,
});

export { Accordion };

export type {
  AccordionContentProps,
  AccordionCurrentValue,
  AccordionHeadingLevel,
  AccordionHeaderProps,
  AccordionIndicatorProps,
  AccordionIndicatorRenderState,
  AccordionItemProps,
  AccordionMode,
  AccordionProps,
  AccordionSize,
  AccordionTriggerProps,
  AccordionType,
  AccordionValue,
  AccordionValueChangeHandler,
} from './types';
