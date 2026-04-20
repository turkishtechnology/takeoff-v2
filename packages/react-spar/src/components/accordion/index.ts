import { Accordion as AccordionRoot, AccordionBase } from './Accordion';
import { AccordionItem, AccordionItemBase } from './AccordionItem';
import { AccordionHeader, AccordionHeaderBase } from './AccordionHeader';
import { AccordionTrigger, AccordionTriggerBase } from './AccordionTrigger';
import { AccordionContent, AccordionContentBase } from './AccordionContent';

const Accordion = AccordionRoot as typeof AccordionRoot & {
  Root: typeof AccordionRoot;
  Item: typeof AccordionItem;
  Header: typeof AccordionHeader;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
};

Accordion.Root = AccordionRoot;
Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

export {
  Accordion,
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  AccordionBase,
  AccordionItemBase,
  AccordionHeaderBase,
  AccordionTriggerBase,
  AccordionContentBase,
};

export type { AccordionContentProps, AccordionHeaderProps, AccordionItemProps, AccordionMode, AccordionProps, AccordionSize, AccordionTriggerProps, ViewType } from './types';
