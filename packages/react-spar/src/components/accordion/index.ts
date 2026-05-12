import { Accordion as AccordionRoot } from './Accordion';
import { AccordionItem } from './AccordionItem';
import { AccordionHeader } from './AccordionHeader';
import { AccordionTrigger } from './AccordionTrigger';
import { AccordionContent } from './AccordionContent';

const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

export { Accordion };

export type {
  AccordionArrowPosition,
  AccordionContentProps,
  AccordionCurrentValue,
  AccordionHeadingLevel,
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionMode,
  AccordionProps,
  AccordionSize,
  AccordionTriggerProps,
  AccordionTriggerTitleProps,
  AccordionType,
  AccordionValue,
  AccordionValueChangeHandler,
} from './types';
