import { Accordion as AccordionRoot } from './Accordion';
import { AccordionItem } from './AccordionItem';
import { AccordionHeader } from './AccordionHeader';
import { AccordionTrigger } from './AccordionTrigger';
import { AccordionContent } from './AccordionContent';
import { AccordionArrow } from './AccordionArrow';
import { AccordionArrowBase, AccordionBase, AccordionContentBase, AccordionHeaderBase, AccordionItemBase, AccordionTriggerBase } from './base';

const Accordion = AccordionRoot as typeof AccordionRoot & {
  Root: typeof AccordionRoot;
  Item: typeof AccordionItem;
  Header: typeof AccordionHeader;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
  Arrow: typeof AccordionArrow;
};

Accordion.Root = AccordionRoot;
Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
Accordion.Arrow = AccordionArrow;

export {
  Accordion,
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  AccordionArrow,
  AccordionBase,
  AccordionItemBase,
  AccordionHeaderBase,
  AccordionTriggerBase,
  AccordionContentBase,
  AccordionArrowBase,
};

export type {
  AccordionArrowProps,
  AccordionContentProps,
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionMode,
  AccordionProps,
  AccordionSize,
  AccordionTriggerProps,
  AccordionType,
} from './types';
